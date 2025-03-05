"use client"

import { getCommentsByPost } from "@/action/comments"
import { CommentsWithUser } from "@/icons/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"

export function useCommentsByPost(
  postId: string,
  userId: string | null,
  initialData:CommentsWithUser[] | []
) {
  return useInfiniteQuery({
    queryKey:  [{ scope: "allComments", postId }],
    queryFn: ({ pageParam }: { pageParam: string | null }) => getCommentsByPost(postId,userId,pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    staleTime: 60000, // 1 minute
    initialData: {
      pageParams: [null],
      pages: [{
        data: initialData,
        nextCursor: null,
        status:200
      }]
    }
  })
}

