import { db } from "@/config/db";
import { users } from "@/config/schema";
import { eq } from "drizzle-orm";

/**
 * Service to handle PayPal payment processing and credit updates
 */
export class PayPalService {
  /**
   * Update user credits after successful payment
   * @param userId - Clerk user ID
   * @param creditsToAdd - Number of credits to add
   * @returns Updated user object or null if user not found
   */
  static async updateUserCredits(userId: string, creditsToAdd: number) {
    try {
      // Fetch current user to get existing credits
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, userId))
        .limit(1);

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Calculate new credit balance
      const newCredits = (currentUser.credits || 0) + creditsToAdd;

      // Update user credits in database
      const [updatedUser] = await db
        .update(users)
        .set({ 
          credits: newCredits,
          updatedAt: new Date()
        })
        .where(eq(users.clerkUserId, userId))
        .returning();

      return updatedUser;
    } catch (error) {
      console.error("Error updating user credits:", error);
      throw error;
    }
  }

  /**
   * Create order details for PayPal
   * @param amount - Payment amount
   * @param currency - Currency code (default: USD)
   * @returns Order details object
   */
  static createOrderDetails(amount: number, currency: string = "USD") {
    return {
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
        },
      ],
    };
  }

  /**
   * Validate payment amount against plan
   * @param amount - Paid amount
   * @param expectedAmount - Expected amount for the plan
   * @returns Boolean indicating if amount is valid
   */
  static validatePaymentAmount(amount: number, expectedAmount: number) {
    // Allow small differences due to currency conversion
    return Math.abs(amount - expectedAmount) < 0.01;
  }
}