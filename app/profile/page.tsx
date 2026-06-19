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
import OrdersSection from "./OrdersSection";
import Link from "next/link";
import {
  UserCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChartBarSquareIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  UserCircleIcon as UserCircleIconSolid,
  StarIcon,
} from "@heroicons/react/24/solid";

type TabType =
  | "profile"
  | "children"
  | "bookings"
  | "payments"
  | "orders"
  | "availability"
  | "reviews";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [userRole, setUserRole] = useState<"parent" | "tutor" | "admin">(
    "parent"
  );

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      toast.error("You must be logged in to view your profile");
      redirect("/auth/signin?callbackUrl=/profile");
    } else if (session && status === "authenticated") {
      toast.success(`Welcome back, ${session.user?.name || "User"}!`);
      // Fetch user role
      fetchUserRole();
    }
  }, [session, status]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role || "parent");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen surface-cream flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[#90AC19]/20 rounded-full"></div>
            <span className="loading loading-spinner loading-lg text-[#90AC19] relative z-10"></span>
          </div>
          <p className="mt-6 text-base-content/70 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen surface-cream">
      {/* Modern Header with Gradient */}
      <div className="relative bg-linear-to-r from-[#90AC19] via-[#90AC19] to-[#A25F97] shadow-xl overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image with Glow Effect */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-[#E8931A] to-white rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1 shadow-lg">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user?.name || "User"}
                    width={96}
                    height={96}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <UserCircleIconSolid className="w-full h-full text-[#A25F97]" />
                )}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                  {session.user?.name || "User"}
                </h1>
              </div>
              <p className="text-white/90 text-sm md:text-base mb-3 break-all md:break-normal">
                {session.user?.email}
              </p>
              <MembershipStatus />
            </div>

            {/* Admin Dashboard Link */}
            <div className="self-start md:self-auto">
              <AdminDashboardLink />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="bg-base-100 shadow-md sticky top-0 z-40 border-b-2 border-base-300">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {/* Profile Tab - Always visible */}
            <button
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                activeTab === "profile"
                  ? "border-[#90AC19] text-[#90AC19] bg-[#90AC19]/5"
                  : "border-transparent text-gray-600 hover:text-[#90AC19] hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <UserCircleIcon className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-sm md:text-base font-semibold">
                <span className="hidden sm:inline">Profile Details</span>
                <span className="sm:hidden">Profile</span>
              </span>
            </button>

            {/* Conditional Tabs based on Role */}
            {(userRole === "parent" || userRole === "admin") && (
              <>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "children"
                      ? "border-[#E8931A] text-[#E8931A] bg-[#E8931A]/5"
                      : "border-transparent text-gray-600 hover:text-[#E8931A] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("children")}
                >
                  <UserGroupIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">My Children</span>
                    <span className="sm:hidden">Children</span>
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "bookings"
                      ? "border-[#A25F97] text-[#A25F97] bg-[#A25F97]/5"
                      : "border-transparent text-gray-600 hover:text-[#A25F97] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("bookings")}
                >
                  <CalendarDaysIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">My Bookings</span>
                    <span className="sm:hidden">Bookings</span>
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "payments"
                      ? "border-[#90AC19] text-[#90AC19] bg-[#90AC19]/5"
                      : "border-transparent text-gray-600 hover:text-[#90AC19] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("payments")}
                >
                  <CreditCardIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">Payments</span>
                    <span className="sm:hidden">Pay</span>
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "orders"
                      ? "border-[#E8931A] text-[#E8931A] bg-[#E8931A]/5"
                      : "border-transparent text-gray-600 hover:text-[#E8931A] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  <ShieldCheckIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">My Orders</span>
                    <span className="sm:hidden">Orders</span>
                  </span>
                </button>
              </>
            )}

            {userRole === "tutor" && (
              <>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "availability"
                      ? "border-[#E8931A] text-[#E8931A] bg-[#E8931A]/5"
                      : "border-transparent text-gray-600 hover:text-[#E8931A] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("availability")}
                >
                  <CalendarDaysIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">Availability</span>
                    <span className="sm:hidden">Schedule</span>
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "bookings"
                      ? "border-[#A25F97] text-[#A25F97] bg-[#A25F97]/5"
                      : "border-transparent text-gray-600 hover:text-[#A25F97] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("bookings")}
                >
                  <UserGroupIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">My Sessions</span>
                    <span className="sm:hidden">Sessions</span>
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-4 ${
                    activeTab === "reviews"
                      ? "border-[#90AC19] text-[#90AC19] bg-[#90AC19]/5"
                      : "border-transparent text-gray-600 hover:text-[#90AC19] hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("reviews")}
                >
                  <StarIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base font-semibold">
                    <span className="hidden sm:inline">Reviews & Ratings</span>
                    <span className="sm:hidden">Reviews</span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area with Animation */}
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="animate-fadeIn">
          {activeTab === "profile" && (
            <ProfileDetails user={session.user} userRole={userRole} />
          )}

          {/* Parent and Admin specific tabs */}
          {(userRole === "parent" || userRole === "admin") && (
            <>
              {activeTab === "children" && <ChildrenSection />}
              {activeTab === "bookings" && <BookingsSection />}
              {activeTab === "payments" && <PaymentsSection />}
              {activeTab === "orders" && <OrdersSection />}
            </>
          )}

          {/* Tutor-specific tabs */}
          {userRole === "tutor" && (
            <>
              {activeTab === "availability" && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    My Availability
                  </h2>
                  <div className="text-gray-600">
                    <p className="mb-4">
                      Manage your teaching schedule and availability here.
                    </p>
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        Availability management coming soon! Contact admin to
                        update your schedule.
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "bookings" && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    My Sessions
                  </h2>
                  <div className="text-gray-600">
                    <p className="mb-4">
                      View and manage your tutoring sessions with students.
                    </p>
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        Session management coming soon! Your assigned sessions
                        will appear here.
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <StarIcon className="h-7 w-7 text-yellow-500" />
                    Reviews & Ratings
                  </h2>
                  <div className="text-gray-600">
                    <p className="mb-4">
                      See what parents and students are saying about your
                      tutoring.
                    </p>
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        Reviews and ratings system coming soon! Build your
                        reputation as a tutor.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Custom CSS for hide-scrollbar and fadeIn animation */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
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
        return "bg-gradient-to-r from-[#E8931A] to-[#E8931A]/80 text-white shadow-lg shadow-[#E8931A]/30";
      case "basic":
        return "bg-gradient-to-r from-[#90AC19] to-[#90AC19]/80 text-white shadow-lg shadow-[#90AC19]/30";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30";
      case "tutor":
        return "bg-gradient-to-r from-[#A25F97] to-[#A25F97]/80 text-white shadow-lg shadow-[#A25F97]/30";
      default:
        return "bg-gradient-to-r from-[#90AC19] to-[#90AC19]/80 text-white shadow-lg shadow-[#90AC19]/30";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="skeleton h-7 w-28 rounded-full"></div>
        <div className="skeleton h-7 w-20 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm ${getMembershipBadgeColor(
          membershipInfo.membershipType
        )}`}
      >
        {membershipInfo.membershipType === "premium" ? (
          <StarIcon className="w-4 h-4" />
        ) : (
          <ShieldCheckIcon className="w-4 h-4" />
        )}
        {membershipInfo.membershipType.charAt(0).toUpperCase() +
          membershipInfo.membershipType.slice(1)}{" "}
        Member
      </div>
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm ${getRoleBadgeColor(
          membershipInfo.role
        )}`}
      >
        {membershipInfo.role.charAt(0).toUpperCase() +
          membershipInfo.role.slice(1)}
      </div>
      {membershipInfo.phone && (
        <div className="flex items-center gap-1.5 text-white/90 text-sm">
          <PhoneIcon className="w-4 h-4" />
          <span className="hidden md:inline">{membershipInfo.phone}</span>
        </div>
      )}
      {membershipInfo.address && (
        <div className="flex items-center gap-1.5 text-white/90 text-sm">
          <MapPinIcon className="w-4 h-4" />
          <span className="hidden lg:inline truncate max-w-xs">
            {membershipInfo.address}
          </span>
        </div>
      )}
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
    <Link
      href="/dashboard"
      className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#90AC19] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white hover:border-[#E8931A]"
    >
      <div className="absolute inset-0 bg-linear-to-r from-[#E8931A]/10 to-[#A25F97]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <ChartBarSquareIcon className="h-5 w-5 relative z-10" />
      <span className="relative z-10 text-sm md:text-base">
        Admin Dashboard
      </span>
    </Link>
  );
}
