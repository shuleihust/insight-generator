// lib/stripe/server.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const PRICING_PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    amount: 19900, // $199.00
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_YEARLY!,
    amount: 199900, // $1999.00
  },
  lifetime: {
    priceId: process.env.STRIPE_PRICE_LIFETIME!,
    amount: 399900, // $3999.00
  },
}
