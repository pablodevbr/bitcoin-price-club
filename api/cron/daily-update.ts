// Vercel Cron Job Serverless Function: /api/cron/daily-update
// Triggered daily to fetch BTC price, generate AI insights, cache in KV, and broadcast to Telegram.

import { getBitcoinMarketData } from '../../lib/crypto';
import { generateMarketSummary } from '../../lib/ai';
import { saveDailySnapshot } from '../../lib/kv';
import { sendTelegramBroadcast } from '../../lib/telegram';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res?: any) {
  try {
    // 1. Validate Cron Secret for Authorization (Vercel Cron headers)
    const authHeader = req?.headers?.get
      ? req.headers.get('authorization')
      : req?.headers?.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (res && typeof res.status === 'function') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch Bitcoin market data (CoinGecko with Binance fallback)
    const marketData = await getBitcoinMarketData();

    // 3. Generate AI summary (Google Gemini)
    const summary = await generateMarketSummary({
      priceUsd: marketData.priceUsd,
      change24h: marketData.change24h,
      satoshisPerDollar: marketData.satoshisPerDollar,
    });

    // 4. Save daily snapshot to Vercel KV / Upstash
    const snapshot = {
      priceUsd: marketData.priceUsd,
      change24h: marketData.change24h,
      satoshisPerDollar: marketData.satoshisPerDollar,
      summary,
      updatedAt: marketData.lastUpdated,
    };
    await saveDailySnapshot(snapshot);

    // 5. Send broadcast to Telegram channel
    const formattedPrice = `$${marketData.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedSats = `${marketData.satoshisPerDollar.toLocaleString('en-US')} sats`;
    const changeSign = marketData.change24h > 0 ? '+' : '';

    const telegramCaption = `
<b>₿ Bitcoin Daily Update</b>

<b>Price:</b> ${formattedPrice} USD (${changeSign}${marketData.change24h}%)
<b>Satoshis per $1:</b> ${formattedSats}

<i>${summary}</i>
`.trim();

    // Dynamic OG image URL for Telegram and social embeds
    const host =
      (req?.headers?.get ? req.headers.get('host') : req?.headers?.host) ||
      'bitcoinprice.club';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const encodedSummary = encodeURIComponent(summary);
    const ogImageUrl = `${protocol}://${host}/api/og?price=${marketData.priceUsd}&change=${marketData.change24h}&sats=${marketData.satoshisPerDollar}&summary=${encodedSummary}`;

    const telegramResult = await sendTelegramBroadcast(ogImageUrl, telegramCaption);

    const responseData = {
      success: true,
      data: snapshot,
      telegram: telegramResult,
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(responseData);
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Daily update cron error:', error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: errorMessage });
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
