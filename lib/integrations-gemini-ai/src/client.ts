import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const gemini = apiKey ? new GoogleGenerativeAI(apiKey) : null;
