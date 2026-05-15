import React from "react";

const SkeletonLoading = ({ items }: { items: number }) => {
  return Array.from({ length: items || 5 }, (_, index) => (
    <div
      className="mt-1 h-[270px] w-full animate-pulse rounded-2xl border border-black/5 bg-gray-100"
      key={index}
    ></div>
  ));
};

export default SkeletonLoading;
