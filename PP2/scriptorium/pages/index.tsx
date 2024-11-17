import Image from "next/image";
import localFont from "next/font/local";
import { useState } from "react";
import dynamic from "next/dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-lg`}
    >
      <header className="text-4xl font-bold mb-8">Scriptorium</header>
      <main className="flex flex-col gap-8 w-full max-w-4xl">
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
        <button
          className="w-20 p-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          onClick={runCode}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
        <pre className="w-full p-4 text-lg border rounded bg-gray-100">
          {output}
        </pre>
      </main>
    </div>
  );
}
