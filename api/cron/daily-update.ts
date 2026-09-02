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

    // 5. Send broadcast to Telegram channel with AI text accompanying the clean image card
    const formattedPrice = `$${marketData.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedSats = `${marketData.satoshisPerDollar.toLocaleString('en-US')} sats`;
    const changeSign = marketData.change24h >= 0 ? '+' : '';

    // Truncate summary if needed so the total Telegram photo caption never exceeds 1000 characters
    let cleanSummary = summary.trim();
    const maxSummaryLength = 700;
    if (cleanSummary.length > maxSummaryLength) {
      cleanSummary = `${cleanSummary.substring(0, maxSummaryLength - 3)}...`;
    }

    let telegramCaption = `
<b>₿ Bitcoin Price Club • Daily Update</b>

💰 <b>Price:</b> ${formattedPrice} USD (<code>${changeSign}${marketData.change24h}%</code>)
⚡ <b>Satoshis per $1:</b> <code>${formattedSats}</code>

🧠 <b>AI Market Insight:</b>
<i>"${cleanSummary}"</i>

🌐 <a href="https://bitcoinprice.club">bitcoinprice.club</a>
`.trim();

    // Enforce strict 1000 character safety limit for Telegram photo captions
    if (telegramCaption.length > 1000) {
      telegramCaption = `${telegramCaption.substring(0, 995)}...`;
    }

    // Dynamic clean OG image URL with cache-buster for Telegram
    const host =
      (req?.headers?.get ? req.headers.get('host') : req?.headers?.host) ||
      'bitcoinprice.club';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const ogImageUrl = `${protocol}://${host}/api/og?price=${marketData.priceUsd}&change=${marketData.change24h}&sats=${marketData.satoshisPerDollar}&t=${Date.now()}`;

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
