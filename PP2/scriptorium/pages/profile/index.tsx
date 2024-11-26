import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  phone: string;
}

export default function ViewProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserData(response.data);
        setError("");
      } catch (err: any) {
        if (err.response?.status === 401 && refreshToken) {
          try {
            const refreshResponse = await axios.post("/api/users/refresh", {
              refreshToken,
            });
            const newAccessToken = refreshResponse.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);

            const retryResponse = await axios.get("/api/users/me", {
              headers: { Authorization: `Bearer ${newAccessToken}` },
            });
            setUserData(retryResponse.data);
            setError("");
          } catch (refreshErr) {
            setError("Session expired. Please log in again.");
            router.push("/login");
          }
        } else {
          setError("Failed to fetch user data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No user data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                My Profile
              </h1>
              <p className="text-muted-foreground mt-1">
                View your personal information
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {/* Avatar */}
            <img
              src={userData.avatar || "icons/profile-pic.jpg"}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border border-border shadow-md"
            />

            {/* User Info */}
            <div className="w-full">
              <p className="text-lg font-medium text-muted-foreground">
                Full Name:
              </p>
              <p className="text-foreground text-xl font-semibold">
                {userData.firstName} {userData.lastName}
              </p>
            </div>
            <div className="w-full">
              <p className="text-lg font-medium text-muted-foreground">
                Email:
              </p>
              <p className="text-foreground text-xl font-semibold">
                {userData.email}
              </p>
            </div>
            <div className="w-full">
              <p className="text-lg font-medium text-muted-foreground">
                Phone:
              </p>
              <p className="text-foreground text-xl font-semibold">
                {userData.phone || "N/A"}
              </p>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => router.push("/profile/edit")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
