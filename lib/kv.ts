// Vercel KV / Upstash Redis Client & Daily Snapshot Helpers
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

export interface DailySnapshot {
  priceUsd: number;
  change24h: number;
  satoshisPerDollar: number;
  summary: string;
  updatedAt: string;
}

const KV_DAILY_KEY = 'bitcoin:daily_snapshot';
const LOCAL_CACHE_DIR = path.resolve(process.cwd(), '.cache');
const LOCAL_CACHE_FILE = path.join(LOCAL_CACHE_DIR, 'daily-snapshot.json');

/**
 * Checks if a string is a valid configured URL and not a placeholder.
 */
function isValidUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('...') || url.includes('placeholder')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Initializes and returns an Upstash/Vercel KV Redis client instance, or null if unconfigured.
 */
export function getKvClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!isValidUrl(url) || !token || token.includes('...')) {
    return null;
  }

  return new Redis({ url: url!, token });
}

/**
 * Persists the daily Bitcoin snapshot into KV storage and local fallback cache.
 * @param snapshot - Market data and AI generated summary
 */
export async function saveDailySnapshot(snapshot: DailySnapshot): Promise<void> {
  // 1. Always try writing to local cache file for local dev / CLI synchronization
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors in serverless production environments
  }

  // 2. Persist to Vercel KV / Upstash Redis if configured
  const redis = getKvClient();
  if (!redis) {
    return;
  }
  await redis.set(KV_DAILY_KEY, JSON.stringify(snapshot));
}

/**
 * Retrieves the latest cached daily Bitcoin snapshot from KV storage or local fallback cache.
 */
export async function getDailySnapshot(): Promise<DailySnapshot | null> {
  try {
    const redis = getKvClient();
    if (redis) {
      const data = await redis.get<string | DailySnapshot>(KV_DAILY_KEY);
      if (data) {
        if (typeof data === 'string') {
          return JSON.parse(data) as DailySnapshot;
        }
        return data as DailySnapshot;
      }
    }
  } catch (error) {
    console.error('Failed to read daily snapshot from KV:', error);
  }

  // Fallback to local snapshot file if available
  try {
    if (fs.existsSync(LOCAL_CACHE_FILE)) {
      const raw = fs.readFileSync(LOCAL_CACHE_FILE, 'utf-8');
      return JSON.parse(raw) as DailySnapshot;
    }
  } catch (fileErr) {
    console.warn('Failed to read local snapshot cache:', fileErr);
  }

  return null;
}

