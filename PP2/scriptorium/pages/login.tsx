import { useState } from "react";
import axios, { AxiosError } from "axios";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/login", formData);
      setSuccess("Login successful");
      setError("");
      // Save tokens to local storage or context
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred");
      }
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-lg">
      <header className="text-4xl text-blue-900 font-bold mb-8">
        Scriptorium
      </header>
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-900 text-white p-2 rounded w-full"
        >
          Login
        </button>
      </div>
    </div>
  );
}
