import React from "react";
import DraftLogsCard from "./_components/DraftLogsCard";
import CreateLogDialog from "./_components/CreateLogDialog";
import { getDraftChangeLogs } from "@/action/changeLog";
import { getAllCategories } from "@/action/category";
import { getUser } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    company: string;
  }>;
  searchParams: Promise<{
    search: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {

  const { company } = await params;
  const { search } = await searchParams;
  const [categories, draftedLogs, user] = await Promise.all([
    getAllCategories(company),
    getDraftChangeLogs(company, null,search),
    getUser(),
  ]);

  if(!user){
    return redirect("/")
  }
  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-y-10">
      <div className="w-full h-full flex justify-between gap-4 items-center">
        <div className="flex-1 flex flex-col gap-1 items-start justify-center">
          <h2 className="text-xl text-foreground font-semibold">Change Log</h2>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur. Est tristique in non
          </p>
        </div>
        <CreateLogDialog
          categories={categories.data || []}
          companySlug={company}
          userId={user.id}
        />
      </div>

      {/* All Change Logs */}
      <DraftLogsCard
        companySlug={company}
        initialData={draftedLogs}
        search={search}
      />
    </div>
  );
};

export default page;
