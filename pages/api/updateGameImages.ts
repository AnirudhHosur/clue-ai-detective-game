import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { games } from "@/config/schema";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get authenticated user ID from Clerk
    const { userId } = getAuth(req);
    
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      gameId,
      generatedImageUrl,
      firebaseImageUrl,
      imageBase64,
    } = req.body;

    // Validate required fields
    if (!gameId) {
      res.status(400).json({ error: "Game ID is required" });
      return;
    }

    // Check if game exists and belongs to user
    const [existingGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, Number(gameId)))
      .limit(1);

    if (!existingGame) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    if (existingGame.userId !== userId) {
      res.status(403).json({ error: "Forbidden: You don't have access to this game" });
      return;
    }

    // Prepare images array
    let imagesArray: string[] = [];
    if (Array.isArray(existingGame.images)) {
      imagesArray = [...existingGame.images];
    }
    
    if (imageBase64 && typeof imageBase64 === "string") {
      imagesArray.push(imageBase64);
    }

    // Update game in database
    const [updatedGame] = await db
      .update(games)
      .set({
        generatedImageUrl: generatedImageUrl || existingGame.generatedImageUrl,
        firebaseImageUrl: firebaseImageUrl || existingGame.firebaseImageUrl,
        images: imagesArray,
      })
      .where(eq(games.id, Number(gameId)))
      .returning();

    res.status(200).json({
      success: true,
      game: updatedGame,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to update game images",
    });
  }
}