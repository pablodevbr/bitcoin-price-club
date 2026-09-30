// LLM Market Sentiment & Summary Integration using Google Gemini
import { GoogleGenAI } from '@google/genai';
import {
  marketInsightPromptTemplate,
  marketInsightFallbackPositiveTemplate,
  marketInsightFallbackNegativeTemplate,
  marketInsightFallbackNewsPositive,
  marketInsightFallbackNewsNegative,
} from '../prompts/market-insight.js';
import { MarketInsightResult } from '../types.js';

export interface MarketAnalysisInput {
  priceUsd: number;
  change24h: number;
  satoshisPerDollar?: number;
}

export type { MarketInsightResult };

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
 * Parses raw LLM text into structured summary and news topics.
 */
function parseAiResponse(rawText: string): { summary?: string; news?: string[] } | null {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') {
      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : undefined,
        news: Array.isArray(parsed.news)
          ? parsed.news
              .map((item: any) => String(item).trim())
              .filter((item: string) => item.length > 0)
          : Array.isArray(parsed.topics)
          ? parsed.topics
              .map((item: any) => String(item).trim())
              .filter((item: string) => item.length > 0)
          : undefined,
      };
    }
  } catch {
    // If JSON parsing fails, attempt regex extraction for summary and bullet topics
    try {
      const newsItems: string[] = [];
      const lines = rawText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^[-*•]\s+/.test(trimmed)) {
          const item = trimmed.replace(/^[-*•]\s+/, '').trim();
          if (item) newsItems.push(item);
        }
      }
      return {
        summary: rawText.replace(/[-*•].*$/gm, '').trim() || undefined,
        news: newsItems.length > 0 ? newsItems : undefined,
      };
    } catch {
      // Ignored
    }
  }
  return null;
}

/**
 * Generates an analytical market commentary along with a concise list of 24h news drivers.
 * Uses Google Gemini LLM with JSON mode, falling back gracefully to templates.
 */
export async function generateMarketAnalysis(data: MarketAnalysisInput): Promise<MarketInsightResult> {
  const { priceUsd, change24h } = data;
  const satoshis = data.satoshisPerDollar ?? Math.round(100_000_000 / (priceUsd || 1));
  const isPositive = change24h >= 0;

  // Prepare fallback data
  const priceFormatted = priceUsd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const changeFormatted = `${isPositive ? '+' : ''}${change24h.toFixed(2)}`;
  const satsFormatted = satoshis.toLocaleString('en-US');

  const fallbackTemplate = isPositive
    ? marketInsightFallbackPositiveTemplate
    : marketInsightFallbackNegativeTemplate;

  const fallbackSummary = interpolatePrompt(fallbackTemplate, {
    price: priceFormatted,
    change24h: changeFormatted,
    sats: satsFormatted,
  });

  const fallbackNews = isPositive
    ? [...marketInsightFallbackNewsPositive]
    : [...marketInsightFallbackNewsNegative];

  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = getMarketInsightPrompt(data);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const raw = response.text?.trim();
      if (raw) {
        const parsed = parseAiResponse(raw);
        if (parsed) {
          const summary = parsed.summary && parsed.summary.length > 15 ? parsed.summary : fallbackSummary;
          const newsTopics =
            parsed.news && parsed.news.length > 0
              ? parsed.news.slice(0, 3)
              : fallbackNews;

          return { summary, newsTopics };
        }
      }
    } catch (error) {
      console.warn('Gemini AI Generation Error, using contextual fallback from /prompts:', error);
    }
  }

  return {
    summary: fallbackSummary,
    newsTopics: fallbackNews,
  };
}

/**
 * Generates an analytical market commentary (2 to 3 sentences maximum) using Gemini LLM.
 * Backward compatible helper for components expecting only a string.
 */
export async function generateMarketSummary(data: MarketAnalysisInput): Promise<string> {
  const result = await generateMarketAnalysis(data);
  return result.summary;
}

/**
 * Helper for UI components to generate insights directly from price and 24h change.
 */
export async function generateMarketInsight(price: number, change24h: number): Promise<string> {
  return generateMarketSummary({ priceUsd: price, change24h });
}

