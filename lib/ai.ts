// LLM Market Sentiment & Summary Integration using Google Gemini
import { GoogleGenAI } from '@google/genai';
import {
  marketInsightPromptTemplate,
  marketInsightFallbackPositiveTemplate,
  marketInsightFallbackNegativeTemplate,
} from '../prompts/market-insight.js';

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
 * Falls back gracefully to the templates in /prompts/market-insight.ts if API key is unconfigured.
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
      console.warn('Gemini AI Generation Error, using contextual fallback from /prompts:', error);
    }
  }

  // Interpolate fallback template from /prompts/market-insight.ts
  const isPositive = change24h >= 0;
  const priceFormatted = priceUsd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const changeFormatted = `${isPositive ? '+' : ''}${change24h.toFixed(2)}`;
  const satsFormatted = satoshis.toLocaleString('en-US');

  const fallbackTemplate = isPositive
    ? marketInsightFallbackPositiveTemplate
    : marketInsightFallbackNegativeTemplate;

  return interpolatePrompt(fallbackTemplate, {
    price: priceFormatted,
    change24h: changeFormatted,
    sats: satsFormatted,
  });
}

/**
 * Helper for UI components to generate insights directly from price and 24h change.
 */
export async function generateMarketInsight(price: number, change24h: number): Promise<string> {
  return generateMarketSummary({ priceUsd: price, change24h });
}
