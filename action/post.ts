"use server";

import {
  SubscriptionPlan,
  type FeatureTagType,
  type PostType,
} from "@prisma/client";
import { prisma } from "@/utils/prisma/client";
import { revalidatePath } from "next/cache";
import { getUser } from "@/utils/supabase/queries";
import { PostWithCounts, TimePeriod } from "@/icons/lib/types";
import { subDays, subMonths, subWeeks, subYears } from "date-fns";
import { imagekit } from "@/utils/imagekit";

type SortOption = "comments" | "recent" | "votes";

export const getPostsByCategory = async(
  companySlug: string,
  categoryId: string,
  cursor: string | null,
  limit = 10,
  searchQuery = "",
  sortBy: SortOption = "votes"
): Promise<{ data: PostWithCounts[]; nextCursor: string | null }> =>{
  try {
    const user = await getUser();
    const userId = user?.id || "";

    const cursorObj = cursor ? { id: cursor } : undefined;

    const posts = await prisma.post.findMany({
      where: {
        companySlug,
        ...(categoryId ? { categoryId } : {}),
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      orderBy: [
        { createdAt: "desc" as const }, // Always sort by newest first
        ...(sortBy === "votes"
          ? [{ upvotes: { _count: "desc" as const } }]
          : []),
        ...(sortBy === "comments"
          ? [{ comments: { _count: "desc" as const } }]
          : []),
      ],

      include: {
        _count: {
          select: {
            comments: true,
            upvotes: true,
          },
        },
        upvotes: {
          select: {
            userId: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;

    // console.log("Posts:", posts);
    return {
      data: posts.map((post) => ({
        ...post,
        hasUpvoted: userId
          ? post.upvotes.some((upvote) => upvote.userId === userId)
          : false,
      })),
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
}


export const createPost = async({
  title,
  description,
  tag,
  companySlug,
  categoryId,
  images,
}: {
  title: string;
  description: string;
  tag: FeatureTagType;
  companySlug: string;
  categoryId: string;
  images: File[];
}) => {
  try {
    const [subscription, allPosts] = await Promise.all([
      prisma.subscription.findFirst({
        where: { companySlug: companySlug },
      }),
      prisma.post.findMany({
        where: { companySlug: companySlug },
      }),
    ]);

    if (!subscription) {
      return { status: 403, message: "Subscription not found" };
    }

    const categoryLimit =
      subscription.plan === SubscriptionPlan.FREE
        ? 20
        : Number.MAX_SAFE_INTEGER; // Unlimited for paid plans

    if (allPosts.length >= categoryLimit) {
      return {
        status: 403,
        message: `You have reached the category limit (${
          subscription.plan === SubscriptionPlan.FREE ? 20 : "Unlimited"
        }) for your plan. Upgrade to add more.`,
      };
    }

    const user = await getUser();
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    const userId = user.id;
    let uploadedImageUrls: string[] = [];

    // Handle ImageKit uploads if images exist
    if (images.length > 0) {
      const uploadPromises = images.map(async (image) => {
        try {
          const buffer = await image.arrayBuffer(); 
          const result = await imagekit.upload({
            file: Buffer.from(buffer),
            fileName: image.name,
            folder: "/postImages",
          });

          return result.url; // Return uploaded image URL
        } catch (error) {
          console.error("ImageKit Upload Error:", error);
          return null; // Skip failed uploads
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      uploadedImageUrls = uploadedUrls.filter((url) => url !== null);
    }

    // Create new post in Prisma
    const newPost = await prisma.post.create({
      data: {
        title,
        description,
        tag,
        companySlug,
        categoryId,
        authorId: userId,
        images: uploadedImageUrls, // Store uploaded image URLs
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            upvotes: true,
          },
        },
      },
    });

    // Revalidate the posts page
    revalidatePath(`/${companySlug}/feedback/${categoryId}`);
    console.log("Post created:", newPost);

    return { data: newPost, status: 200 };
  } catch (error) {
    console.error("Error creating post:", error);
    return { status: 500, message: "Failed to create post" };
  }
}

//upvote post
export const upvotePost = async (
  postId: string,
  userId: string,
  currPath: string
) => {
  try {
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_postId: {
          postId,
          userId: userId,
        },
      },
    });

    if (existingUpvote) {
      // If the user has already upvoted, remove the upvote
      await prisma.upvote.delete({
        where: {
          userId_postId: {
            postId,
            userId: userId,
          },
        },
      });
    } else {
      // If the user hasn't upvoted, create a new upvote
      await prisma.upvote.create({
        data: {
          postId,
          userId: userId,
        },
      });
    }

    revalidatePath(currPath);
    return {
      status: 200,
    };
  } catch (error) {
    console.error("Error upvoting post:", error);
    return { status: 500, message: "Failed to upvote post" };
  }
};

//get Post by PostType

//get Post by PostType
export const getPostsByType = async(
  companySlug: string,
  postType: PostType,
  searchQuery: string,
  cursor: string | null,
  limit = 10
): Promise<{ data: PostWithCounts[]; nextCursor: string | null }> =>{
  try {
    const user = await getUser();
    const userId = user?.id;

    const posts = await prisma.post.findMany({
      where: {
        companySlug,
        postType,
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            upvotes: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        upvotes: {
          select: {
            userId: true,
          },
        },
      },
    });

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;

    const postsWithHasUpvoted = posts.map((post) => ({
      ...post,
      hasUpvoted: userId
        ? post.upvotes.some((upvote) => upvote.userId === userId)
        : false,
    }));

    return {
      data: postsWithHasUpvoted,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching posts by type:", error);
    throw new Error("Failed to fetch posts");
  }
}

export const  getAllPost = async(
  companySlug: string,
  cursor: string | null,
  sortBy: SortOption = "recent",
  timePeriod: TimePeriod = "monthly",
  limit = 10
): Promise<{ data: PostWithCounts[]; nextCursor: string | null }> =>{
  try {
    const user = await getUser();
    const userId = user?.id;

    const cursorObj = cursor ? { id: cursor } : undefined;

    // Calculate the start date based on the time period
    const startDate = (() => {
      const now = new Date();
      switch (timePeriod) {
        case "daily":
          return subDays(now, 1);
        case "weekly":
          return subWeeks(now, 1);
        case "monthly":
          return subMonths(now, 1);
        case "yearly":
          return subYears(now, 1);
        default:
          return subMonths(now, 1); // Default to monthly if invalid time period
      }
    })();

    const posts = await prisma.post.findMany({
      where: {
        companySlug,
        createdAt: {
          gte: startDate,
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      orderBy: [
        { createdAt: "desc" as const }, // Always sort by newest first
        ...(sortBy === "votes"
          ? [{ upvotes: { _count: "desc" as const } }]
          : []),
        ...(sortBy === "comments"
          ? [{ comments: { _count: "desc" as const } }]
          : []),
      ],

      include: {
        _count: {
          select: {
            comments: true,
            upvotes: true,
          },
        },
        upvotes: {
          select: {
            userId: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;

    // console.log("Posts:", posts);

    return {
      data: posts.map((post) => ({
        ...post,
        upvotes: post.upvotes.map((upvote) => ({ userId: upvote.userId })),
        hasUpvoted: userId
          ? post.upvotes.some((upvote) => upvote.userId === userId)
          : false,
      })),
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw new Error("Failed to fetch all posts");
  }
}

export const updatePostType = async(
  postId: string,
  newType: PostType,
  currPath: string
) => {
  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { postType: newType },
    });

    // Revalidate the posts page
    revalidatePath(currPath);

    return { success: true, data: updatedPost };
  } catch (error) {
    console.error("Error updating post type:", error);
    return { success: false, error: "Failed to update post type" };
  }
}

//get post By Id
export const getPostById = async (
  postId: string
): Promise<{ data: PostWithCounts }> => {
  try {
    const user = await getUser();
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        _count: {
          select: {
            comments: true,
            upvotes: true,
          },
        },
        upvotes: {
          select: {
            userId: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    return {
      data: {
        ...post,
        hasUpvoted: user
          ? post.upvotes.some((upvote) => upvote.userId === user.id)
          : false,
      },
    };
  } catch (error) {
    console.error("Error fetching post by id:", error);
    throw new Error("Failed to fetch post by id");
  }
};
