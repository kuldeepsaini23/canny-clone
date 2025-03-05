import { updateCompanyDetails, uploadCompanyImage } from "@/action/company";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role } from "@prisma/client";
import { Loader2, Upload } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type CompanyProps = {
  role: Role & { company: { name: string; slug: string; logo: string | null } };
};

const CompanyProfile = ({ role }: CompanyProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState(role?.company?.name || "");
  const [slug, setSlug] = useState(role?.company?.slug || "");
  const [avatarSrc, setAvatarSrc] = useState(role?.company?.logo || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleCompanyDetails = async () => {
    setLoading(true);
    try {
      // update company details
      const updateCompany = await updateCompanyDetails(role?.companySlug, {
        name: companyName,
        slug,
      });

      if (updateCompany.status !== 200 || !updateCompany.data) {
        throw new Error("Failed to update company details");
      }
      const segments = pathname.split("/");
      segments[1] = updateCompany.data.slug;
      const newPath = segments.join("/");

      router.replace(newPath);
      toast.success("Company details updated successfully");
    } catch (error) {
      console.error("Failed to update company details", error);
      toast.error("Failed to update company details");
      setCompanyName(role.company.name);
      setSlug(role.company.slug);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) {
      return toast.error("No file selected");
    }

    setIsUploading(true);

    try {
      const response = await uploadCompanyImage(role.companySlug, file);

      if (response?.status !== 200 && !response.data)
        throw new Error("Failed to update avatar");
      // console.log("Response:", response);
      setAvatarSrc(response?.data?.logo || "");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // console.error("Error updating avatar:", error);
      setAvatarSrc(role?.company?.logo || "");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex items-start justify-center flex-col gap-4">
      <p className="text-lg font-semibold">Company Details</p>
      <div className="w-full flex justify-between items-center gap-12 flex-wrap">
        <div className="relative group">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={avatarSrc}
              alt={role.company.name}
              className="object-cover"
            />
            <AvatarFallback>{role.company.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center border rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-pink-500" />
            </label>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          <input
            id="avatar-upload"
            type="file"
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex flex-col flex-1 gap-2 items-start">
          <Input
            type="text"
            required
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <Input
            type="text"
            required
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full flex justify-end">
        <Button
          variant={"outline"}
          onClick={handleCompanyDetails}
          className="px-8 py-4"
          disabled={
            loading ||
            (role?.company?.name === companyName.trim() &&
              role?.company?.slug === slug.trim())
          }
        >
          Update
        </Button>
      </div>
    </div>
  );
};

export default CompanyProfile;
