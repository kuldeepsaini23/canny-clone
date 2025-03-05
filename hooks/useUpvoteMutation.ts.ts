/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { upvotePost } from "@/action/post"
import { toast } from "sonner"

type UpvoteMutationOptions = {
  queryKey: QueryKey
  mutationFn?: (postId: string, userId: string, currPath: string) => Promise<any>
  onMutate?: (postId: string) => Promise<any>
  onError?: (error: unknown, postId: string, context: any) => void
  onSuccess?: (data: any, postId: string) => void
  onSettled?: () => void
  currPath: string
}

export const useUpvoteMutation = ({
  currPath,
  queryKey,
  mutationFn = upvotePost,
  onMutate: customOnMutate,
  onError: customOnError,
  onSuccess: customOnSuccess,
  onSettled: customOnSettled,
}: UpvoteMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string, userId: string }) => mutationFn(postId, userId, currPath),
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      if (customOnMutate) {
        await customOnMutate(postId)
      } else {
        // Default optimistic update
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((post: any) =>
                post.id === postId
                  ? {
                      ...post,
                      _count: {
                        ...post._count,
                        upvotes: post.hasUpvoted ? post._count.upvotes - 1 : post._count.upvotes + 1,
                      },
                      hasUpvoted: !post.hasUpvoted,
                    }
                  : post,
              ),
            })),
          }
        })
      }

      return { previousData }
    },
    onError: (error, variables, context) => {
      console.error("Error upvoting post:", error)
      queryClient.setQueryData(queryKey, context?.previousData)
      if (customOnError) {
        customOnError(error, variables.postId, context)
      } else {
        toast.error("Failed to update upvote")
      }
    },
    onSuccess: (data, variables) => {
      console.log("Data", data)
      if (customOnSuccess) {
        customOnSuccess(data, variables.postId)
      } 
    },
    onSettled: () => {
      if (customOnSettled) {
        customOnSettled()
      } else {
        queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}

