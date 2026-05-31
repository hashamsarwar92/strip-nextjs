"use client";
// app/pricing/page.tsx
//
// This is the pricing page users see before subscribing.
// When they click "Get Started", it calls our /api/stripe/create-checkout endpoint
// and redirects them to Stripe's payment page.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/lib/stripe/stripe_plans";
import { Check } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  
  // Track which plan is currently being processed (for loading state)
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  async function handleSubscribe(priceId: string | null) {
    // Free plan — just redirect to dashboard
    if (!priceId) {
      router.push("/dashboard");
      return;
    }

    setLoadingPriceId(priceId);

    try {
      // Call our backend to create a Stripe Checkout Session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId: "price_1Td7erD0vTr3liAbgEq4F2re" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect the user to Stripe's payment page
      // data.url is the Stripe checkout URL
      window.location.assign(data.url);

    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPriceId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 text-xl">
            Choose the plan that works best for you
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isPopular = plan.name === "Pro";
            const isLoading = loadingPriceId === plan.priceId;

            return (
              <div
                key={plan.name}
                className={`
                  relative rounded-2xl p-8 flex flex-col
                  ${isPopular
                    ? "bg-indigo-600 ring-2 ring-indigo-400 scale-105"
                    : "bg-gray-900 ring-1 ring-gray-800"
                  }
                `}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-400 text-indigo-950 text-sm font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Name & Price */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className={`text-sm mb-4 ${isPopular ? "text-indigo-200" : "text-gray-400"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className={isPopular ? "text-indigo-200" : "text-gray-400"}>
                        /month
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check
                        size={18}
                        className={isPopular ? "text-indigo-200" : "text-indigo-400"}
                      />
                      <span className={`text-sm ${isPopular ? "text-white" : "text-gray-300"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading}
                  className={`
                    w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${isPopular
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }
                  `}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : plan.price === 0 ? (
                    "Get Started Free"
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security Note */}
        <p className="text-center text-gray-500 text-sm mt-12">
          🔒 Payments are securely processed by Stripe. We never store your card details.
        </p>
      </div>
    </div>
  );
}
