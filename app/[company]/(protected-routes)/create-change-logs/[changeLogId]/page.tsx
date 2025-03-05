import React from "react";
import ChangeLogEditor from "./_components/ChangeLogEditor";
import { getUser } from "@/utils/supabase/queries";
import { getChangeLogById } from "@/action/changeLog";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    company: string;
    changeLogId: string;
  }>;
};

const page = async ({ params }: Props) => {
  const { company, changeLogId } = await params;
  const [user, changeLog] = await Promise.all([
    getUser(),
    getChangeLogById(changeLogId),
  ]);
  if (!user) {
    redirect("/");
  }

  if (!changeLog.data) {
    redirect(`/${company}/write-change-logs`);
  }

  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-y-10">
      <ChangeLogEditor
        companySlug={company}
        user={user}
        changeLog={changeLog.data}
      />
    </div>
  );
};

export default page;
