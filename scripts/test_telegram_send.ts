import fs from 'fs';
import { getBitcoinMarketData } from '../lib/crypto.ts';
import { generateMarketSummary } from '../lib/ai.ts';
import { sendTelegramBroadcast } from '../lib/telegram.ts';

// Load .env.local manually
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  }
} catch (e) {
  console.warn('Could not read .env.local:', e);
}

async function testTelegramSend() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL_ID;

  console.log('Testing Telegram Bot Configuration:');
  console.log('Bot Token:', token ? `${token.substring(0, 10)}...` : 'NOT FOUND');
  console.log('Channel ID:', channel);

  // 1. Check getMe
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meJson = await meRes.json();
  console.log('Bot details (getMe):', meJson.result?.username);

  if (!meJson.ok) {
    console.error('Bot token is invalid!');
    return;
  }

  // 2. Fetch live market data
  console.log('Fetching live market data...');
  const market = await getBitcoinMarketData();
  const formattedPrice = `$${market.priceUsd.toLocaleString('en-US', {
    minimumFractionDigits: market.priceUsd % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
  const changeSign = market.change24h >= 0 ? '+' : '';
  const formattedChange = `${changeSign}${market.change24h.toFixed(2)}%`;
  const formattedSats = market.satoshisPerDollar.toLocaleString('en-US');

  // 3. Generate AI Market Insight
  console.log('Generating AI Market Insight...');
  const aiInsight = await generateMarketSummary({
    priceUsd: market.priceUsd,
    change24h: market.change24h,
    satoshisPerDollar: market.satoshisPerDollar,
  });
  console.log('AI Insight:', aiInsight);

  // 4. Generate 1024x267 card via api/og
  const { default: ogHandler } = await import('../api/og.ts');
  
  let pngBuffer: any = null;
  const req = {
    url: `http://localhost:3000/api/og?price=${market.priceUsd}&change=${market.change24h}&sats=${market.satoshisPerDollar}&channel=${encodeURIComponent(channel || '')}`,
    query: {
      price: String(market.priceUsd),
      change: String(market.change24h),
      sats: String(market.satoshisPerDollar),
      channel: channel,
    }
  };
  const res = {
    setHeader() {},
    end(buf: any) {
      pngBuffer = buf;
    },
    status() { return { json() {} }; }
  };

  await ogHandler(req, res);

  if (!pngBuffer) {
    console.error('Failed to generate PNG buffer from api/og!');
    return;
  }

  console.log('Generated card PNG buffer, byte size:', pngBuffer.length);

  // 5. Formatted Telegram Caption in English including AI Insight
  const caption = `
<b>₿ Bitcoin Price Club</b> • Daily Market Update

💰 <b>Spot Price:</b> <code>${formattedPrice} USD</code> (<code>${formattedChange} 24h</code>)
⚡ <b>Purchasing Power:</b> <code>${formattedSats} Satoshis / $1.00 USD</code>

🧠 <b>AI Market Insight:</b>
<i>"${aiInsight.trim()}"</i>

🌐 <a href="https://bitcoinprice.club">bitcoinprice.club</a>
<i>Tap the card above to open in full view!</i>
`.trim();

  // 6. Send broadcast directly to Telegram channel
  console.log('Sending broadcast directly to Telegram channel...');
  const result = await sendTelegramBroadcast(pngBuffer, caption);
  console.log('Broadcast Result:', result);
}

testTelegramSend().catch(console.error);
