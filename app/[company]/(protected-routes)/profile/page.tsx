import { onAuthenticateUser } from "@/action/auth";
import Notification from "@/components/Global/Settings/Notification";
import Profile from "@/components/Global/Settings/Profile";
import { SettingsUser } from "@/icons/lib/types";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = 'force-dynamic'

const page = async () => {
  const user = await onAuthenticateUser(true);
  if (user.status !== 200 || !user.data) {
    redirect("/");
  }
  const userData = user.data as SettingsUser;
  return (
    <div className="flex w-full flex-col space-y-10 justify-center items-center pb-10">
      <Profile user={userData} />
      <Notification
        notificationEnabled={user?.data?.notificationsEnabled}
        userId={user?.data?.id}
      />
    </div>
  );
};

export default page;
