import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateMarketInsight } from '../services/geminiService';

interface AiInsightProps {
  currentPrice: number;
  change24h: number;
}

export const AiInsight: React.FC<AiInsightProps> = ({ currentPrice, change24h }) => {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInsight = async () => {
    if (!process.env.API_KEY) {
      setInsight("Please configure your Gemini API Key to receive AI insights.");
      return;
    }
    setLoading(true);
    const text = await generateMarketInsight(currentPrice, change24h);
    setInsight(text);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="h-full flex flex-col p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-500/20 shadow-2xl backdrop-blur-sm transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300">Gemini Insight</h3>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        {loading && !insight ? (
          <div className="space-y-2 w-full">
            <div className="h-2 bg-indigo-200 dark:bg-slate-700/50 rounded w-3/4 animate-pulse"></div>
            <div className="h-2 bg-indigo-200 dark:bg-slate-700/50 rounded w-full animate-pulse"></div>
            <div className="h-2 bg-indigo-200 dark:bg-slate-700/50 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <p className="text-lg text-slate-900 dark:text-slate-100 font-serif italic leading-relaxed opacity-100 transition-colors duration-300">
            "{insight || "The market is pondering..."}"
          </p>
        )}
      </div>

      <div className="mt-4 text-xs text-indigo-700/80 dark:text-slate-500 text-right font-semibold">
        Analysis based on current price action
      </div>
    </div>
  );
};