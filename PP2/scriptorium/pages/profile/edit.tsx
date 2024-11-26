import React from "react"
import { useState, useEffect } from "react";
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

export default function Profile() {
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
            const refreshResponse = await axios.post("/api/users/refresh", {
              refreshToken,
            });
            accessToken = refreshResponse.data.accessToken;

            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
            }
            const response = await axios.get("/api/users/me", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setUserData(response.data);
            setError("");
          } catch (refreshErr) {
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
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put("/api/users/me", userData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccess("Profile updated successfully!");
      setError("");
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred");
      }
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Edit Profile</h1>
              <p className="text-muted-foreground mt-1">Update your personal information</p>
            </div>
            <Link
              href="/profile"
              className="text-sm text-primary hover:text-primary/90 transition-colors duration-200"
            >
              ← Back to Profile
            </Link>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Name Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-muted-foreground mb-1">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatar"
                  name="avatar"
                  value={userData.avatar}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground transition-colors duration-200"
                  placeholder="Enter your avatar URL"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-4 py-2.5 border border-border text-muted-foreground rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}