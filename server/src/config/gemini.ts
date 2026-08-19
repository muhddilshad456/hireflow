import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const LLM_MODEL = "gemini-3.6-flash";
