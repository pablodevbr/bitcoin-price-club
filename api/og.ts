// Dynamic OpenGraph / Social Card Image Generator: /api/og
// High-End Creative & Minimalist Card (Borderless, Luxury Crypto Aesthetic)

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
 * Generates an ultra-professional, borderless, high-end 1200x630 SVG artwork.
 * Design Highlights:
 * - Completely borderless (zero internal or external stroke borders).
 * - Multi-layered atmospheric aurora lighting & subtle 3D translucent ₿ watermark.
 * - Massive typographic hierarchy: Huge high-contrast Bitcoin price hero.
 * - Subordinate Satoshi purchasing power highlight bar.
 * - Clean, discrete branding and date.
 */
function generateCleanCardSvg(data: {
  price: string;
  change: string;
  isPositive: boolean;
  sats: string;
  date: string;
}): string {
  const changeBg = data.isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const changeText = data.isPositive ? '#34d399' : '#f87171';
  const changeArrow = data.isPositive ? '▲ ' : '▼ ';

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Atmospheric Aurora Glows -->
    <radialGradient id="auroraOrange" cx="80%" cy="25%" r="65%">
      <stop offset="0%" stop-color="#F7931A" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#FF9900" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#04060a" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="auroraPurple" cx="15%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.16" />
      <stop offset="60%" stop-color="#0F172A" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#04060a" stop-opacity="0" />
    </radialGradient>

    <!-- Glass Fill with Zero Stroke -->
    <linearGradient id="heroGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.04)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.01)" />
    </linearGradient>

    <linearGradient id="satsGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(247, 147, 26, 0.08)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)" />
    </linearGradient>

    <!-- Gold Text Gradient -->
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F7931A" />
      <stop offset="100%" stop-color="#FDBA74" />
    </linearGradient>

    <style>
      .brand-title { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 19px; fill: #ffffff; letter-spacing: 1px; }
      .brand-tag { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 600; font-size: 11px; fill: #64748b; letter-spacing: 2px; }
      .date-badge { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 600; font-size: 14px; fill: #94a3b8; }
      
      .kicker-label { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 800; font-size: 13px; fill: #94a3b8; letter-spacing: 3px; }
      .main-price { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-weight: 900; font-size: 106px; fill: #ffffff; letter-spacing: -3px; }
      .main-currency { font-family: 'SF Pro Display', -apple-system, sans-serif; font-weight: 700; font-size: 28px; fill: #64748b; }
      
      .pill-text { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 800; font-size: 20px; fill: ${changeText}; }
      
      .sats-title { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 700; font-size: 12px; fill: #fbbf24; letter-spacing: 2px; }
      .sats-digits { font-family: 'SF Pro Display', -apple-system, monospace; font-weight: 900; font-size: 40px; fill: url(#goldText); }
      .sats-suffix { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 700; font-size: 18px; fill: #fde68a; }
      .sats-caption { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 500; font-size: 14px; fill: #94a3b8; }
      
      .footer-url { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 700; font-size: 15px; fill: #94a3b8; letter-spacing: 0.5px; }
      .footer-live { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-weight: 600; font-size: 13px; fill: #34d399; letter-spacing: 1px; }
    </style>
  </defs>

  <!-- Deep Obsidian Canvas (Zero Borders) -->
  <rect width="1200" height="630" fill="#04060a" />
  
  <!-- Aurora Atmosphere Layers -->
  <rect width="1200" height="630" fill="url(#auroraOrange)" />
  <rect width="1200" height="630" fill="url(#auroraPurple)" />

  <!-- Sculptural Translucent Bitcoin Watermark (Creative Background Art) -->
  <g transform="translate(860, 420)" opacity="0.045">
    <circle cx="160" cy="0" r="240" fill="#F7931A" />
    <text x="160" y="90" font-family="-apple-system, sans-serif" font-weight="900" font-size="340" fill="#04060a" text-anchor="middle">₿</text>
  </g>

  <!-- 1. HEADER (Borderless, Subtle & Refined) -->
  <g transform="translate(72, 60)">
    <!-- Sleek Coin Emblem -->
    <circle cx="22" cy="22" r="22" fill="#F7931A" />
    <text x="22" y="30" font-family="sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">₿</text>

    <!-- Brand Signature -->
    <text x="56" y="18" class="brand-title">BITCOIN PRICE CLUB</text>
    <text x="56" y="34" class="brand-tag">DAILY MARKET INTELLIGENCE</text>

    <!-- Soft Date Capsule (No Border) -->
    <rect x="890" y="4" width="166" height="36" rx="18" fill="rgba(255, 255, 255, 0.05)" />
    <text x="973" y="27" class="date-badge" text-anchor="middle">${escapeXml(data.date)}</text>
  </g>

  <!-- 2. MAIN HERO: MASSIVE BITCOIN SPOT PRICE (Borderless) -->
  <g transform="translate(72, 140)">
    <!-- Soft Ambient Surface (Zero Stroke Borders) -->
    <rect width="1056" height="240" rx="28" fill="url(#heroGlass)" />

    <!-- Section Kicker -->
    <text x="50" y="52" class="kicker-label">SPOT PRICE</text>

    <!-- Massive High-Contrast Price Display -->
    <text x="50" y="156" class="main-price">${escapeXml(data.price)}</text>
    <text x="${escapeXml(data.price).length > 9 ? '710' : '630'}" y="118" class="main-currency">USD</text>

    <!-- 24h Variation Capsule (No Border) -->
    <rect x="${escapeXml(data.price).length > 9 ? '790' : '710'}" y="86" width="150" height="46" rx="23" fill="${changeBg}" />
    <text x="${escapeXml(data.price).length > 9 ? '865' : '785'}" y="116" class="pill-text" text-anchor="middle">${changeArrow}${escapeXml(data.change)}</text>

    <!-- Context Meta Subline -->
    <text x="50" y="202" font-family="-apple-system, sans-serif" font-weight="500" font-size="14" fill="#64748b">Real-time consolidated index • Updated every 60s</text>
  </g>

  <!-- 3. SECONDARY HERO: SATOSHI PURCHASING POWER (Borderless & Seamless) -->
  <g transform="translate(72, 404)">
    <!-- Soft Amber Glow Surface (Zero Stroke Borders) -->
    <rect width="1056" height="120" rx="24" fill="url(#satsGlass)" />

    <!-- Left: Satoshis Counter -->
    <g transform="translate(50, 32)">
      <text x="0" y="16" class="sats-title">PURCHASING POWER FOR $1.00 USD</text>
      <text x="0" y="62" class="sats-digits">${escapeXml(data.sats)}</text>
      <text x="${escapeXml(data.sats).length * 26 + 12}" y="58" class="sats-suffix">Satoshis</text>
    </g>

    <!-- Right: Informational Context -->
    <g transform="translate(680, 52)">
      <text x="326" y="16" class="sats-caption" text-anchor="end">1 Bitcoin = 100,000,000 Satoshis</text>
      <text x="326" y="38" class="sats-caption" text-anchor="end" fill="#64748b">Stack sats, preserve sovereignty</text>
    </g>
  </g>

  <!-- 4. FOOTER: MINIMALIST BRAND & LIVE INDICATOR -->
  <g transform="translate(72, 578)">
    <text x="0" y="0" class="footer-url">bitcoinprice.club</text>
    <g transform="translate(1056, 0)">
      <text x="0" y="0" class="footer-live" text-anchor="end">● LIVE ON-CHAIN</text>
    </g>
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
    const formatParam = getParam('format') || 'png';

    // 2. Fallback to KV snapshot or live crypto fetch if parameters are omitted
    if (!priceParam || !changeParam || !satsParam) {
      try {
        const cachedSnapshot = await getDailySnapshot();
        if (cachedSnapshot) {
          if (!priceParam) priceParam = String(cachedSnapshot.priceUsd);
          if (!changeParam) changeParam = String(cachedSnapshot.change24h);
          if (!satsParam) satsParam = String(cachedSnapshot.satoshisPerDollar);
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
      ? '0.00%'
      : `${Math.abs(numericChange).toFixed(2)}%`;

    const formattedSats = isNaN(numericSats)
      ? '1,036'
      : numericSats.toLocaleString('en-US');

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // 4. Generate Clean SVG Artwork
    const svg = generateCleanCardSvg({
      price: formattedPrice,
      change: formattedChange,
      isPositive,
      sats: formattedSats,
      date: currentDate,
    });

    // Cache headers (no-cache in dev to allow immediate visual updates)
    const cacheHeader = 'no-cache, no-store, must-revalidate';

    // If SVG requested directly
    if (formatParam === 'svg') {
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', cacheHeader);
        return res.end(svg);
      }
      return new Response(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': cacheHeader,
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
      res.setHeader('Cache-Control', cacheHeader);
      return res.end(Buffer.from(pngBuffer));
    }

    return new Response(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': cacheHeader,
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
