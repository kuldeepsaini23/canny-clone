"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { PostType } from "@prisma/client";
import { useInView } from "react-intersection-observer";
import PostLoader from "../Loader/PostLoader";
import { usePostsByType } from "@/hooks/post/usePostByType";
import UpvoteButton from "../UpvoteButton";
import InfiniteLoader from "../Loader";
import { PostWithCounts } from "@/icons/lib/types";

type Props = {
  scrollHeight: string;
  user: User | null;
  postType: PostType;
  companySlug: string;
  searchQuery: string;
  initialData: PostWithCounts[] | [];
  isUserJoined: boolean;
};

const FeaturePosts = ({
  scrollHeight,
  user,
  postType,
  companySlug,
  searchQuery,
  initialData,
  isUserJoined
}: Props) => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePostsByType(companySlug, postType, searchQuery, initialData);

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    const fetch = async () => {
      setIsSearching(true);
      await refetch().finally(() => {
        setIsSearching(false);
      });
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const posts = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading || isSearching) {
    return (
      <ScrollArea
        className={`rounded-xl border border-input px-2 py-3 ${scrollHeight}`}
      >
        <PostLoader count={4} />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      className={`rounded-xl h-full border border-input ${scrollHeight}`}
    >
      {posts.length > 0 ? (
        <div className="w-full flex flex-col gap-y-4 px-3 py-4">
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <div className="w-full flex gap-3 items-center justify-start">
                <UpvoteButton
                  post={post}
                  queryKey={[
                    {
                      scope: "postsByType",
                      postType,
                      companySlug,
                      searchQuery,
                    },
                  ]}
                  isUserJoined={isUserJoined}
                  user={user}
                />
                <p className="text-lg font-semibold text-primary">
                  {post.title}
                </p>
              </div>
              {index !== posts.length - 1 && <Separator className="" />}
            </React.Fragment>
          ))}
          {hasNextPage && (
            <div ref={ref} className="w-full">
              {isFetchingNextPage && <InfiniteLoader />}
            </div>
          )}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center p-4 text-center ${scrollHeight}`}>
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No Post available</p>
        </div>
      )}
    </ScrollArea>
  );
};

export default FeaturePosts;
