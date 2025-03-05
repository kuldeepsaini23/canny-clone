"use client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Category } from "@prisma/client";
import ShowCategory from "../../../category/_components/ShowCategory";

type Props = {
  currCategoryId: string;
  companySlug: string;
   initialData: { data: Category[] | []; nextCursor: string | null };
};

const CategoryPanel = ({ currCategoryId, companySlug, initialData}: Props) => {

  return (
    <div className="flex flex-col gap-y-1">
      <ShowCategory
        companySlug={companySlug}
        initialData={initialData}
        search={""} 
        isEdit={false}
        isFeedbackPage={true}
        currCategoryId={currCategoryId}
      />
      <div className="w-full flex justify-end items-center">
        <Link
          href={`/${companySlug}/category`}
          className="hover:underline text-sm text-muted-foreground font-semibold flex gap-x-1 items-center justify-center"
        >
          see all categories <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
};

export default CategoryPanel;
