"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { usePublishedLogs } from "@/hooks/changeLogs/usePublishedLogs";
import type { ChangeLogWithUser } from "@/icons/lib/types";
import { useEffect } from "react";
import { useQueryState } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import { getFeatureColor } from "@/utils/BadgeColor";
import { useInView } from "react-intersection-observer";
import InfiniteLoader from "@/components/Global/Loader";
import DisplayEditor from "./DisplayEditor";
import { Value } from "@udecode/plate";

type Props = {
  companySlug: string;
  search: string;
  initialData: ChangeLogWithUser[] | [];
};

const DisplayChangeLogs = ({ companySlug, initialData, search }: Props) => {
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
  } = usePublishedLogs(companySlug, debouncedSearch, initialData);

  const { ref, inView } = useInView();

  const allData = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const renderContent = () => {
    if (isLoading || isFetching) {
      return <InfiniteLoader />;
    }

    if (allData.length === 0) {
      return (
        <div className="w-full flex justify-center items-center py-20">
          <p className="text-muted-foreground">No changelogs found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-8 w-full">
          {allData.map((entry, index) => (
            <div key={index} className="w-full flex gap-4 items-stretch">
              <div className="w-fit min-w-[150px] flex flex-col items-center">
                <Badge variant={"outline"} className="text-sm mb-3">
                  {format(new Date(entry?.createdAt), "MMMM d, yyyy")}
                </Badge>
                <div className="flex-grow w-[1px] bg-input" />
              </div>
              <div className="w-full pb-8">
                <div className="flex items-center space-x-4 mb-2">
                  <Badge
                    variant="outline"
                    className={getFeatureColor(entry?.type)}
                  >
                    {entry?.type}
                  </Badge>
                  {entry?.Category?.map((cat) => (
                    <Badge key={cat.id} variant="default" className="text-sm">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-xl font-semibold mb-4">{entry?.title}</h2>

                {entry.content && typeof entry.content === 'string' ? (
                  <DisplayEditor value={JSON.parse(entry.content) as Value} />
                ) : (
                  <div className="w-full flex items-center justify-center mt-5">
                    <p className="text-xl text-muted-foreground">
                      No content found
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
    <div className="w-full flex flex-col gap-y-10 items-start justify-start pb-20">
      <div className="w-full flex items-center space-x-4">
        <div className="w-full relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            className="pl-10 rounded-xl"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default DisplayChangeLogs;
