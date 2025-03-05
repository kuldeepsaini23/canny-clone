"use server";
import { prisma } from "@/utils/prisma/client";
import { createClient } from "@/utils/supabase/server";


//update company Details
export const updateCompanyDetails = async (
  companySlug: string,
  data: {
    name?: string;
    slug?: string;
  }
) => {
  try {
    console.log("🔴 updateCompanyDetails", data, companySlug);
    const company = await prisma.company.update({
      where: {
        slug: companySlug,
      },
      data: data,
    });

    if(!company) {
      throw new Error("Failed to update company details");
    }

    return { status: 200, data: company };
  } catch (error) {
    console.log("🔴 ERROR updateCompanyDetails", error);
    return { status: 500 };
  }
};

//get Company Details by slug
export const getCompanyDetailsBySlug = async (slug: string) => {
  try {
    // console.log("🔴 getCompanyDetailsBySlug");
    const company = await prisma.company.findUnique({
      where: {
        slug: slug,
      },
    });
    return { status: 200, data: company };
  } catch (error) {
    console.log("🔴 ERROR getCompanyDetailsBySlug", error);
    return { status: 500 };
  }
};

//upload company image
export const uploadCompanyImage = async (companySlug: string, file: File) => {
  try {
    console.log("🔴 uploadCompanyImage");

    const filePath = `company/${Date.now()}-${file.name}`;

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("canny-clone")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }

    // Get public URL of uploaded image
    const { data: imageUrl } = supabase.storage
      .from("canny-clone")
      .getPublicUrl(filePath);

    const company = await prisma.company.update({
      where: {
        slug: companySlug,
      },
      data: {
        logo: imageUrl.publicUrl,
      },
    });
    console.log("Company:", company);
    return { status: 200, data: company };
  } catch (error) {
    console.log("🔴 ERROR uploadCompanyImage", error);
    return { status: 500 };
  }
};


