"use client";
import { getAllCategoriesByCompany } from "@/action/category";
import { Category } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useGetCategories(
  companySlug: string,
  searchQuery: string,
  initialData: { data: Category[] | []; nextCursor: string | null }
) {
  return useInfiniteQuery({
    queryKey: [{ scope: "categories", companySlug , searchQuery}],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      getAllCategoriesByCompany(companySlug, pageParam, 10),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    initialData: {
      pageParams: [null],
      pages: [initialData],
    },
  });
}
