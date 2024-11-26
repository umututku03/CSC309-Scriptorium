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
        pathname: "/",
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
        alert("Template forked successfully.");
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
    <div className="p-8">
      <h1
        className="text-4xl text-blue-900 font-bold mb-8 cursor-pointer"
        onClick={() => router.push("/")}
      >
        Scriptorium
      </h1>
      {/* Add navigation buttons */}
      <div className="flex flex-wrap mb-4">
        {isAuthenticated && (
          <>
            <button
              onClick={() => router.push("/templates?mine=true")}
              className="p-2 bg-white text-blue-600 rounded hover:text-blue-400"
            >
              My Templates
            </button>
          </>
        )}

        <button
          onClick={() => router.push("/templates")}
          className="p-2 bg-white text-blue-600 rounded hover:text-blue-400"
        >
          Explore Templates
        </button>
      </div>
      {template && (
        <>
          <h1 className="text-2xl font-bold mb-4">{template.title}</h1>
          <p className="mb-4">{template.explanation}</p>
          <p className="mb-4 text-sm text-gray-600">Tags: {template.tags}</p>
          {template.forkedFromId && (
            <p className="mb-4 text-sm text-gray-600">FORKED TEMPLATE</p>
          )}
          <pre className="p-4 bg-gray-100 rounded mb-4">{template.code}</pre>
          <button
            className="p-2 bg-blue-600 text-white rounded mr-2"
            onClick={useTemplate}
          >
            Use Template
          </button>
          {userId && (
            <>
              <button
                className="p-2 bg-green-600 text-white rounded mr-2"
                onClick={forkTemplate}
              >
                Fork Template
              </button>
              {userId === template.userId && (
                <>
                  <button
                    className="p-2 bg-yellow-600 text-white rounded mr-2"
                    onClick={() => router.push(`/templates/edit/${id}`)}
                  >
                    Edit Template
                  </button>
                  <button
                    className="p-2 bg-red-600 text-white rounded mr-2 "
                    onClick={deleteTemplate}
                  >
                    Delete Template
                  </button>
                </>
              )}
            </>
          )}
          {template.forkedFromId && (
            <button
              className="p-2 bg-gray-600 text-white rounded"
              onClick={() => router.push(`/templates/${template.forkedFromId}`)}
            >
              Forked From
            </button>
          )}
        </>
      )}
    </div>
  );
}