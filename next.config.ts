import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    dangerouslyAllowSVG:true,
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '**',
        
      },
      {
        protocol: 'https',
        hostname: 'czumehkevpcgfswvjqjk.supabase.co',
        port: '',
        pathname: '**',
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
    ]
  }
};

export default nextConfig;
