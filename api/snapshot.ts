// API Route: /api/snapshot
// Reads the latest daily snapshot from Vercel KV / Upstash Redis with live market fallback

import { getDailySnapshot } from '../lib/kv';
import { getBitcoinMarketData } from '../lib/crypto';
import { generateMarketSummary } from '../lib/ai';

export const config = {
  maxDuration: 15,
};

export default async function handler(req: any, res?: any) {
  try {
    // 1. Try reading from Vercel KV cache
    const cachedSnapshot = await getDailySnapshot();

    if (cachedSnapshot) {
      const responseData = {
        source: 'kv_cache',
        data: cachedSnapshot,
      };

      if (res && typeof res.status === 'function') {
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res.status(200).json(responseData);
      }

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    // 2. Fallback: Fetch live market data
    const marketData = await getBitcoinMarketData();
    let summary = 'Bitcoin continues to consolidate with disciplined market fundamentals.';

    try {
      summary = await generateMarketSummary({
        priceUsd: marketData.priceUsd,
        change24h: marketData.change24h,
        satoshisPerDollar: marketData.satoshisPerDollar,
      });
    } catch {
      // Keep default summary on LLM error
    }

    const fallbackSnapshot = {
      priceUsd: marketData.priceUsd,
      change24h: marketData.change24h,
      satoshisPerDollar: marketData.satoshisPerDollar,
      summary,
      updatedAt: marketData.lastUpdated,
    };

    const responseData = {
      source: 'live_fallback',
      data: fallbackSnapshot,
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(responseData);
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve snapshot';
    console.error('Snapshot API Error:', error);

    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: errorMessage });
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
