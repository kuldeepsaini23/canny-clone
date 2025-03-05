/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentIcon from "@/icons/CommentIcon";
import LikeIcon from "@/icons/LikeIcon";
import SendIcon from "@/icons/SendIcon";
import { CommentsWithUser } from "@/icons/lib/types";
import { User } from "@prisma/client";
import { format } from "date-fns";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/provider/tanstack-provider";
import { addComment, likeComment } from "@/action/comments";
// import AuthRequiredModal from "@/components/Global/LoginModal/AuthRequiredModal";
// import { usePathname } from "next/navigation";

type Props = {
  reply?: boolean;
  comment: CommentsWithUser;
  user: User | null;
};

const CommentCard = ({ comment, reply = false, user }: Props) => {
  // const pathname = usePathname();
  const [showTextArea, setShowTextArea] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalOpen, setModalOpen] = useState(false);
  const [content, setContent] = useState("");

  const addReplyMutation = useMutation({
    mutationFn: (newReply: { postId: string; userId: string; content: string; parentId: string }) =>
      addComment(newReply.postId, newReply.userId, newReply.content, newReply.parentId),
    onMutate: async (newReply) => {
      await queryClient.cancelQueries({
        queryKey: [{ scope: "allComments", postId: newReply.postId }],
      })

      const previousComments = queryClient.getQueryData([{ scope: "allComments", postId: newReply.postId }])

      queryClient.setQueryData([{ scope: "allComments", postId: newReply.postId }], (old: any) => {
        const newComment: CommentsWithUser = {
          id: Date.now().toString(),
          postId: newReply.postId,
          userId: newReply.userId,
          parentId: newReply.parentId,
          comment: newReply.content,
          user: user as User,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { likes: 0, replies: 0 },
          replies: [],
          likes: [],
          hasLiked: false,
          deletedAt: null,
        }

        const updateReplies = (comments: CommentsWithUser[]): CommentsWithUser[] => {
          return comments.map((c) => {
            if (c.id === newReply.parentId) {
              return {
                ...c,
                replies: [newComment, ...c.replies],
                _count: {
                  ...c._count,
                  replies: c._count.replies + 1,
                },
              }
            } else if (c.replies.length > 0) {
              return {
                ...c,
                replies: updateReplies(c.replies),
              }
            }
            return c
          })
        }

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: updateReplies(page.data),
          })),
        }
      })

      setShowTextArea(false)

      return { previousComments }
    },
    onError: (err, newReply, context) => {
      queryClient.setQueryData([{ scope: "allComments", postId: newReply.postId }], context?.previousComments)
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [{ scope: "allComments", postId: variables.postId }],
      })
    },
  })


  const likeMutation = useMutation({
    mutationFn: () => likeComment(comment.id, user?.id || ""),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [{ scope: "allComments", postId: comment.postId }],
      });

      const previousComments = queryClient.getQueryData([
        { scope: "allComments", postId: comment.postId },
      ]);

      queryClient.setQueryData(
        [{ scope: "allComments", postId: comment.postId }],
        (old: any) => {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((c: any) =>
                c.id === comment.id
                  ? {
                      ...c,
                      _count: { ...c._count, likes: c.hasLiked ? c._count.likes - 1 : c._count.likes + 1 },
                      hasLiked: !c.hasLiked,
                    }
                  : c
              ),
            })),
          };
        }
      );

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        [{ scope: "allComments", postId: comment.postId }],
        context?.previousComments
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [{ scope: "allComments", postId: comment.postId }],
      });
    },
  });

  const handleReply = () => {
    if (!user) {
      setModalOpen(true);
    } else {
      addReplyMutation.mutate({
        postId: comment.postId,
        userId: user.id,
        content, // This is now HTML content
        parentId: comment.id,
      });
    }
  };

  const handleLike = () => {
    console.log(user);
    if (!user) {
      setModalOpen(true);
    } else {
      likeMutation.mutate();
    }
  };

  return (
    <div className="w-full h-full flex gap-3 items-start">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={comment?.user?.avatar}
          alt={comment?.user?.name}
          className="object-cover"
        />
        <AvatarFallback>{comment?.user?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="w-full flex flex-col gap-3 items-start">
        <div>
          <p className="text-sm font-bold text-primary">
            {comment?.user?.name}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {comment?.comment}
          </p>
        </div>
        <div className="flex w-full justify-between gap-3 items-center">
          <div className="flex items-center gap-x-2">
            <div
              className="flex items-center gap-1 hover:cursor-pointer"
              onClick={handleLike}
            >
              <LikeIcon />
              <span className="text-xs text-gray-400">
                {comment?._count?.likes || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CommentIcon />
              <span className="text-xs text-gray-400">
                {comment?._count?.replies || 0}
              </span>
            </div>
            {reply && (
              <Button
                variant={"link"}
                onClick={() => setShowTextArea(!showTextArea)}
              >
                Reply
              </Button>
            )}
          </div>

          {comment?.createdAt && (
            <p className="text-xs text-foreground font-medium">
              {format(new Date(comment.createdAt), "MMMM d, yyyy")}
            </p>
          )}
        </div>
        {showTextArea && (
          <div className="w-full flex flex-col items-end gap-1">
            <div className="w-full flex gap-3 items-start">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatar}
                  alt={user?.name}
                  className="object-cover"
                />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Textarea
                className="w-full border border-input rounded-lg p-2"
                placeholder="Leave a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="self-end"
              onClick={handleReply}
            >
              <SendIcon />
            </Button>
          </div>
        )}
      </div>
      {/* <AuthRequiredModal
        open={modalOpen}
        redirect={pathname}
        setOpen={setModalOpen}
        companySlug={compa}
        userType="User"
      /> */}
    </div>
  );
};

export default CommentCard;
