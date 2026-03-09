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
    <div className="bg-white rounded-lg border border-gray-200 p-6 my-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Code Sandbox</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {language.toUpperCase()}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          {copied ? (
            <>
              <FaCheck size={14} className="text-green-600" />
              <span className="text-green-600">Copied</span>
            </>
          ) : (
            <>
              <FaCopy size={14} />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Code Editor Area */}
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto max-h-64 overflow-y-auto">
        <pre>{code}</pre>
      </div>

      {/* Run Button */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={executeCode}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" size={16} />
              Running...
            </>
          ) : (
            <>
              <FaPlay size={14} />
              Run Code
            </>
          )}
        </Button>
        <span className="text-xs text-gray-500 pt-2">
          {language === "python" ? "🐍 Python 3.10" : "🟨 JavaScript (Node.js 18)"}
        </span>
      </div>

      {/* Output Area */}
      {(output || error) && (
        <div className={`rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto ${
          error
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-green-50 border border-green-200 text-green-800"
        }`}>
          <p className="font-semibold mb-2">
            {error ? "❌ Error Output:" : "✅ Program Output:"}
          </p>
          <p className="whitespace-pre-wrap break-words">{output || error}</p>
        </div>
      )}

      {!output && !error && !loading && (
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-200 text-center text-gray-500 text-sm">
          Click "Run Code" to execute this code
        </div>
      )}
    </div>
  );
};

export default CodeSandbox;
