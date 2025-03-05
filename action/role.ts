"use server";
import { prisma } from "@/utils/prisma/client";
import { RoleType, SubscriptionPlan } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { mailSender } from "@/utils/mailSender";
import { inviteType, RoleWithUser } from "@/icons/lib/types";
import env from "@/env";
import { getUser } from "@/utils/supabase/queries";

export const getCompanyAdmins = async (
  companySlug: string,
  cursor: string | null,
  limit = 10
): Promise<{
  status: number;
  data?: RoleWithUser[];
  nextCursor?: string | null;
}> => {
  try {
    const res = await prisma.role.findMany({
      where: {
        companySlug,
        roleType: RoleType.Admin,
      },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        user: true,
      },
    });

    const nextCursor = res.length === limit ? res[res.length - 1].id : null;
    return { status: 200, data: res, nextCursor };
  } catch (error) {
    console.log("🔴 ERROR", error);
    throw new Error("Failed to get company admins");
  }
};

//Change staff role
export const changeStaffRole = async (id: string, roleType: RoleType) => {
  try {
    const res = await prisma.role.update({
      where: {
        id,
      },
      data: {
        roleType,
      },
    });

    return { status: 200, data: res };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
};

export const inviteStaff = async (
  companySlug: string,
  emailDetails: inviteType[]
) => {
  try {
    // Fetch company & subscription details in one go
    const [company, subscription, existingStaff] = await Promise.all([
      prisma.company.findUnique({
        where: { slug: companySlug },
      }),
      prisma.subscription.findFirst({
        where: { companySlug },
      }),
      prisma.role.findMany({
        where: { companySlug },
      }),
    ]);

    if (!company) {
      return { status: 404, error: "Company not found" };
    }

    if (!subscription) {
      return { status: 403, error: "Subscription not found" };
    }

    // Set staff limits based on the subscription plan
    const staffLimit =
      subscription.plan === SubscriptionPlan.FREE
        ? 1
        : subscription.plan === SubscriptionPlan.STARTER
        ? 3
        : Number.MAX_SAFE_INTEGER; // Unlimited for Business Plan

    if (existingStaff.length >= staffLimit) {
      return {
        status: 403,
        error: `You have reached the staff limit (${staffLimit}) for your plan. Upgrade to add more.`,
      };
    }

    // Process each invite
    const results = await Promise.all(
      emailDetails.map(async (detail) => {
        const user = await prisma.user.findUnique({
          where: { email: detail.receiverEmail },
        });

        if (user) {
          // Check if user is already staff
          const existingRole = existingStaff.find(
            (staff) => staff.userId === user.id
          );
          if (existingRole) {
            return {
              status: 400,
              data: detail,
              error: "User is already staff",
            };
          }

          // Create role
          await prisma.role.create({
            data: {
              userId: user.id,
              companySlug,
              roleType: RoleType.Admin,
            },
          });

          // Send invitation email
          await mailSender(
            detail.receiverEmail,
            `Invitation to join ${company.name} as staff`,
            `<p>You've been assigned an Admin Role in ${company.name}.</p>`
          );

          return { status: 200, data: detail };
        } else {
          // Check if an invite was already sent
          const existingInvite = await prisma.invite.findFirst({
            where: { companySlug, receiverEmail: detail.receiverEmail },
          });

          if (existingInvite) {
            return { status: 400, data: detail, error: "Invite already sent" };
          }

          // Create invite
          const invite = await prisma.invite.create({
            data: {
              content: `You've been invited to join ${company.name} as staff`,
              senderId: detail.senderId,
              companySlug,
              receiverEmail: detail.receiverEmail,
            },
          });

          const invitationLink = `${env.website.origin}?modalOpen=true&companyInvite=${invite.id}`;

          // Send invite email
          await mailSender(
            detail.receiverEmail,
            `Invitation to join ${company.name} as staff`,
            `<p>You've been invited to join ${company.name} as staff. Click <a href="${invitationLink}">here</a> to sign up.</p>`
          );

          return { status: 200, data: detail };
        }
      })
    );

    // Revalidate page cache
    revalidatePath(`/dashboard/${companySlug}/settings/team`);

    return { status: 200, results };
  } catch (error) {
    console.error("🔴 Error inviting staff:", error);
    return { status: 500, error: "Failed to invite staff" };
  }
};

//get All Company users
export const getCompanyUsers = async (companySlug: string) => {
  try {
    const res = await prisma.role.findMany({
      where: {
        companySlug,
        roleType: RoleType.User,
      },
      include: {
        user: true,
      },
    });

    return { status: 200, data: res };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
};

// Owner and Admin companies
export const getAdminCompanies = async () => {
  try {
    const user = await getUser();

    if (!user) {
      return { status: 401, data: [] };
    }

    const companies = await prisma.role.findMany({
      where: {
        userId: user.id,
        roleType: {
          in: [RoleType.Admin, RoleType.Owner],
        },
      },
      include: {
        company: true,
      },
    });

    return { status: 200, data: companies };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500, data: [] };
  }
};

//Add user to company
export const addUserToCompany = async (
  companySlug: string,
  userId: string,
) => {
  try {
    const res = await prisma.role.create({
      data: {
        userId,
        companySlug,
        roleType : RoleType.User,
      },
    });

    return { status: 200, data: res };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
}

//check if User is joined the company or not 
export const isUserJoinedCompany = async (userId: string, companySlug: string) => {
  try {
    const res = await prisma.role.findFirst({
      where: {
        userId,
        companySlug,
      },
    });

    return { status: 200, data: res };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500 };
  }
}