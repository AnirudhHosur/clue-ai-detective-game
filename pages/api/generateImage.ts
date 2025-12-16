import type { NextApiRequest, NextApiResponse } from "next";
import Replicate from "replicate";
import dotenv from "dotenv";
import path from "path";

// Load environment variables explicitly
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

    // Check for API key
    const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ 
        error: "REPLICATE_API_TOKEN or REPLICATE_API_KEY is not configured. Please check your .env.local file.",
        details: "Copy .env.local.example to .env.local and add your actual API keys."
      });
      return;
    }

    // Initialize Replicate with API key
    const replicate = new Replicate({
      auth: apiKey,
    });

    // Generate image using Google Imagen-4 model
    const input = {
      prompt: prompt,
      aspect_ratio: "16:9",
      output_format: "jpg",
      safety_filter_level: "block_medium_and_above"
    };

    // Add timeout to Replicate call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    const output = await replicate.run("google/imagen-4", { 
      input,
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    // Extract the image URL from the output
    let imageUrl: string;
    
    if (output && typeof (output as any).url === "function") {
      imageUrl = (output as any).url();
    } else if (typeof output === "string") {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      if (typeof firstItem === "string") {
        imageUrl = firstItem;
      } else if (firstItem && typeof (firstItem as any).url === "function") {
        imageUrl = (firstItem as any).url();
      } else {
        imageUrl = (firstItem as any)?.url || "";
      }
    } else {
      imageUrl = (output as any)?.url || "";
    }

    if (!imageUrl) {
      res.status(500).json({ error: "Failed to extract image URL from response" });
      return;
    }

    // Fetch the image from the URL and convert to base64
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 30000); // 30 second timeout
    
    const imageResponse = await fetch(imageUrl, { signal: controller2.signal });
    clearTimeout(timeoutId2);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get the image as a buffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type from response or default to jpeg
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    
    // Convert to base64
    const base64Image = buffer.toString("base64");
    const base64DataUrl = `data:${contentType};base64,${base64Image}`;

    res.status(200).json({ 
      imageUrl,
      imageBase64: base64DataUrl
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to generate image",
    });
  }
}