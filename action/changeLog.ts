"use server";
import { ChangeLogWithUser } from "@/icons/lib/types";
import { prisma } from "@/utils/prisma/client";
import { ChangeLogStatus, FeatureTagType, Prisma } from "@prisma/client";

//update change log content

export const updateChangeLogContent = async (
  changeLogId: string,
  title: string,
  content: Prisma.JsonValue,
  status: ChangeLogStatus
) => {
  try {
    const changeLog = await prisma.changeLog.update({
      where: {
        id: changeLogId,
      },
      data: {
        title: title,
        content: content as Prisma.InputJsonValue,
        status: status,
      },
    });

    if (status === ChangeLogStatus.Published) {
      await prisma.notification.create({
        data: {
          content: `New Change Log: ${title}`,
          companySlug: changeLog.companySlug,
        },
      });
    }

    return { status: 200, data: changeLog };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to update change log content");
  }
};

//get change log by id
export const getChangeLogById = async (changeLogId: string) => {
  try {
    const changeLog = await prisma.changeLog.findUnique({
      where: {
        id: changeLogId,
      },
    });

    return { status: 200, data: changeLog };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to get change log");
  }
};

//create change Log
export const createChangeLog = async (
  companySlug: string,
  title: string,
  categoryIds: string[],
  type: FeatureTagType,
  userId: string
) => {
  try {
    const changeLog = await prisma.changeLog.create({
      data: {
        title: title,
        companySlug: companySlug,
        Category: { connect: categoryIds.map((id) => ({ id })) }, // Connect multiple categories
        type: type,
        userId: userId,
      },
    });

    return { status: 200, data: changeLog };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to create change log");
  }
};

//get Draft change logs
export const getDraftChangeLogs = async (
  companySlug: string,
  cursor: string | null,
  search: string | null,
  limit = 1
): Promise<{
  status: number;
  data: ChangeLogWithUser[];
  nextCursor: string | null;
}> => {
  try {
    const changeLogs = await prisma.changeLog.findMany({
      where: {
        companySlug: companySlug,
        status: ChangeLogStatus.Draft,
      },
      include: {
        Category: true,
        user: true,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    const nextCursor =
      changeLogs.length === limit ? changeLogs[changeLogs.length - 1].id : null;

    return { status: 200, data: changeLogs, nextCursor };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to get draft change logs");
  }
};

//get all Published change logs
export const getAllPublishedChangeLogs = async (
  companySlug: string,
  cursor: string | null,
  search = "",
  limit = 1
): Promise<{
  status: number;
  data: ChangeLogWithUser[];
  nextCursor: string | null;
}> => {
  try {
    const changeLogs = await prisma.changeLog.findMany({
      where: {
        companySlug: companySlug,
        status: ChangeLogStatus.Published,
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      },
      include: {
        Category: true,
        user: true,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    const nextCursor =
      changeLogs.length === limit ? changeLogs[changeLogs.length - 1].id : null;

    return { status: 200, data: changeLogs, nextCursor };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to get published change logs");
  }
};
