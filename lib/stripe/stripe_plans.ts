export const PLANS = [
  {
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    priceId: null,
    features: [
      "5 GB Storage",
      "Upload up to 10 files",
      "Basic file sharing",
    ],
  },
  {
    name: "Pro",
    description: "Perfect for individuals and small teams",
    price: 9.99,
    priceId: "pro",   // ← just a key, not the real Stripe ID
    features: [
      "50 GB Storage",
      "Unlimited file uploads",
      "Advanced file sharing",
      "Priority support",
    ],
  },
  {
    name: "Business",
    description: "For growing teams with advanced needs",
    price: 29.99,
    priceId: "business",  // ← just a key
    features: [
      "500 GB Storage",
      "Unlimited file uploads",
      "Team collaboration",
      "Admin controls",
      "24/7 support",
    ],
  },
];