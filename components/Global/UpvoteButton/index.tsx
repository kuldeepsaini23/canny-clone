"use client";
import { Button } from "@/components/ui/button";
import { useUpvoteMutation } from "@/hooks/useUpvoteMutation.ts";
import { usePathname } from "next/navigation";
import React from "react";
import { type QueryKey } from "@tanstack/react-query";
import { PostWithCounts } from "@/icons/lib/types";
import { User } from "@supabase/supabase-js";
import { ChevronUp } from "lucide-react";
import { User as PrismaUser } from "@prisma/client";

type Props = {
  queryKey: QueryKey;
  post: PostWithCounts;
  user: User | PrismaUser | null;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isUserJoined: boolean;
};

const UpvoteButton = ({ queryKey, post, user, setOpen, isUserJoined}: Props) => {
  const pathname = usePathname();

  const upvoteMutation = useUpvoteMutation({
    currPath: pathname,
    queryKey: queryKey,
  });

  const handleUpvote = (postId: string) => {
    if (!user || !isUserJoined) {
      if (setOpen) {
        setOpen(true);
      }

      return;
    } else {
      upvoteMutation.mutate({ postId, userId: user.id });
    }
  };
  return (
    <Button
      variant={"outline"}
      onClick={() => handleUpvote(post.id)}
      className={`px-3 !py-2 flex flex-col border border-input rounded-md font-medium text-sm h-14 ${
        post.hasUpvoted
          ? "bg-primary text-primary-foreground"
          : "bg-background text-foreground"
      }`}
    >
      <ChevronUp size={16} />
      {post._count.upvotes}
    </Button>
  );
};

export default UpvoteButton;
