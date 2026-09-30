// Bitcoin Price, Chart History & Satoshi Conversion Utilities
// Multi-Provider Resilient Architecture:
// 1. CoinGecko API
// 2. Binance Public API (fast global & browser CORS support)
// 3. Kraken Public API (US/Vercel serverless & global fallback, immune to HTTP 451)

import type { BitcoinData, BitcoinMarketData, ChartDataPoint } from '../types.js';

export const SATOSHIS_IN_ONE_BITCOIN = 100_000_000;
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';
const KRAKEN_BASE_URL = 'https://api.kraken.com/0/public';

/**
 * Calculates the amount of Satoshis purchasable for $1.00 USD.
 * @param priceUsd - Current Bitcoin price in USD
 */
export function calculateSatoshisPerDollar(priceUsd: number): number {
  if (!priceUsd || priceUsd <= 0) return 0;
  return Math.round(SATOSHIS_IN_ONE_BITCOIN / priceUsd);
}

/**
 * Provider 1: Fetches current price, 24h change and sparkline history from CoinGecko.
 */
async function fetchFromCoinGecko(): Promise<BitcoinData> {
  const priceRes = await fetch(
    `${COINGECKO_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
    { headers: { Accept: 'application/json' } }
  );

  if (!priceRes.ok) {
    throw new Error(`CoinGecko price API error: ${priceRes.status}`);
  }

  const priceJson = await priceRes.json();
  const btc = priceJson.bitcoin;
  if (!btc?.usd) {
    throw new Error('Invalid price data from CoinGecko');
  }

  let history: ChartDataPoint[] = [];
  try {
    const historyRes = await fetch(
      `${COINGECKO_BASE_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (historyRes.ok) {
      const historyJson = await historyRes.json();
      history = historyJson.prices.map((point: [number, number]) => ({
        timestamp: point[0],
        price: point[1],
      }));
    }
  } catch (historyError) {
    console.warn('CoinGecko history fetch failed:', historyError);
  }

  return {
    current_price: btc.usd,
    price_change_percentage_24h: btc.usd_24h_change ?? 0,
    last_updated: new Date(btc.last_updated_at ? btc.last_updated_at * 1000 : Date.now()),
    history,
  };
}

/**
 * Provider 2: Fetches current price, 24h change and klines history from Binance.
 */
async function fetchFromBinance(): Promise<BitcoinData> {
  const tickerRes = await fetch(`${BINANCE_BASE_URL}/ticker/24hr?symbol=BTCUSDT`, {
    headers: { Accept: 'application/json' },
  });

  if (!tickerRes.ok) {
    throw new Error(`Binance ticker API error: ${tickerRes.status}`);
  }

  const tickerData = await tickerRes.json();
  const current_price = parseFloat(tickerData.lastPrice);
  const price_change_percentage_24h = parseFloat(tickerData.priceChangePercent);

  if (isNaN(current_price)) {
    throw new Error('Invalid price data received from Binance');
  }

  let history: ChartDataPoint[] = [];
  try {
    const klinesRes = await fetch(
      `${BINANCE_BASE_URL}/klines?symbol=BTCUSDT&interval=1h&limit=24`,
      { headers: { Accept: 'application/json' } }
    );
    if (klinesRes.ok) {
      const klines = await klinesRes.json();
      history = klines.map((k: (string | number)[]) => ({
        timestamp: Number(k[0]),
        price: parseFloat(String(k[4])),
      }));
    }
  } catch (klinesError) {
    console.warn('Binance klines fetch failed:', klinesError);
  }

  return {
    current_price,
    price_change_percentage_24h: isNaN(price_change_percentage_24h) ? 0 : price_change_percentage_24h,
    last_updated: new Date(),
    history,
  };
}

/**
 * Provider 3: Fetches current price, 24h change and OHLC history from Kraken Public API.
 * Regulated in the US and globally accessible from all serverless cloud providers (no HTTP 451).
 */
async function fetchFromKraken(): Promise<BitcoinData> {
  const tickerRes = await fetch(`${KRAKEN_BASE_URL}/Ticker?pair=XBTUSD`, {
    headers: { Accept: 'application/json' },
  });

  if (!tickerRes.ok) {
    throw new Error(`Kraken ticker API error: ${tickerRes.status}`);
  }

  const tickerJson = await tickerRes.json();
  const pairData = tickerJson?.result?.XXBTZUSD || tickerJson?.result?.XBTUSD;
  if (!pairData) {
    throw new Error('Invalid ticker payload from Kraken');
  }

  const current_price = parseFloat(pairData.c?.[0]);
  const openPrice24h = parseFloat(pairData.o);
  if (isNaN(current_price)) {
    throw new Error('Invalid price value from Kraken');
  }

  const price_change_percentage_24h =
    !isNaN(openPrice24h) && openPrice24h > 0
      ? ((current_price - openPrice24h) / openPrice24h) * 100
      : 0;

  let history: ChartDataPoint[] = [];
  try {
    const ohlcRes = await fetch(`${KRAKEN_BASE_URL}/OHLC?pair=XBTUSD&interval=60`, {
      headers: { Accept: 'application/json' },
    });
    if (ohlcRes.ok) {
      const ohlcJson = await ohlcRes.json();
      const candles = ohlcJson?.result?.XXBTZUSD || ohlcJson?.result?.XBTUSD;
      if (Array.isArray(candles)) {
        history = candles.slice(-24).map((c: (string | number)[]) => ({
          timestamp: Number(c[0]) * 1000,
          price: parseFloat(String(c[4])),
        }));
      }
    }
  } catch (ohlcErr) {
    console.warn('Kraken OHLC history fetch failed:', ohlcErr);
  }

  return {
    current_price,
    price_change_percentage_24h,
    last_updated: new Date(),
    history,
  };
}

/**
 * Fetches full Bitcoin data including chart history with multi-provider resilient failover:
 * CoinGecko -> Binance -> Kraken
 */
export async function fetchBitcoinData(): Promise<BitcoinData> {
  try {
    return await fetchFromCoinGecko();
  } catch (cgError) {
    console.warn('CoinGecko failed, attempting fallback to Binance...', cgError);
    try {
      return await fetchFromBinance();
    } catch (binanceError) {
      console.warn('Binance failed, attempting fallback to Kraken...', binanceError);
      try {
        return await fetchFromKraken();
      } catch (krakenError) {
        console.error('All Bitcoin price providers failed:', krakenError);
        throw new Error('Failed to fetch Bitcoin data from all available sources.');
      }
    }
  }
}

/**
 * Retrieves concise Bitcoin market data formatted for cron snapshots and API endpoints.
 */
export async function getBitcoinMarketData(): Promise<BitcoinMarketData> {
  const data = await fetchBitcoinData();
  const satoshisPerDollar = calculateSatoshisPerDollar(data.current_price);

  return {
    priceUsd: data.current_price,
    change24h: Number(data.price_change_percentage_24h.toFixed(2)),
    satoshisPerDollar,
    lastUpdated: data.last_updated.toISOString(),
  };
}
