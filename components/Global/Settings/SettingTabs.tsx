"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { settingTabs } from "@/icons/lib/constants";

const SettingTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");


  const handleValueChange = (value: string) => {
    setActiveTab(value);
    router.push(`/settings#${value}`);
  };

  useEffect(() => {
    const tab = pathname.split("#")[1];
    if (tab) {
      setActiveTab(tab);
    }
  }, [pathname]);

  return (
    <div className=" max-w-lg mx-auto flex flex-col gap-y-10">
      <Tabs
        value={activeTab}
        onValueChange={handleValueChange}
        className="w-full"
      >
        <TabsList className="bg-transparent space-x-3">
          {settingTabs.map((tab, idx) => (
            <TabsTrigger
              value={tab.value}
              key={idx}
              className="text-sm font-medium hover:bg-foreground hover:text-background data-[state=active]:bg-foreground data-[state=active]:text-background "
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SettingTabs;
