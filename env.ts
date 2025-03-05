
const env = {
  website:{
    origin: String(process.env.NEXT_PUBLIC_URL),
    googleRedirect:String(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT),
    nodeEnv: String(process.env.NODE_ENV),
  },

  supabase:{
    url: String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  stripe:{
    stripeSecretKey: String(process.env.STRIPE_SECRET_KEY),
    publishedKey: String(process.env.NEXT_PUBLIC_STRIPE_PUBLISHED_KEY),
    affiliatePercent: Number(process.env.NEXT_PUBLIC_AFFILIATE_PERCENT),
    subscriptionProductId: String(process.env.NEXT_PUBLIC_SUBSCRIPTION_PRODUCT_ID),
    stripeClientId: String(process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID),
    stripeWebhook: String(process.env.STRIPE_WEBHOOK_SECRET),
  },
  vercel:{
    projectId: String(process.env.VERCEL_PROJECT_ID),
    teamId: String(process.env.VERCEL_TEAM_ID),
    authToken: String(process.env.VERCEL_AUTH_TOKEN),
  },
  imagekit:{
    publicKey: String(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY),
    urlEndpoint: String(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT),
    privateKey: String(process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY),
  }
}

export default env;