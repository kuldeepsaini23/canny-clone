"use server";
import { prisma } from "@/utils/prisma/client";
import { SubscriptionPlan } from "@prisma/client";

export const getAllCategoriesByCompany = async (
  companySlug: string,
  cursor: string | null,
  limit = 10
) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        companySlug: companySlug,
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor if it exists
      cursor: cursor ? { id: cursor } : undefined, // Use cursor for pagination
    });
    if (!categories)
      return {
        status: 404,
        message: "Categories not found",
        data: [],
        nextCursor: null,
      };

    // Determine next cursor (for pagination)
    const nextCursor =
      categories.length === limit ? categories[categories.length - 1].id : null;

    return {
      data: categories,
      nextCursor,
    };
  } catch (error) {
    console.error("🔴 ERROR getAllCategoriesByCompany:", error);
    throw new Error("Failed to fetch posts");
  }
};


export const createCategory = async (companySlug: string, name: string) => {
  try {
    // Fetch subscription and categories in a single query
    const [subscription, allCategories] = await Promise.all([
      prisma.subscription.findFirst({
        where: { companySlug: companySlug },
      }),
      prisma.category.findMany({
        where: { companySlug: companySlug },
      }),
    ]);

    if (!subscription) {
      return { status: 403, message: "Subscription not found" };
    }

    // Determine category limit based on plan
    const categoryLimit =
      subscription.plan === SubscriptionPlan.FREE ? 3 : Number.MAX_SAFE_INTEGER; // Unlimited for paid plans

    if (allCategories.length >= categoryLimit) {
      return {
        status: 403,
        message: `You have reached the category limit (${
          subscription.plan === SubscriptionPlan.FREE ? 3 : "Unlimited"
        }) for your plan. Upgrade to add more.`,
      };
    }

    // Check if the category already exists
    const categoryExist = allCategories.find((cat) => cat.name === name);
    if (categoryExist) {
      return { status: 400, message: "Category already exists" };
    }

    // Create a new category
    const category = await prisma.category.create({
      data: {
        name: name,
        companySlug: companySlug,
      },
    });

    return { status: 200, data: category };
  } catch (error) {
    console.error("🔴 ERROR createCategory:", error);
    return { status: 500, message: "Failed to create category" };
  }
};


//update category 
export const updateCategory = async (categoryId: string, name: string) => {
  try {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: name,
      },
    });
    return {status:200, data:category};
  } catch (error) {
    console.error("🔴 ERROR updateCategory:", error);
    return {status:500, message:"Failed to update category"};
  }
}

export const getAllCategories = async (companySlug:string) => {
  try {
    const categories = await prisma.category.findMany({where:{companySlug:companySlug}, orderBy:{name:"asc"}});
    return {status:200, data:categories};
  } catch (error) {
    console.error("🔴 ERROR getALlCategories:", error);
    return {status:500, message:"Failed to fetch categories"};
  }
}