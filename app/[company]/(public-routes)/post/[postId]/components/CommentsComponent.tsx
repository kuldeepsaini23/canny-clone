"use client";
import { Badge } from "@/components/ui/badge";
import React from "react";
import AllComments from "./AllComments";
import UpvoteButton from "@/components/Global/UpvoteButton";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/action/post";
import { CommentsWithUser, PostWithCounts } from "@/icons/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { User } from "@prisma/client";

type Props = {
  post: PostWithCounts;
  user: User | null;
  comments: CommentsWithUser[] | [];
  isUserJoined:boolean
};

const CommentsComponent = ({ post, user, comments, isUserJoined }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: [{ scope: "post", postId: post.id }],
    queryFn: () => getPostById(post.id),
    initialData: {
      data: post,
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const currPost = data.data;
  return (
    <div className="flex flex-col gap-y-6 bg-secondary border border-input rounded-xl px-8 py-6">
      <div className="flex flex-col items-start justify-center gap-3">
        <div className="w-full flex gap-3 items-center justify-start">
          <UpvoteButton
            post={post}
            user={user}
            queryKey={[{ scope: "post", postId: post.id }]}
            isUserJoined={isUserJoined}
          />
          <p className="text-xl font-semibold text-primary">{currPost.title}</p>
        </div>
        <Badge
          variant="outline"
          className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
        >
          New Feature
        </Badge>

        <p className="text-muted-foreground text-sm font-medium">
          {currPost?.description}
        </p>
        {currPost?.images?.length > 0 && (
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <Image
              src={currPost?.images?.[0]}
              alt={currPost?.title}
              fill
              className="h-full w-full rounded-md object-cover"
            />
          </AspectRatio>
        )}
      </div>

      <AllComments comments={comments} post={post} user={user || null} />
    </div>
  );
};

export default CommentsComponent;
