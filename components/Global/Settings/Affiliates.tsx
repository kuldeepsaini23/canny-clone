"use client";

import React, { useEffect } from "react";
import CardLayout from "../CardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link2 } from "lucide-react";
import { Subscription, User } from "@prisma/client";
import { toast } from "sonner";
import env from "@/env";
import Link from "next/link";
import { getStripeOAuthLink } from "@/utils/stripe/stripeOauth";
import { useRouter } from "next/navigation";
import { AffiliateWithReferred } from "@/icons/lib/types";
import { useInView } from "react-intersection-observer";
import { useGetAffiliates } from "@/hooks/settings/useAffiliates";
import InfiniteLoader from "../Loader";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

type Props = {
  user: User;
  companySlug: string;
  subscription: Subscription;
  success?: string;
  error?: string;
  initialData: {
    status: number;
    data: AffiliateWithReferred[] | [];
    nextCursor: string | null;
  };
};

const Affiliates = ({
  user,
  companySlug,
  subscription,
  success,
  error,
  initialData,
}: Props) => {
  const router = useRouter();
  const affiliateLink = `${env.website.origin}?modalOpen=true&affiliateId=${user.id}-${companySlug}&userType=Company`;
  const stripeOAuthLink = getStripeOAuthLink(
    `/stripe-connect`,
    `${subscription.id}company${companySlug}`
  );

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetAffiliates(companySlug, initialData);
  const { ref, inView } = useInView();

  const allAffiliates = data?.pages.flatMap((page) => page.data) || [];

  // ✅ Handle success & error messages once on mount
  useEffect(() => {
    if (success) {
      toast.success(success);
      router.replace(`/${companySlug}/settings`);
    }
    if (error) {
      toast.error(error);
      router.replace(`/${companySlug}/settings`);
    }
  }, [success, error, router, companySlug]);

  // ✅ Load more data when user scrolls into view
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <CardLayout
      layoutId="affiliates"
      heading="Affiliates"
      subHeading="Manage your affiliate partnerships"
      HeadingIcon={
        subscription?.stripeId && (
          <Link2
            className="w-4 h-4 hover:text-blue-300 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(affiliateLink);
              toast.success("Copied to clipboard");
            }}
          />
        )
      }
      buttonChildren={
        subscription.stripeId ? (
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex gap-1 items-end">
                <p className="text-3xl font-semibold">
                  ${user.monthlyIncome.toFixed(1) || 0}k
                </p>
                <p className="text-muted-foreground">per month</p>
              </div>
              <div className="flex gap-1 items-end">
                <p className="text-3xl font-semibold">
                  ${user.allTimeIncome.toFixed(1) || 0}k
                </p>
                <p className="text-muted-foreground">all time</p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={stripeOAuthLink}
            className="px-4 py-2 border text-sm rounded-sm border-input bg-background"
          >
            Connect Stripe
          </Link>
        )
      }
      childrenClassName="px-5"
    >
      <ScrollArea className="px-5 h-[250px]">
        {subscription?.stripeId ? (
          isLoading ? (
            <InfiniteLoader />
          ) : allAffiliates.length > 0 ? (
            allAffiliates.map((affiliate) => {
              return (
                <div
                  className="w-full flex justify-between items-center gap-3"
                  key={affiliate.id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={affiliate.referred?.avatar || ""}
                        alt={affiliate.referred?.name || "User"}
                      />
                      <AvatarFallback>
                        {affiliate.referred?.name
                          ? affiliate.referred.name.charAt(0)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {affiliate.referred?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {affiliate.referred?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full flex items-center justify-center mt-5">
              <p className="text-xl text-muted-foreground">
                No affiliates found
              </p>
            </div>
          )
        ) : (
          <div className="w-full flex items-center justify-center mt-5">
            <p className="text-xl text-muted-foreground">
              Please connect with Stripe
            </p>
          </div>
        )}

        {hasNextPage && (
          <>
            <div ref={ref} />
            {isFetchingNextPage && <InfiniteLoader />}
          </>
        )}
      </ScrollArea>
    </CardLayout>
  );
};

export default Affiliates;
