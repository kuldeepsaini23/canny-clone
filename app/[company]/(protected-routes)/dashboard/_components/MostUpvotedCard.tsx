"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardLayout from "@/components/Global/CardLayout";
import { Separator } from "@/components/ui/separator";
import CommentIcon from "@/icons/CommentIcon";
import { Badge } from "@/components/ui/badge";
import { getBadgeStyles, getFeatureColor } from "@/utils/BadgeColor";
import type { User } from "@supabase/supabase-js";
import { useQueryState } from "nuqs";
import type {
  FeedbackSortOption,
  PostWithCounts,
  TimePeriod,
} from "@/icons/lib/types";
import { useInView } from "react-intersection-observer";
import InfiniteLoader from "@/components/Global/Loader";
import { useAllPostsData } from "@/hooks/post/useAllPostsData.ts";
import { usePathname } from "next/navigation";
import { updatePostType } from "@/action/post";
import { PostType } from "@prisma/client";
import { toast } from "sonner";
import { queryClient } from "@/provider/tanstack-provider";
import PostLoader from "@/components/Global/Loader/PostLoader";
import UpvoteButton from "@/components/Global/UpvoteButton";

type Props = {
  user: User;
  companySlug: string;
  sortByQuery?: string;
  sortByTime?: string;
  initialData: PostWithCounts[] | [];
  isUserJoined: boolean;
};

const MostUpvotedCard = ({
  companySlug,
  user,
  sortByQuery,
  sortByTime,
  initialData,
  isUserJoined,
}: Props) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useQueryState("timePeriod", {
    defaultValue: sortByTime || ("monthly" as TimePeriod),
  });

  const [sortBy, setSortBy] = useQueryState("sortBy", {
    defaultValue: sortByQuery || ("recent" as FeedbackSortOption),
  });

  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
  } = useAllPostsData(
    companySlug,
    sortBy as FeedbackSortOption,
    timePeriod as TimePeriod,
    initialData
  );

  const handleSortChange = (value: string) => {
    setSortBy(value as FeedbackSortOption);
  };

  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  const allPosts = data?.pages.flatMap((page) => page.data) || [];

  const handlePostTypeChange = async (postId: string, newType: PostType) => {
    toast.loading("Updating post type...");
    setLoading(true);
    try {
      await updatePostType(postId, newType, pathname);
      queryClient.invalidateQueries({
        queryKey: [{ scope: "allPosts", companySlug }],
      });

      queryClient.invalidateQueries({
        queryKey: [
          { scope: "postsByType", companySlug, postType: "Completed" },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          { scope: "postsByType", companySlug, postType: "InDevelopment" },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "postsByType", companySlug, postType: "Planned" }],
      });

      toast.success("Post type updated successfully");
      //Invalid query key for PostType
    } catch (error) {
      console.error("Failed to update post type:", error);
      toast.error("Failed to update post type");
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const renderContent = () => {
    if (isLoading || isFetching) {
      return <PostLoader />;
    }

    if (isError) {
      return (
        <p className="text-center text-red-500 py-4">
          There was an error loading the posts. Please try again later.
        </p>
      );
    }

    if (allPosts.length === 0) {
      return (
        <div className="grid h-[300px] place-content-center place-items-center">
          <p className="text-center text-gray-500 py-4">
            No posts found.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {allPosts.map((post, idx) => (
          <React.Fragment key={post.id}>
            <div className="w-full pb-1 flex flex-row gap-x-3 items-start">
              <UpvoteButton
                post={post}
                queryKey={[
                  { scope: "allPosts", companySlug, sortBy, timePeriod },
                ]}
                isUserJoined={isUserJoined}
                user={user}
              />
              <div className="w-full flex flex-col items-start gap-3 justify-center">
                <div className="w-full flex-1 flex gap-4 items-center justify-between">
                  <p className="text-lg text-primary font-semibold">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {post.tag && (
                      <Badge className={`px-3 ${getFeatureColor(post.tag)}`}>
                        {post.tag}
                      </Badge>
                    )}

                    {post.category && (
                      <Badge variant={"default"} className={`px-3 capitalize`}>
                        {post.category.name}
                      </Badge>
                    )}
                    <Select
                      disabled={loading}
                      value={post.postType || ""}
                      onValueChange={(value) =>
                        handlePostTypeChange(post.id, value as PostType)
                      }
                    >
                      <SelectTrigger className="w-[170px] focus:ring-0">
                        <SelectValue
                          placeholder="Select Post Type"
                          className={getBadgeStyles(post.postType || "")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planned" className="text-blue-500">
                          Planned
                        </SelectItem>
                        <SelectItem
                          value="InDevelopment"
                          className="text-yellow-500"
                        >
                          In Development
                        </SelectItem>
                        <SelectItem
                          value="Completed"
                          className="text-green-500"
                        >
                          Completed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <CommentIcon />
                    <span className="text-xs text-gray-400">
                      {post._count.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {idx !== allPosts.length - 1 && <Separator />}
          </React.Fragment>
        ))}
        {hasNextPage && (
          <>
            <div ref={ref} />
            {isFetchingNextPage && <InfiniteLoader />}
          </>
        )}
      </div>
    );
  };

  return (
    <CardLayout
      layoutId="MostUpvotedPost"
      heading="All Posts"
      subHeading="Lorem ipsum dolor sit amet consectetur. Est tristique in non"
      buttonChildren={
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] px-4 border-input bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="votes">Most Votes</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[120px] px-4 border-input bg-background">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <ScrollArea className="h-[400px] px-5">{renderContent()}</ScrollArea>
    </CardLayout>
  );
};

export default MostUpvotedCard;
