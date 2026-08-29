// Bitcoin Price, Chart History & Satoshi Conversion Utilities
// Primary Provider: CoinGecko API | Fallback Provider: Binance Public API

import { BitcoinData, BitcoinMarketData, ChartDataPoint } from '../types';

export const SATOSHIS_IN_ONE_BITCOIN = 100_000_000;
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

/**
 * Calculates the amount of Satoshis purchasable for $1.00 USD.
 * @param priceUsd - Current Bitcoin price in USD
 */
export function calculateSatoshisPerDollar(priceUsd: number): number {
  if (!priceUsd || priceUsd <= 0) return 0;
  return Math.round(SATOSHIS_IN_ONE_BITCOIN / priceUsd);
}

/**
 * Fetches current price, 24h change and sparkline history from CoinGecko.
 */
async function fetchFromCoinGecko(): Promise<BitcoinData> {
  // 1. Fetch Current Price & 24h Change
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

  // 2. Fetch 24h Price History
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
 * Fallback: Fetches current price, 24h change and klines history from Binance.
 */
async function fetchFromBinance(): Promise<BitcoinData> {
  // 1. Fetch 24hr Ticker
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

  // 2. Fetch 1h Klines History (last 24 periods)
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
 * Fetches full Bitcoin data including chart history with resilient fallback.
 * Ideal for frontend dashboard rendering.
 */
export async function fetchBitcoinData(): Promise<BitcoinData> {
  try {
    return await fetchFromCoinGecko();
  } catch (error) {
    console.warn('CoinGecko failed, attempting fallback to Binance...', error);
    try {
      return await fetchFromBinance();
    } catch (binanceError) {
      console.error('All Bitcoin price providers failed:', binanceError);
      throw new Error('Failed to fetch Bitcoin data from all available sources.');
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
