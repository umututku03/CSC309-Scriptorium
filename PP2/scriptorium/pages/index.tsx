import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios"; // Added import for axios

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

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateExplanation, setTemplateExplanation] = useState("");
  const [templateTags, setTemplateTags] = useState("");

  useEffect(() => {
    // Check for tokens in localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      setAccessToken(token);
    }
    // Load code and language from query parameters if present
    if (router.query.code) {
      setCode(router.query.code as string);
    }
    if (router.query.language) {
      setLanguage(router.query.language as string);
    }
  }, [router.query]);

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin }),
      });
      const data = await response.json();
      if (response.ok) {
        setOutput(data.stdout);
      } else {
        setOutput(data.stderr || "Error executing code.");
      }
    } catch (error) {
      setOutput("Network error.");
    }
    setLoading(false);
  };

  const saveTemplate = async () => {
    if (!templateTitle || !templateExplanation || !templateTags) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setOutput("");
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
          router.push("/templates?mine=true"); // Redirect to user's templates
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert((error as any).response?.data?.error || "Failed to save template.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirect to login page
    router.push("/login");
  };

  const handleLogout = () => {
    // Clear tokens and update state
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setAccessToken("");
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-lg`}
    >
      <header className="flex justify-between items-center w-full max-w-4xl">
        <h1
          className="text-4xl text-blue-900 font-bold mb-8 cursor-pointer"
          onClick={() => router.push("/")}
        >
          Scriptorium
        </h1>
        {isAuthenticated ? (
          <button
            className="p-2 bg-red-600 text-white rounded hover:bg-red-500"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            onClick={handleLogin}
          >
            Login
          </button>
        )}
      </header>
      <main className="flex flex-col gap-8 w-full max-w-4xl">
        {/* Add navigation buttons */}
        <div className="flex flex-wrap gap-4">
          {isAuthenticated && (
            <>
              <button
                onClick={() => router.push("/templates?mine=true")}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                My Templates
              </button>
            </>
          )}
          <button
            onClick={() => router.push("/blogposts")}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Explore Posts
          </button>
          <button
            onClick={() => router.push("/templates")}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Explore Templates
          </button>
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <select
            className="p-2 text-lg border rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="py">Python</option>
            <option value="js">JavaScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <CodeMirror
          value={code}
          className="w-full h-96 text-lg"
          extensions={[
            language === "py"
              ? langs.python()
              : language === "js"
              ? langs.javascript()
              : language === "java"
              ? langs.java()
              : language === "c"
              ? langs.cpp()
              : language === "cpp"
              ? langs.cpp()
              : [],
          ]}
          onChange={(value) => setCode(value)}
        />
        <textarea
          className="w-full p-4 text-lg border rounded"
          placeholder="Standard Input"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            className="w-20 p-3 text-sm bg-blue-900 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            onClick={runCode}
            disabled={loading}
          >
            {loading ? "Running..." : "Run Code"}
          </button>
          {isAuthenticated && (
            <button
              className="w-32 p-3 text-sm bg-green-600 text-white rounded hover:bg-green-500"
              onClick={() => setShowSaveModal(true)}
            >
              Save as Template
            </button>
          )}
        </div>
        <pre className="w-full p-4 text-lg border rounded bg-gray-100">
          {output}
        </pre>
        {showSaveModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Save Template</h2>
              <input
                className="w-full p-2 mb-2 border rounded"
                type="text"
                placeholder="Title"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 mb-2 border rounded"
                placeholder="Explanation"
                value={templateExplanation}
                onChange={(e) => setTemplateExplanation(e.target.value)}
              />
              <input
                className="w-full p-2 mb-4 border rounded"
                type="text"
                placeholder="Tags (space-separated)"
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="mr-2 p-2 bg-gray-300 rounded"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="p-2 bg-blue-600 text-white rounded"
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
