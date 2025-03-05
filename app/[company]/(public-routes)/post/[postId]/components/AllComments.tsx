"use client";
import { useCommentsByPost } from "@/hooks/post/useCommentsByPost";
import { CommentsWithUser, PostWithCounts } from "@/icons/lib/types";
import { User } from "@prisma/client";
import React from "react";
import CommentCard from "./CommentCard";

//Todo: Add that not logged user have to login to interact with anything
type ReplyProps = {
  comment: CommentsWithUser;
  depth?: number;
  user: User | null;
};

const ReplyComments = ({ comment, depth = 0, user }: ReplyProps) => {
  return (
    <div className={`flex flex-col ${depth === 0 && "gap-y-6"}  items-start w-full`}>
      <div className={`w-full ${depth > 0 ? "pl-11" : ""}`}>
        <CommentCard reply={true} comment={comment} user={user} />
      </div>
      {comment?.replies?.length > 0 && (
        <div className="w-full">
          {comment.replies.map((reply) => (
            <ReplyComments
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type Props = {
  comments: CommentsWithUser[] | [];
  post: PostWithCounts;
  user: User | null;
};

const AllComments = ({ comments, post, user }: Props) => {
  const { data, isLoading } = useCommentsByPost(
    post.id,
    user?.id || null,
    comments
  );

  if (isLoading) return <div>Loading...</div>;

  const allComments = data?.pages.map((page) => page.data).flat();

  return (
    <div className="w-full flex flex-col gap-y-6 items-start flex-shrink-0">
      <div className="w-full border-b border-input pb-2">
        <p className="text-sm font-bold text-muted-foreground">
          Comments on this post ({comments.length || 0})
        </p>
      </div>

      <div className="flex flex-col gap-y-6 items-start w-full">
        {allComments.map((comment, idx) => (
          <ReplyComments key={idx} comment={comment} user={user} />
        ))}
      </div>
    </div>
  );
};

export default AllComments;
