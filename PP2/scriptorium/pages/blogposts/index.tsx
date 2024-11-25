import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  templates: { id: number; title: string }[];
  user: { firstName: string; lastName: string; id: number };
  report_count: number;
  isHidden: boolean;
}

const BlogPostList: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchParams, setSearchParams] = useState<{
    title: string | string[];
    description: string | string[];
    tag: string | string[];
    content: string | string[];
    templateTitle: string | string[];
    userId?: number;
  }>({
    title: query.title || "",
    description: query.description || "",
    tag: query.tag || "",
    content: query.content || "",
    templateTitle: query.templateTitle || "",
  });
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("desc"); // "asc", "desc", or null
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const handleToggleHide = async (id: number, currentHiddenState: boolean) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to be logged in");
        return;
      }
      await axios.put(
        `/api/blogposts/${id}`,
        { isHidden: !currentHiddenState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setBlogPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, isHidden: !currentHiddenState } : post
        )
      );
    } catch (err: any) {
      console.error(
        "Failed to update post visibility:",
        err.response?.data?.error || err.message
      );
      alert("Failed to update post visibility. Please try again.");
    }
  };

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");

    try {
      if (accessToken) {
        const userResponse = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setIsAdmin(userResponse.data.role === "ADMIN");
        setCurrentUserId(userResponse.data.id);
        const requestParams = {
          ...searchParams,
          page,
          pageSize: 12,
          sortOrder,
          sortBy,
        };

        requestParams.userId = userResponse.data.id;

        var response = await axios.get(`/api/blogposts`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: requestParams,
        });
      } else {
        var response = await axios.get(`/api/blogposts`, {
          params: {
            ...searchParams,
            page,
            pageSize: 12,
            sortOrder,
            sortBy,
          },
        });
      }

      setBlogPosts(response.data.displayedPosts);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      if (err.status === 401) {
        if (refreshToken) {
          try {
            response = await axios.post("/api/users/refresh", { refreshToken });
            accessToken = response.data.accessToken;
            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
              const userResponse = await axios.get("/api/users/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              setIsAdmin(userResponse.data.role === "ADMIN");
              setCurrentUserId(userResponse.data.id);
              response = await axios.get(`/api/blogposts`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                params: {
                  ...searchParams,
                  page,
                  pageSize: 12,
                  sortOrder,
                  sortBy,
                },
              });
              setBlogPosts(response.data.displayedPosts);
              setTotalPages(response.data.totalPages || 1);
            }
          } catch (err: any) {
            try {
              response = await axios.get(`/api/blogposts`, {
                params: {
                  ...searchParams,
                  page,
                  pageSize: 12,
                  sortOrder,
                  sortBy,
                },
              });
            } catch (err: any) {
              setError("Failed to load blog posts. Please try again later.");
            }
          }
        }
      } else if (err.response?.status === 404) {
        setError("No blog posts found matching your search criteria.");
        setBlogPosts([]);
      } else {
        setError("Failed to load blog posts. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [page, searchParams, sortOrder, sortBy]);

  const updateQueryParams = (params: any) => {
    router.push(
      {
        pathname: "/blogposts",
        query: { ...params },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearchChange = (key: string, value: string) => {
    const newSearchParams = { ...searchParams, [key]: value };
    setSearchParams(newSearchParams);
    updateQueryParams(newSearchParams);
    setPage(1); // Reset to the first page on new search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateQueryParams({ ...searchParams, page: newPage });
  };

  const handleVote = async (id: number, votetype: string) => {
    try {
      const token = localStorage.getItem("accessToken"); // Or wherever you store the token
      if (!token) {
        alert("You need to log in to vote");
        return;
      }

      const res = await axios.post(
        `/api/ratings`,
        { votetype, blogPostId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Updated existing rating
      if (res.status === 200) {
        setBlogPosts((prev) =>
          prev.map((post) =>
            post.id === id
              ? {
                  ...post,
                  upvotes:
                    votetype === "UPVOTE" ? post.upvotes + 1 : post.upvotes - 1,
                  downvotes:
                    votetype === "DOWNVOTE"
                      ? post.downvotes + 1
                      : post.downvotes - 1,
                }
              : post
          )
        );
      }

      // Created new rating
      if (res.status === 202) {
        setBlogPosts((prev) =>
          prev.map((post) =>
            post.id === id
              ? {
                  ...post,
                  upvotes:
                    votetype === "UPVOTE" ? post.upvotes + 1 : post.upvotes,
                  downvotes:
                    votetype === "DOWNVOTE"
                      ? post.downvotes + 1
                      : post.downvotes,
                }
              : post
          )
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to rate the post:",
        err.response?.data?.error || err.message
      );
    }
  };

  const handleSortTypeChange = (type: "rating" | "reports") => {
    setSortBy(type);
    // Reset sort order to desc when changing sort type
    setSortOrder("desc");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-400">Blog Posts</h1>
        <button
          onClick={() => router.push("/blogposts/create")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ✏️ Create New Post
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-6">
          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                placeholder="Search by title"
                value={searchParams.title}
                onChange={(e) => handleSearchChange("title", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                placeholder="Search by description"
                value={searchParams.description}
                onChange={(e) =>
                  handleSearchChange("description", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tag</label>
              <input
                type="text"
                placeholder="Search by tag"
                value={searchParams.tag}
                onChange={(e) => handleSearchChange("tag", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Content
              </label>
              <input
                type="text"
                placeholder="Search by content"
                value={searchParams.content}
                onChange={(e) => handleSearchChange("content", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Template
              </label>
              <input
                type="text"
                placeholder="Search by template"
                value={searchParams.templateTitle}
                onChange={(e) =>
                  handleSearchChange("templateTitle", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              {isAdmin ? (
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        handleSortTypeChange(
                          e.target.value as "rating" | "reports"
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="rating">Rating</option>
                      <option value="reports">Reports</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="desc">
                        {sortBy === "reports"
                          ? "Most Reported"
                          : "Highest Rated"}
                      </option>
                      <option value="asc">
                        {sortBy === "reports"
                          ? "Least Reported"
                          : "Lowest Rated"}
                      </option>
                    </select>
                  </div>
                </div>
              ) : (
                // Non-admin sort control
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sort by Rating
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="desc">Highest Rated</option>
                    <option value="asc">Lowest Rated</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => {
          const isAuthor = currentUserId === post.user.id;
          const shouldShow = !post.isHidden || isAdmin || isAuthor;
          return (
            shouldShow && (
              <div
                key={post.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow`}
              >
                <div className="p-6">
                  {(isAdmin || (isAuthor && post.isHidden)) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {isAdmin && post.report_count > 0 && (
                        <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                          🚩 {post.report_count} report
                          {post.report_count !== 1 ? "s" : ""}
                        </span>
                      )}
                      {post.isHidden && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          🚫 Hidden
                        </span>
                      )}
                    </div>
                  )}
                  <Link href={`/blogposts/${post.id}`}>
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {post.tag && (
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {post.tag}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
                        {post.user.firstName[0]}
                      </div>
                      <div className="ml-2">
                        <Link href={`/users/${post.user.id}`}>
                          <p className="font-medium hover:underline cursor-pointer">
                            {post.user.firstName} {post.user.lastName}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <div className="mt-4 flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleHide(post.id, post.isHidden)
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors
                        ${
                          post.isHidden
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                        >
                          {post.isHidden ? "👁️ Unhide" : "🚫 Hide"} Post
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleVote(post.id, "UPVOTE")}
                      className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                    >
                      👍 {post.upvotes}
                    </button>
                    <button
                      onClick={() => handleVote(post.id, "DOWNVOTE")}
                      className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                    >
                      👎 {post.downvotes}
                    </button>
                  </div>
                </div>
              </div>
            )
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center items-center space-x-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md transition-colors ${
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm font-medium text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-md transition-colors ${
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default BlogPostList;
