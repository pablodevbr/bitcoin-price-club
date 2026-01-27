import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketInsight = async (price: number, change24h: number): Promise<string> => {
  try {
    const prompt = `
      The current Bitcoin price is $${price.toLocaleString()} USD.
      The 24-hour change is ${change24h.toFixed(2)}%.
      
      Provide a very short, witty, or philosophical 2-sentence comment about this price action 
      in the style of a wise, slightly cynical financial guru. 
      If it's down, be encouraging but realistic. If it's up, be euphoric but cautious.
      Mention "satoshis" if relevant.
    `;

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