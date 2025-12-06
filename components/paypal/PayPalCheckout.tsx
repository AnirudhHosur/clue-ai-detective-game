import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useUserContext } from "@/contexts/UserContext";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

interface PricingPlan {
  id: number;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular: boolean;
}

interface PayPalCheckoutProps {
  selectedPlan: PricingPlan | null;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  onBack: () => void;
}

export default function PayPalCheckout({
  selectedPlan,
  processing,
  setProcessing,
  onBack,
}: PayPalCheckoutProps) {
  const { refreshUser } = useUserContext();
  const router = useRouter();
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Create PayPal order
   */
  const createOrder = async (data: any, actions: any) => {
    console.log("Creating order with data:", data);

    if (!selectedPlan) {
      const error = new Error("No plan selected");
      toast.error("Please select a plan before proceeding with payment.");
      throw error;
    }

    try {
      // Create PayPal order with proper format
      const orderData = {
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: selectedPlan.price.toFixed(2)
            }
          }
        ]
      };

      console.log("Sending order data:", orderData);

      const orderId = await actions.order.create(orderData);

      console.log("Created order ID:", orderId);
      console.log("Order ID type:", typeof orderId);

      // Handle different return types
      if (typeof orderId === 'string' && orderId.length > 0) {
        console.log("Returning valid string order ID");
        return orderId;
      }

      if (orderId && typeof orderId === 'object' && orderId.id) {
        console.log("Returning object order ID:", orderId.id);
        return orderId.id;
      }

      // If we get here, there's an issue with the order ID
      console.error("Invalid order ID returned:", orderId);
      throw new Error("Invalid order ID returned from PayPal. Please try again.");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create payment order: " + (error as Error).message);
      throw error;
    }
  };

  /**
   * Handle PayPal approval - simplified version
   */
  const onApprove = async (data: any, actions: any) => {
    console.log("Approval data:", data);

    // Validate actions object
    if (!actions || !actions.order) {
      console.error("Missing actions.order in onApprove");
      toast.error("Payment processing error. Please try again.");
      setProcessing(false);
      return;
    }

    try {
      // Capture payment immediately - this is critical and must happen first
      console.log("Starting immediate payment capture...");
      const details = await actions.order.capture();
      console.log("Captured payment:", details);

      // Validate selected plan
      if (!selectedPlan) {
        throw new Error("No plan selected");
      }

      // Update user credits via API
      console.log("Updating user credits...");
      const response = await fetch("/api/updateCredits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creditsToAdd: selectedPlan.credits,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update credits");
      }

      // Refresh user context
      console.log("Refreshing user data...");
      await refreshUser();

      // Show success message and redirect
      toast.success(`Successfully added ${selectedPlan.credits} credits to your account!`);

      // Simple redirect without delays
      setProcessing(false);
      onBack();
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Error processing payment:", error);

      // Handle specific window closed error
      if (error.message && error.message.includes("Window closed")) {
        toast.error("Payment processing was interrupted. The PayPal window was closed. Please try again.");
      } else {
        toast.error(error.message || "Failed to process payment. Please try again.");
      }

      // Reset state
      setProcessing(false);
    }
  };

  /**
   * Handle PayPal cancellation
   */
  const onCancel = () => {
    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.warn("Component unmounted during cancellation");
      return;
    }

    toast.warning("Your payment was cancelled. No credits were added to your account.");
    // Reset state after a short delay to ensure proper cleanup
    setTimeout(() => {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.warn("Component unmounted during cancel timeout");
        return;
      }

      setProcessing(false);
      onBack();
    }, 1000);
  };

  /**
   * Handle PayPal error
   */
  const onError = (err: any) => {
    console.error("PayPal error:", err);

    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.warn("Component unmounted during error");
      return;
    }

    toast.error("There was an error processing your payment. Please try again.");
    // Reset state after a short delay to ensure proper cleanup
    setTimeout(() => {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.warn("Component unmounted during error timeout");
        return;
      }

      setProcessing(false);
      onBack();
    }, 1000);
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
              <p className="text-default-500">{selectedPlan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedPlan.credits} credits</div>
              <div className="text-lg">${selectedPlan.price}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {processing ? (
        <Card>
          <CardBody>
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="ml-4 self-center">Processing your payment...</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <PayPalButtons
          style={{ 
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
            tagline: false
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
          disabled={processing}
        />
      )}
    </div>
  );
}