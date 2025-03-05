import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Comment, User } from "@prisma/client";
import React from "react";

type Props = {
  comments: (Comment & {
    user: User;
    _count: {
      likes: number;
      replies: number;
    };
  })[];
};

const TopComments = ({comments}: Props) => {

  return (
    <Card className="h-fit border-input p-4">
      <h2 className="mb-6 text-lg font-semibold">Top Comments</h2>
      <div className="space-y-4">
        {comments.length > 0 ? comments.map((comment, i) => (
          <div
            key={i}
            className="w-full flex gap-3 items-center rounded-lg"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={comment?.user?.avatar}
                alt={comment?.user?.name}
                className="object-cover"
              />
              <AvatarFallback>{comment?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="self-center">
              <p className="text-sm font-bold text-primary">{comment?.user?.name}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
               {comment?.comment}
              </p>
            </div>
          </div>
        )) : (
          <div className="w-full flex items-center justify-center  mt-5">
          <p className="text-xl text-muted-foreground">No comments found</p>
        </div>
        )}
      </div>
    </Card>
  );
};

export default TopComments;
