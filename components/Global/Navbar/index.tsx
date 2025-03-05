import { Button } from "@/components/ui/button";
import React from "react";
import PathHeading from "./PathHeading";
import NotificationIcon from "@/icons/NotificationIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationCard from "./NotificationCard";
import Logout from "./Logout";
import { Company, User } from "@prisma/client";
import CompanySwitcher from "./CompanySwitcher";
import { RoleWithCompany } from "@/icons/lib/types";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EyeButton from "./EyeButton";

type Props = {
  user: User | null;
  companies: RoleWithCompany[] | [];
  isAdmin: boolean;
  currCompany: Company;
  defaultCompany:RoleWithCompany
};

const Navbar = ({ user, companies, isAdmin, currCompany, defaultCompany }: Props) => {

  return (
    <header className="flex items-center justify-between py-8">
      {!isAdmin ? (
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border">
              {currCompany?.logo && (
                <AvatarImage
                  src={currCompany?.logo}
                  alt={currCompany?.name || "Company logo"}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currCompany?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium truncate max-w-[150px]">
                {currCompany?.name || "Select company"}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <CompanySwitcher
          allCompany={companies}
          defaultCompany={defaultCompany}
        />
      )}

      <PathHeading />
      {user ? (
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="px-3 py-2 hover:bg-secondary transition-all duration-500 ease-in-out"
              >
                <NotificationIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0">
              <NotificationCard />
            </PopoverContent>
          </Popover>

         { isAdmin && <EyeButton/>}
          <Logout />
        </div>
      ) : (
       null
      )}
    </header>
  );
};

export default Navbar;
