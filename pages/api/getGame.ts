import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { games } from "@/config/schema";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Game ID is required" });
      return;
    }

    const gameId = parseInt(id, 10);
    if (isNaN(gameId)) {
      res.status(400).json({ error: "Invalid game ID" });
      return;
    }

    // Fetch game from database
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    // Check if user owns this game
    if (game.userId !== userId) {
      res.status(403).json({ error: "Forbidden: You don't have access to this game" });
      return;
    }

    res.status(200).json({ game });
  } catch (error: any) {
    console.error("Error fetching game:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch game",
    });
  }
}

