// Dynamic Telegram Card & OpenGraph Image Generator: /api/og
// Engineered for Telegram chat preview constraints (1024 x 267)
// Center stage is visible before click; creative wings are revealed after clicking!

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
 * Generates the high-end 1024 x 267 Telegram Card SVG.
 * 
 * Layout Architecture:
 * - Center Stage (x: 260 -> 764): Visible in the Telegram in-chat preview bubble before clicking.
 * - Left Wing (x: 0 -> 260): Revealed when the photo is opened in full view.
 * - Right Wing (x: 764 -> 1024): Revealed when the photo is opened in full view.
 */
function generateTelegramCardSvg(data: {
  price: string;
  change: string;
  isPositive: boolean;
  sats: string;
  channel: string;
}): string {
  const isPositive = data.isPositive;
  const changeBg = isPositive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
  const changeBorder = isPositive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';
  const changeColor = isPositive ? '#10B981' : '#F87171';
  const changeArrow = isPositive ? '▲ ' : '▼ ';

  // SVG grid lines (financial matrix coordinates)
  const verticalGrid: string[] = [];
  for (let x = 40; x < 1024; x += 48) {
    verticalGrid.push(`<line x1="${x}" y1="0" x2="${x}" y2="267" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1" />`);
  }
  const horizontalGrid: string[] = [];
  for (let y = 30; y < 267; y += 42) {
    horizontalGrid.push(`<line x1="0" y1="${y}" x2="1024" y2="${y}" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1" />`);
  }

  // Glowing matrix dots along coordinates
  const dotCoords: [number, number][] = [
    [88, 72], [136, 114], [184, 156], [232, 72], [280, 198],
    [760, 72], [808, 156], [856, 114], [904, 198], [952, 72],
    [380, 50], [640, 50], [420, 240], [600, 240]
  ];
  const matrixDots = dotCoords.map(
    ([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="2" fill="#10B981" opacity="0.35" />`
  );

  // Dynamic price typography sizing
  const priceLen = data.price.length;
  const priceFontSize = priceLen > 11 ? 64 : priceLen > 9 ? 70 : 78;

  return `
<svg width="1024" height="267" viewBox="0 0 1024 267" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Luxury Obsidian & Deep Midnight Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080C14" />
      <stop offset="50%" stop-color="#0B1322" />
      <stop offset="100%" stop-color="#05080F" />
    </linearGradient>

    <!-- Emerald Ambient Atmosphere Glow in the center -->
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.14" />
      <stop offset="60%" stop-color="#0B1322" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#05080F" stop-opacity="0" />
    </radialGradient>

    <!-- Gold 3D Coin Gradients -->
    <linearGradient id="goldFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="40%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>

    <linearGradient id="goldRim" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350F" />
      <stop offset="50%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#FCD34D" />
    </linearGradient>

    <!-- Orbital Energy Ring Gradient -->
    <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00FFA3" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.8" />
    </linearGradient>

    <!-- Frosted Capsule Glass -->
    <linearGradient id="pillGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.08)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)" />
    </linearGradient>

    <!-- 3D Arrow Gradients -->
    <linearGradient id="arrowGradDown" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="100%" stop-color="#FCD34D" />
    </linearGradient>

    <linearGradient id="arrowGradUp" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#ECFDF5" />
    </linearGradient>
  </defs>

  <!-- Base Canvas -->
  <rect width="1024" height="267" fill="url(#bgGrad)" />
  <rect width="1024" height="267" fill="url(#centerGlow)" />

  <!-- Grid & Matrix System -->
  <g opacity="0.8">
    ${verticalGrid.join('\n    ')}
    ${horizontalGrid.join('\n    ')}
    ${matrixDots.join('\n    ')}
  </g>

  <!-- ======================================================== -->
  <!-- 1. LEFT WING: REVEALED ON FULL CLICK (x: 0 -> 260)        -->
  <!-- ======================================================== -->
  <g id="leftWing">
    <!-- Top-Left 3D Zigzag Volatility Arrow (Down) -->
    <g transform="translate(30, 24)">
      <!-- Arrow drop shadow -->
      <path d="M 0 10 L 26 36 L 46 22 L 72 48 L 60 52 L 86 60 L 80 34 L 70 42 L 48 18 L 26 32 Z" fill="rgba(0,0,0,0.5)" transform="translate(3, 4)" />
      <!-- Arrow Body -->
      <path d="M 0 10 L 26 36 L 46 22 L 72 48 L 60 52 L 86 60 L 80 34 L 70 42 L 48 18 L 26 32 Z" fill="url(#arrowGradDown)" stroke="#FFFBEB" stroke-width="0.8" />
      <!-- Trailing dots & $$$$ label -->
      <circle cx="8" cy="6" r="2.5" fill="#FDE047" opacity="0.6" />
      <circle cx="18" cy="2" r="2" fill="#FDE047" opacity="0.4" />
      <text x="96" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="900" font-size="12" fill="#FDE047" letter-spacing="1px">$$$$</text>
    </g>

    <!-- Floating 3D Gold Bitcoin Coin (Left) -->
    <g transform="translate(195, 68) rotate(-22)">
      <ellipse cx="0" cy="5" rx="28" ry="17" fill="url(#goldRim)" />
      <ellipse cx="0" cy="0" rx="28" ry="17" fill="url(#goldFace)" stroke="#FEF08A" stroke-width="1.2" />
      <ellipse cx="0" cy="0" rx="23" ry="13.5" fill="none" stroke="rgba(120, 53, 15, 0.45)" stroke-width="1" />
      <text x="0" y="6" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="18" fill="#78350F" text-anchor="middle">₿</text>
    </g>

    <!-- 24h Delta Capsule Badge -->
    <g transform="translate(30, 142)">
      <rect width="138" height="34" rx="17" fill="${changeBg}" stroke="${changeBorder}" stroke-width="1" />
      <text x="69" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="800" font-size="14" fill="${changeColor}" text-anchor="middle">${changeArrow}${escapeXml(data.change)} 24H</text>
    </g>

    <!-- Institutional Footer & Scarcity Mark -->
    <g transform="translate(30, 218)">
      <text x="0" y="10" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="800" font-size="10.5" fill="#94A3B8" letter-spacing="1px">POWERED BY GEMINI AI</text>
      <text x="0" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="700" font-size="9" fill="#10B981" letter-spacing="1.8px">21M HARD CAP • PROOF OF WORK</text>
    </g>
  </g>

  <!-- ======================================================== -->
  <!-- 2. CENTER STAGE: VISIBLE BEFORE CLICK (x: 260 -> 764)     -->
  <!-- ======================================================== -->
  <g id="centerStage">
    <!-- 3D Bitcoin Price Club Medallion -->
    <g transform="translate(512, 42)">
      <!-- Orbital Energy Ring -->
      <ellipse cx="0" cy="0" rx="42" ry="15" fill="none" stroke="url(#orbitGlow)" stroke-width="2.5" transform="rotate(-14)" stroke-dasharray="160 12" />
      <circle cx="-38" cy="10" r="2.5" fill="#00FFA3" />
      <circle cx="38" cy="-10" r="2" fill="#F59E0B" />

      <!-- Medallion Rim -->
      <circle cx="0" cy="2" r="23" fill="#78350F" />
      <!-- Medallion Face -->
      <circle cx="0" cy="0" r="22" fill="url(#goldFace)" stroke="#FEF08A" stroke-width="1.5" />
      <!-- Inner Ring -->
      <circle cx="0" cy="0" r="18" fill="none" stroke="#FBBF24" stroke-width="1" stroke-dasharray="2 2" />
      <!-- Sovereign ₿ Core -->
      <text x="0" y="8" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="22" fill="#090D16" text-anchor="middle">₿</text>
    </g>

    <!-- Massive High-Contrast Spot Price Hero -->
    <text x="512" y="150" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-weight="900" font-size="${priceFontSize}" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2.5px">${escapeXml(data.price)}</text>

    <!-- Telegram Pill Button (High Engagement) -->
    <g transform="translate(372, 184)">
      <!-- Pill Container with Glass Fill and Border -->
      <rect width="280" height="46" rx="23" fill="url(#pillGlass)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.2" />
      
      <!-- Telegram Paper Airplane Icon -->
      <g transform="translate(26, 12)">
        <path d="M 0 10 L 22 0 L 16 22 L 10 15 L 10 20 L 13 16" fill="#00FFA3" />
      </g>

      <!-- Telegram Handle Text -->
      <text x="64" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="800" font-size="20" fill="#F1F5F9" letter-spacing="0.5px">${escapeXml(data.channel)}</text>
    </g>
  </g>

  <!-- ======================================================== -->
  <!-- 3. RIGHT WING: REVEALED ON FULL CLICK (x: 764 -> 1024)   -->
  <!-- ======================================================== -->
  <g id="rightWing">
    <!-- Top-Right Brand Signature -->
    <g transform="translate(994, 34)">
      <text x="0" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="19" fill="#FFFFFF" text-anchor="end" letter-spacing="1.5px">BITCOIN PRICE CLUB</text>
      <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="700" font-size="9.5" fill="#64748B" text-anchor="end" letter-spacing="2px">DAILY ON-CHAIN INTELLIGENCE</text>
    </g>

    <!-- Satoshi Purchasing Power Badge -->
    <g transform="translate(764, 102)">
      <rect width="230" height="34" rx="17" fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1" />
      <text x="115" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Inter', monospace" font-weight="800" font-size="13.5" fill="#FBBF24" text-anchor="middle">⚡ ${escapeXml(data.sats)} SATS / $1.00 USD</text>
    </g>

    <!-- Floating 3D Gold Bitcoin Coin (Right) -->
    <g transform="translate(812, 192) rotate(26)">
      <ellipse cx="0" cy="5" rx="27" ry="16" fill="url(#goldRim)" />
      <ellipse cx="0" cy="0" rx="27" ry="16" fill="url(#goldFace)" stroke="#FEF08A" stroke-width="1.2" />
      <ellipse cx="0" cy="0" rx="22" ry="12.5" fill="none" stroke="rgba(120, 53, 15, 0.45)" stroke-width="1" />
      <text x="0" y="6" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" fill="#78350F" text-anchor="middle">₿</text>
    </g>

    <!-- Bottom-Right 3D Bull Momentum Arrow (Rising) -->
    <g transform="translate(908, 178)">
      <!-- Shadow -->
      <path d="M 0 54 L 24 30 L 44 44 L 70 16 L 68 8 L 94 0 L 86 26 L 76 18 L 46 50 L 26 36 Z" fill="rgba(0,0,0,0.5)" transform="translate(3, 3)" />
      <!-- Arrow Body -->
      <path d="M 0 54 L 24 30 L 44 44 L 70 16 L 68 8 L 94 0 L 86 26 L 76 18 L 46 50 L 26 36 Z" fill="url(#arrowGradUp)" stroke="#ECFDF5" stroke-width="0.8" />
      <!-- Momentum Text -->
      <text x="-8" y="44" font-family="-apple-system, sans-serif" font-weight="900" font-size="12" fill="#34D399" text-anchor="end">+$1,000</text>
    </g>

    <!-- Live Status Pill -->
    <g transform="translate(994, 246)">
      <circle cx="-136" cy="-4" r="3.5" fill="#10B981" />
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-weight="700" font-size="10" fill="#10B981" text-anchor="end" letter-spacing="1px">LIVE ON-CHAIN CONSENSUS</text>
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
    let channelParam = getParam('channel') || process.env.TELEGRAM_CHANNEL_HANDLE || process.env.TELEGRAM_CHANNEL_ID || '@bitcoinpriceclub';
    const formatParam = getParam('format') || 'png';

    // Format channel handle cleanly
    if (!channelParam.startsWith('@') && !channelParam.startsWith('http')) {
      channelParam = `@${channelParam}`;
    }

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
      ? '$96,500'
      : `$${numericPrice.toLocaleString('en-US', {
          minimumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        })}`;

    const isPositive = numericChange >= 0;
    const formattedChange = isNaN(numericChange)
      ? '0.00%'
      : `${Math.abs(numericChange).toFixed(2)}%`;

    const formattedSats = isNaN(numericSats)
      ? '1,036'
      : numericSats.toLocaleString('en-US');

    // 4. Generate Clean 1024 x 267 SVG Artwork
    const svg = generateTelegramCardSvg({
      price: formattedPrice,
      change: formattedChange,
      isPositive,
      sats: formattedSats,
      channel: channelParam,
    });

    // Cache headers
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

    // 5. Render to high-resolution PNG using Resvg (1024 x 267)
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1024,
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
