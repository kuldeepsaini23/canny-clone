"use client";

import Link from "next/link";
import ModeToggle from "../ModeToggle";
import React from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/icons/lib/constants";
import { Company, User } from "@prisma/client";
import { useUserStore } from "@/store/userStore";

type Props = {
  user: User | null;
  isAdmin: boolean;
  currCompany: Company;
};

const Sidebar = ({ user, isAdmin, currCompany }: Props) => {
  const pathname = usePathname();
  const {eye} = useUserStore();
  const visibleTabs = navigation.filter((item) => {
    if (!user)
      return item.name === "Change Log " || item.name === "Feature Tracker";
    if (!isAdmin) return item.name !== "Dashboard";
    return true;
  });



  return (
    <React.Fragment>
      <div className="fixed left-0 sm:left-1 xl:left-[12%] top-[40%] -translate-y-4 h-full w-16">
        <nav className="flex h-fit flex-col items-center justify-center gap-4">
          {visibleTabs.map((item) => (
            <Link
              key={item.name}
              href={
                item.name === "Settings" && !isAdmin
                  ? `/${currCompany?.slug}/profile`
                  : item.name === "Change Log" && isAdmin && eye
                  ? `/${currCompany?.slug}/create-change-logs`
                  : `/${currCompany?.slug}${item.href}`
              }
              className={`flex justify-center items-center p-2 rounded-lg ${
                pathname.includes(
                  item.name === "Settings" && !isAdmin
                    ? `/${currCompany?.slug}/profile`
                    : item.name === "Change Log" && isAdmin && eye
                    ? `/${currCompany?.slug}/create-change-logs`
                    : `/${currCompany?.slug}${item.href}`
                )
                  ? "bg-secondary"
                  : ""
              }`}
            >
              <item.icon />
              <span className="sr-only">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      <ModeToggle className="fixed left-0 sm:left-1 xl:left-[12%] bottom-7 bg-secondary border-0" />
    </React.Fragment>
  );
};

export default Sidebar;
