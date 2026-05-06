import { Sandpack } from "@codesandbox/sandpack-react";

interface SandpackRendererProps {
  language: string;
  initialCode: string;
}

export default function SandpackRenderer({ language, initialCode }: SandpackRendererProps) {
  // Map common languages to Sandpack templates
  let template: "react" | "vanilla" | "node" | "python" | "react-ts" = "vanilla";
  
  const langLower = language.toLowerCase();
  if (langLower.includes("react")) {
    template = langLower.includes("ts") || langLower.includes("typescript") ? "react-ts" : "react";
  } else if (langLower.includes("node") || langLower.includes("js") || langLower.includes("javascript")) {
    template = "node";
  } else if (langLower.includes("python")) {
    template = "python";
  }

  // Determine the primary file based on the template
  let mainFile = "/index.js";
  if (template === "react") mainFile = "/App.js";
  if (template === "react-ts") mainFile = "/App.tsx";
  if (template === "python") mainFile = "/main.py";

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      <div className="bg-slate-900 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Interactive Sandbox ({template})
        </span>
      </div>
      <Sandpack
        template={template}
        theme="dark"
        files={{
          [mainFile]: initialCode,
        }}
        options={{
          showNavigator: false,
          showTabs: false,
          editorHeight: 400,
          editorWidthPercentage: 60,
        }}
      />
    </div>
  );
}
