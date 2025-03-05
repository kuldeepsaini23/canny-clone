"use client";
import { Button } from "@/components/ui/button";
import LogoutIcon from "@/icons/LogoutIcon";
import { supabaseClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const Logout = () => {
  const handleLogout = async() => {
    const {error} = await supabaseClient.auth.signOut();
    if(error) {
      return toast.error(error.message);
    }
    redirect("/");
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="px-3 py-2 hover:bg-secondary transition-all duration-500 ease-in-out"
      onClick={handleLogout}
    >
      <LogoutIcon />
    </Button>
  );
};

export default Logout;
