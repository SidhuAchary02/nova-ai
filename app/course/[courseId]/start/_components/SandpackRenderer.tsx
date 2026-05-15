import { Sandpack } from "@codesandbox/sandpack-react";

interface SandpackRendererProps {
  language: string;
  initialCode: string;
}

export default function SandpackRenderer({ language, initialCode }: SandpackRendererProps) {
  // Map common languages to Sandpack templates
  let template: "react" | "vanilla" | "node" | "react-ts" = "vanilla";
  
  const langLower = language.toLowerCase();
  if (langLower.includes("react")) {
    template = langLower.includes("ts") || langLower.includes("typescript") ? "react-ts" : "react";
  } else if (langLower.includes("node") || langLower.includes("js") || langLower.includes("javascript")) {
    template = "node";
  } else if (langLower.includes("python")) {
    // Sandpack does not provide a first-class Python runtime template.
    // Fall back to a generic editor preview.
    template = "vanilla";
  }

  // Determine the primary file based on the template
  let mainFile = "/index.js";
  if (template === "react") mainFile = "/App.js";
  if (template === "react-ts") mainFile = "/App.tsx";

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-black/5 shadow-2xl">
      <div className="bg-white px-4 py-2 border-b border-black/5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-nova-body flex items-center gap-2">
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
