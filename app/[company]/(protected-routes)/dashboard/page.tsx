import React from "react";
import GetStartedCard from "./_components/GetStartedCard";
import FeatureTracker from "@/components/Global/FeatureTracker";
import MostUpvotedCard from "./_components/MostUpvotedCard";
import { getUser } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import { FeedbackSortOption, TimePeriod } from "@/icons/lib/types";
import { getAllPost, getPostsByType } from "@/action/post";
import ShowCategory from "../../(public-routes)/category/_components/ShowCategory";
import { getAllCategoriesByCompany } from "@/action/category";
import { isUserJoinedCompany } from "@/action/role";

type Props = {
  params: Promise<{
    company: string;
  }>;
  searchParams: Promise<{
    search?: string;
    timePeriod?: TimePeriod;
    sortBy?: FeedbackSortOption;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { company } = await params;
  const { search, sortBy, timePeriod } = await searchParams;
  const user = await getUser();
  if (!user) {
    return redirect("/");
  }

  const [
    completedPosts,
    plannedPosts,
    developmentPosts,
    allPosts,
    categories,
    userJoinedResult,
  ] = await Promise.all([
    getPostsByType(company, "Completed", search || "", null),
    getPostsByType(company, "Planned", search || "", null),
    getPostsByType(company, "InDevelopment", search || "", null),
    getAllPost(company, null, sortBy || "recent", timePeriod || "daily"),
    getAllCategoriesByCompany(company, null, 10),
    user ? isUserJoinedCompany(user.id, company) : { status: 200, data: null },
  ]);

  const isUserJoined = user ? !!userJoinedResult.data : false;

  return (
    <div className="w-full h-full flex flex-col items-start justify-normal gap-y-10 pb-10 sm:pb-20">
      {/* Get Started Card */}
      <GetStartedCard />

      {/* Category */}
      <div className="w-full flex flex-col gap-y-5 items-start">
        <div className="w-full">
          <h4 className="text-lg text-foreground font-semibold">Categories</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Track the progress of our features
          </p>
          <ShowCategory
            search={search || ""}
            companySlug={company}
            initialData={categories}
            isEdit={true}
          />
        </div>
      </div>

      {/* Feature tracker */}
      <FeatureTracker
        scrollHeight="h-[350px]"
        companySlug={company}
        user={user}
        search={search}
        initialCompletedData={completedPosts.data || []}
        initialDevelopmentData={developmentPosts.data || []}
        initialPlannedData={plannedPosts.data || []}
        isUserJoined={isUserJoined}
      />

      {/* Most UpVoted Posts */}
      <MostUpvotedCard
        user={user}
        companySlug={company}
        sortByQuery={sortBy}
        sortByTime={timePeriod}
        initialData={allPosts.data || []}
        isUserJoined={isUserJoined}
      />
    </div>
  );
};

export default page;
