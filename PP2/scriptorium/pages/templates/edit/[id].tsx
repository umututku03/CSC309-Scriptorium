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
      <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="explanation">
          Explanation
        </label>
        <textarea
          id="explanation"
          className="w-full p-2 border rounded"
          placeholder="Explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="code">
          Code
        </label>
        <textarea
          id="code"
          className="w-full p-2 border rounded"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="language">
          Language
        </label>
        <select
          id="language"
          className="w-full p-2 border rounded"
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
      <button
        className="p-2 bg-blue-600 text-white rounded"
        onClick={saveChanges}
      >
        Save Changes
      </button>
    </div>
  );
}
