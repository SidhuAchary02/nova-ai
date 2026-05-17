"use client";

import { useEffect, useMemo, useState } from "react";

interface MermaidBlockProps {
  code: string;
}

function normalizeLooseFlowchart(code: string) {
  const lines = code.split(/\r?\n/);
  const nodeIds = new Map<string, string>();
  let nextId = 1;

  const sanitizeLabel = (value: string) =>
    value
      .replace(/[`<>]/g, "")
      .replace(/\|/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const sanitizeToken = (value: string) =>
    value
      .replace(/[`<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const splitEdgeLabel = (value: string) => {
    const firstPipe = value.indexOf("|");
    if (firstPipe === -1) {
      return { label: "", rest: value };
    }

    const secondPipe = value.indexOf("|", firstPipe + 1);
    if (secondPipe === -1) {
      return { label: "", rest: value.replace("|", " ") };
    }

    return {
      label: value.slice(firstPipe + 1, secondPipe),
      rest: value.slice(secondPipe + 1),
    };
  };

  const buildNodeShape = (token: string) => {
    const trimmed = sanitizeToken(token);
    const innerRaw = trimmed
      .replace(/^[A-Za-z_][\w-]*\s*/, "")
      .replace(/^[\[(\{]+/, "")
      .replace(/[\])\}]+$/, "")
      .trim();
    const inner = sanitizeLabel(innerRaw) || "Step";

    if (trimmed.startsWith("((") && trimmed.endsWith("))")) {
      return `(( ${inner} ))`;
    }

    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      return `([${inner}])`;
    }

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return `{${inner}}`;
    }

    return `[${inner}]`;
  };

  const getNodeId = (token: string) => {
    const normalizedToken = sanitizeToken(token);

    if (!normalizedToken) {
      return "";
    }

    if (/^[A-Za-z_][\w-]*\s*(\(\(|\(|\[|\{)/.test(normalizedToken)) {
      return normalizedToken;
    }

    const existingId = nodeIds.get(normalizedToken);
    if (existingId) {
      return `${existingId}${buildNodeShape(normalizedToken)}`;
    }

    const newId = `n${nextId++}`;
    nodeIds.set(normalizedToken, newId);
    return `${newId}${buildNodeShape(normalizedToken)}`;
  };

  const normalizeLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    const arrowIndex = trimmed.indexOf("-->");
    if (arrowIndex === -1) {
      if (/^[A-Za-z_][\w-]*\s*(\(\(|\(|\[|\{)/.test(trimmed)) {
        return trimmed;
      }
      return "";
    }

    const leftRaw = trimmed.slice(0, arrowIndex).trim();
    let rightRaw = trimmed.slice(arrowIndex + 3).trim();

    if (!leftRaw || !rightRaw) return "";

    const { label, rest } = splitEdgeLabel(rightRaw);
    rightRaw = rest.trim();

    const left = getNodeId(leftRaw);
    const right = getNodeId(rightRaw);

    if (!left || !right) return "";

    const cleanedLabel = sanitizeLabel(label);
    if (cleanedLabel) {
      return `${left} -->|${cleanedLabel}| ${right}`;
    }

    return `${left} --> ${right}`;
  };

  const normalized = lines.map((line, index) => {
    if (index === 0 && /^\s*(flowchart|graph)\b/i.test(line)) {
      return line.trim();
    }

    if (/^\s*(subgraph|end|style|classDef|class|click|linkStyle|direction\b)/i.test(line)) {
      return line.trim();
    }

    return normalizeLine(line);
  });

  const cleaned = normalized.map((line) => line.trim()).filter((line) => line.length > 0);
  if (cleaned.length === 1 && /^\s*(flowchart|graph)\b/i.test(cleaned[0])) {
    cleaned.push("A[Start] --> B[Next step]");
  }

  return cleaned.join("\n");
}

function buildMermaidInkUrl(code: string) {
  const trimmedCode = code.trim();
  const normalizedCode = /^\s*(flowchart|graph)\b/i.test(trimmedCode)
    ? normalizeLooseFlowchart(trimmedCode)
    : trimmedCode;

  if (!normalizedCode) {
    return "";
  }

  const utf8Bytes = new TextEncoder().encode(normalizedCode);
  let binary = "";

  for (let index = 0; index < utf8Bytes.length; index += 1) {
    binary += String.fromCharCode(utf8Bytes[index]);
  }

  const base64 = btoa(binary);
  const base64Url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  return `https://mermaid.ink/img/${base64Url}?type=png&bgColor=060816&theme=dark`;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setRetryNonce(0);
  }, [code]);

  const imageUrl = useMemo(() => {
    if (!code?.trim()) return "";

    const baseUrl = buildMermaidInkUrl(code);
    if (!baseUrl) return "";

    return retryNonce > 0 ? `${baseUrl}&v=${retryNonce}` : baseUrl;
  }, [code, retryNonce]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setRetryNonce((prev) => prev + 1);
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-nova-card/[0.03] px-4 py-3 text-left transition hover:bg-nova-card/[0.06]"
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-sm font-semibold text-slate-100">Visual overview</p>
          <p className="text-xs text-slate-400">
            {isOpen ? "Hide the flowchart" : "Show the flowchart"}
          </p>
        </div>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-nova-card/5 text-slate-300 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.2l3.71-3.97a.75.75 0 1 1 1.08 1.04l-4.24 4.54a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/80 p-3">
          {imageUrl && !hasError ? (
            <div className="relative flex items-center justify-center">
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-slate-950/60">
                  <span className="text-xs text-slate-400">Rendering flowchart...</span>
                </div>
              )}
              <img
                src={imageUrl}
                alt="Mermaid flowchart"
                className="h-auto w-full max-h-[360px] max-w-[980px] rounded-lg bg-slate-950 object-contain sm:max-h-[420px] lg:max-h-[520px]"
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {imageUrl
                  ? "We could not load this diagram yet."
                  : "No flowchart is available for this lesson yet."}
              </div>
              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-full border border-white/10 bg-nova-card/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-nova-card/10"
                >
                  Retry diagram
                </button>
              )}
              {code?.trim() && (
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-300">
                  {code}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
