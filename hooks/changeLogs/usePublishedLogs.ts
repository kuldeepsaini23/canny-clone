"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChangeLogWithUser } from "@/icons/lib/types";
import {
  getAllPublishedChangeLogs,
} from "@/action/changeLog";

export function usePublishedLogs(
  companySlug: string,
  search: string,
  initialData: ChangeLogWithUser[] | []
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "draftLogs", companySlug, search }],
    queryFn: ({ pageParam = null }: { pageParam: string | null }) =>
      getAllPublishedChangeLogs(companySlug, pageParam, search, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    initialData: {
      pageParams: [null],
      pages: [{ status: 200, data: initialData, nextCursor: null }],
    },
  });
}
