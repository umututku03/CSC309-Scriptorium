import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useTheme } from "next-themes";

export default function Signup() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    avatar: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("/api/users/signup", formData);
      setSuccess("Signup successful!");
      // Automatically log in the user after signup
      const loginResponse = await axios.post("/api/users/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("accessToken", loginResponse.data.accessToken);
      localStorage.setItem("refreshToken", loginResponse.data.refreshToken);
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 transition-colors ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >

      {/* Logo and Header */}
      <div className="mb-8 text-center">
        <img
          src={theme === "dark" ? "/logo.jpg" : "/logo.jpg"}
          alt="Logo"
          className="w-24 h-24 mx-auto transition-all transform hover:scale-110"
        />
        <h1 className="text-4xl font-extrabold mt-4">Scriptorium</h1>
      </div>

      {/* Signup Form */}
      <div
        className={`w-full max-w-md rounded-lg shadow-lg p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <input
            type="text"
            name="avatar"
            placeholder="Avatar URL (optional)"
            value={formData.avatar}
            onChange={handleChange}
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-lg font-semibold shadow hover:shadow-md transition-all flex items-center justify-center ${
              theme === "dark"
                ? "bg-blue-600 text-gray-100 hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing Up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Redirect to Login */}
        <div className="text-center mt-6">
          <p className="text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className={`font-semibold ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}