import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Signup() {
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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/signup", formData);
      setSuccess("Signup successful");
      setError("");
      // Option 1: Automatically log in the user
      const loginResponse = await axios.post("/api/users/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("accessToken", loginResponse.data.accessToken);
      localStorage.setItem("refreshToken", loginResponse.data.refreshToken);
      // Redirect to profile page
      router.push("/");

      // Option 2: Redirect to login page
      // router.push("/login");
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
        <h2 className="text-2xl mb-4">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
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
        <input
          type="text"
          name="avatar"
          placeholder="Avatar URL"
          value={formData.avatar}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-900 text-white p-2 rounded w-full"
          onClick={handleSubmit}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
