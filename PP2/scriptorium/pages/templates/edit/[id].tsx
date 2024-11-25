import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios"; // Import axios

export default function EditTemplate() {
  const router = useRouter();
  const { id } = router.query;
  // Remove useSession
  // const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`/api/codetemplates/${id}`);
      if (response.status === 200) {
        const data = response.data;
        setTitle(data.title);
        setExplanation(data.explanation);
        setTags(data.tags);
        setCode(data.code);
        setLanguage(data.language);
      } else {
        alert("Error fetching template.");
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const saveChanges = async () => {
    if (!title || !explanation || !tags || !code || !language) {
      alert("Please fill in all fields.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You need to be logged in to save changes.");
      router.push("/login");
      return;
    }

    try {
      const response = await axios.put(
        `/api/codetemplates/${id}`,
        {
          title,
          explanation,
          tags: tags.split(","),
          code,
          language,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Template updated successfully.");
        router.push(`/templates/${id}`);
      } else {
        alert(`Error updating template: ${response.data.error}`);
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  return (
    <div className="p-8">
      {/* ...existing code... */}
      <button
        className="p-2 bg-blue-600 text-white rounded"
        onClick={saveChanges}
      >
        Save Changes
      </button>
    </div>
  );
}
