import env from "@/env";
import { loadStripe } from "@stripe/stripe-js";

export const useStripeElements = (connectedAccountId?: string) => {
  if (connectedAccountId) {
    const StripePromise = async () =>
      await loadStripe(env.stripe.publishedKey ?? "", {
        stripeAccount: connectedAccountId,
      });

    return { StripePromise };
  }

  const StripePromise = async () =>
    await loadStripe(env.stripe.publishedKey ?? "");

  return { StripePromise };
};
