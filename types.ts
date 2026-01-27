export interface CoinGeckoPriceResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
}

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
