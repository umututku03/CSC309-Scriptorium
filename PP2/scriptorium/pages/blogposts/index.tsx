import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import UserAvatar from "../components/user-avatar";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  templates: { id: number; title: string }[];
  user: { firstName: string; lastName: string; id: number; avatar: string; };
  report_count: number;
  isHidden: boolean;
  ratings: { userId: number; votetype: string }[];
  userVote: string | null;
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
    id?: number;
    author?: string;
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

  const extractVoteTypes = (blogPosts: BlogPost[], userId: number) => {
    blogPosts.forEach((blogPost: BlogPost) => {
      blogPost.ratings.forEach((rating: { userId: number; votetype: string}) => {
        if (rating.userId === userId) {
          blogPost.userVote = rating.votetype;
        }
      })
    })
  } 

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    let userResponse;
    try {
      if (accessToken) {
        userResponse = await axios.get("/api/users/me", {
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
        if (router.query.author === "me") {
          requestParams.id = userResponse.data.id;
        }

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
      if (userResponse) {
        extractVoteTypes(response.data.displayedPosts, userResponse.data.id);
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
    if (router.isReady) {
      fetchBlogPosts();
    }
  }, [page, searchParams, sortOrder, sortBy, router.isReady]);

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
                  userVote: votetype
                }
              : post
          )
        );
      }

      if (res.status === 201) {
        setBlogPosts((prev) =>
          prev.map((post) =>
            post.id === id
              ? {
                  ...post,
                  upvotes:
                    votetype === "UPVOTE" ? post.upvotes - 1 : post.upvotes,
                  downvotes:
                    votetype === "DOWNVOTE"
                      ? post.downvotes - 1
                      : post.downvotes,
                  userVote: null
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
                  userVote: votetype
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
    <div className="max-w-7xl mx-auto px-4 py-8 bg-background text-foreground">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
        <button
          onClick={() => router.push("/blogposts/create")}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
        >
          ✏️ Create New Post
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                placeholder="Search by title"
                value={searchParams.title}
                onChange={(e) => handleSearchChange("title", e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <input
                type="text"
                placeholder="Search by description"
                value={searchParams.description}
                onChange={(e) => handleSearchChange("description", e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Tag</label>
              <input
                type="text"
                placeholder="Search by tag"
                value={searchParams.tag}
                onChange={(e) => handleSearchChange("tag", e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Content</label>
              <input
                type="text"
                placeholder="Search by content"
                value={searchParams.content}
                onChange={(e) => handleSearchChange("content", e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Template</label>
              <input
                type="text"
                placeholder="Search by template"
                value={searchParams.templateTitle}
                onChange={(e) => handleSearchChange("templateTitle", e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              {isAdmin ? (
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortTypeChange(e.target.value as "rating" | "reports")}
                      className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground transition-colors duration-200"
                    >
                      <option value="rating">Rating</option>
                      <option value="reports">Reports</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground transition-colors duration-200"
                    >
                      <option value="desc">
                        {sortBy === "reports" ? "Most Reported" : "Highest Rated"}
                      </option>
                      <option value="asc">
                        {sortBy === "reports" ? "Least Reported" : "Lowest Rated"}
                      </option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sort by Rating</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring text-foreground transition-colors duration-200"
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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
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
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-border"
              >
                <div className="p-6">
                  {(isAdmin || (isAuthor && post.isHidden)) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {isAdmin && post.report_count > 0 && (
                        <span className="inline-flex items-center px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                          🚩 {post.report_count} report{post.report_count !== 1 ? "s" : ""}
                        </span>
                      )}
                      {post.isHidden && (
                        <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                          🚫 Hidden
                        </span>
                      )}
                    </div>
                  )}
                  <Link href={`/blogposts/${post.id}`}>
                    <h2 className="text-xl font-semibold text-card-foreground hover:text-primary transition-colors duration-200 mb-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {post.tag && (
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {post.tag}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserAvatar user={post.user} />
                      <div className="ml-2">
                        <p className="font-medium hover:text-foreground transition-colors duration-200">
                          {post.user.firstName} {post.user.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleHide(post.id, post.isHidden)}
                        className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200
                          ${post.isHidden 
                            ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          }`}
                      >
                        {post.isHidden ? "👁️ Unhide" : "🚫 Hide"} Post
                      </button>
                    )}
                    <button
                    onClick={() => handleVote(post.id, "UPVOTE")}
                    className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200
                      ${post.userVote === "UPVOTE"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                  >
                    👍 {post.upvotes}
                  </button>
                  <button
                    onClick={() => handleVote(post.id, "DOWNVOTE")}
                    className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200
                      ${post.userVote === "DOWNVOTE"
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      }`}
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
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
            page === 1
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm font-medium text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
            page === totalPages
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default BlogPostList;