"use client";

import type React from "react";
import { useQueryState } from "nuqs";
import FeaturePosts from "./FeaturePosts";
import type { User } from "@supabase/supabase-js";
import { PostType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PostWithCounts } from "@/icons/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

type Props = {
  scrollHeight: string;
  search?: string;
  user: User | null;
  companySlug: string;
  initialDevelopmentData: PostWithCounts[] | [];
  initialCompletedData: PostWithCounts[] | [];
  initialPlannedData: PostWithCounts[] | [];
  isUserJoined:boolean
};

const FeatureTracker = ({
  scrollHeight,
  search,
  user,
  companySlug,
  initialCompletedData,
  initialDevelopmentData,
  initialPlannedData,
  isUserJoined
}: Props) => {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: search || "",
  });





  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const debouncedSearchQuery = useDebounce(searchQuery || "", 300);

  const featureTrackerData = [
    {
      title: "Planned",
      type: PostType.Planned,
      initialData: initialPlannedData,
    },
    {
      title: "In Development",
      type: PostType.InDevelopment,
      initialData: initialDevelopmentData,
    },
    {
      title: "Completed",
      type: PostType.Completed,
      initialData: initialCompletedData,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-y-5 items-start">
      <div className="w-full">
        <h4 className="text-lg text-foreground font-semibold">
          Feature tracker
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Track the progress of our features
        </p>
        <div className="w-full relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search options..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="grid w-full md:grid-cols-3 grid-cols-1 place-content-center place-items-center gap-6">
        {featureTrackerData.map((feature, index) => (
          <div key={index} className="w-full flex flex-col gap-y-2">
            <div className="flex gap-2 items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  feature.type === PostType.Planned
                    ? "bg-blue-500"
                    : feature.type === PostType.InDevelopment
                    ? "bg-yellow-500"
                    : "bg-green-500"
                } rounded-md`}
              />
              <h5 className="text-lg text-foreground font-semibold">
                {feature.title}
              </h5>
            </div>
            <FeaturePosts
              scrollHeight={scrollHeight}
              user={user}
              postType={feature.type}
              companySlug={companySlug}
              searchQuery={debouncedSearchQuery}
              initialData={feature.initialData}
              isUserJoined={isUserJoined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureTracker;
