import React, { useState, useEffect, useCallback } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { PriceCard } from './components/PriceCard';
import { SatoshiCard } from './components/SatoshiCard';
import { QuoteSection } from './components/QuoteSection';
import { MarketChart } from './components/MarketChart';
import { AiInsight } from './components/AiInsight';
import { ShareButton } from './components/ShareButton';
import { fetchBitcoinData } from './lib/crypto';
import { BitcoinData } from './types';
import { Loader2 } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState<BitcoinData | null>(null);
  const [cachedSummary, setCachedSummary] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Update HTML class for Tailwind dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Try reading the daily snapshot from Vercel KV via /api/snapshot
      let snapshotSummary: string | undefined = undefined;
      try {
        const snapshotRes = await fetch('/api/snapshot');
        if (snapshotRes.ok) {
          const snapshotJson = await snapshotRes.json();
          if (snapshotJson?.data?.summary) {
            snapshotSummary = snapshotJson.data.summary;
            setCachedSummary(snapshotSummary);
          }
        }
      } catch (snapshotErr) {
        console.warn('Could not fetch snapshot from KV, continuing with live crypto data:', snapshotErr);
      }

      // 2. Fetch full Bitcoin market data (Price, 24h Change, and Chart History)
      const result = await fetchBitcoinData();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load Bitcoin data:', err);
      setError('Failed to load Bitcoin data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <SpeedInsights />
      <Analytics />

      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full sticky top-0 z-50 backdrop-blur-md bg-opacity-80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bitcoin rounded-full flex items-center justify-center shadow-lg shadow-bitcoin/20">
            <span className="text-white font-bold text-2xl">₿</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight hidden sm:block">Bitcoin Price Club</h1>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <ShareButton
              price={data.current_price}
              change24h={data.price_change_percentage_24h}
              summary={cachedSummary}
              className="hidden sm:inline-flex"
            />
          )}
          <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-12">
        <QuoteSection />

        {loading && !data ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin w-10 h-10 text-bitcoin" />
            <p className="text-slate-500 animate-pulse">Synchronizing with the blockchain &amp; KV cache...</p>
          </div>
        ) : error ? (
          <div className="p-8 border border-red-500/20 bg-red-500/10 rounded-2xl text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : data ? (
          <div className="space-y-12 animate-fade-in">
            {/* Top Cards: Price & Satoshis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PriceCard
                price={data.current_price}
                change24h={data.price_change_percentage_24h}
                lastUpdated={data.last_updated}
              />
              <SatoshiCard price={data.current_price} />
            </div>

            {/* Mobile Share on X Button */}
            <div className="flex sm:hidden justify-center">
              <ShareButton
                price={data.current_price}
                change24h={data.price_change_percentage_24h}
                summary={cachedSummary}
                className="w-full justify-center py-3 text-base"
              />
            </div>

            {/* Middle Grid: 24h Trend Chart & AI Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white/5 border border-slate-200/10 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-400">24 Hour Trend</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                    Live Sparkline
                  </span>
                </div>
                <div className="h-[300px] w-full">
                  <MarketChart
                    history={data.history}
                    color={data.price_change_percentage_24h >= 0 ? '#10B981' : '#EF4444'}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <AiInsight
                  currentPrice={data.current_price}
                  change24h={data.price_change_percentage_24h}
                  initialInsight={cachedSummary}
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 text-center text-slate-500 text-sm border-t border-slate-200/5 flex flex-col items-center gap-3">
        {data && (
          <div className="mb-2">
            <ShareButton
              price={data.current_price}
              change24h={data.price_change_percentage_24h}
              summary={cachedSummary}
            />
          </div>
        )}
        <p>Data provided by CoinGecko &amp; Gemini AI • Powered by Vercel KV</p>
        <p className="opacity-50">© {new Date().getFullYear()} Bitcoin Price Club (bitcoinprice.club)</p>
      </footer>
    </div>
  );
};

export default App;