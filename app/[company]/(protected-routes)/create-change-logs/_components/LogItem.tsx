import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFeatureColor } from "@/utils/BadgeColor";
import type { ChangeLogWithUser } from "@/icons/lib/types";
import Link from "next/link";
import { format } from "date-fns";

type Props = {
  log: ChangeLogWithUser;
  companySlug: string;
};

const LogItem = ({ log, companySlug }: Props) => {
  return (
    <Link
      href={`/${companySlug}/create-change-logs/${log.id}`}
      className="w-full flex flex-col items-start gap-3 justify-center"
    >
      <div className="w-full flex-1 flex gap-4 items-center justify-between">
        <p className="text-lg text-primary font-semibold">{log.title}</p>
        <div className="flex gap-2 items-center">
          <Badge className={`px-3 ${getFeatureColor(log.type)}`}>
            {log?.type}
          </Badge>

          <Badge className={`px-3`}>{log?.status}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={log?.user?.avatar}
            alt={log?.user?.name}
            className="object-cover"
          />
          <AvatarFallback>{log?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{log?.user?.name}</span>
        </div>
        <div className="flex flex-col ml-auto text-right">
          {log.createdAt && (
            <span className="text-xs text-muted-foreground">
              Created: {format(new Date(log?.createdAt), "MMMM d, yyyy")}
            </span>
          )}
          {log.updatedAt && (
            <span className="text-xs text-muted-foreground">
              Updated: {format(new Date(log?.updatedAt), "MMMM d, yyyy")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default LogItem;
