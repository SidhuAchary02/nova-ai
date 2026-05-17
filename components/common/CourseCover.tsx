import { ny } from "@/lib/utils";
import Image from "next/image";
import { LuSparkles } from "react-icons/lu";

type CourseCoverProps = {
  title?: string;
  category?: string;
  imageUrl?: string | null;
  className?: string;
  compact?: boolean;
  showTitle?: boolean;
};

const gradients = [
  "from-violet-500/30 via-fuchsia-500/10 to-slate-900/80",
  "from-amber-500/35 via-orange-500/10 to-slate-900/80",
  "from-rose-500/30 via-pink-500/10 to-slate-900/80",
  "from-emerald-500/30 via-lime-500/10 to-slate-900/80",
  "from-indigo-500/25 via-purple-500/10 to-slate-900/80",
  "from-red-500/25 via-amber-500/10 to-slate-900/80",
];

const isDefaultBanner = (imageUrl?: string | null) => {
  return !imageUrl || imageUrl === "/thumbnail.png";
};

const getIndex = (value: string) => {
  const hash = value
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % gradients.length;
};

const getInitials = (title?: string) => {
  if (!title) return "NA";
  const words = title.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
};

const CourseCover = ({
  title,
  category,
  imageUrl,
  className,
  compact = false,
  showTitle = true,
}: CourseCoverProps) => {
  if (!isDefaultBanner(imageUrl)) {
    return (
      <div className={ny("relative overflow-hidden", className)}>
        <Image
          src={imageUrl!}
          alt={title || "Course banner"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
      </div>
    );
  }

  const key = `${title || "course"}-${category || "general"}`;
  const gradient = gradients[getIndex(key)];
  const initials = getInitials(title);

  return (
    <div
      className={ny(
        "relative flex h-full w-full items-end overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-4",
        className
      )}
    >
      <div className={ny("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-nova-card/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

      <div className="relative z-10 flex h-full w-full items-center justify-center text-center">
        {showTitle && (
          <p className="text-2xl font-extrabold leading-tight text-white drop-shadow-md">
            {compact ? title || "Untitled" : title || "New Course"}
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseCover;