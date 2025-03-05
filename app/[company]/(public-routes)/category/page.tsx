import { getAllCategoriesByCompany } from "@/action/category";
import React from "react";
import ShowCategory from "./_components/ShowCategory";

type Props = {
  params: Promise<{
    company: string;
  }>;

  searchParams: Promise<{
    search?: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { company } = await params;
  const { search } = await searchParams;
  const categories = await getAllCategoriesByCompany(company, search || "", 10);

  return (
    <div className="w-full flex flex-col gap-y-5 items-start">
      <div className="w-full">
        <h4 className="text-lg text-foreground font-semibold">Categories</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Track the progress of our features
        </p>
        <ShowCategory
          search={search || ""}
          companySlug={company}
          initialData={categories}
        />
      </div>
    </div>
  );
};

export default page;
