import { ny } from "@/lib/utils";

type NameChipProps = {
  name?: string | null;
  maxLength?: number;
  className?: string;
};

const truncateName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}...`;
};

const NameChip = ({ name, maxLength = 14, className }: NameChipProps) => {
  const safeName = (name || "Creator").trim();
  const isLong = safeName.length > maxLength;
  const shortName = truncateName(safeName, maxLength);

  return (
    <span className="group relative inline-flex max-w-full items-center">
      <span
        className={ny(
          "inline-flex max-w-full items-center rounded-full border border-white/15 bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-slate-100",
          className
        )}
      >
        <span className="truncate">{shortName}</span>
      </span>

      {isLong && (
        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-slate-950/95 px-2.5 py-1 text-xs text-slate-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {safeName}
        </span>
      )}
    </span>
  );
};

export default NameChip;