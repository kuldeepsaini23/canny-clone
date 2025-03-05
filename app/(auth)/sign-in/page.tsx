"use client"
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import React from "react";



const page = () => {
  const handleGoogleOAuth = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider : "google",
      options: {
        redirectTo:  'http://localhost:3000/api/callback',
      },
    })
    

  };
  return (
    <Button onClick={() => handleGoogleOAuth()}>Sign in with Google</Button>
  );
};

export default page;
