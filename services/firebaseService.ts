import { storage } from "@/config/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

/**
 * Service to handle Firebase Storage operations
 * 
 * SECURITY NOTE: This service runs on the server-side only to protect Firebase credentials.
 * Never expose Firebase credentials to the client-side/browser.
 * 
 * All Firebase operations must be performed server-side to prevent exposure of:
 * - Firebase API keys
 * - Storage bucket details
 * - Authentication tokens
 * 
 * This service should only be imported and used in API routes or server-side functions.
 */
export class FirebaseService {
  /**
   * Upload an image to Firebase Storage and return the download URL
   * @param imageBase64 - Base64 encoded image data
   * @param fileName - Name to use for the file in storage (optional)
   * @returns Download URL of the uploaded image
   */
  static async uploadImageFromBase64(imageBase64: string, fileName?: string): Promise<string> {
    try {
      // Remove the data URL prefix if present
      let base64Data = imageBase64;
      if (imageBase64.startsWith("data:")) {
        base64Data = imageBase64.split(",")[1];
      }

      // Generate a unique filename if not provided
      const finalFileName = fileName || `game-images/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;

      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, finalFileName);

      // Upload the base64 string
      await uploadString(storageRef, base64Data, "base64");

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image to Firebase Storage:", error);
      throw error;
    }
  }

  /**
   * Upload an image from URL to Firebase Storage and return the download URL
   * @param imageUrl - URL of the image to upload
   * @param fileName - Name to use for the file in storage (optional)
   * @returns Download URL of the uploaded image
   */
  static async uploadImageFromUrl(imageUrl: string, fileName?: string): Promise<string> {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Convert to base64
      const arrayBuffer = await response.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      // Upload the base64 data
      return await this.uploadImageFromBase64(base64Data, fileName);
    } catch (error) {
      console.error("Error uploading image from URL to Firebase Storage:", error);
      throw error;
    }
  }
}