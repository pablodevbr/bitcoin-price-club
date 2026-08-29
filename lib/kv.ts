// Vercel KV / Upstash Redis Client & Daily Snapshot Helpers
import { Redis } from '@upstash/redis';

export interface DailySnapshot {
  priceUsd: number;
  change24h: number;
  satoshisPerDollar: number;
  summary: string;
  updatedAt: string;
}

const KV_DAILY_KEY = 'bitcoin:daily_snapshot';

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
 * Persists the daily Bitcoin snapshot into KV storage.
 * @param snapshot - Market data and AI generated summary
 */
export async function saveDailySnapshot(snapshot: DailySnapshot): Promise<void> {
  const redis = getKvClient();
  if (!redis) {
    console.warn('Vercel KV / Upstash credentials not configured. Skipping snapshot save.');
    return;
  }
  await redis.set(KV_DAILY_KEY, JSON.stringify(snapshot));
}

/**
 * Retrieves the latest cached daily Bitcoin snapshot from KV storage.
 */
export async function getDailySnapshot(): Promise<DailySnapshot | null> {
  try {
    const redis = getKvClient();
    if (!redis) {
      return null;
    }

    const data = await redis.get<string | DailySnapshot>(KV_DAILY_KEY);

    if (!data) return null;
    if (typeof data === 'string') {
      return JSON.parse(data) as DailySnapshot;
    }
    return data as DailySnapshot;
  } catch (error) {
    console.error('Failed to read daily snapshot from KV:', error);
    return null;
  }
}
