import React from "react";
import DisplayChangeLogs from "./_components/DisplayChangeLogs";
import { getAllPublishedChangeLogs } from "@/action/changeLog";

type Props = {
  searchParams: Promise<{
    search: string;
  }>;
  params: Promise<{
    company: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { company } = await params;
  const { search } = await searchParams;
  const publishedLogs = await getAllPublishedChangeLogs(company, null, search);
  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-y-10">
      <div className="w-full h-full flex justify-between gap-4 items-center">
        <div className="flex-1 flex flex-col gap-1 items-start justify-center">
          <h2 className="text-xl text-foreground font-semibold">Change Log</h2>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur. Est tristique in non
          </p>
        </div>
      </div>

      {/* All Change Logs */}
      <DisplayChangeLogs
        companySlug={company}
        initialData={publishedLogs.data || []}
        search={search}
      />
    </div>
  );
};

export default page;
