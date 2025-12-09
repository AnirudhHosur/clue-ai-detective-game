import type { NextApiRequest, NextApiResponse } from "next";
import { storage } from "@/config/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }

    // Convert image URL to base64
    const base64image = await convertImageToBase64(imageUrl);

    // Create filename
    const fileName = `game-images/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;

    // Upload to Firebase Storage
    const imageRef = ref(storage, fileName);
    const snapshot = await uploadString(imageRef, base64image, 'data_url');

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Return the Firebase download URL
    res.status(200).json({
      firebaseImageUrl: downloadURL
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to upload image to Firebase Storage"
    });
  }
}

// Helper function to convert image URL to base64
async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Determine content type
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // Return data URL format
    return `data:${contentType};base64,${base64String}`;
  } catch (error) {
    throw error;
  }
}