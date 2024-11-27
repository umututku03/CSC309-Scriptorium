import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import UserAvatar from "@/pages/components/user-avatar";

export default function TemplatesPage() {
  const router = useRouter();
  const { query } = router;

  const [templates, setTemplates] = useState<
    {
      id: string;
      title: string;
      explanation: string;
      tags: string;
      user: { id: number; firstName: string; lastName: string; avatar: string };
    }[]
  >([]);
  const [searchParams, setSearchParams] = useState<{
    title: string | string[];
    explanation: string | string[];
    tags: string | string[];
    mine: string | string[];
    userId?: string;
  }>({
    title: query.title || "",
    explanation: query.explanation || "",
    tags: query.tags || "",
    mine: query.mine || "", // Add 'mine' parameter
  });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Add this line
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1); // Add currentPage state
  const TEMPLATES_PER_PAGE = 9; // Define templates per page

  const fetchTemplates = async () => {
    // setLoading(true);
    setError(null);
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    const isMine = searchParams.mine === "true";
    const requestParams = { ...searchParams }; // Remove limit and offset
    try {
      let response;

      if (accessToken) {
        const userResponse = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCurrentUserId(userResponse.data.id);
        if (isMine) {
          requestParams.userId = userResponse.data.id;
        }
        response = await axios.get(`/api/codetemplates`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: requestParams,
        });
      } else {
        if (isMine) {
          setError("Please log in to view your templates.");
          setTemplates([]);
          return;
        }
        response = await axios.get(`/api/codetemplates`, {
          params: { ...requestParams }, // Ensure limit and offset are included
        });
      }

      if (response.status === 200) {
        console.log("Fetched templates:", response.data.codeTemplates); // Log fetched templates
        const reversedTemplates = [...response.data.codeTemplates].reverse();
        setTemplates(reversedTemplates);
        setError(null);
      } else if (response.status === 404) {
        setError("No templates found matching your search criteria.");
        setTemplates([]);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post("/api/users/refresh", {
              refreshToken,
            });
            accessToken = refreshResponse.data.accessToken;
            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
              const userResponse = await axios.get("/api/users/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              setCurrentUserId(userResponse.data.id);
              if (isMine) {
                requestParams.userId = userResponse.data.id;
              }
              const response = await axios.get(`/api/codetemplates`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                params: requestParams,
              });
              if (response.status === 200) {
                console.log(
                  "Fetched templates after refresh:",
                  response.data.codeTemplates
                ); // Log fetched templates after refresh
                const reversedTemplates = [
                  ...response.data.codeTemplates,
                ].reverse(); // Reverse the order
                setTemplates(reversedTemplates);
                setError(null);
              } else if (response.status === 404) {
                setError("No templates found matching your search criteria.");
                setTemplates([]);
              }
            }
          } catch (refreshErr: any) {
            console.error("Error refreshing token:", refreshErr);
            setError("Failed to refresh token. Please log in again.");
          }
        } else {
          setError("Unauthorized. Please log in.");
        }
      } else if (err.response?.status === 404) {
        setError("No templates found matching your search criteria.");
        setTemplates([]);
      } else {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates. Please try again later.");
      }
    } finally {
      //   setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [searchParams]); // Remove currentPage from dependencies

  const handleSearchChange = (key: string, value: string) => {
    const newSearchParams = { ...searchParams, [key]: value };
    setSearchParams(newSearchParams);
    setCurrentPage(1); // Reset to first page on search
    router.push(
      {
        pathname: "/templates",
        query: { ...newSearchParams },
      },
      undefined,
      { shallow: true }
    );
  };

  // Calculate totalPages based on templates length
  const totalPages = Math.ceil(templates.length / TEMPLATES_PER_PAGE);
  // Determine templates to display on current page
  const displayedTemplates = templates.slice(
    (currentPage - 1) * TEMPLATES_PER_PAGE,
    currentPage * TEMPLATES_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-background text-foreground">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Code Templates</h1>
      </div>

      {/* Search Filters */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Title
            </label>
            <input
              type="text"
              placeholder="Search by title"
              value={searchParams.title}
              onChange={(e) => handleSearchChange("title", e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Explanation
            </label>
            <input
              type="text"
              placeholder="Search by explanation"
              value={searchParams.explanation}
              onChange={(e) =>
                handleSearchChange("explanation", e.target.value)
              }
              className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Tags
            </label>
            <input
              type="text"
              placeholder="Search by tag"
              value={searchParams.tags}
              onChange={(e) => handleSearchChange("tags", e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-border"
          >
            <div className="p-6">
              <Link href={`/templates/${template.id}`}>
                <h2 className="text-xl font-semibold text-card-foreground hover:text-primary transition-colors duration-200 mb-2">
                  {template.title}
                </h2>
              </Link>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {template.explanation}
              </p>
              <div className="flex items-center flex-wrap gap-2">
                {template.tags
                  .split(" ")
                  .map((tag) => tag.trim())
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              {/* Template Owner */}
              {template.user && (
                <div className="flex items-center text-sm text-muted-foreground mt-4">
                  <UserAvatar user={template.user} />
                  <div className="ml-2">
                    <p className="font-medium hover:text-foreground transition-colors duration-200">
                      {template.user.firstName} {template.user.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {displayedTemplates.length === 0 && !error && (
          <p className="text-center text-muted-foreground col-span-full py-8">
            No templates found.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              currentPage === 1
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              currentPage === totalPages
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
