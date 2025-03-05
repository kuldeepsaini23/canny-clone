import { Suspense } from "react";
import CreatePost from "./_components/CreatePost";
import PostDataManager from "./_components/PostDataManager";
import CategoryPanel from "./_components/CategoryPanel";
import { getUser } from "@/utils/supabase/queries";
import { getPostsByCategory } from "@/action/post";
import { getAllCategoriesByCompany } from "@/action/category";
import { isUserJoinedCompany } from "@/action/role";

type Props = {
  params: Promise<{
    company: string;
    categoryId: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sortBy?: "recent" | "votes" | "comments";
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { categoryId, company } = await params;
  const { search, sortBy } = await searchParams;
  const user = await getUser();

  const [posts, allCategories, userJoinedResult] = await Promise.all([
    getPostsByCategory(company, categoryId, null, 10, search, sortBy),
    getAllCategoriesByCompany(company, null, 10),
    user?.id ? isUserJoinedCompany(user.id, company) : { status: 200, data: null },
  ]);


  const isUserJoined = user ? !!userJoinedResult.data : false

  return (
      <div className="w-full h-full">
        <main className="w-full mx-auto grid grid-cols-1 gap-6 p-4 md:grid-cols-[1fr,300px]">
          <div className="flex flex-col gap-y-5 bg-secondary border border-input rounded-xl px-8 py-6">
            <CreatePost
              companySlug={company}
              categoryId={categoryId}
              user={user}
              categories={allCategories.data || []}
              isUserJoined={isUserJoined}
            />

            <Suspense fallback={<div>Loading...</div>}>
              <PostDataManager
                companySlug={company}
                categoryId={categoryId}
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
              currCategoryId={categoryId}
              companySlug={company}
            />
          </Suspense>
        </main>
      </div>
  );
};

export default page;
