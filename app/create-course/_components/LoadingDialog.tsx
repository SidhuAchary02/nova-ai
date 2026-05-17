"use client";

import { useEffect, useRef, useState } from "react";

// ─── Message sequences ────────────────────────────────────────────────────────

const ROADMAP_STEPS = [
  "Analyzing your learning goals",
  "Understanding your current skill level",
  "Personalizing your roadmap",
  "Structuring your learning journey",
  "Optimizing course flow",
  "Curating the best sequence",
  "Almost ready",
];

const COURSE_MESSAGES = [
  "Designing your curriculum",
  "Generating chapter content",
  "Building lesson structure",
  "Linking learning resources",
  "Structuring quizzes",
  "Preparing your workspace",
  "Finalizing course",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoadingDialogProps =
  | { loading: boolean; variant?: "roadmap"; progress?: never; progressTotal?: never; progressLesson?: never }
  | {
    loading: boolean;
    variant: "course";
    progress?: number;
    progressTotal?: number;
    progressLesson?: string;
  };

// ─── Minimal animated line ────────────────────────────────────────────────────

function AnimatedBar({ pct, animate = false }: { pct: number; animate?: boolean }) {
  return (
    <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-black/8">
      {animate ? (
        // Indeterminate shimmer for roadmap
        <div
          className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-nova-primary"
          style={{
            animation: "nova-shimmer 1.8s ease-in-out infinite",
          }}
        />
      ) : (
        // Determinate for course
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-nova-primary transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}

// ─── Roadmap variant ──────────────────────────────────────────────────────────

function RoadmapLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((p) => (p + 1) % ROADMAP_STEPS.length);
        setVisible(true);
      }, 250);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-nova-primary/8" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-1">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-nova-primary">
          Generating Roadmap
        </p>
        <p
          className="text-base font-medium text-nova-heading transition-opacity duration-250"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {ROADMAP_STEPS[msgIdx]}
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-1.5">
        {ROADMAP_STEPS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-400 ${i === msgIdx
              ? "h-1.5 w-5 bg-nova-primary"
              : i < msgIdx
                ? "h-1.5 w-1.5 bg-nova-primary/40"
                : "h-1.5 w-1.5 bg-black/10"
              }`}
          />
        ))}
      </div>

      {/* Bar */}
      <AnimatedBar pct={0} animate />

      <p className="text-center text-xs text-nova-body/50">
        This usually takes 5-10 seconds
      </p>
    </div>
  );
}

// ─── Course variant ───────────────────────────────────────────────────────────

function CourseLoader({
  progress = 0,
  progressTotal = 0,
  progressLesson,
}: {
  progress?: number;
  progressTotal?: number;
  progressLesson?: string;
}) {
  const hasReal = progressTotal > 0;
  const realPct = hasReal ? Math.min(95, Math.round((progress / progressTotal) * 100)) : 0;

  const [simPct, setSimPct] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [maxDisplayPct, setMaxDisplayPct] = useState(0);

  useEffect(() => {
    if (hasReal) return;
    const t = setInterval(() => {
      setSimPct((p) => Math.min(88, p + (88 - p) * 0.025));
    }, 150);
    return () => clearInterval(t);
  }, [hasReal]);

  useEffect(() => {
    if (hasReal) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((p) => (p + 1) % COURSE_MESSAGES.length);
        setVisible(true);
      }, 250);
    }, 2800);
    return () => clearInterval(t);
  }, [hasReal]);

  const rawPct = hasReal ? realPct : Math.round(simPct);

  useEffect(() => {
    setMaxDisplayPct((prev) => {
      const next = Math.max(prev, rawPct);
      return Math.min(95, next);
    });
  }, [rawPct]);

  const pct = maxDisplayPct;
  const primaryMsg = hasReal && progressLesson
    ? progressLesson
    : COURSE_MESSAGES[msgIdx];
  const subMsg = hasReal
    ? `${progress} of ${progressTotal} lessons complete`
    : "Building your course";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-nova-primary/8" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
      </div>

      {/* Title + message */}
      <div className="text-center space-y-1">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-nova-primary">
          Creating Course
        </p>
        <p
          className="text-base font-medium text-nova-heading line-clamp-1 transition-opacity duration-250"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {primaryMsg}
        </p>
      </div>

      {/* Progress bar with label */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-nova-body/60">{subMsg}</span>
          {hasReal && (
            <span className="tabular-nums font-semibold text-nova-primary">{pct}%</span>
          )}
        </div>
        <AnimatedBar pct={pct} animate={false} />

        {/* Lesson ticks — only when ≤ 20 lessons */}
        {hasReal && progressTotal > 0 && progressTotal <= 20 && (
          <div className="flex gap-[3px] mt-1">
            {Array.from({ length: progressTotal }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${i < progress ? "bg-nova-primary" : "bg-black/8"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-nova-body/50">
        This may take a moment — we're crafting something great
      </p>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

const LoadingDialog = (props: LoadingDialogProps) => {
  const { loading, variant = "roadmap" } = props;
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      timerRef.current = setTimeout(() => setVisible(false), 400);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [loading]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background: "rgba(253,248,244,0.72)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "nova-fade 0.25s ease both",
        }}
      />

      {/* Card */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="w-full max-w-[360px] rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.10)]"
          style={{
            pointerEvents: "auto",
            animation: "nova-up 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-nova-primary opacity-70" />

          {variant === "roadmap" ? (
            <RoadmapLoader />
          ) : (
            <CourseLoader
              progress={"progress" in props ? props.progress : undefined}
              progressTotal={"progressTotal" in props ? props.progressTotal : undefined}
              progressLesson={"progressLesson" in props ? props.progressLesson : undefined}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes nova-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nova-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nova-shimmer {
          0%   { left: -34%; }
          100% { left: 100%; }
        }
      `}</style>
    </>
  );
};

export default LoadingDialog;
