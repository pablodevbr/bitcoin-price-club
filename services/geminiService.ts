import { GoogleGenAI } from "@google/genai";
import { getMarketInsightPrompt } from "./promptService";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketInsight = async (price: number, change24h: number): Promise<string> => {
  try {
    const prompt = getMarketInsightPrompt({ price, change24h });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    return response.text?.trim() || "The market is pondering...";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "The market is always right, even when it's confusing.";
  }
};