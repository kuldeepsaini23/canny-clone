"use client"

import {  getPostsByCategory } from "@/action/post"
import { PostWithCounts } from "@/icons/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"

export function usePostDataByCategory(
  companySlug: string,
  categoryId: string,
  searchQuery: string,
  sortBy: "recent" | "votes" | "comments",
  initialData:PostWithCounts[] | []
) {
  return useInfiniteQuery({
    queryKey:  [{ scope: "posts", companySlug, categoryId }],
    queryFn: ({ pageParam }: { pageParam: string | null }) => getPostsByCategory(companySlug, categoryId, pageParam, 10, searchQuery, sortBy),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    initialData: {
      pageParams: [null],
      pages: [{
        data: initialData,
        nextCursor: null
      }]
    }
  })
}

