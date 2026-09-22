// LLM Market Sentiment & Summary Integration using Google Gemini
import { GoogleGenAI } from '@google/genai';
import { marketInsightPromptTemplate } from '../prompts/market-insight';

export interface MarketAnalysisInput {
  priceUsd: number;
  change24h: number;
  satoshisPerDollar?: number;
}

/**
 * Replaces placeholders in {{key}} format with provided values.
 */
export function interpolatePrompt(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return key in variables ? String(variables[key]) : `{{${key}}}`;
  });
}

/**
 * Builds formatted prompt from the modular template in /prompts/market-insight.ts
 */
export function getMarketInsightPrompt(data: MarketAnalysisInput): string {
  const priceFormatted = data.priceUsd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const changeFormatted = `${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}`;
  const satoshis = data.satoshisPerDollar ?? Math.round(100_000_000 / (data.priceUsd || 1));

  return interpolatePrompt(marketInsightPromptTemplate, {
    price: priceFormatted,
    change24h: changeFormatted,
    sats: satoshis.toLocaleString('en-US'),
  });
}

/**
 * Resolves the Gemini API key from environment variables.
 */
function getApiKey(): string | undefined {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY);

  if (!key || key.includes('PLACEHOLDER') || key.length < 10) {
    return undefined;
  }
  return key;
}

/**
 * Generates an analytical market commentary (2 to 3 sentences maximum) using Gemini LLM.
 * Falls back gracefully to intelligent financial analysis in English if API key is unconfigured.
 * @param data - Market metrics (price, 24h change, satoshis)
 */
export async function generateMarketSummary(data: MarketAnalysisInput): Promise<string> {
  const { priceUsd, change24h } = data;
  const satoshis = data.satoshisPerDollar ?? Math.round(100_000_000 / (priceUsd || 1));
  const prompt = getMarketInsightPrompt(data);

  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text && text.length > 20) {
        return text;
      }
    } catch (error) {
      console.warn('Gemini AI Generation Error, using contextual fallback:', error);
    }
  }

  // Intelligent Contextual Fallback in English based on live market momentum
  const isPositive = change24h >= 0;
  const formattedPrice = `$${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedChange = `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`;
  const formattedSats = satoshis.toLocaleString('en-US');

  if (isPositive) {
    return `Bitcoin displays disciplined upward momentum trading at ${formattedPrice} USD (${formattedChange} in 24h). Institutional liquidity absorption remains robust as purchasing power holds steady at ${formattedSats} satoshis per dollar.`;
  }

  return `Bitcoin is navigating a healthy technical consolidation trading at ${formattedPrice} USD (${formattedChange} in 24h). The retracement widens the strategic accumulation window for sovereign stackers (${formattedSats} satoshis per USD) with a disciplined long-term horizon.`;
}

/**
 * Helper for UI components to generate insights directly from price and 24h change.
 */
export async function generateMarketInsight(price: number, change24h: number): Promise<string> {
  return generateMarketSummary({ priceUsd: price, change24h });
}
