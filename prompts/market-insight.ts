// Market Insight AI Prompt & Fallback Templates
// Centralized in /prompts for easy editing and maintenance

export const marketInsightPromptTemplate = `
You are a sharp, analytical cryptocurrency market analyst for "Bitcoin Price Club".

Current Bitcoin Market Data:
- Spot Price: \${{price}} USD
- 24h Change: {{change24h}}%
- Satoshis per $1 USD: {{sats}} sats

Task:
1. Summary: Write a short, analytical, and insightful market sentiment summary for today in English (strictly 2 to 3 sentences maximum).
Tone: Pragmatic, objective, and wise with subtle financial acumen. If the price is down, highlight long-term perspective and satoshi accumulation window; if up, maintain disciplined optimism and liquidity consolidation. Do not use markdown formatting, quotes, or greetings.

2. 24h News Topics: List 2 to 3 concise, highly relevant news topics or market drivers from the past 24 hours that may have impacted the Bitcoin price during this period.
Requirements for topics: Only the short topic/headline (maximum 12-15 words each), objective, and direct.

Response Format:
You MUST respond with valid JSON matching this schema:
{
  "summary": "2 to 3 sentences market sentiment summary",
  "news": [
    "First concise 24h news headline/driver",
    "Second concise 24h news headline/driver",
    "Third concise 24h news headline/driver"
  ]
}
`.trim();

export const marketInsightFallbackPositiveTemplate =
  'Bitcoin displays disciplined upward momentum trading at ${{price}} USD ({{change24h}}% in 24h). Institutional liquidity absorption remains robust as purchasing power holds steady at {{sats}} satoshis per dollar.';

export const marketInsightFallbackNegativeTemplate =
  'Bitcoin is navigating a healthy technical consolidation trading at ${{price}} USD ({{change24h}}% in 24h). The retracement widens the strategic accumulation window for sovereign stackers ({{sats}} satoshis per USD) with a disciplined long-term horizon.';

export const marketInsightFallbackNewsPositive = [
  'Institutional spot ETF inflows and treasury accumulation reinforce spot demand',
  'Global liquidity expansion signals sustained macro resilience across digital assets',
  'On-chain accumulation strengthens as exchange reserves reach multi-year lows',
];

export const marketInsightFallbackNewsNegative = [
  'Derivatives leverage flush and options expiry trigger short-term market consolidation',
  'Macro treasury yield shifts and hawkish central bank rhetoric pause risk-on momentum',
  'Strategic accumulation accelerates at key support levels amidst spot absorption',
];

