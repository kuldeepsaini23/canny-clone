"use server";
import { prisma } from "@/utils/prisma/client";
import { AffiliatesStatus } from "@prisma/client";
import { AffiliateWithReferred } from "@/icons/lib/types";

//TOdo: correct this
export const getAllAffiliates = async (
  companySlug: string,
  cursor: string | null,
  limit = 10
): Promise<{
  status: number;
  data: AffiliateWithReferred[];
  nextCursor: string | null;
}> => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      where: {
        companySlug: companySlug,
        affiliatesStatus: AffiliatesStatus.Active,
      },
      include: {
        referred: {
          include:{
            subscription:true
          }
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: limit,
      skip: cursor ? 1 : 0,
    });

    const nextCursor =
      affiliates.length === limit ? affiliates[affiliates.length - 1].id : null;

    return {
      status: 200,
      data: affiliates as unknown as AffiliateWithReferred[],
      nextCursor,
    };
  } catch (e) {
    console.log(e);
    throw new Error("Internal Server Error");
  }
};

