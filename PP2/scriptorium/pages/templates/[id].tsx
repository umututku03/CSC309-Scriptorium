import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios"; // Import axios

export default function TemplateDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const { data: session } = useSession();

  interface Template {
    title: string;
    explanation: string;
    tags: string;
    code: string;
    language: string;
    userId: string;
    forkedFromId: number;
    blogPosts: {
      id: number;
      title: string;
      description: string;
    }[];
  }

  const [template, setTemplate] = useState<Template | null>(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      fetchUser(accessToken);
    }
  }, [id]);
  console.log(template);
  console.log("HELLO ");
  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`/api/codetemplates/${id}`);

      if (response.status === 200) {
        setTemplate(response.data);
      } else {
        alert("Error fetching template.");
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await axios.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setUserId(response.data.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Handle error
    }
  };

  const useTemplate = () => {
    if (template) {
      router.push({
        pathname: "/editor",
        query: { code: template.code, language: template.language },
      });
    }
  };

  const forkTemplate = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You need to be logged in to fork a template.");
      router.push("/login");
      return;
    }
    try {
      const response = await axios.post(
        `/api/codetemplates/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 201) {
        alert("Template forked and added to My Templates successfully!");
      } else {
        alert(`Error forking template: ${response.data.error}`);
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const deleteTemplate = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You need to be logged in to delete a template.");
      router.push("/login");
      return;
    }
    try {
      const response = await axios.delete(`/api/codetemplates/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        alert("Template deleted successfully.");
        router.push("/templates");
      } else {
        alert(`Error deleting template: ${response.data.error}`);
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  return (
    <div className="p-8 bg-background text-foreground">
      {/* Header */}

      {template && (
        <div className="space-y-6">
          {/* Template Header */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-card-foreground">
              {template.title}
            </h2>
            <p className="text-muted-foreground">{template.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {template.tags.split(" ").map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {template.forkedFromId && (
              <div className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                Forked Template
              </div>
            )}
          </div>

          {/* Code Display */}
          <div className="relative">
            <pre className="p-4 bg-card border border-border rounded-lg overflow-x-auto text-card-foreground">
              <code>{template.code}</code>
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={useTemplate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
            >
              Use Template
            </button>

            {userId && (
              <>
                <button
                  onClick={forkTemplate}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
                >
                  Fork Template
                </button>

                {template.forkedFromId && (
                  <button
                    onClick={() =>
                      router.push(`/templates/${template.forkedFromId}`)
                    }
                    className="px-4 py-2 bg-primary text-destructive-foreground rounded-md hover:bg-muted/80 transition-colors duration-200"
                  >
                    View Original
                  </button>
                )}

                {userId === template.userId && (
                  <>
                    <button
                      onClick={() => router.push(`/templates/edit/${id}`)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
                    >
                      Edit Template
                    </button>
                  </>
                )}
                {userId === template.userId && (
                  <>
                    <button
                      onClick={deleteTemplate}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors duration-200"
                    >
                      Delete Template
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          {/* Blog Posts Section */}
          <div>
            <h2 className="text-xl ">Relevant Blogposts:</h2>
            <ul className="list-disc list-inside marker:text-sm marker:text-blue-500">
              {template.blogPosts.map((post) => (
                <li
                  key={post.id}
                  className="marker:text-sm marker:text-primary ml-3"
                >
                  <a
                    href={`/blog/${post.id}`}
                    className=" hover:underline ml-2 mr-2"
                  >
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
