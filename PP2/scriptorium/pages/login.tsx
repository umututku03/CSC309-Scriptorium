import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useTheme } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError(""); // Reset error state
    try {
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Redirect to home page after login
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to login:", err.response?.data?.error || err.message);
      } else {
        console.error("Failed to login:", err);
      }
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 transition-colors ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <img
          src={theme === "dark" ? "/logo.jpg" : "/logo.jpg"}
          alt="Logo"
          className="w-32 h-32 mx-auto animate-bounce"
        />
      </div>

      {/* Welcome Message */}
      <h1 className="text-4xl font-extrabold mb-4 text-center">
        Welcome Back!
      </h1>
      <p className="text-lg text-center mb-8">
        Please log in to access your account.
      </p>

      {/* Login Card */}
      <div
        className={`w-full max-w-md rounded-lg shadow-lg p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <input
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={`w-full p-3 rounded-md focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-300 focus:ring-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className={`w-full py-3 rounded-md text-lg font-semibold shadow hover:shadow-md transition-all ${
              theme === "dark"
                ? "bg-blue-600 text-gray-100 hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>

        {/* Additional Links */}
        <div className="text-center mt-2">
          <p className="text-sm">
            Don't have an account?{" "}
            <a
              href="/register"
              className={`font-semibold ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} Scriptorium. All rights reserved.</p>
      </footer>
    </div>
  );
}
