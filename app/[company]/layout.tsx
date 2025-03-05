import { getCompanyDetailsBySlug } from "@/action/company";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Global/Navbar";
import Sidebar from "@/components/Global/Sidebar";
import { onAuthenticateUser } from "@/action/auth";
import { getAdminCompanies } from "@/action/role";
import { SettingsUser } from "@/icons/lib/types";
import { RoleType } from "@prisma/client";

type Props = {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
};

const Layout = async ({ children, params }: Props) => {
  const { company } = await params;

  // Fetch user, companies, and company details concurrently
  const [user, companies, companyDetails] = await Promise.all([
    onAuthenticateUser(true),
    getAdminCompanies(),
    getCompanyDetailsBySlug(company),
  ]);

  const userData = user.data as SettingsUser | null;
  const isAdmin =
    userData?.roles?.some(
      (role) =>
        role.roleType === RoleType.Admin || role.roleType === RoleType.Owner
    ) || false;

  const defaultCompany = companies.data.find(
    (comp) => comp.companySlug === company
  );

  // Handle missing company or required permissions
  if (
    companyDetails.status !== 200 ||
    !companyDetails.data ||
    (isAdmin && !defaultCompany)
  ) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <Alert variant="destructive" className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {!userData
              ? "Authentication failed. Please log in again."
              : "No company exists with this URL or you don't have the required permissions."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto xl:max-w-7xl relative px-16 md:px-20">
      <Navbar
        user={userData}
        companies={companies.data}
        currCompany={companyDetails.data}
        isAdmin={isAdmin}
        defaultCompany={defaultCompany!}
      />
      <div className="w-full h-full">
        <Sidebar
          user={userData}
          isAdmin={isAdmin}
          currCompany={companyDetails.data}
        />
        {children}
      </div>
    </div>
  );
};

export default Layout;
