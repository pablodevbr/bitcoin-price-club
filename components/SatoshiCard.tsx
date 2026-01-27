import React from 'react';
import { Layers } from 'lucide-react';

interface SatoshiCardProps {
  price: number;
}

export const SatoshiCard: React.FC<SatoshiCardProps> = ({ price }) => {
  // 1 BTC = 100,000,000 Satoshis
  // Value of 1 Sat in USD = Price / 100,000,000
  // Value of $1 USD in Sats = 100,000,000 / Price
  
  const satsPerDollar = Math.floor(100_000_000 / price);
  const oneSatValue = price / 100_000_000;

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-bitcoin/10 to-transparent border border-bitcoin/20 shadow-2xl backdrop-blur-sm overflow-hidden transition-transform hover:-translate-y-1 duration-300">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2">
            <Layers className="text-bitcoin w-5 h-5" />
            <h2 className="text-bitcoin text-lg font-medium tracking-wide uppercase">Satoshi Value</h2>
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold font-mono tracking-widest">
              {satsPerDollar.toLocaleString()}
            </span>
            <span className="text-lg text-slate-500 font-mono">sats / $1</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Stacking sats is still accessible.</p>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200/5">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">1 Satoshi = </span>
                <span className="font-mono text-slate-300">${oneSatValue.toFixed(8)}</span>
            </div>
             <div className="w-full bg-slate-700/30 h-1 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-bitcoin w-full animate-pulse opacity-50"></div>
            </div>
        </div>
      </div>
    </div>
  );
};