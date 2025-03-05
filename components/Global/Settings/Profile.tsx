"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import CardLayout from "../CardLayout";
import { Button } from "@/components/ui/button";
import { updateUserDetails } from "@/action/auth";
import { toast } from "sonner";
import { SettingsUser } from "@/icons/lib/types";
import CompanyProfile from "./CompanyProfile";
import { useRouter } from "next/navigation";

type Props = {
  user: SettingsUser;
};

const Profile = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const router = useRouter();

  const handleUpdateUserDetails = async () => {
    setLoading(true);
    try {
      // update user details
      const updateUser = await updateUserDetails(user?.id, {
        name,
        email,
      });

      if (updateUser.status !== 200) {
        throw new Error("Failed to update user details");
      }
      toast.success("User details updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to update user details", error);
      toast.error("Failed to update user details");
      setName(user.name);
      setEmail(user.email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardLayout
      heading="Profile"
      layoutId="team"
      subHeading="Lorem ipsum dolor sit amet consectetur. Est tristique in non"
    >
      <div className="w-full flex flex-col items-start justify-start gap-y-10 px-5">
        {/* User details */}
        <div className="w-full flex items-start justify-center flex-col gap-4">
          <p className="text-lg font-semibold">User Details</p>
          <div className="w-full flex justify-between items-center gap-12 flex-wrap">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 gap-2 items-start">
              <Input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                required
                placeholder="johndoe@gamil.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full flex justify-end">
            <Button
              variant={"outline"}
              className="px-8 py-4"
              disabled={
                loading || (user?.name === name.trim() && user?.email === email.trim())
              }
              onClick={handleUpdateUserDetails}
            >
              Update
            </Button>
          </div>
        </div>

        {/* Company name */}
        {user.accountType === "Company" && user.roles?.find((role) => role.roleType === "Owner") && (
          <CompanyProfile
            role={user.roles.find((role) => role.roleType === "Owner")!}
          />
        )}
      </div>
    </CardLayout>
  );
};

export default Profile;
