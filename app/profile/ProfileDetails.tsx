"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { User } from "next-auth";

interface ProfileDetailsProps {
  user: User;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: user.name || "",
    email: user.email || "",
    phone: "",
    address: "",
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const userData = await response.json();
        setProfile({
          name: userData.name || user.name || "",
          email: userData.email || user.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });
      } else {
        toast.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile information");
    }
  }, [user.name, user.email]);

  useEffect(() => {
    // Load user profile data from API
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base-content">
          Profile Details
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary btn-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                fetchUserProfile(); // Reset to original data
              }}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Personal Information
          </h3>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="p-3 bg-base-100 rounded-lg border">
                  {profile.name || "Not provided"}
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <div className="p-3 bg-base-100 rounded-lg border text-base-content/70">
                {profile.email}
                <div className="text-xs text-base-content/50 mt-1">
                  Email cannot be changed
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Phone Number</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="p-3 bg-base-100 rounded-lg border">
                  {profile.phone || ""}
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Address</span>
              </label>
              {isEditing ? (
                <textarea
                  value={profile.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter your address"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-base-100 rounded-lg border min-h-[4rem]">
                  {profile.address || ""}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
