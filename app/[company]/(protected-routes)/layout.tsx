import { onAuthenticateUser } from "@/action/auth";
import { redirect } from "next/navigation";

import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const auth = await onAuthenticateUser(false);
  if (auth.status !== 200) {
    //Todo: Add error inside the redirect
    redirect("/");
  }
  return <div className="w-full h-full">{children}</div>;
};

export default layout;
