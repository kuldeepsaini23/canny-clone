import React from "react";
import TopComments from "./components/TopComments";
import CommentsComponent from "./components/CommentsComponent";
import { getPostById } from "@/action/post";
import { getTopCommentsByPost, getCommentsByPost } from "@/action/comments";
import { onAuthenticateUser } from "@/action/auth";
import { isUserJoinedCompany } from "@/action/role";

type Props = {
  params: Promise<{
    company: string;
    postId: string;
  }>;
};

const page = async ({ params }: Props) => {
  const { postId, company } = await params;
  const user = await onAuthenticateUser();

  const [post, topComments, allComments, userJoinedResult] = await Promise.all([
    getPostById(postId),
    getTopCommentsByPost(postId),
    getCommentsByPost(postId, user?.data?.id || null, null),
    user.data ? isUserJoinedCompany(user.data.id, company) : { status: 200, data: null },
  ]);

  const isUserJoined = user ? !!userJoinedResult.data : false;
  // console.log(post, topComments, allComments);

  if (!post.data) {
    return (
      <div className="w-full flex items-center justify-center  mt-5">
        <p className="text-xl text-muted-foreground">No Post found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <main className="w-full mx-auto grid grid-cols-1 gap-6 p-4 md:grid-cols-[1fr,300px]">
        <CommentsComponent
          post={post.data}
          comments={allComments.data}
          user={user.data || null}
          isUserJoined={isUserJoined}
        />
        <TopComments comments={topComments.data || []} />
      </main>
    </div>
  );
};

export default page;
