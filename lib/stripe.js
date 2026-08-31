import Stripe from "stripe";

// Ленивая инициализация — см. пояснение в lib/supabase.js
let _stripe = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return _stripe;
}
