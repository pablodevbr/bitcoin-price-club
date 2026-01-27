import React from 'react';

export const QuoteSection: React.FC = () => {
  return (
    <div className="text-center py-12 px-4 relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bitcoin/10 rounded-full blur-[100px] -z-10 group-hover:bg-bitcoin/20 transition-colors duration-700"></div>
      <blockquote className="relative z-10">
        <p className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-bitcoin to-slate-400 animate-gradient-x bg-[length:200%_auto]">
          "Everyone buys bitcoin at the price they deserve"
        </p>
      </blockquote>
    </div>
  );
};