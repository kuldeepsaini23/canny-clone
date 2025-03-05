import env from "@/env";
import Stripe from "stripe";

export const stripe = new Stripe(env.stripe.stripeSecretKey ?? '', {
  apiVersion: '2025-02-24.acacia',
  appInfo:{
    name: 'Leaderboard Saas',
    version: '0.1.0'
  }
}) 