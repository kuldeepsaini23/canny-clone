"use client";

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import CardLayout from "@/components/Global/CardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDraftLogs } from "@/hooks/changeLogs/useDraftLogs";
import type { ChangeLogWithUser } from "@/icons/lib/types";
import LogItem from "./LogItem";
import InfiniteLoader from "@/components/Global/Loader";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryState } from "nuqs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PostLoader from "@/components/Global/Loader/PostLoader";

type Props = {
  companySlug: string;
  search: string;
  initialData: { data: ChangeLogWithUser[] | []; nextCursor: string | null };
};

const DraftLogsCard = ({ companySlug, initialData, search }: Props) => {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: search || "",
  });

  const debouncedSearch = useDebounce(searchQuery, 500);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useDraftLogs(companySlug, debouncedSearch, initialData);
  const { ref, inView } = useInView();

  const allData = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const renderContent = () => {
    if (isLoading || isFetching) {
      return <PostLoader />;
    }

    if (allData.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No change logs found.
        </div>
      );
    }

    return (
      <>
        {allData.map((log, idx) => (
          <React.Fragment key={log.id}>
            <LogItem log={log} companySlug={companySlug} />
            {idx !== allData.length - 1 && <Separator />}
          </React.Fragment>
        ))}
        {hasNextPage && (
          <>
            <div ref={ref} />
            {isFetchingNextPage && <InfiniteLoader />}
          </>
        )}
      </>
    );
  };

  return (
    <CardLayout
      layoutId="drafts"
      heading="Drafts"
      subHeading="Lorem ipsum dolor sit amet consectetur. Est tristique in non"
    >
      <ScrollArea className="h-[500px] px-5">
        <div className="space-y-4">
          {
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-full relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-10 rounded-xl focus-visible:ring-0"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {renderContent()}
            </div>
          }
        </div>
      </ScrollArea>
    </CardLayout>
  );
};

export default DraftLogsCard;
