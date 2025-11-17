import type { NextApiRequest, NextApiResponse } from "next";
import Replicate from "replicate";
import dotenv from "dotenv";
import path from "path";

// Load environment variables explicitly
// Next.js should load .env.local automatically, but this ensures it works
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

export default async function generateImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    // Check for API key first - support both REPLICATE_API_KEY and REPLICATE_API_TOKEN
    const apiKey = process.env.REPLICATE_API_KEY || process.env.REPLICATE_API_TOKEN;
    
    // Debug logging (remove in production)
    console.log("Environment check:");
    console.log("- REPLICATE_API_KEY exists:", !!process.env.REPLICATE_API_KEY);
    console.log("- REPLICATE_API_TOKEN exists:", !!process.env.REPLICATE_API_TOKEN);
    console.log("- Using API key:", !!apiKey);
    console.log("- API key length:", apiKey?.length || 0);
    console.log("- All env vars starting with REPLICATE:", Object.keys(process.env).filter(k => k.startsWith("REPLICATE")));
    
    if (!apiKey) {
      console.error("REPLICATE_API_KEY or REPLICATE_API_TOKEN is not set in environment variables");
      console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes("API") || k.includes("KEY") || k.includes("TOKEN")));
      res.status(500).json({ 
        error: "REPLICATE_API_KEY or REPLICATE_API_TOKEN is not configured. Please check your .env.local file.",
        debug: {
          hasKey: !!apiKey,
          hasReplicateKey: !!process.env.REPLICATE_API_KEY,
          hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
          envKeys: Object.keys(process.env).filter(k => k.includes("API") || k.includes("KEY") || k.includes("TOKEN"))
        }
      });
      return;
    }

    // Initialize Replicate with API key
    const replicate = new Replicate({
      auth: apiKey,
    });

    // Generate image using Flux Schnell model
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
        },
      }
    );

    // Extract the image URL from the output
    // The output is typically an array of URLs
    let imageUrl: string;
    
    if (Array.isArray(output) && output.length > 0) {
      // If output is an array of URLs
      imageUrl = typeof output[0] === "string" ? output[0] : output[0].toString();
    } else if (typeof output === "string") {
      imageUrl = output;
    } else {
      // Handle case where output might be an object with a URL property
      imageUrl = (output as any)?.url || (output as any)?.[0]?.url || "";
    }

    if (!imageUrl) {
      res.status(500).json({ error: "Failed to extract image URL from response" });
      return;
    }

    res.status(200).json({ imageUrl });
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({
      error: error.message || "Failed to generate image",
    });
  }
}