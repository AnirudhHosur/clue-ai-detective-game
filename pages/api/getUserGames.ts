import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { games } from "@/config/schema";
import { eq, desc } from "drizzle-orm";

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

    // Fetch games from database for this user
    const userGames = await db
      .select()
      .from(games)
      .where(eq(games.userId, userId))
      .orderBy(desc(games.createdAt));

    res.status(200).json({ games: userGames });
  } catch (error: any) {
    console.error("Error fetching user games:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch games",
    });
  }
}