"use client";

import type React from "react";
import { usePostDataByCategory } from "@/hooks/post/usePostDataByCategory";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import InfiniteLoader from "@/components/Global/Loader";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import CommentIcon from "@/icons/CommentIcon";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { getFeatureColor } from "@/utils/BadgeColor";
import { useQueryState } from "nuqs";
import type { FeedbackSortOption, PostWithCounts } from "@/icons/lib/types";
import AuthRequiredModal from "@/components/Global/LoginModal/AuthRequiredModal";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import UpvoteButton from "@/components/Global/UpvoteButton";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

type Props = {
  companySlug: string;
  categoryId: string;
  search?: string;
  sortBySearchQuery?: FeedbackSortOption;
  user: User | null;
  initialData: PostWithCounts[] | [];
  isUserJoined: boolean;
};

const PostDataManager = ({
  companySlug,
  categoryId,
  search,
  user,
  sortBySearchQuery,
  initialData,
  isUserJoined
}: Props) => {
  const { ref, inView } = useInView();
  const pathname = usePathname();
  const [modal, setModal] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: search || "",
  });
  const [sortBy, setSortBy] = useQueryState("sortBy", {
    defaultValue: sortBySearchQuery || ("recent" as FeedbackSortOption),
  });
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery || "", 300);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePostDataByCategory(
    companySlug,
    categoryId,
    debouncedSearchQuery,
    sortBy as FeedbackSortOption,
    initialData
  );


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = async (option: FeedbackSortOption) => {
    setSortBy(option);
  };

  const posts = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  useEffect(() => {
    const fetchData = async () => {
      setIsSearching(true);
      await refetch().finally(() => {
          setIsSearching(false);
        });
    };
  
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, sortBy]);


  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="w-full relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search posts..."
            defaultValue={searchQuery}
            onChange={handleSearch}
            className="pl-10 rounded-xl bg-secondary"
          />
        </div>

        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px] bg-secondary">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
            <SelectItem value="comments">Most Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isSearching || isLoading ? (
        <InfiniteLoader />
      ) : (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                className="w-full flex flex-col items-start gap-2"
                key={post.id}
              >
                <div className="w-full flex flex-col gap-4 mb-2">
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={`/${companySlug}/post/${post.id}`}
                      className="flex-1 flex items-start justify-center flex-col gap-3 "
                    >
                      <Badge
                        variant="outline"
                        className={getFeatureColor(post.tag)}
                      >
                        {post.tag}
                      </Badge>

                      <div>
                        <p className="text-sm font-bold text-primary">
                          {post.title}
                        </p>
                        <p className="line-clamp-2 mt-2 text-muted-foreground">
                          {post.description}
                        </p>
                      </div>
                    </Link>
                    <UpvoteButton
                      post={post}
                      queryKey={[
                        {
                          scope: "posts",
                          companySlug,
                          categoryId,
                        },
                      ]}
                      isUserJoined={isUserJoined}
                      user={user}
                      setOpen={setModal}
                    />
                  </div>
                  <div className="flex w-full justify-between gap-3 items-center">
                    <div className="flex items-center gap-1">
                      <CommentIcon />
                      <span className="text-xs text-gray-400">
                        {post._count.comments}
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium">
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="py-4 w-full">
                  <Separator className="border-input" />
                </div>
              </div>
            ))
          ) : (
            <div className="w-full flex items-center justify-center">
              <p className="text-lg text-muted-foreground">No posts found.</p>
            </div>
          )}
          {hasNextPage && (
            <>
              <div ref={ref} />
              {isFetchingNextPage && <InfiniteLoader />}
            </>
          )}
        </div>
      )}
      <AuthRequiredModal
        open={modal}
        companySlug={companySlug}
        userId={user?.id || null}
        setOpen={setModal}
        redirect={pathname}
      />
    </div>
  );
};

export default PostDataManager;
