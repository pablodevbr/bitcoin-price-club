import { BitcoinData, ChartDataPoint } from '../types';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

// Helper to fetch from CoinGecko (Primary)
const fetchFromCoinGecko = async (): Promise<BitcoinData> => {
  // Fetch Price
  const priceRes = await fetch(
    `${COINGECKO_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`
  );
  
  if (!priceRes.ok) throw new Error('Failed to fetch price from CoinGecko');
  const priceJson = await priceRes.json();
  const btc = priceJson.bitcoin;

  // Fetch History (Sparkline for 24h)
  let history: ChartDataPoint[] = [];
  try {
      const historyRes = await fetch(
          `${COINGECKO_BASE_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=1`
      );
      if (historyRes.ok) {
          const historyJson = await historyRes.json();
          history = historyJson.prices.map((point: [number, number]) => ({
              timestamp: point[0],
              price: point[1]
          }));
      } else {
        console.warn(`CoinGecko history status: ${historyRes.status}`);
      }
  } catch (historyError) {
      console.warn("Failed to fetch CoinGecko history:", historyError);
  }

  return {
    current_price: btc.usd,
    price_change_percentage_24h: btc.usd_24h_change,
    last_updated: new Date(btc.last_updated_at * 1000),
    history,
  };
};

// Helper to fetch from Binance (Fallback)
const fetchFromBinance = async (): Promise<BitcoinData> => {
    // Ticker for price and 24h change
    const tickerRes = await fetch(`${BINANCE_BASE_URL}/ticker/24hr?symbol=BTCUSDT`);
    if (!tickerRes.ok) throw new Error('Failed to fetch price from Binance');
    const tickerData = await tickerRes.json();

    // Klines for history (1h intervals, last 24 points to match ~1 day chart)
    let history: ChartDataPoint[] = [];
    try {
        const klinesRes = await fetch(`${BINANCE_BASE_URL}/klines?symbol=BTCUSDT&interval=1h&limit=24`);
        if (klinesRes.ok) {
             const klines = await klinesRes.json();
             // kline format: [open_time, open, high, low, close, volume, ...]
             history = klines.map((k: any) => ({
                 timestamp: k[0],
                 price: parseFloat(k[4]) // Close price
             }));
        }
    } catch (e) {
        console.warn("Failed to fetch Binance history:", e);
    }

    return {
        current_price: parseFloat(tickerData.lastPrice),
        price_change_percentage_24h: parseFloat(tickerData.priceChangePercent),
        last_updated: new Date(), // Binance data is real-time
        history
    };
};

export const fetchBitcoinData = async (): Promise<BitcoinData> => {
  try {
    return await fetchFromCoinGecko();
  } catch (error) {
    console.warn("Primary crypto API failed, attempting fallback to Binance...", error);
    try {
        return await fetchFromBinance();
    } catch (binanceError) {
        console.error("Crypto Service Error: All sources failed", binanceError);
        throw new Error("Failed to fetch Bitcoin data from all available sources.");
    }
  }
};