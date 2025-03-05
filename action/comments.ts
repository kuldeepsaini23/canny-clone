"use server";
import { CommentsWithUser } from "@/icons/lib/types";
import { prisma } from "@/utils/prisma/client";
import { revalidatePath } from "next/cache";

export const getTopCommentsByPost = async (postId: string) => {
  try {
    const topComments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      take: 3,
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },

      orderBy: {
        likes: {
          _count: "desc",
        },
      },
    });

    if (!topComments) {
      return { status: 404 };
    }

    return { status: 200, data: topComments };
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch top comments");
  }
};

export const getCommentsByPost = async (postId: string, userId: string | null, cursor?: string | null, limit = 10) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null }, 
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: cursor ? 1 : 0, 
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: true,
        replies: {
          include: {
            user: true,
            replies: true, 
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });


    const formattedComments = comments.map((comment) => formatComment(comment as CommentsWithUser, userId));
    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;

    return {
      status: 200,
      data: formattedComments,
      nextCursor,
    };
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch comments");
  }
};


export const addComment = async(postId: string, userId: string, content: string, parentId?: string) => {
  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        comment: content,
        parentId,
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
            replies: true, // Nested replies
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
          },
        },
        likes:{
          select:{
            userId:true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    const finalComment = formatComment(comment as CommentsWithUser, userId);

    revalidatePath(`/post/${postId}`);
    return { status: 200, data: finalComment };
  } catch (error) {
    console.error(error);
    return { status: 500, error: "Failed to add comment" };
  }
}



export const likeComment = async(commentId: string, userId: string) => {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (existingLike) {
      // If already liked, remove like (Unlike)
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      revalidatePath(`/post/${commentId}`);
      return { status: 200, message: "Comment unliked" };
    } else {
      // If not liked, add like
      const like = await prisma.like.create({
        data: {
          commentId,
          userId,
        },
      });

      revalidatePath(`/post/${commentId}`);
      return { status: 200, data: like, message: "Comment liked" };
    }
  } catch (error) {
    console.error(error);
    return { status: 500, error: "Failed to toggle like" };
  }
}

const formatComment = (comment: CommentsWithUser, userId: string | null): CommentsWithUser => ({
  ...comment,
  hasLiked: comment?.likes?.some((like) => like?.userId ===userId),
  replies: comment?.replies?.map((reply: CommentsWithUser) => formatComment(reply, userId)), // Recursively format replies
});