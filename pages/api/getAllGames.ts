import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { games, users } from "@/config/schema";
import { desc, eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log("Fetching all games with user information...");
    
    // Fetch all games with user information
    const allGames = await db
      .select({
        id: games.id,
        title: games.title,
        genre: games.genre,
        tone: games.tone,
        difficulty: games.difficulty,
        imageUrl: games.generatedImageUrl,
        createdAt: games.createdAt,
        username: users.username,
        userEmail: users.email,
      })
      .from(games)
      .leftJoin(users, eq(games.userId, users.clerkUserId))
      .orderBy(desc(games.createdAt));

    console.log("Successfully fetched games:", allGames.length);
    res.status(200).json({ games: allGames });
  } catch (error: any) {
    console.error("Error fetching all games:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: error.message || "Failed to fetch games",
      details: error.stack || "No stack trace available"
    });
  }
}