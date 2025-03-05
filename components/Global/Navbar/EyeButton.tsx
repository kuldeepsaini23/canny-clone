"use client";
import { Button } from "@/components/ui/button";
import EyeIcon from "@/icons/EyeIcon";
import { useUserStore } from "@/store/userStore";
import React from "react";

const EyeButton = () => {
  const { eye, setEye } = useUserStore();

  const handleView = () => {
    setEye(!eye);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`px-3 py-2 hover:bg-secondary transition-all duration-500 ease-in-out ${
        eye ? "bg-secondary" : ""
      }`}
      onClick={handleView}
    >
      <EyeIcon />
    </Button>
  );
};

export default EyeButton;
