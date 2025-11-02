"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { User } from "next-auth";
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-[#90AC19] to-[#A25F97] rounded-xl">
              <UserIcon className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            Profile Details
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#90AC19] to-[#90AC19]/90 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <PencilSquareIcon className="h-5 w-5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#90AC19] to-[#90AC19]/90 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                fetchUserProfile();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              <XMarkIcon className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <div className="p-1.5 bg-[#90AC19]/10 rounded-lg">
              <UserIcon className="h-4 w-4 text-[#90AC19]" />
            </div>
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#90AC19] focus:ring-2 focus:ring-[#90AC19]/20 transition-all duration-300 outline-none"
              placeholder="Enter your full name"
            />
          ) : (
            <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
              <p className="text-gray-800 font-medium">
                {profile.name || "Not provided"}
              </p>
            </div>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <div className="p-1.5 bg-[#E8931A]/10 rounded-lg">
              <EnvelopeIcon className="h-4 w-4 text-[#E8931A]" />
            </div>
            Email Address
          </label>
          <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 relative">
            <p className="text-gray-800 font-medium break-all">
              {profile.email}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheckIcon className="h-4 w-4 text-[#A25F97]" />
              <span className="text-xs text-gray-500">
                Email cannot be changed
              </span>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <div className="p-1.5 bg-[#A25F97]/10 rounded-lg">
              <PhoneIcon className="h-4 w-4 text-[#A25F97]" />
            </div>
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#A25F97] focus:ring-2 focus:ring-[#A25F97]/20 transition-all duration-300 outline-none"
              placeholder="Enter your phone number"
            />
          ) : (
            <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
              <p className="text-gray-800 font-medium">
                {profile.phone || "Not provided"}
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <div className="p-1.5 bg-[#E8931A]/10 rounded-lg">
              <MapPinIcon className="h-4 w-4 text-[#E8931A]" />
            </div>
            Address
          </label>
          {isEditing ? (
            <textarea
              value={profile.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8931A] focus:ring-2 focus:ring-[#E8931A]/20 transition-all duration-300 outline-none resize-none"
              placeholder="Enter your address"
              rows={4}
            />
          ) : (
            <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 min-h-24">
              <p className="text-gray-800 font-medium">
                {profile.address || "Not provided"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      {!isEditing && (
        <div className="mt-8 p-4 bg-linear-to-r from-[#90AC19]/10 to-[#A25F97]/10 rounded-xl border border-[#90AC19]/20">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-[#90AC19] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Your Information is Secure
              </p>
              <p className="text-xs text-gray-600">
                Your personal data is encrypted and stored securely. We will
                never share your information with third parties without your
                consent.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
