import { Suspense } from "react";
import { getUser } from "@/utils/supabase/queries";
import { getPostsByCategory } from "@/action/post";
import { getAllCategoriesByCompany } from "@/action/category";
import CreatePost from "./[categoryId]/_components/CreatePost";
import PostDataManager from "./[categoryId]/_components/PostDataManager";
import CategoryPanel from "./[categoryId]/_components/CategoryPanel";
import { isUserJoinedCompany } from "@/action/role";

type Props = {
  params: Promise<{
    company: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sortBy?: "recent" | "votes" | "comments";
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { company } = await params;
  const { search, sortBy } = await searchParams;
  const user = await getUser();

  const [posts, allCategories, userJoinedResult] = await Promise.all([
    getPostsByCategory(company, "", null, 10, search, sortBy),
    getAllCategoriesByCompany(company, null, 10),
    user ? isUserJoinedCompany(user.id, company) : { status: 200, data: null },
  ]);

  const isUserJoined = user ? !!userJoinedResult.data : false;

  // console.log("post", posts)

  return (
    <div className="w-full h-full">
      <main className="w-full mx-auto grid grid-cols-1 gap-6 p-4 md:grid-cols-[1fr,300px]">
        <div className="flex flex-col gap-y-5 bg-secondary border border-input rounded-xl px-8 py-6">
          <CreatePost
            companySlug={company}
            categoryId={""}
            user={user}
            categories={allCategories.data || []}
            isUserJoined={isUserJoined}
          />

          <Suspense fallback={<div>Loading...</div>}>
            <PostDataManager
              companySlug={company}
              categoryId={""}
              search={search}
              user={user}
              sortBySearchQuery={sortBy || "recent"}
              initialData={posts.data || []}
              isUserJoined={isUserJoined}
            />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <CategoryPanel
            initialData={allCategories}
            currCategoryId={""}
            companySlug={company}
          />
        </Suspense>
      </main>
    </div>
  );
};

export default page;
