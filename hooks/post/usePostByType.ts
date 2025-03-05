"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { PostType } from "@prisma/client";
import { getPostsByType } from "@/action/post";
import { PostWithCounts } from "@/icons/lib/types";

export function usePostsByType(
  companySlug: string,
  postType: PostType,
  searchQuery: string,
  initialData: PostWithCounts[] | []
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "postsByType", companySlug, postType }],
    queryFn: ({ pageParam = null }: { pageParam: string | null }) =>
      getPostsByType(companySlug,postType, searchQuery, pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    initialData: {
      pageParams: [null],
      pages: [{ data: initialData, nextCursor: null }],
    },
  });
}
