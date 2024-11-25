import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";

export default function TemplatesPage() {
  const router = useRouter();
  const { query } = router;

  const [templates, setTemplates] = useState<
    {
      id: string;
      title: string;
      explanation: string;
      tags: string;
      user: { id: number; firstName: string; lastName: string };
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

  const fetchTemplates = async () => {
    // setLoading(true);
    setError(null);
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    const isMine = searchParams.mine === "true";
    try {
      let response;

      if (accessToken) {
        const userResponse = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCurrentUserId(userResponse.data.id);
        const requestParams = { ...searchParams };
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
          params: { ...searchParams },
        });
      }

      if (response.status === 200) {
        console.log("Fetched templates:", response.data.codeTemplates); // Log fetched templates
        setTemplates(response.data.codeTemplates);
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
              const requestParams = { ...searchParams };
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
                setTemplates(response.data.codeTemplates);
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
  }, [searchParams]);

  const handleSearchChange = (key: string, value: string) => {
    const newSearchParams = { ...searchParams, [key]: value };
    setSearchParams(newSearchParams);
    router.push(
      {
        pathname: "/templates",
        query: { ...newSearchParams },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Templates</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              placeholder="Search by title"
              value={searchParams.title}
              onChange={(e) => handleSearchChange("title", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Explanation
            </label>
            <input
              type="text"
              placeholder="Search by explanation"
              value={searchParams.explanation}
              onChange={(e) =>
                handleSearchChange("explanation", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              placeholder="Search by tag"
              value={searchParams.tags}
              onChange={(e) => handleSearchChange("tags", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Log templates before rendering */}
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <Link href={`/templates/${template.id}`}>
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                  {template.title}
                </h2>
              </Link>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.explanation}
              </p>
              <div className="flex items-center">
                {template.tags
                  .split(" ")
                  .map((tag) => tag.trim())
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full mr-2"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              {/* Display the owner of the template */}
              {template.user && (
                <div className="flex items-center text-sm text-gray-500 mt-4">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
                    {template.user.firstName[0]}
                  </div>
                  <div className="ml-2">
                    <Link href={`/users/${template.user.id}`}>
                      <p className="font-medium hover:underline cursor-pointer">
                        {template.user.firstName} {template.user.lastName}
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {templates.length === 0 && !error && (
          <p className="text-center text-gray-500">No templates found.</p>
        )}
      </div>
    </div>
  );
}
