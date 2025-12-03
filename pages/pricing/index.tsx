import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useUserContext } from "@/contexts/UserContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function PricingPage() {
  const { user: dbUser, isLoading: userLoading, refreshUser } = useUserContext();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Pricing plans
  const pricingPlans = [
    {
      id: 1,
      name: "Starter Pack",
      credits: 5,
      price: 4.99,
      description: "Perfect for trying out our detective games",
      popular: false,
    },
    {
      id: 2,
      name: "Investigator Bundle",
      credits: 15,
      price: 12.99,
      description: "Great value for regular players",
      popular: true,
    },
    {
      id: 3,
      name: "Detective Pro",
      credits: 30,
      price: 24.99,
      description: "Best value for dedicated sleuths",
      popular: false,
    },
    {
      id: 4,
      name: "Master Sleuth",
      credits: 75,
      price: 59.99,
      description: "Unlimited mystery solving",
      popular: false,
    },
  ];

  // Handle plan selection
  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
    setShowPayPal(true);
  };

  // Create PayPal order
  const createOrder = async (data: any, actions: any) => {
    try {
      console.log("Creating order with data:", data);
      
      if (!selectedPlan) {
        throw new Error("No plan selected");
      }
      
      const plan = pricingPlans.find(p => p.id === selectedPlan);
      if (!plan) {
        throw new Error("Plan not found");
      }
      
      // Create PayPal order with proper format
      const orderData = {
        purchase_units: [
          {
            amount: {
              value: plan.price.toFixed(2)
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

  // Handle PayPal approval
  const onApprove = async (data: any, actions: any) => {
    try {
      setProcessing(true);
      console.log("Approval data:", data);
      
      // Capture the payment
      const details = await actions.order.capture();
      console.log("Captured payment:", details);
      
      if (!selectedPlan) {
        throw new Error("No plan selected");
      }
      
      const plan = pricingPlans.find(p => p.id === selectedPlan);
      if (!plan) {
        throw new Error("Plan not found");
      }
      
      // Call API to update user credits
      const response = await fetch("/api/updateCredits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creditsToAdd: plan.credits,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update credits");
      }
       
      // Refresh user context to show updated credits
      await refreshUser();
      
      toast.success(`Successfully added ${plan.credits} credits to your account!`);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
      setShowPayPal(false);
    }
  };

  // Handle PayPal cancellation
  const onCancel = () => {
    toast.warning("Your payment was cancelled. No credits were added to your account.");
    setShowPayPal(false);
    setSelectedPlan(null);
  };

  // Handle PayPal error
  const onError = (err: any) => {
    console.error("PayPal error:", err);
    toast.error("There was an error processing your payment. Please try again.");
    setShowPayPal(false);
    setSelectedPlan(null);
  };

  // Handle back to plans
  const handleBackToPlans = () => {
    setShowPayPal(false);
    setSelectedPlan(null);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <div className="text-center max-w-3xl">
          <motion.h1 
            className={title()}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Add More&nbsp;
          </motion.h1>
          <motion.h1 
            className={title({ color: "violet" })}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Credits
          </motion.h1>
          <motion.p 
            className="mt-4 text-lg text-default-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Purchase credits to create more AI-powered detective games
          </motion.p>
        </div>

        {/* Current Credits Display */}
        {!userLoading && dbUser && (
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl max-w-2xl w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="text-2xl font-bold">{dbUser.credits}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Current Credits</h2>
                  <p className="opacity-90">Ready to solve more mysteries</p>
                </div>
              </div>
              <div className="bg-white/20 px-6 py-3 rounded-xl">
                <p className="text-sm opacity-90">1 credit = 1 game</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* PayPal Buttons Section */}
        {showPayPal && selectedPlan && (
          <motion.div 
            className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
              <Button 
                variant="light" 
                onClick={handleBackToPlans}
                className="text-purple-600 dark:text-purple-400"
              >
                ← Back to Plans
              </Button>
            </div>
            
            {(() => {
              const plan = pricingPlans.find(p => p.id === selectedPlan);
              if (!plan) return null;
              
              return (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-default-500">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{plan.credits} credits</div>
                      <div className="text-lg">${plan.price}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {processing ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={onCancel}
                onError={onError}
              />
            )}
          </motion.div>
        )}

        {/* Pricing Plans */}
        {!showPayPal && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`relative h-full ${
                    plan.popular
                      ? "border-2 border-purple-500 shadow-xl scale-105"
                      : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-xs font-bold px-4 py-1 rounded-full z-10">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-6">
                    <h3 className="text-xl font-bold text-center">{plan.name}</h3>
                    <p className="text-center text-default-500 text-sm mt-1">{plan.description}</p>
                  </CardHeader>
                  <CardBody className="py-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{plan.credits}</div>
                      <div className="text-default-500">credits</div>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${plan.price}</span>
                      </div>
                      <div className="mt-1 text-xs text-default-400">
                        ${(plan.price / plan.credits).toFixed(2)} per credit
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter className="pt-2 pb-6">
                    {dbUser ? (
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                        <Button
                          color={plan.popular ? "secondary" : "primary"}
                          variant={plan.popular ? "shadow" : "solid"}
                          className="w-full font-bold py-3"
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          Select Plan
                        </Button>
                      </motion.div>
                    ) : (
                      <Button
                        color={plan.popular ? "secondary" : "primary"}
                        variant={plan.popular ? "shadow" : "solid"}
                        className="w-full font-bold py-3"
                        disabled
                      >
                        Sign in to purchase
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl w-full mt-8">
          <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <motion.div 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-bold">How do credits work?</h3>
              <p className="text-default-500 mt-1">
                Each credit allows you to create one AI-powered detective game. Credits never expire and can be used anytime.
              </p>
            </motion.div>
            <motion.div 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="font-bold">Can I get a refund?</h3>
              <p className="text-default-500 mt-1">
                Credits are non-refundable but never expire. If you're having issues, please contact our support team.
              </p>
            </motion.div>
            <motion.div 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="font-bold">Do unused credits expire?</h3>
              <p className="text-default-500 mt-1">
                No, your credits never expire. Purchase what you need and use them whenever you're ready.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}