import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { PayPalService } from "@/services/paypalService";

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

    const { creditsToAdd } = req.body;

    if (creditsToAdd === undefined || creditsToAdd <= 0) {
      res.status(400).json({ error: "Valid creditsToAdd value is required" });
      return;
    }

    // Update user credits using PayPalService
    const updatedUser = await PayPalService.updateUserCredits(userId, creditsToAdd);

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully added ${creditsToAdd} credits`,
      newCredits: updatedUser.credits,
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Error updating credits:", error);
    res.status(500).json({
      error: error.message || "Failed to update credits",
    });
  }
}