import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface PriceCardProps {
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price, change24h, lastUpdated }) => {
  const isPositive = change24h >= 0;

  return (
    <div className="relative group p-8 rounded-3xl bg-white/5 border border-slate-200/10 shadow-2xl backdrop-blur-sm overflow-hidden transition-transform hover:-translate-y-1 duration-300">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-bitcoin rounded-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-all duration-500 rotate-12">
        <span className="text-white font-bold text-8xl select-none">₿</span>
      </div>
      
      <div className="flex flex-col h-full relative z-10">
        <h2 className="text-slate-500 dark:text-slate-400 text-lg font-medium tracking-wide uppercase mb-2">Bitcoin Price</h2>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl sm:text-6xl font-bold font-mono tracking-widest text-slate-900 dark:text-white">
            ${price.toLocaleString()}
          </span>
          <span className="text-xl text-slate-500 font-mono">USD</span>
        </div>

        <div className="flex items-center gap-4 mt-auto">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
            isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(change24h).toFixed(2)}%
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={12} />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};