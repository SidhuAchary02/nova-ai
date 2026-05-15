"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

interface MermaidBlockProps {
  code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !code) return;

    const render = async () => {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      try {
        const { svg } = await mermaid.render(id, code);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn("Mermaid render failed:", err);
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-slate-300 text-sm p-4">${code}</pre>`;
        }
      }
    };

    render();
  }, [code]);

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-border p-4 bg-slate-900/50"
    />
  );
}
