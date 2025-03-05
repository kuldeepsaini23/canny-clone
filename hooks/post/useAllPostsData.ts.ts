"use client";

import { getAllPost } from "@/action/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  FeedbackSortOption,
  PostWithCounts,
  TimePeriod,
} from "@/icons/lib/types";

export function useAllPostsData(
  companySlug: string,
  sortBy: FeedbackSortOption,
  timePeriod: TimePeriod,
  initialData: PostWithCounts[] | []
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "allPosts", companySlug, sortBy, timePeriod }],
    queryFn: ({ pageParam = null }: { pageParam: string | null }) =>
      getAllPost(companySlug, pageParam, sortBy, timePeriod, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 60000, // 1 minute
    initialData: {
      pageParams: [null],
      pages: [{ data: initialData, nextCursor: null }],
    },
  });
}
