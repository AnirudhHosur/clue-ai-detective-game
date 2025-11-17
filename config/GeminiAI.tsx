import { GoogleGenAI } from '@google/genai';

// Utility that sends a prompt to Gemini and returns the resulting text response
export async function generateMysteryGame(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY, // for local `.env` only, not client/browser!
  });

  const model = 'gemini-2.5-flash-image'; // or use a text-only model if available

  const config = {
    responseModalities: ['TEXT'],
  };

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  // Generate the streaming response
  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let fullText = '';
  for await (const chunk of response) {
    const textPart = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textPart) {
      fullText += textPart;
    }
    // Do NOT try .data for text response!
  }

  return fullText;
}
