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
          "inline-flex max-w-full items-center rounded-full border border-black/5 bg-nova-bg px-2.5 py-1 text-xs font-semibold text-nova-heading shadow-sm",
          className
        )}
      >
        <span className="truncate">{shortName}</span>
      </span>

      {isLong && (
        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs text-nova-heading shadow-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {safeName}
        </span>
      )}
    </span>
  );
};

export default NameChip;