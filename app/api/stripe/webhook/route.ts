import { updateStripeSubscription } from "@/action/stripe";
import env from "@/env";
import { stripe } from "@/utils/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Configure relevant Stripe events
const STRIPE_SUBSCRIPTION_EVENTS = new Set([
  "invoice.created",
  "invoice.finalized",
  "invoice.paid",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  try {
    const stripeEvent = await getStripeEvent(body, signature);

    // Process only relevant subscription events
    if (!STRIPE_SUBSCRIPTION_EVENTS.has(stripeEvent.type)) {
      console.log("👉🏻 Unhandled irrelevant event!", stripeEvent.type);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const subscription = stripeEvent.data.object as Stripe.Subscription;
    const metadata = subscription.metadata;

    // Skip connected account events
    if (
      metadata.connectAccountPayments ||
      metadata.connectAccountSubscriptions
    ) {
      console.log("Skipping connected account subscription event");
      return NextResponse.json(
        { message: "Skipping connected account event" },
        { status: 200 }
      );
    }

    switch (stripeEvent.type) {
      // case "customer.subscription.created":
      case "customer.subscription.updated":
        console.log("CREATED FROM SUBSCRIPTION WEBHOOK 💳", stripeEvent.type);
        await updateStripeSubscription(subscription);
        return NextResponse.json({ received: true }, { status: 200 });
      default:
        // console.log("👉🏻 Unhandled relevant event!", stripeEvent.type);
        return NextResponse.json({ received: true }, { status: 200 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new NextResponse(`Webhook Error: ${error.message}`, {
      status: error.statusCode || 500,
    });
  }
}

// Helper functions
const getStripeEvent = async (
  body: string,
  sig: string | null
): Promise<Stripe.Event> => {
  const webhookSecret = env.stripe.stripeWebhook;

  if (!sig || !webhookSecret) {
    throw new Error("Stripe signature or webhook secret missing");
  }

  return stripe.webhooks.constructEvent(body, sig, webhookSecret);
};
