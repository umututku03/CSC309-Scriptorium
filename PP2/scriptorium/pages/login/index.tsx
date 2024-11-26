import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function LoginPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "Failed to login:",
          err.response?.data?.error || err.message
        );
      } else {
        console.error("Failed to login:", err);
      }
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 transition-colors ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >

      {/* Logo */}
      <div className="mb-6">
        <img
          src={theme === "dark" ? "/logo.jpg" : "/logo.jpg"}
          alt="Logo"
          className="w-32 h-32 mx-auto transition-transform duration-500 hover:scale-110"
        />
      </div>

      <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>

      {/* Login Form */}
      <div
        className={`w-full max-w-md space-y-4 p-6 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <input
          className={`w-full p-3 border rounded-md ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-gray-300 focus:border-blue-500 focus:ring-blue-500"
              : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          }`}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={`w-full p-3 border rounded-md ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-gray-300 focus:border-blue-500 focus:ring-blue-500"
              : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          }`}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className={`w-full p-3 rounded-md hover:opacity-90 transition-opacity ${
            theme === "dark"
              ? "bg-blue-600 text-gray-100"
              : "bg-blue-600 text-white"
          }`}
          onClick={handleLogin}
        >
          Login
        </button>

        {/* Link to Signup */}
        <div className="text-center mt-4 text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link
            href="/signup"
            className="text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}