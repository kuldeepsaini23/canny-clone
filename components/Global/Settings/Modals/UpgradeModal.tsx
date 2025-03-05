"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Subscription, SubscriptionPlan, User } from "@prisma/client";
import { subscriptionPlans } from "@/icons/lib/constants";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { onGetStripeClientSecret, updateCardDetails, updateSubscription } from "@/action/stripe";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cancelSubscription } from "@/action/subscription";

type Props = {
  subscription: Subscription;
  user: User;
  currentPlan: SubscriptionPlan;
  setCurrentPlan: (plan: SubscriptionPlan) => void;
};

const UpgradeModal = ({ subscription, user, currentPlan, setCurrentPlan}: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    currentPlan
  );
  const [priceId, setPriceId] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const showStripeInput =
    subscription.plan === SubscriptionPlan.FREE &&
    (selectedPlan === SubscriptionPlan.BUSINESS ||
      selectedPlan === SubscriptionPlan.STARTER);


  const handleConfirm = async () => {
    setLoading(true); // Set loading state at the beginning

    try {
      if (
        (subscription.plan === SubscriptionPlan.STARTER ||
          subscription.plan === SubscriptionPlan.BUSINESS) &&
        selectedPlan === SubscriptionPlan.FREE
      ) {
        // Schedule cancellation at the end of the billing period
        if (!subscription.stripeSubscriptionId) {
          return toast.error("Subscription not found");
        }
        await cancelSubscription(subscription.stripeSubscriptionId);
        setCurrentPlan(selectedPlan);
        toast.success(
          "Your subscription will be canceled at the end of the billing period."
        );
        setOpen(false);
        return;
      }

      if (subscription.plan === SubscriptionPlan.STARTER && selectedPlan === SubscriptionPlan.BUSINESS) {
        // update subscription
        if (!subscription.stripeSubscriptionId) {
          return toast.error("Subscription not found");
        }
        await updateSubscription(subscription.stripeSubscriptionId, priceId, subscription.id);
        setCurrentPlan(selectedPlan);
        toast.success("Your subscription has been updated");
        setOpen(false);
        return;
      }

      if (!stripe || !elements) {
        return toast.error("Stripe not initialized");
      }
      if (!priceId) {
        return toast.error("Price ID not found");
      }

      const intent = await onGetStripeClientSecret(
        user.email,
        user.id,
        subscription.id,
        priceId,
        selectedPlan
      );
      console.log("INTENT", intent);

      if (!intent?.secret) {
        throw new Error("Failed to initialize payment");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card details not found");
      }
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intent.secret,
        {
          payment_method: { card: cardElement },
        }
      );
      if (error) {
        throw new Error(error?.message || "Payment failed");
      }

      if (subscription.stripeCustomerId) {
        console.log("UPDATING CARD DETAILS");
        await updateCardDetails(subscription.stripeCustomerId, subscription.id);
      }

      setCurrentPlan(selectedPlan);
      console.log("PAYMENT INTENT", paymentIntent);
      // Success handling
      toast.success("You have successfully upgraded your plan");
      setOpen(false);
    } catch (e) {
      console.log("SUBSCRIPTION-->", e);
      toast.error("Failed to update subscription");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-8 py-4">
          Upgrade
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl border-0 bg-[#0a0a0a] p-0 text-[#ffffff] shadow-lg">
        <div className="w-full p-6 flex flex-col gap-y-8 items-start justify-center">
          <DialogTitle className="text-lg font-semibold text-primary">
            Upgrade your plan
          </DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground text-sm">
            Choose the plan that suits you
          </DialogDescription>

          <RadioGroup
            value={selectedPlan}
            onValueChange={(value) => {
              setSelectedPlan(value as SubscriptionPlan);
              setPriceId(
                subscriptionPlans.find((plan) => plan.id === value)?.priceId ||
                  ""
              );
            }}
            className="space-y-4 w-full"
          >
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan.id as SubscriptionPlan);
                  setPriceId(plan.priceId || "");
                }}
                className={`w-full cursor-pointer rounded-xl border border-border px-3 py-4 bg-secondary ${
                  selectedPlan === plan.id ? "bg-secondary" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-4 flex p-4 items-center justify-center rounded-md bg-background border-input">
                    <plan.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-primary font-medium">
                      {plan.title}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {plan.description} (
                      <Link href="#" className="underline">
                        Click here
                      </Link>{" "}
                      to learn more)
                    </div>
                  </div>
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="h-4 w-4 border-primary text-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
          </RadioGroup>

          {showStripeInput && (
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#B4B0AE",
                    "::placeholder": {
                      color: "#B4B0AE",
                    },
                  },
                },
              }}
              className="border-[1px] outline-none rounded-lg p-3 w-full"
            />
          )}

          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-center space-x-2">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                className="h-5 w-5 border-primary data-[state=checked]:bg-secondary-foreground data-[state=checked]:text-secondary"
              />
              <label htmlFor="confirm" className="text-[#a1a1aa]">
                Yes, I want an upgrade
              </label>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!confirmed || loading}
              className="rounded-lg bg-[#333337] px-6 py-2 text-[#ffffff] hover:bg-[#27272a] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
