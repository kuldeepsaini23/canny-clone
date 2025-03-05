import env from "@/env";

export const getStripeOAuthLink = (url: string, data: string) => {
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${env.stripe.stripeClientId}&scope=read_write&redirect_uri=${env.website.origin}${url}&state=${data}`;
};
