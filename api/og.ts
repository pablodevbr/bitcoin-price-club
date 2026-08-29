// Dynamic OpenGraph / Social Card Image Generator: /api/og
// High performance SVG & PNG image renderer powered by @resvg/resvg-js

import { Resvg } from '@resvg/resvg-js';
import { getDailySnapshot } from '../lib/kv';
import { getBitcoinMarketData } from '../lib/crypto';

export const config = {
  maxDuration: 15,
};

/**
 * Escapes XML special characters for SVG safety.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates the 1200x630 SVG template with Bitcoin Price Club dark aesthetic.
 */
function generateCardSvg(data: {
  price: string;
  change: string;
  isPositive: boolean;
  sats: string;
  summary: string;
  date: string;
}): string {
  const changeBg = data.isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
  const changeBorder = data.isPositive ? '#10b981' : '#ef4444';
  const changeText = data.isPositive ? '#34d399' : '#f87171';

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradients -->
    <radialGradient id="bgGlowOrange" cx="90%" cy="10%" r="50%">
      <stop offset="0%" stop-color="#F7931A" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#030712" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bgGlowIndigo" cx="10%" cy="90%" r="50%">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#030712" stop-opacity="0" />
    </radialGradient>

    <!-- Card Background Fill -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0b0f19" stop-opacity="0.95" />
    </linearGradient>

    <linearGradient id="aiCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.65" />
    </linearGradient>

    <style>
      .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 900; font-size: 28px; fill: #ffffff; }
      .subtitle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 13px; fill: #94a3b8; letter-spacing: 2px; }
      .badge-date { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 15px; fill: #cbd5e1; }
      .label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 14px; fill: #94a3b8; letter-spacing: 1.5px; }
      .sats-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 14px; fill: #fbbf24; letter-spacing: 1.5px; }
      .price-value { font-family: 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, monospace; font-weight: 900; font-size: 46px; fill: #ffffff; }
      .change-value { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 16px; fill: ${changeText}; }
      .sats-value { font-family: 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, monospace; font-weight: 900; font-size: 46px; fill: #F7931A; }
      .sats-unit { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 20px; fill: #fde68a; }
      .ai-header { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 13px; fill: #a5b4fc; letter-spacing: 1.5px; }
      .ai-text { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 20px; fill: #e2e8f0; }
      .footer-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 14px; fill: #64748b; }
    </style>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="#030712" />
  <rect width="1200" height="630" fill="url(#bgGlowOrange)" />
  <rect width="1200" height="630" fill="url(#bgGlowIndigo)" />

  <!-- Subtle Outer Border -->
  <rect x="20" y="20" width="1160" height="590" rx="32" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />

  <!-- HEADER -->
  <g transform="translate(60, 55)">
    <!-- Bitcoin Circle Icon -->
    <circle cx="28" cy="28" r="28" fill="#F7931A" />
    <text x="28" y="38" font-family="sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle">₿</text>

    <!-- Brand Title -->
    <text x="74" y="24" class="title">BITCOIN PRICE CLUB</text>
    <text x="74" y="44" class="subtitle">DAILY INTELLIGENCE &amp; ANALYTICS</text>

    <!-- Date Badge -->
    <rect x="910" y="4" width="170" height="42" rx="21" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <text x="995" y="30" class="badge-date" text-anchor="middle">${escapeXml(data.date)}</text>
  </g>

  <!-- METRICS SECTION -->
  <!-- Left Card: Bitcoin Price -->
  <g transform="translate(60, 140)">
    <rect width="560" height="155" rx="24" fill="url(#cardGrad)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
    <text x="36" y="48" class="label">BITCOIN PRICE (USD)</text>
    <text x="36" y="112" class="price-value">${escapeXml(data.price)}</text>

    <!-- 24h Change Pill -->
    <rect x="420" y="80" width="105" height="36" rx="18" fill="${changeBg}" stroke="${changeBorder}" stroke-width="1" />
    <text x="472" y="104" class="change-value" text-anchor="middle">${escapeXml(data.change)}</text>
  </g>

  <!-- Right Card: Satoshis Power -->
  <g transform="translate(650, 140)">
    <rect width="490" height="155" rx="24" fill="url(#cardGrad)" stroke="rgba(247, 147, 26, 0.25)" stroke-width="1" />
    <text x="36" y="48" class="sats-label">PURCHASING POWER ($1 USD)</text>
    <text x="36" y="112" class="sats-value">${escapeXml(data.sats)}</text>
    <text x="360" y="110" class="sats-unit">Sats</text>
  </g>

  <!-- AI MARKET SENTIMENT CARD -->
  <g transform="translate(60, 320)">
    <rect width="1080" height="185" rx="24" fill="url(#aiCardGrad)" stroke="rgba(129, 140, 248, 0.25)" stroke-width="1" />
    
    <!-- AI Tag Header -->
    <text x="36" y="44" class="ai-header">✨  GEMINI MARKET SENTIMENT</text>

    <!-- AI Quote Text -->
    <foreignObject x="36" y="62" width="1008" height="105">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #e2e8f0; font-family: Georgia, serif; font-style: italic; font-size: 20px; line-height: 1.45;">
        "${escapeXml(data.summary)}"
      </div>
    </foreignObject>
  </g>

  <!-- FOOTER -->
  <g transform="translate(60, 560)">
    <text x="0" y="0" class="footer-text">bitcoinprice.club</text>
    <text x="1080" y="0" class="footer-text" text-anchor="end">Automated Daily Broadcast • Live On-Chain Data</text>
  </g>
</svg>
`.trim();
}

export default async function handler(req: any, res?: any) {
  try {
    // 1. Resolve search params from URL or query
    let searchParams: URLSearchParams;
    if (typeof req?.url === 'string' && (req.url.startsWith('http://') || req.url.startsWith('https://'))) {
      searchParams = new URL(req.url).searchParams;
    } else {
      const host = req?.headers?.host || 'localhost:3000';
      const protocol = req?.headers?.['x-forwarded-proto'] || 'http';
      searchParams = new URL(req?.url || '', `${protocol}://${host}`).searchParams;
    }

    const getParam = (key: string): string | null => {
      if (req?.query && typeof req.query[key] === 'string') return req.query[key];
      return searchParams.get(key);
    };

    let priceParam = getParam('price');
    let changeParam = getParam('change') || getParam('change24h');
    let satsParam = getParam('sats');
    let summaryParam = getParam('summary') || getParam('ai') || getParam('quote');
    const formatParam = getParam('format') || 'png';

    // 2. Fallback to KV snapshot or live crypto fetch if parameters are omitted
    if (!priceParam || !changeParam || !satsParam || !summaryParam) {
      try {
        const cachedSnapshot = await getDailySnapshot();
        if (cachedSnapshot) {
          if (!priceParam) priceParam = String(cachedSnapshot.priceUsd);
          if (!changeParam) changeParam = String(cachedSnapshot.change24h);
          if (!satsParam) satsParam = String(cachedSnapshot.satoshisPerDollar);
          if (!summaryParam) summaryParam = cachedSnapshot.summary;
        } else {
          // If KV snapshot is not populated yet, fetch live market data automatically
          const liveData = await getBitcoinMarketData();
          if (!priceParam) priceParam = String(liveData.priceUsd);
          if (!changeParam) changeParam = String(liveData.change24h);
          if (!satsParam) satsParam = String(liveData.satoshisPerDollar);
        }
      } catch (kvError) {
        console.warn('Fallback data fetch failed in OG route:', kvError);
      }
    }

    // 3. Format values
    const numericPrice = parseFloat(priceParam || '96500');
    const numericChange = parseFloat(changeParam || '0');
    const numericSats = parseInt(satsParam || '1036', 10);

    const formattedPrice = isNaN(numericPrice)
      ? '$96,500.00'
      : `$${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const isPositive = numericChange >= 0;
    const formattedChange = isNaN(numericChange)
      ? '+0.00%'
      : `${isPositive ? '+' : ''}${numericChange.toFixed(2)}%`;

    const formattedSats = isNaN(numericSats)
      ? '1,036'
      : numericSats.toLocaleString('en-US');

    const summaryText =
      summaryParam && summaryParam.trim().length > 0
        ? summaryParam.trim()
        : 'Bitcoin maintains strong network fundamentals as market momentum consolidates.';

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // 4. Generate SVG
    const svg = generateCardSvg({
      price: formattedPrice,
      change: formattedChange,
      isPositive,
      sats: formattedSats,
      summary: summaryText,
      date: currentDate,
    });

    // If SVG requested directly
    if (formatParam === 'svg') {
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.end(svg);
      }
      return new Response(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    // 5. Render to high-resolution PNG using Resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.end(Buffer.from(pngBuffer));
    }

    return new Response(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error generating OG image';
    console.error('OG Image Generation Error:', error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: errorMessage });
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
