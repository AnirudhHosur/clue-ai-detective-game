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
    
    if (!apiKey) {
      console.error("REPLICATE_API_KEY or REPLICATE_API_TOKEN is not set in environment variables");
      res.status(500).json({ 
        error: "REPLICATE_API_KEY or REPLICATE_API_TOKEN is not configured. Please check your .env.local file."
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

    const output = await replicate.run("google/imagen-4", { input });

    // Extract the image URL from the output using .url() method
    let imageUrl: string;
    
    // Handle the output which has a .url() method
    if (output && typeof (output as any).url === "function") {
      imageUrl = (output as any).url();
    } else if (typeof output === "string") {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      // Fallback: if it's an array, try to get the first element
      const firstItem = output[0];
      if (typeof firstItem === "string") {
        imageUrl = firstItem;
      } else if (firstItem && typeof (firstItem as any).url === "function") {
        imageUrl = (firstItem as any).url();
      } else {
        imageUrl = (firstItem as any)?.url || "";
      }
    } else {
      // Handle case where output might be an object with a URL property
      imageUrl = (output as any)?.url || "";
    }

    if (!imageUrl) {
      res.status(500).json({ error: "Failed to extract image URL from response" });
      return;
    }

    // Fetch the image from the URL and convert to base64
    try {
      const imageResponse = await fetch(imageUrl);
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
        imageUrl, // Keep URL for reference
        imageBase64: base64DataUrl // Return base64 data URL
      });
    } catch (fetchError: any) {
      console.error("Error fetching and converting image to base64:", fetchError);
      // Return URL even if base64 conversion fails
      res.status(200).json({ 
        imageUrl,
        imageBase64: null,
        error: fetchError.message || "Failed to convert image to base64"
      });
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({
      error: error.message || "Failed to generate image",
    });
  }
}