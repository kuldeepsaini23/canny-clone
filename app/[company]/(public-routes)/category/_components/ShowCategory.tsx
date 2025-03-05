"use client";

import InfiniteLoader from "@/components/Global/Loader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetCategories } from "@/hooks/categories/useCategories";
import type { Category } from "@prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CategoryDialog from "./CategoryDialog";
import { cn } from "@/icons/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Props type definition
type Props = {
  search: string;
  companySlug: string;
  initialData: { data: Category[]; nextCursor: string | null };
  isEdit?: boolean;
  className?: string;
  isFeedbackPage?: boolean;
  currCategoryId?: string;
};

const ShowCategory = ({
  search,
  companySlug,
  initialData,
  isEdit = false,
  className,
  isFeedbackPage = false,
  currCategoryId,
}: Props) => {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: search || "",
  });

  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const { ref, inView } = useInView();
  const debounceSearch = useDebounce(searchQuery, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useGetCategories(companySlug, debounceSearch, initialData);

  const categories = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className={cn("flex w-full flex-col items-center gap-y-4", isFeedbackPage && "border p-4 rounded-xl")}>
      {/* Search Bar */}
      <div className="flex justify-between w-full items-center gap-3">
        <div className="w-full relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading || categories.length === 0}
            placeholder="Search Category..."
            className="pl-10 rounded-xl"
          />
        </div>
        {isEdit && (
          <CategoryDialog
            companySlug={companySlug}
            mode="create"
            onOpenChange={(open) => setOpenDialogId(open ? "create" : null)}
            open={openDialogId === "create"}
            initialValue=""
          />
        )}
      </div>

      {/* Loading State */}
      {isLoading || isFetching ? (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-8 rounded-full bg-primary-foreground" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        isFeedbackPage ? (
          <ScrollArea className="space-y-4 max-h-[400px] w-full">
            {categories.map((category) => (
              <Link href={`/${companySlug}/feedback/${category.id}`} key={category.id} className="w-full">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start capitalize", category.id === currCategoryId && "bg-secondary")}
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </ScrollArea>
        ) : (
          <div className={cn("w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", className)}>
            {categories.map((category) => (
              <div key={category.id} className="w-full flex items-center justify-between gap-x-4 px-4 py-2 rounded-full bg-primary-foreground">
                <Link href={`/${companySlug}/category/${category.id}`} className="text-primary py-2 w-full text-base font-semibold capitalize">
                  {category.name}
                </Link>
                {isEdit && (
                  <CategoryDialog
                    companySlug={companySlug}
                    mode="edit"
                    initialValue={category.name}
                    onOpenChange={(open) => setOpenDialogId(open ? category.id : null)}
                    open={openDialogId === category.id}
                    categoryId={category.id}
                  />
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="w-full flex items-center justify-center mt-5">
          <p className="text-xl text-muted-foreground">No categories found</p>
        </div>
      )}

      {/* Infinite Scrolling Loader */}
      {hasNextPage && (
        <>
          <div ref={ref} />
          {isFetchingNextPage && <InfiniteLoader />}
        </>
      )}
    </div>
  );
};

export default ShowCategory;
