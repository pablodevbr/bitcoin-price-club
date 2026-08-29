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
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY)
  );
}

/**
 * Initializes and returns the GoogleGenAI instance.
 */
function getAiClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured (GEMINI_API_KEY or API_KEY).');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generates an analytical market commentary (2 to 3 sentences maximum) using Gemini LLM.
 * @param data - Market metrics (price, 24h change, satoshis)
 */
export async function generateMarketSummary(data: MarketAnalysisInput): Promise<string> {
  const { priceUsd, change24h } = data;
  const satoshis = data.satoshisPerDollar ?? Math.round(100_000_000 / (priceUsd || 1));
  const prompt = getMarketInsightPrompt(data);

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      return `Bitcoin is currently trading at $${priceUsd.toLocaleString()} (${change24h > 0 ? '+' : ''}${change24h}% in 24h), yielding ${satoshis.toLocaleString()} sats per dollar.`;
    }

    return text;
  } catch (error) {
    console.error('Gemini AI Generation Error:', error);
    return `Bitcoin is holding at $${priceUsd.toLocaleString()} (${change24h > 0 ? '+' : ''}${change24h}% in 24h), equivalent to ${satoshis.toLocaleString()} satoshis per USD.`;
  }
}

/**
 * Helper for UI components to generate insights directly from price and 24h change.
 */
export async function generateMarketInsight(price: number, change24h: number): Promise<string> {
  return generateMarketSummary({ priceUsd: price, change24h });
}
