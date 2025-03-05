"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChangeLogWithUser } from "@/icons/lib/types";
import { getDraftChangeLogs } from "@/action/changeLog";

export function useDraftLogs(
  companySlug: string,
  search: string,
  initialData: {data: ChangeLogWithUser[] | []; nextCursor: string | null}
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "draftLogs", companySlug, search }],
    queryFn: ({ pageParam = null }: { pageParam: string | null }) =>
      getDraftChangeLogs(companySlug, pageParam, search, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    initialData: {
      pageParams: [null],
      pages: [initialData],
    },
  });
}
