import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function LoginPage() {
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
      // Redirect to home page after login
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Login</h1>
      <div className="w-full max-w-md space-y-4">
        <input
          className="w-full p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
