"use server";
import { prisma } from "@/utils/prisma/client";
import { stripe } from "@/utils/stripe";
import { SubscriptionPlan } from "@prisma/client";

export const getSubscription = async (userId: string) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
      },
    });

    return { status: 200, data: subscription };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
};


export const updateStripeId = async(stripeId: string, subscriptionId: string) => {
  try {
    await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        stripeId,
      },
    });

    return { status: 200 };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
}


export const connectStripe = async(code: string, state: string)=> {
  try {
    if (!code || !state) {
      return { success: false, error: "Missing required parameters" };
    }

    console.log("Connecting business with code:", code, "and state:", state);

    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    if (!response.stripe_user_id) {
      return { status:400, error: "Failed to connect business" };
    }

    await prisma.subscription.update({
      where: { id: state },
      data: { stripeId: response.stripe_user_id },
    });

    console.log("Business connected successfully!");
    return { status:200 };
  } catch (error) {
    console.error("Error connecting business:", error);
    return { status:500, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export const cancelSubscription = async(subscriptionId: string) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId,
      },
    });

    if (!subscription) {
      return { status: 404, error: "Subscription not found" };
    }

    if (!subscription.stripeSubscriptionId) {
      return { status: 400, error: "Subscription is not connected to Stripe" };
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        plan: SubscriptionPlan.FREE,
      },
    });

    //also update affliliate status

    return { status: 200 };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}

