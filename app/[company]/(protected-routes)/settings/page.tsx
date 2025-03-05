import { getAllAffiliates } from "@/action/affiliates";
import { getAllUsers, onAuthenticateUser } from "@/action/auth";
import { getCompanyDetailsBySlug } from "@/action/company";
import { getCompanyAdmins } from "@/action/role";
import { getSubscription } from "@/action/subscription";
// import { checkDomainConfig } from "@/action/vercel";
import Affiliates from "@/components/Global/Settings/Affiliates";
import Billing from "@/components/Global/Settings/Billing";
import CustomDomain from "@/components/Global/Settings/CustomDomain";
import Notification from "@/components/Global/Settings/Notification";
import Profile from "@/components/Global/Settings/Profile";
import SettingTabs from "@/components/Global/Settings/SettingTabs";
import TeamMembers from "@/components/Global/Settings/TeamMembers";
import { SettingsUser } from "@/icons/lib/types";
import { RoleType } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{
    company: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { company } = await params;
  const { success, error } = await searchParams;
  const user = await onAuthenticateUser(true);
  if (user.status !== 200 || !user.data) {
    redirect("/");
  }
  const [admins, allUsers, subscription, companyDetails, allAffiliates] =
    await Promise.all([
      getCompanyAdmins(company, null),
      getAllUsers(user.data.id),
      getSubscription(user.data.id),
      getCompanyDetailsBySlug(company),
      getAllAffiliates(company, null),
    ]);

  if (subscription.status !== 200 || !subscription.data) {
    redirect("/");
  }

  // if (true) {
  //   const checkDomainStatus = await checkDomainConfig("www.taniabhardwaj.com");
  //   console.log(checkDomainStatus);
  // }

  const userData = user.data as SettingsUser;
  const isOwner = userData.roles.some(
    (role) => role.companySlug === company && role.roleType === RoleType.Owner
  );

  return (
    <div className="flex w-full flex-col space-y-10 justify-center items-center pb-10">
      <SettingTabs />
      {isOwner && <Profile user={userData} />}

      <TeamMembers
        companySlug={company}
        initialData={{
          ...admins,
          data: admins.data || [],
          nextCursor: admins.nextCursor || null,
        }}
        allUsers={allUsers.data || []}
        user={user.data}
      />

      <Affiliates
        user={user?.data}
        companySlug={company}
        subscription={subscription.data}
        success={success}
        error={error}
        initialData={allAffiliates}
      />

      {isOwner && (
        <Billing subscription={subscription?.data} user={user?.data} />
      )}
      <CustomDomain companyDomain={companyDetails?.data?.customDomain || ""} />

      {/*Todo Think about that */}
      {isOwner && (
        <Notification
          notificationEnabled={user?.data?.notificationsEnabled}
          userId={user?.data?.id}
        />
      )}
    </div>
  );
};

export default page;
