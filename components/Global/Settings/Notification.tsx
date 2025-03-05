"use client";
import React, { useState } from "react";
import CardLayout from "../CardLayout";
import { Switch } from "@/components/ui/switch";
import { changeNotificationStatus } from "@/action/auth";
import { toast } from "sonner";

type Props = {
  notificationEnabled: boolean;
  userId: string;
}

const Notification = ({notificationEnabled, userId}:Props) => {
  const [notification, setNotification] = useState(notificationEnabled);
  const handleNotification = async(check:boolean) => {
    setNotification(check);
    try{
      // update notification settings
      const updateNotification = await changeNotificationStatus(userId, check);
      if(updateNotification.status !== 200){
        throw new Error("Failed to update notification settings");
      }
      toast.success("Notification settings updated successfully");
    }catch(error){
      console.error("Failed to update notification settings", error);
      setNotification(!check);
      toast.error("Failed to update notification settings");
    }
  };
  return (
    <CardLayout
      layoutId="notification"
      heading="Notification"
      subHeading="You can customize your notification settings here"
    >
      <div className="w-full flex justify-between items-center gap-3 px-5 flex-wrap">
        <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet consectetur. Est tristique in non</p>

        <Switch id="airplane-mode" checked={notification} onCheckedChange={handleNotification}/>
      </div>
    </CardLayout>
  );
};

export default Notification;
