import { getPostsByType } from "@/action/post";
import { isUserJoinedCompany } from "@/action/role";
import FeatureTracker from "@/components/Global/FeatureTracker";
import { getUser } from "@/utils/supabase/queries";
import React from "react";

type Props = {
  params: Promise<{
    company: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { company } = await params;
  const { search } = await searchParams;
  const user = await getUser();
  const [completedPosts, plannedPosts, developmentPosts, userJoinedResult] =
    await Promise.all([
      getPostsByType(company, "Completed", search || "", null),
      getPostsByType(company, "Planned", search || "", null),
      getPostsByType(company, "InDevelopment", search || "", null),
      user
        ? isUserJoinedCompany(user.id, company)
        : { status: 200, data: null },
    ]);

  const isUserJoined = user ? !!userJoinedResult.data : false;

  return (
    <FeatureTracker
      scrollHeight="h-[60vh]"
      companySlug={company}
      user={user}
      search={search}
      initialCompletedData={completedPosts.data || []}
      initialDevelopmentData={developmentPosts.data || []}
      initialPlannedData={plannedPosts.data || []}
      isUserJoined={isUserJoined}
    />
  );
};

export default page;
