import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import React from "react";

const UserToolTip = ({
  username,
  userProfileImage,
}: {
  username: string;
  userProfileImage: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="flex items-center justify-center gap-2 text-slate-300">
            Course by
            <Badge className="cursor-pointer bg-slate-800 text-slate-100">{username}</Badge>
          </p>
        </TooltipTrigger>
        <TooltipContent variant={"secondary"}>
          <Image
            src={userProfileImage || "/userProfile.png"}
            alt={username || "Course creator"}
            width={50}
            height={50}
            priority
            className="rounded-full"
          />
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserToolTip;
