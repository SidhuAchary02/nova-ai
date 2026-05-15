import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import React from "react";
import NameChip from "@/components/common/NameChip";

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
          <p className="flex items-center justify-center gap-2 text-nova-body">
            Course by
            <NameChip name={username} maxLength={14} />
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
