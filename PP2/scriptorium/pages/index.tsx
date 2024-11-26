// pages/index.tsx
import Link from "next/link";

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
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-primary to-primary/70 text-primary-foreground py-20 px-6">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">Welcome to Scriptorium</h1>
        <p className="text-lg sm:text-xl max-w-3xl">
          The new way to write, execute, and share code seamlessly. Explore templates, read blogs, and create amazing projects with ease.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/editor"
            className="bg-background text-primary px-6 py-3 rounded-lg shadow-md hover:bg-secondary transition-colors duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="bg-transparent border border-primary-foreground px-6 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors duration-200"
          >
            Learn More
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 bg-background">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-foreground">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg bg-card text-card-foreground">
            <h3 className="text-xl font-bold mb-3">
              Multi-language Support
            </h3>
            <p className="text-muted-foreground">
              Execute code in 10+ languages with ease, all within a secure sandbox environment.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card text-card-foreground">
            <h3 className="text-xl font-bold mb-3">
              Secure Code Execution
            </h3>
            <p className="text-muted-foreground">
              Run code safely and securely, with guaranteed isolation from the host system.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card text-card-foreground">
            <h3 className="text-xl font-bold mb-3">
              Ready-to-Use Templates
            </h3>
            <p className="text-muted-foreground">
              Get started faster with 30+ pre-built templates for various programming tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-16 px-6 bg-secondary">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-secondary-foreground">
          Explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Top Templates</h3>
            <p className="text-muted-foreground mb-4">
              Discover the most popular templates used by our community.
            </p>
            <Link
              href="/templates"
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
            >
              Browse Templates
              <span className="ml-2">→</span>
            </Link>
          </div>
          <div className="bg-card p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Top Blog Posts</h3>
            <p className="text-muted-foreground mb-4">
              Read insightful articles from developers and educators.
            </p>
            <Link
              href="/blog"
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
            >
              Browse Blogs
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}