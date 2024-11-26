import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface Template {
  id: number;
  title: string;
}

const CreateBlogPost: React.FC = () => {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [matchingTemplates, setMatchingTemplates] = useState<Template[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const handleTemplateSearch = async (searchText: string) => {
    try {
      const response = await axios.get("/api/codetemplates", {
        params: { title: searchText },
      });
      setMatchingTemplates(response.data.codeTemplates || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    const currentCursorPosition = e.target.selectionStart;
    setCursorPosition(currentCursorPosition);

    const match = newContent.slice(0, currentCursorPosition).match(/#(\w*)$/);
    if (match) {
      const searchText = match[1];
      if (searchText.length > 0) {
        handleTemplateSearch(searchText);
        setShowTemplatePopup(true);
      }
    } else {
      setShowTemplatePopup(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    const beforeCursor = content.slice(0, cursorPosition).replace(/#\w*$/, `#${template.id}`);
    const afterCursor = content.slice(cursorPosition);
    setContent(`${beforeCursor}${afterCursor}`);
    setShowTemplatePopup(false);
  };

  const extractTemplateIds = (): number[] => {
    const matches = Array.from(content.matchAll(/#(\d+)/g));
    return matches.map((match) => parseInt(match[1]));
  };

  const handleCreatePost = async () => {
    if (!title || !description || !content || !tag) {
      setError("All fields are required!");
      return;
    }

    const templateIds = extractTemplateIds();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You need to log in to create a blog post.");
        return;
      }

      const response = await axios.post(
        "/api/blogposts",
        {
          title,
          description,
          content,
          tag,
          templateIds
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess("Blog post created successfully!");
        setTitle("");
        setDescription("");
        setContent("");
        setTag("");
        setTimeout(() => {
          router.push("/blogposts");
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create blog post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-sm px-6 py-4 mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">Create a New Blog Post</h1>
          <p className="text-muted-foreground mt-1">Share your knowledge with the community</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-card rounded-lg shadow-sm px-6 py-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-destructive/10 border-destructive/20 border rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-primary/10 border-primary/20 border rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-primary">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="Enter a descriptive title for your blog post"
            />
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="Write a brief description of your post"
              rows={3}
            />
          </div>

          {/* Content Input */}
          <div className="mb-6 relative">
            <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-1">
              Content
            </label>
            <div className="mt-1 mb-2">
              <span className="text-sm text-muted-foreground">
                Use <code className="px-1 py-0.5 bg-muted rounded text-sm">#title</code> to reference templates
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="Write your blog post content here..."
              rows={12}
            />

            {/* Template Popup */}
            {showTemplatePopup && matchingTemplates.length > 0 && (
              <div className="absolute left-0 right-0 bg-card border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                {matchingTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0"
                  >
                    <span className="text-primary">#{template.id}</span>
                    <span className="mx-2">-</span>
                    <span className="text-card-foreground">{template.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Input */}
          <div className="mb-8">
            <label htmlFor="tag" className="block text-sm font-medium text-muted-foreground mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors"
              placeholder="Enter tags (comma-separated)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => router.push("/blogposts")}
              className="px-6 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePost}
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPost;