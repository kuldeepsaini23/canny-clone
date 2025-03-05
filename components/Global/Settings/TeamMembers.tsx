"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RoleType, type User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trash2 } from "lucide-react";
import { changeStaffRole } from "@/action/role";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CardLayout from "../CardLayout";
import AddStaffModal from "./Modals/AddStaffModal";
import { RoleWithUser } from "@/icons/lib/types";
import { useGetAdmins } from "@/hooks/settings/useAdmins";
import { useInView } from "react-intersection-observer";
import InfiniteLoader from "../Loader";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  companySlug: string;
  allUsers: User[] | [];
  user: User;
  initialData: {
    status: number;
    data: RoleWithUser[] | [];
    nextCursor: string | null;
  };
};

const TeamMembers = ({ companySlug, allUsers, user, initialData }: Props) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetAdmins(companySlug, initialData);
  const { ref, inView } = useInView();
  const admins =
    (data?.pages.map((page) => page.data).flat() as RoleWithUser[]) || [];

  const handleRemoveStaff = async (id: string) => {
    setLoading(true);
    toast.loading("Removing staff");
    try {
      const res = await changeStaffRole(id, RoleType.User);
      if (res.status === 200) {
        throw new Error("Failed to remove staff");
      }

      router.refresh();
      toast.success("Staff removed successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error("Failed to remove staff");
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <CardLayout
      heading="Team Members"
      layoutId="team"
      subHeading="Manage your team members and their roles"
      buttonChildren={
        <AddStaffModal
          companySlug={companySlug}
          users={allUsers}
          currUser={user}
        />
      }
    >
      <ScrollArea className="px-5 h-[250px]">
        {isLoading ? (
          <InfiniteLoader />
        ) : admins.length > 0 ? (
          admins.map((admin) => (
            <div
              className="w-full flex justify-between items-center gap-3"
              key={admin?.id}
            >
              <div className="flex justify-center items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={admin?.user?.avatar}
                    alt={admin?.user?.name}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {admin?.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{admin?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {admin?.user?.email}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => handleRemoveStaff(admin?.id)}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing
                  </>
                ) : (
                  "Remove"
                )}
              </Button>
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center mt-5">
            <p className="text-xl text-muted-foreground">No Members found</p>
          </div>
        )}
        {hasNextPage && (
          <>
            <div ref={ref} />
            {isFetchingNextPage && <InfiniteLoader />}
          </>
        )}
      </ScrollArea>
    </CardLayout>
  );
};

export default TeamMembers;
