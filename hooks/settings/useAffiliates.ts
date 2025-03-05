"use client";
import { getAllAffiliates } from "@/action/affiliates";
import { AffiliateWithReferred } from "@/icons/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useGetAffiliates(
  companySlug: string,
  initialData: { status:number, data: AffiliateWithReferred[] | []; nextCursor: string | null }
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "affiliates", companySlug }],
    queryFn: ({ pageParam=null }: { pageParam: string | null }) =>
      getAllAffiliates(companySlug, pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    initialData: {
      pageParams: [null],
      pages: [initialData],
    },
  });
}
