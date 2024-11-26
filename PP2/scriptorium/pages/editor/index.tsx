import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";
import { useTheme } from "next-themes";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { langs } from "@uiw/codemirror-extensions-langs";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateExplanation, setTemplateExplanation] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [status, setStatus] = useState("neutral"); // New state for execution status

  const defaultTemplates: Record<string, string> = {
    py: `# Python Template\nprint("Hello, World!")`,
    js: `// JavaScript Template\nconsole.log("Hello, World!");`,
    java: `// Java Template\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
    c: `// C Template\n#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}`,
    cpp: `// C++ Template\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`,
    go: `// Go Template\npackage main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}`,
    rs: `// Rust Template\nfn main() {\n  println!("Hello, World!");\n}`,
    rb: `# Ruby Template\nputs "Hello, World!"`,
    php: `// PHP Template\n<?php\necho "Hello, World!";\n?>`,
    swift: `// Swift Template\nimport Foundation\nprint("Hello, World!")`,
    pl: `# Perl Template\nprint "Hello, World!\\n";`,
    r: `# R Template\ncat("Hello, World!\\n")`,
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      setAccessToken(token);
    }
    if (router.query.code) {
      setCode(router.query.code as string);
    } else {
      setCode(defaultTemplates[language]);
    }
    if (router.query.language) {
      setLanguage(router.query.language as string);
    }
  }, [router.query, language]);

  const runCode = async () => {
    setLoading(true);
    setOutput(""); // Clear previous output
    setStatus("neutral"); // Reset status to neutral before running
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setOutput(data.stdout || "Code executed successfully with no output.");
        setStatus("success"); // Set status to success
      } else {
        const errorMessage =
          data.error ||
          "An error occurred during code execution. Please check your code and try again.";
        const errorDetails = data.details ? `\nDetails:\n${data.details}` : "";
        const formattedError = `Error: ${errorMessage}${errorDetails}`;
        setOutput(formattedError);
        setStatus("error"); // Set status to error
      }
    } catch (error) {
      setOutput("Network error: Unable to reach the server.");
      setStatus("error"); // Set status to error for network failure
    } finally {
      setLoading(false);
    }
  };
  


  const saveTemplate = async () => {
    if (!templateTitle || !templateExplanation || !templateTags) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to log in to save a template.");
        return;
      }

      const response = await axios.post(
        "/api/codetemplates",
        {
          title: templateTitle,
          explanation: templateExplanation,
          tags: templateTags.split(" "),
          code,
          language,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Template saved successfully!");
        setTemplateTitle("");
        setTemplateExplanation("");
        setTemplateTags("");
        setShowSaveModal(false);
        setTimeout(() => {
          router.push("/templates?mine=true");
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert((error as any).response?.data?.error || "Failed to save template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center">Code Execution</h1>

        <div className="flex flex-wrap gap-4">
          {isAuthenticated && (
            <button
              onClick={() => router.push("/templates?mine=true")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
            >
              My Templates
            </button>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <select
            className="p-2 text-lg bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setCode(defaultTemplates[e.target.value]);
            }}
          >
            <option value="py">Python</option>
            <option value="js">JavaScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rs">Rust</option>
            <option value="rb">Ruby</option>
            <option value="php">PHP</option>
            <option value="swift">Swift</option>
            <option value="pl">Perl</option>
            <option value="r">R</option>
          </select>
        </div>

        <div className="border border-border rounded-md overflow-hidden">
          <CodeMirror
            value={code}
            height="400px"
            className="text-lg"
            theme={theme === "dark" ? "dark" : "light"}
            extensions={[
              language === "py"
                ? langs.python()
                : language === "js"
                  ? langs.javascript()
                  : language === "java"
                    ? langs.java()
                    : language === "c" || language === "cpp"
                      ? langs.cpp()
                      : language === "go"
                        ? langs.go()
                        : language === "rs"
                          ? langs.rust()
                          : language === "rb"
                            ? langs.ruby()
                            : language === "php"
                              ? langs.php()
                              : language === "swift"
                                ? langs.swift()
                                : language === "pl"
                                  ? langs.perl()
                                  : language === "r"
                                    ? langs.r()
                                    : []
            ]}
            onChange={(value) => setCode(value)}
          />
        </div>

        <textarea
          className="w-full p-4 text-lg bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
          placeholder="Standard Input"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={runCode}
            disabled={loading}
          >
            {loading ? "Running..." : "Run Code"}
          </button>
          {isAuthenticated && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
              onClick={() => setShowSaveModal(true)}
            >
              Save as Template
            </button>
          )}
        </div>

        <pre
          className={`w-full p-4 text-lg border rounded-md transition-colors duration-200 ${status === "success"
              ? "bg-green-100 text-green-800 border-green-300"
              : status === "error"
                ? "bg-red-100 text-red-800 border-red-300"
                : "bg-muted text-muted-foreground border-border"
            }`}
        >
          {output}
        </pre>


        {showSaveModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
              <h2 className="text-xl font-bold mb-4">Save Template</h2>
              <input
                className="w-full p-2 mb-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                type="text"
                placeholder="Title"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 mb-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                placeholder="Explanation"
                value={templateExplanation}
                onChange={(e) => setTemplateExplanation(e.target.value)}
              />
              <input
                className="w-full p-2 mb-4 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                type="text"
                placeholder="Tags (space-separated)"
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors duration-200"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
                  onClick={saveTemplate}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}