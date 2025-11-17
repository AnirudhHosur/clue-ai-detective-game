import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY, // Server reads from .env
    });

    const model = "gemini-2.5-flash-image";
    const config = { responseModalities: ["TEXT"] };
    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullText = "";
    for await (const chunk of response) {
      const textPart = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textPart) fullText += textPart;
    }
    res.status(200).json({ result: fullText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "AI request failed" });
  }
}
