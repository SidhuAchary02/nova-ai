"use client";

import { useMemo } from "react";

interface MermaidBlockProps {
  code: string;
}

function normalizeLooseFlowchart(code: string) {
  const lines = code.split(/\r?\n/);
  const nodeIds = new Map<string, string>();
  let nextId = 1;

  const buildNodeShape = (token: string) => {
    const trimmed = token.trim();
    const inner = trimmed
      .replace(/^[A-Za-z_][\w-]*\s*/, "")
      .replace(/^[\[(\{]+/, "")
      .replace(/[\])\}]+$/, "")
      .trim();

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
    const normalizedToken = token.trim().replace(/\s+/g, " ");

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
    const flowMatch = line.match(/^\s*(.+?)\s*-->(?:\s*\|([^|]+)\|\s*)?(.+?)\s*$/);

    if (!flowMatch) {
      return line;
    }

    const [, leftRaw, labelRaw, rightRaw] = flowMatch;
    const left = getNodeId(leftRaw);
    const right = getNodeId(rightRaw);

    if (labelRaw) {
      return `${left} -->|${labelRaw.trim()}| ${right}`;
    }

    return `${left} --> ${right}`;
  };

  const normalized = lines.map((line, index) => {
    if (index === 0 && /^\s*(flowchart|graph)\b/i.test(line)) {
      return line.trim();
    }

    if (/^\s*(subgraph|end|style|classDef|class|click|linkStyle|direction\b)/i.test(line)) {
      return line;
    }

    return normalizeLine(line);
  });

  return normalized.join("\n");
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

  for (const byte of utf8Bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = btoa(binary);
  const base64Url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  return `https://mermaid.ink/img/${base64Url}?type=png&bgColor=060816&theme=dark`;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const imageUrl = useMemo(() => {
    if (!code?.trim()) return "";

    return buildMermaidInkUrl(code);
  }, [code]);

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Mermaid flowchart"
          className="h-auto w-full rounded-xl bg-slate-950"
          loading="lazy"
        />
      ) : (
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-300">
          {code}
        </pre>
      )}
    </figure>
  );
}
