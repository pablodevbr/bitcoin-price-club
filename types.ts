// Unified Project Types & Interfaces

export interface ChartDataPoint {
  timestamp: number;
  price: number;
}

export interface BitcoinData {
  current_price: number;
  price_change_percentage_24h: number;
  last_updated: Date;
  history: ChartDataPoint[];
}

export interface BitcoinMarketData {
  priceUsd: number;
  change24h: number;
  satoshisPerDollar: number;
  lastUpdated: string;
}

export interface DailySnapshot {
  priceUsd: number;
  change24h: number;
  satoshisPerDollar: number;
  summary: string;
  updatedAt: string;
}

export interface CoinGeckoPriceResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
}
