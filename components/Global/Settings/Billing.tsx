"use client";
import React, { useState } from "react";
import CardLayout from "../CardLayout";
import { Subscription, User } from "@prisma/client";
import { subscriptionBenefits } from "@/icons/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpgradeModal from "./Modals/UpgradeModal";
import { StripeElements } from "../stripe";

type Props = {
  subscription: Subscription;
  user: User;
};

const Billing = ({ subscription, user }: Props) => {
  const [currentPlan, setCurrentPlan] = useState(subscription.plan);
  return (
    <CardLayout
      heading="Billing"
      layoutId="billing"
      subHeading="Lorem ipsum dolor sit amet consectetur. Est tristique in non"
      buttonChildren={
        <StripeElements>
          <UpgradeModal
            subscription={subscription}
            user={user}
            currentPlan={currentPlan}
            setCurrentPlan={setCurrentPlan}
          />
        </StripeElements>
      }
      childrenClassName="px-5 flex flex-col sm:flex-row py-5 justify-between items-center gap-4"
    >
      <div className="p-5 w-full sm:w-[400px] flex flex-col items-start gap-3 border border-input bg-secondary rounded-xl">
        <p className="font-bold text-sm text-muted-foreground">
          {subscription.plan} Plan
        </p>
        <div className="w-full flex justify-between gap-3 items-center">
          <p className="font-bold text-primary">
            XXXX XXXX XXXX {subscription?.cardLast4 || "XXXX"}
          </p>
          <p className="text-lg font-semibold text-primary">$0</p>
        </div>
        <div className="w-full flex justify-between gap-3 items-center">
          <div>
            <p className="text-xs text-muted-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">Expiry {user.name}</p>
          </div>

          <p className="text-lg font-semibold text-primary">
            ${subscription.plan}
          </p>
        </div>
      </div>
      <div className="w-full h-full flex gap-4 flex-col items-start justify-start">
        <Tabs className="w-full h-full" defaultValue={subscription?.plan}>
          <div className="w-full h-full flex gap-3 items-start justify-between">
            <div>
              <p className="text-lg font-semibold text-primary">
                {subscription?.plan} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                Currently Subscribed
              </p>
            </div>

            <TabsList>
              {subscriptionBenefits.map((benefit, idx) => (
                <TabsTrigger value={benefit.value} key={idx}>
                  {benefit.value}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {subscriptionBenefits.map((benefit, idx) => (
            <TabsContent value={benefit.value} key={idx}>
              <div className="w-full flex flex-col gap-3">
                {benefit.perks.map((perk, idx) => (
                  <div className="flex items-center gap-3" key={idx}>
                    <span>{perk.icons}</span>
                    <span className="text-sm text-muted-foreground">
                      {perk.perk}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </CardLayout>
  );
};

export default Billing;
