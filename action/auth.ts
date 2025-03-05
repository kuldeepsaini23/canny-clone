"use server";

import { prisma } from "@/utils/prisma/client";
import { getUser } from "@/utils/supabase/queries";
import { accountType } from "@prisma/client";
import slugify from "slugify";

export const createUser = async (
  userType: accountType,
  affiliateId?: string | null,
  companyInvite?: string | null,
  joinCompany?: string | null,
) => {
  try {
    console.log("🔴 onAuthenticateUser", userType, affiliateId, companyInvite, joinCompany);
    const user = await getUser();
    if (!user) {
      return { status: 403 };
    }

    const userExist = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (userExist) {
      return { status: 200, data: userExist };
    }

    if (!user.email || !user.user_metadata) {
      return { status: 400 };
    }

    console.log("🔴 CREATE USER");

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        if (!user.email || !user.user_metadata) {
          return { status: 400 };
        }
        // Create user
        const newUser = await tx.user.create({
          data: {
            id: user.id,
            email: user.email,
            accountType: userType,
            name: user.user_metadata.full_name,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.user_metadata.full_name}`,
          },
        });

        console.log("🔴 NEW USER", newUser);

        if (userType === "Company") {
          
          const slug = await generateUniqueSlug(user.user_metadata.full_name);
          console.log("🔴 SLUG", slug);
          // Create company
          const newCompany = await tx.company.create({
            data: {
              name: user.user_metadata.full_name,
              slug,
            },
          });

          console.log("🔴 NEW COMPANY", newCompany);

          // Create subscription
          const newSubscription = await tx.subscription.create({
            data: {
              userId: newUser.id,
              companySlug:newCompany.slug,
            },
          });

          console.log("🔴 NEW SUBSCRIPTION", newSubscription);

          // Create role
          const newRole = await tx.role.create({
            data: {
              userId: newUser.id,
              companySlug: newCompany.slug,
              roleType: "Owner",
            },
          });

          console.log("🔴 NEW ROLE", newRole);
          // Handle affiliate
          if (affiliateId) {
            const [userId, companySlug] = affiliateId.split("-");
            const checkReferrerUser = await tx.user.findFirst({
              where: {
                id: userId,
              },
            });
            console.log("🔴 CHECK REFERRER USER", checkReferrerUser);
            if (checkReferrerUser) {
              await tx.affiliate.create({
                data: {
                  affiliatesStatus: "Lead",
                  referredId: newUser.id,
                  referrerId: affiliateId,
                  companySlug:companySlug
                },
              });
              console.log("✅ Affiliate created.");
            }
          }
        }

        if (joinCompany) {
          // Join existing company
          const existingCompany = await tx.company.findUnique({
            where: { slug: joinCompany },
          });

          if (existingCompany) {
            const newRole = await tx.role.create({
              data: {
                userId: newUser.id,
                companySlug: existingCompany.slug,
                roleType:  "User",
              },
            });

            console.log("✅ User joined existing company.", newRole);
          }
        }

        // Handle company invite
        if (companyInvite) {
          // Check if the invite exists and is still valid
          const invite = await tx.invite.findFirst({
            where: {
              id: companyInvite,
              receiverEmail: newUser.email, // Ensure the invite is for this user
              accepted: false, // The invite should not have been accepted already
            },
          });

          console.log("🔴 INVITE", invite);
          if (invite) {
            // Assign an "Admin" role to the invited user
            const newRole = await tx.role.create({
              data: {
                userId: newUser.id,
                companySlug: invite.companySlug,
                roleType: "Admin",
              },
            });

            console.log("✅ User assigned Admin role.", newRole);
            // Mark the invite as accepted
            await tx.invite.update({
              where: { id: invite.id },
              data: { accepted: true },
            });

            console.log(
              "✅ Company invite accepted, user assigned Admin role."
            );
          }
        }
        return { newUser };
      },
      {
        timeout: 10000,
      }
    );

    return { status: 200, data: result.newUser };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
};

// Authenticate user
export const onAuthenticateUser = async (
  fetchCompleteData: boolean = false
) => {
  try {
    // console.log("🔴 onAuthenticateUser");

    const user = await getUser();
    if (!user) {
      return { status: 403, message: "Unauthorized" };
    }

    const userExist = await prisma.user.findUnique({
      where: { id: user.id },
      include: fetchCompleteData
        ? {
            affiliates: true,
            referredBy: true,
            roles: { include: { company: true } }, // Include company through roles
            subscription: true,
            notifications: true,
          }
        : undefined, // No includes for better performance if not required
    });

    if (userExist) {
      return { status: 200, data: userExist };
    }

    return { status: 404, message: "User not found" };
  } catch (error) {
    console.error("🔴 ERROR onAuthenticateUser:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};

//change notification status
export const changeNotificationStatus = async (
  userId: string,
  status: boolean
) => {
  try {
    console.log("🔴 changeNotificationStatus");
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        notificationsEnabled: status,
      },
    });
    return { status: 200, data: user };
  } catch (error) {
    console.log("🔴 ERROR changeNotificationStatus", error);
    return { status: 500 };
  }
};

//update User Details
export const updateUserDetails = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
  }
) => {
  try {
    console.log("🔴 updateUserDetails");
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: data,
    });
    return { status: 200, data: user };
  } catch (error) {
    console.log("🔴 ERROR updateUserDetails", error);
    return { status: 500 };
  }
};

//generate slug

const generateUniqueSlug = async (name: string) => {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};



export const getAllUsers = async (userId: string) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
      },
    });

    return { status: 200, data: users };
  } catch (e) {
    console.error(e);
    return { status: 500, error: "Internal Server Error" };
  }
};
