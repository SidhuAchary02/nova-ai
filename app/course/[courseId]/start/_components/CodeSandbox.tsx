"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaPlay, FaSpinner, FaCopy, FaCheck } from "react-icons/fa";

type CodeSandboxProps = {
  code: string;
  language: "python" | "javascript";
};

const CodeSandbox = ({ code, language }: CodeSandboxProps) => {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const getLanguageVersion = () => {
    return language === "python" ? "3.10.0" : "18.15.0";
  };

  const getLanguageId = () => {
    return language === "python" ? "python" : "javascript";
  };

  const enhanceCodeWithOutput = (codeStr: string): string => {
    // Check if code already has output statements
    const hasOutput = 
      (language === "javascript" && codeStr.includes("console.log")) ||
      (language === "python" && codeStr.includes("print("));

    if (hasOutput) return codeStr;

    // If no output, wrap the code to show the last expression
    if (language === "javascript") {
      return `(function() {
  ${codeStr}
  // Auto-wrapped to show results
  console.log("✅ Code executed successfully");
})();`;
    } else {
      // Python
      return `${codeStr}
# Auto-wrapped to show results
print("✅ Code executed successfully")`;
    }
  };

  const executeCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const enhancedCode = enhanceCodeWithOutput(code);

      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: getLanguageId(),
          version: getLanguageVersion(),
          files: [
            {
              name: `main.${language === "python" ? "py" : "js"}`,
              content: enhancedCode,
            },
          ],
        }),
      });

      const result = await response.json();

      if (result.compile?.stderr) {
        setError(result.compile.stderr);
      } else if (result.run?.stderr) {
        setError(result.run.stderr);
      } else if (result.run?.stdout) {
        setOutput(result.run.stdout);
      } else {
        setOutput("✅ Code executed successfully");
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Failed to execute code"}`);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-[24px] border border-black/5 bg-white shadow-soft p-2 overflow-hidden group">
      <div className="rounded-[20px] bg-[#0A0A0A] overflow-hidden shadow-inner border border-black/10">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <span className="text-[11px] font-medium text-white/40 font-mono tracking-wider uppercase ml-2">
              {language === "python" ? "main.py" : "index.js"}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <>
                <FaCheck size={12} className="text-[#27C93F]" />
                <span className="text-[#27C93F]">Copied</span>
              </>
            ) : (
              <>
                <FaCopy size={12} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code Editor Area */}
        <div className="text-gray-300 p-5 font-mono text-sm overflow-x-auto max-h-[300px] overflow-y-auto leading-relaxed custom-scrollbar">
          <pre>{code}</pre>
        </div>
      </div>

      <div className="mt-4 px-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={executeCode}
              disabled={loading}
              className="flex items-center gap-2 bg-nova-primary text-white hover:bg-nova-primary/90 hover:shadow-md transition-all active:scale-95 rounded-xl px-5 h-10"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  Running...
                </>
              ) : (
                <>
                  <FaPlay size={12} />
                  Run Code
                </>
              )}
            </Button>
            <span className="text-xs font-medium text-nova-body bg-black/5 px-3 py-1.5 rounded-lg border border-black/5">
              {language === "python" ? "🐍 Python 3.10" : "🟨 Node.js 18"}
            </span>
          </div>
        </div>

        {/* Output Area */}
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          {(output || error) && (
            <div className={`rounded-xl p-5 font-mono text-sm max-h-48 overflow-y-auto shadow-inner border ${
              error
                ? "bg-red-50/50 border-red-200 text-red-800"
                : "bg-green-50/50 border-green-200 text-green-800"
            }`}>
              <p className="font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                {error ? "❌ Error Output:" : "✅ Program Output:"}
              </p>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{output || error}</p>
            </div>
          )}

          {!output && !error && !loading && (
            <div className="rounded-xl border border-black/5 bg-nova-bg/50 p-5 text-center text-sm text-nova-body font-medium">
              Click &quot;Run Code&quot; to execute this snippet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeSandbox;
