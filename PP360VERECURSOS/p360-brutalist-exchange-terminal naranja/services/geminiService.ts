
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMarketInsight = async (amount: number, rate: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a very short, brutalist-style financial insight for a user exchanging ${amount} USD at a rate of ${rate} VES/USD. Use uppercase and keep it under 15 words. Example: LIQUIDITY STABLE. OPTIMAL WINDOW DETECTED.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "MARKET SIGNAL: STABLE // VOLATILITY LOW";
  }
};
