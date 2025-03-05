"use client";
import { getCompanyAdmins } from "@/action/role";
import { RoleWithUser } from "@/icons/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useGetAdmins(
  companySlug: string,
  initialData: { status:number, data: RoleWithUser[] | []; nextCursor: string | null }
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "settingsAdmins", companySlug }],
    queryFn: ({ pageParam=null }: { pageParam: string | null }) =>
      getCompanyAdmins(companySlug, pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    initialData: {
      pageParams: [null],
      pages: [initialData],
    },
  });
}
