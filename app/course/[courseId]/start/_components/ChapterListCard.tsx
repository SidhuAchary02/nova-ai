import { ChapterType } from "@/types/types";
import React from "react";
import { LuTimer } from "react-icons/lu";
import { formatDuration } from "@/utils/formatDuration";

type ChapterListCardProps = {
  chapter: ChapterType;
  index: number;
};

const ChapterListCard = ({ chapter, index }: ChapterListCardProps) => {
  return (
    <div className="grid grid-cols-5 items-center p-2.5">
      <div>
        <h2 className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-center text-white">{index +1}</h2>
      </div>
      <div className="col-span-4">
        <h2 className="font-medium text-nova-heading">{chapter.chapterName}</h2>
        <h2 className="flex items-center gap-2 text-sm text-primary"> 
          <LuTimer /> {formatDuration(chapter.duration)}
        </h2>
      </div>
    </div>
  );
};

export default ChapterListCard;
