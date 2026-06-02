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
import PhoneInput from "@/components/PhoneInput";

interface ProfileDetailsProps {
  user: User;
  userRole?: "parent" | "tutor" | "admin";
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  tutorProfile?: {
    specialty: string;
    experience: number;
    subjects: string[];
    qualifications: string[];
    bio: string;
    hourlyRate: number;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    availability: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    };
    documents: string[];
  };
}

export default function ProfileDetails({
  user,
  userRole = "parent",
}: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: user.name || "",
    email: user.email || "",
    phone: "",
    address: "",
    tutorProfile: undefined,
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
          tutorProfile: userData.tutorProfile || undefined,
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
            <PhoneInput
              value={profile.phone}
              onValueChange={(value) => handleInputChange("phone", value)}
              placeholder="8012345678"
              wrapperClassName="form-control"
              inputClassName="w-full px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-[#A25F97] focus:ring-2 focus:ring-[#A25F97]/20 transition-all duration-300 outline-none"
              selectClassName="w-32 rounded-r-none border-2 border-r-0 border-gray-200 bg-white px-2 py-3 text-sm text-gray-800 outline-none transition"
              showPreview={false}
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

      {/* Tutor-Specific Information */}
      {userRole === "tutor" && profile.tutorProfile && (
        <div className="mt-8 pt-8 border-t-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-linear-to-br from-[#E8931A] to-[#A25F97] rounded-xl">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            Tutor Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specialty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Specialty
              </label>
              <div className="p-4 bg-linear-to-br from-[#E8931A]/5 to-[#E8931A]/10 rounded-xl border border-[#E8931A]/20">
                <p className="text-gray-800 font-medium">
                  {profile.tutorProfile.specialty}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Years of Experience
              </label>
              <div className="p-4 bg-linear-to-br from-[#A25F97]/5 to-[#A25F97]/10 rounded-xl border border-[#A25F97]/20">
                <p className="text-gray-800 font-medium">
                  {profile.tutorProfile.experience}{" "}
                  {profile.tutorProfile.experience === 1 ? "year" : "years"}
                </p>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Hourly Rate
              </label>
              <div className="p-4 bg-linear-to-br from-[#90AC19]/5 to-[#90AC19]/10 rounded-xl border border-[#90AC19]/20">
                <p className="text-gray-800 font-medium">
                  ₦{profile.tutorProfile.hourlyRate?.toLocaleString()}/hour
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Rating & Reviews
              </label>
              <div className="p-4 bg-linear-to-br from-yellow-500/5 to-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-gray-800 font-medium flex items-center gap-2">
                  ⭐ {profile.tutorProfile.rating?.toFixed(1) || "0.0"}
                  <span className="text-sm text-gray-600">
                    ({profile.tutorProfile.totalReviews || 0} reviews)
                  </span>
                </p>
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Subjects I Teach
              </label>
              <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {profile.tutorProfile.subjects &&
                  profile.tutorProfile.subjects.length > 0 ? (
                    profile.tutorProfile.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-[#90AC19] text-white rounded-lg text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No subjects specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Qualifications & Certifications
              </label>
              <div className="p-4 bg-linear-to-br from-[#E8931A]/5 to-[#E8931A]/10 rounded-xl border border-[#E8931A]/20">
                <div className="space-y-2">
                  {profile.tutorProfile.qualifications &&
                  profile.tutorProfile.qualifications.length > 0 ? (
                    profile.tutorProfile.qualifications.map((qual, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-gray-800"
                      >
                        <span className="text-[#E8931A] font-bold mt-0.5">
                          •
                        </span>
                        <p className="font-medium">{qual}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No qualifications listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                About Me
              </label>
              <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 min-h-24">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {profile.tutorProfile.bio || "No bio provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
