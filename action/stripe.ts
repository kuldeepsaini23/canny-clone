"use server";
import { prisma } from "@/utils/prisma/client";
import Stripe from "stripe";
import {  SubscriptionPlan } from "@prisma/client";
import env from "@/env";
import { planPricing } from "@/icons/lib/constants";
import { stripe } from "@/utils/stripe";

export const onGetStripeClientSecret = async (
  email: string,
  userId: string,
  subscriptionId: string,
  priceId: string,
  plan: SubscriptionPlan
) => {
  try {
    // 1. Check if the customer already exists
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({ email: email });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create a new customer if one doesn't exist
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
    }

    await prisma.subscription.update({
      where: { userId: userId },
      data: {
        stripeCustomerId: customer.id,
      },
    })
  

    // 2. Create or update the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: userId,
        subscription: subscriptionId,
        plan: plan,
      },
    });

    const paymentIntent = (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent;
    return {
      status: 200,
      secret: paymentIntent.client_secret,
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Subscription creation error:", error);
    return { status: 400, message: "Failed to create subscription" };
  }
};

export const updateStripeSubscription = async (subscription: Stripe.Subscription) => {
  try {
    console.log("Updating subscription", subscription);

    const amount =
      subscription.items.data.reduce((total, item) => {
        return total + (item.price.unit_amount || 0);
      }, 0) / 100; // Convert amount from cents to dollars

    const user = await prisma.user.findUnique({
      where: { id: subscription.metadata.userId },
    });

    console.log("User", user);

    if (!user) {
      throw new Error("User not found");
    }

    const companySubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    console.log("Company Subscription", companySubscription);

    if (!companySubscription) {
      throw new Error("Subscription not found");
    }

    // Check if the user was referred and update affiliate income
    const affiliate = await prisma.affiliate.findFirst({
      where: { referredId: user.id },
    });

    console.log("Affiliate", affiliate);

    if (affiliate && affiliate.referrerId) {
      // Update the affiliate status to Active
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          affiliatesStatus:
            subscription.status === "active" ? "Active" : "Lead",
        },
      });

      console.log("Affiliate updated");
      let commission = 0;
      if (
        companySubscription.plan === SubscriptionPlan.STARTER &&
        subscription.metadata.plan === SubscriptionPlan.BUSINESS
      ) {
        commission =
          ((planPricing["BUSINESS"] - planPricing["STARTER"]) *
            env.stripe.affiliatePercent) /
          100;
      } else {
        commission = (amount * env.stripe.affiliatePercent) / 100;
      }

      console.log("Commission", commission);

      if (subscription.status === "active") {
       


        const referrer = await prisma.user.update({
          where: {
            id: affiliate.referrerId,
          },
          data: {
            allTimeIncome: {
              increment: commission,
            },
            monthlyIncome:{
              increment:commission
            }
          },
          include: {
            subscription: true,
          },
        });

        console.log("Referrer updated");

        if (referrer?.subscription?.stripeId) {
          await stripe.transfers.create({
            amount: Math.round(commission * 100), // Convert to cents
            currency: "usd",
            destination: referrer?.subscription?.stripeId,
            description: `Commission for referring ${affiliate.referredId}`,
          });
          console.log("Commission transferred");
        }
      }
      else{
        await prisma.user.update({
          where: {
            id: affiliate.referrerId,
          },
          data: {
            monthlyIncome:{
              decrement:commission
            }
          }
        })

        console.log("Commission deducted")
      }
    }

    // Update the subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        expiresAt: new Date(subscription.current_period_end * 1000),
        plan: subscription.metadata.plan as SubscriptionPlan,
        stripeSubscriptionId: subscription.id,
      },
    });

    return {
      status: 200,
      data: updatedSubscription,
    };
  } catch (e) {
    console.error("Subscription update failed:", e);
    return {
      status: 500,
      message: "Failed to update subscription",
    };
  }
};



//update subscription


export const updateSubscription = async (subscriptionId: string, priceId: string, prismaSubscriptionId: string) => {
  try {

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);


    const subscriptionItemId = subscription.items.data[0].id;


    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: priceId,
        },
      ],
      metadata: {
        plan: SubscriptionPlan.BUSINESS,
        subscription: prismaSubscriptionId, 
      },
    });

    return { status: 200 };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }
};



//update payment method
export const updateCardDetails = async (customerId: string, subscriptionId:string) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    console.log("PAYMENT METHODS-->",paymentMethods);

    await prisma.subscription.update({
      where:{id:subscriptionId},
      data:{
        cardBrand:paymentMethods.data[0].card?.brand,
        cardLast4:paymentMethods.data[0].card?.last4,
      }
    })

    console.log("PAYMENT METHOD UPDATED");

    return { status: 200 };
  } catch (error) {
    console.error("Error updating payment method:", error);
    return { status: 500, error: error instanceof Error ? error.message : "Unknown error" };
  }
}