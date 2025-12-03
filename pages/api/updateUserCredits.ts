import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { users } from "@/config/schema";
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

    const { credits } = req.body;

    if (credits === undefined) {
      res.status(400).json({ error: "Credits value is required" });
      return;
    }

    // Update user credits
    const [updatedUser] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.clerkUserId, userId))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user credits:", error);
    res.status(500).json({
      error: error.message || "Failed to update user credits",
    });
  }
}