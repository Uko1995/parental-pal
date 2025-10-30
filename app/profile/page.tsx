"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import ProfileDetails from "./ProfileDetails";
import ChildrenSection from "./ChildrenSection";
import BookingsSection from "./BookingsSection";
import PaymentsSection from "./PaymentsSection";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/20/solid";

type TabType = "profile" | "children" | "bookings" | "payments";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      toast.error("You must be logged in to view your profile");
      redirect("/auth/signin?callbackUrl=/profile");
    } else if (session && status === "authenticated") {
      toast.success(`Welcome back, ${session.user?.name || "User"}!`);
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-16 h-16 rounded-full flex-shrink-0">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user?.name || "User"}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-16 h-16 border-2 border-gray-800 p-2 rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                Welcome, {session.user?.name || "User"}
              </h1>
              <p className="text-sm sm:text-base text-base-content/70 break-all sm:break-normal">
                {session.user?.email}
              </p>
              <MembershipStatus />
            </div>
            <div className="self-start sm:self-auto">
              <AdminDashboardLink />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="tabs tabs-lifted overflow-x-auto">
            <button
              className={`tab whitespace-nowrap mx-1 p-1 ${
                activeTab === "profile" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="hidden sm:inline">Profile Details</span>
              <span className="sm:hidden">Profile</span>
            </button>
            <button
              className={`tab whitespace-nowrap mx-1 p-1 ${
                activeTab === "children" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("children")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="hidden sm:inline">My Children</span>
              <span className="sm:hidden">Children</span>
            </button>
            <button
              className={`tab whitespace-nowrap mx-1 p-1 ${
                activeTab === "bookings" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("bookings")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-6 0l-2 13a2 2 0 002 2h8a2 2 0 002-2L18 7M9 7h6m-3 6v4m0 0v-4m-3 2h6"
                />
              </svg>
              <span className="hidden sm:inline">My Bookings</span>
              <span className="sm:hidden">Bookings</span>
            </button>
            <button
              className={`tab whitespace-nowrap mx-1 p-1 ${
                activeTab === "payments" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("payments")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Pay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "profile" && <ProfileDetails user={session.user} />}
        {activeTab === "children" && <ChildrenSection />}
        {activeTab === "bookings" && <BookingsSection />}
        {activeTab === "payments" && <PaymentsSection />}
      </div>
    </div>
  );
}

// Component to display membership status
function MembershipStatus() {
  const [membershipInfo, setMembershipInfo] = useState<{
    membershipType: "basic" | "premium" | "none";
    role: "admin" | "parent" | "tutor";
    address: string;
    phone: string;
  }>({
    membershipType: "basic",
    role: "parent",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembershipInfo();
  }, []);

  const fetchMembershipInfo = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setMembershipInfo({
          membershipType: data.membershipType || "basic",
          role: data.role || "parent",
          address: data.address || "",
          phone: data.phone || "",
        });
      } else {
        toast.error("Failed to fetch membership information");
      }
    } catch (error) {
      console.error("Failed to fetch membership info:", error);
      toast.error("Failed to fetch membership information");
    } finally {
      setLoading(false);
    }
  };

  const getMembershipBadgeColor = (type: string) => {
    switch (type) {
      case "premium":
        return "badge-warning text-warning-content";
      case "basic":
        return "badge-info text-info-content";
      default:
        return "badge-ghost";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "badge-error text-error-content";
      case "tutor":
        return "badge-success text-success-content";
      default:
        return "badge-primary text-primary-content";
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-6 w-20"></div>
        <div className="skeleton h-6 w-16"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <div
        className={`badge ${getMembershipBadgeColor(
          membershipInfo.membershipType
        )}`}
      >
        {membershipInfo.membershipType.charAt(0).toUpperCase() +
          membershipInfo.membershipType.slice(1)}{" "}
        Member
      </div>
      <div className={`badge ${getRoleBadgeColor(membershipInfo.role)}`}>
        {membershipInfo.role.charAt(0).toUpperCase() +
          membershipInfo.role.slice(1)}
      </div>
      {membershipInfo.address && <div>{membershipInfo.address}</div>}
      {membershipInfo.phone && <div>{membershipInfo.phone}</div>}
    </div>
  );
}

// Component for admin dashboard link
function AdminDashboardLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (session?.user?.role) {
          setIsAdmin(session.user.role === "admin");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        toast.error("Failed to check admin status");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Link href="/dashboard" className="btn btn-primary btn-sm">
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Admin Dashboard
      </Link>
      <div className="badge badge-sm badge-outline">Administrator Access</div>
    </div>
  );
}
