import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Profile() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      let accessToken = localStorage.getItem("accessToken");
      let refreshToken = localStorage.getItem("refreshToken");
      try {
        if (accessToken) {
          const response = await axios.get("/api/users/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUserData(response.data);
          setError("");
        } else {
          setError("You need to log in to view your profile");
          router.push("/login");
        }
      } catch (err: any) {
        if (err.response?.status === 401 && refreshToken) {
          try {
            // Attempt to refresh the access token
            const refreshResponse = await axios.post("/api/users/refresh", {
              refreshToken,
            });
            accessToken = refreshResponse.data.accessToken;

            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
            }
            // Retry fetching user data with new access token
            const response = await axios.get("/api/users/me", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setUserData(response.data);
            setError("");
          } catch (refreshErr) {
            // Refresh token failed; redirect to login
            setError("Session expired. Please log in again.");
            router.push("/login");
          }
        } else {
          setError("Failed to fetch user data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put("/api/users/me", userData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccess(response.data.message);
      setError("");
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
        <h2 className="text-2xl mb-4">Profile</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={userData.firstName}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={userData.lastName}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          name="avatar"
          placeholder="Avatar URL"
          value={userData.avatar}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={userData.phone}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-900 text-white p-2 rounded w-full"
        >
          Update
        </button>
      </div>
    </div>
  );
}
