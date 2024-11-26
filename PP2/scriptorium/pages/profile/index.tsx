import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  phone: string;
  stats: {
    blogPosts: number;
    templates: number;
    comments: number;
  };
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
        // Fetch user data along with statistics
        const response = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("API Response:", response.data); // Debug log

        // Map API response to userData state
        setUserData({
          ...response.data,
          stats: response.data.statistics || {
            blogPosts: 0,
            templates: 0,
            comments: 0,
          },
        });
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

            // Map API response to userData state
            setUserData({
              ...retryResponse.data,
              stats: retryResponse.data.statistics || {
                blogPosts: 0,
                templates: 0,
                comments: 0,
              },
            });
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
  }, [router]);

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
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start md:gap-8">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              <img
                src={userData.avatar || "/icons/profile-pic.jpg"}
                alt="User Avatar"
                className="w-36 h-36 rounded-full border border-border shadow-md object-cover"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4 text-center md:text-left mt-6 md:mt-0">
              <h1 className="text-3xl font-bold text-card-foreground">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-muted-foreground text-lg">
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p className="text-muted-foreground text-lg">
                <span className="font-medium">Phone:</span>{" "}
                {userData.phone || "N/A"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-border" />

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-background rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-card-foreground">
                Blog Posts
              </h2>
              <p className="text-3xl font-bold text-primary">
                {userData.stats.blogPosts}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-card-foreground">
                Templates
              </h2>
              <p className="text-3xl font-bold text-primary">
                {userData.stats.templates}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-card-foreground">
                Comments
              </h2>
              <p className="text-3xl font-bold text-primary">
                {userData.stats.comments}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-border" />

          {/* Edit Profile Button */}
          <div className="text-center">
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
