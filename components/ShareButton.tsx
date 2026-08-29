import React from 'react';

interface ShareButtonProps {
  price?: number;
  change24h?: number;
  summary?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  price = 0,
  change24h = 0,
  summary,
  className = '',
}) => {
  const handleShareOnX = () => {
    const shareUrl = 'https://bitcoinprice.club';
    const formattedPrice = price > 0 ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 'Bitcoin';
    const changeSign = change24h >= 0 ? '+' : '';
    const formattedChange = `${changeSign}${change24h.toFixed(2)}%`;
    const sats = price > 0 ? Math.round(100_000_000 / price).toLocaleString('en-US') : '1,000+';

    // Construct compelling tweet text
    let tweetText = `₿ Bitcoin is at ${formattedPrice} USD (${formattedChange} in 24h)\n⚡ $1 USD = ${sats} Satoshis\n\n`;

    if (summary && summary.trim().length > 0) {
      // Truncate long summary if needed to stay within tweet limit
      const cleanSummary = summary.replace(/^["']|["']$/g, '');
      const maxLen = 140;
      const truncated = cleanSummary.length > maxLen ? `${cleanSummary.substring(0, maxLen)}...` : cleanSummary;
      tweetText += `"${truncated}"\n\n`;
    }

    tweetText += 'Daily on-chain intelligence & AI market pulse:';

    const intentParams = new URLSearchParams({
      text: tweetText,
      url: shareUrl,
      hashtags: 'Bitcoin,BTC,Crypto,BitcoinPriceClub',
    });

    const intentUrl = `https://x.com/intent/post?${intentParams.toString()}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  return (
    <button
      onClick={handleShareOnX}
      type="button"
      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 bg-slate-900 text-white hover:bg-black border border-slate-700/60 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white backdrop-blur-md group ${className}`}
      title="Compartilhar no 𝕏"
    >
      {/* 𝕏 Logo SVG */}
      <svg
        className="w-4 h-4 fill-current transition-transform group-hover:scale-110"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span>Compartilhar no 𝕏</span>
    </button>
  );
};
