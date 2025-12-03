import type { NextApiRequest, NextApiResponse } from "next";
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
    const { clerkUserId, email, username } = req.body;

    if (!clerkUserId || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (existingUser) {
      // Return existing user
      res.status(200).json(existingUser);
      return;
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        clerkUserId,
        email,
        username: username || null,
        credits: 2, // Default credits
      })
      .returning();

    res.status(200).json(newUser);
  } catch (error: any) {
    console.error("Error handling user:", error);
    res.status(500).json({
      error: error.message || "Failed to handle user",
    });
  }
}