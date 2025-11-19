"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  BanknotesIcon,
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import ParentCharts from "./ParentCharts";
import ParentsTable from "./ParentsTable";
import AddParentModal from "./AddParentModal";

interface SerializedParentWithStats {
  _id: string | undefined;
  userData: {
    expiresAt: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  phone?: string;
  address?: string;
  role: "admin" | "parent" | "tutor";
  isActive: boolean;
  membershipType: "basic" | "premium" | "none";
  children?: Array<{
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }>;
  stats: {
    totalBookings: number;
    activeBookings: number;
    totalSpent: number;
    childrenCount: number;
    lastBookingDate: number | null;
  };
}

interface ParentAnalytics {
  totalParents: number;
  activeParents: number;
  totalChildren: number;
  averageChildrenPerParent: string | number;
  actualRevenue: number;
  pendingRevenue: number;
  totalRevenue: number;
  membershipDistribution: Array<{
    type: string;
    count: number;
  }>;
}

export default function ParentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [parentsData, setParentsData] = useState<SerializedParentWithStats[]>(
    []
  );
  const [analytics, setAnalytics] = useState<ParentAnalytics>({
    totalParents: 0,
    activeParents: 0,
    totalChildren: 0,
    averageChildrenPerParent: 0,
    actualRevenue: 0,
    pendingRevenue: 0,
    totalRevenue: 0,
    membershipDistribution: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [parentsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/parents-data"),
        fetch("/api/parents-data?type=analytics"),
      ]);

      if (parentsResponse.ok && analyticsResponse.ok) {
        const parentsData = await parentsResponse.json();
        const analyticsData = await analyticsResponse.json();

        // Extract parents array from response (API returns { parents: [...] })
        setParentsData(
          Array.isArray(parentsData) ? parentsData : parentsData.parents || []
        );
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching parents data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleParentAdded = () => {
    fetchData(); // Refresh the data
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="skeleton h-8 w-48 mb-2"></div>
            <div className="skeleton h-4 w-64"></div>
          </div>
          <div className="skeleton h-10 w-24"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat bg-base-100 shadow-lg rounded-2xl">
              <div className="stat-figure">
                <div className="skeleton w-8 h-8 rounded"></div>
              </div>
              <div className="skeleton h-4 w-20 mb-2"></div>
              <div className="skeleton h-8 w-16 mb-2"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="skeleton h-6 w-32 mb-4"></div>
            <div className="skeleton h-64 w-full"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-12 w-12 rounded"></div>
                    <div>
                      <div className="skeleton h-4 w-32 mb-2"></div>
                      <div className="skeleton h-3 w-20"></div>
                    </div>
                  </div>
                  <div className="skeleton h-6 w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Parents</h1>
          <p className="text-gray-600 mt-1">
            Manage parent accounts, children, and service preferences
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Parent Account
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Total Parents
                </h3>
                <p className="text-3xl font-bold text-[#90AC19]">
                  {analytics.totalParents}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.activeParents} active
                </p>
              </div>
              <div className="p-3 ">
                <UsersIcon className="w-8 h-8 text-[#90AC19]" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Total Children
                </h3>
                <p className="text-3xl font-bold text-[#E8931A]">
                  {analytics.totalChildren}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {analytics.averageChildrenPerParent} per parent
                </p>
              </div>
              <div className="p-3">
                <UserGroupIcon className="w-8 h-8 text-[#E8931A]" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Actual Payments
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.actualRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Successfully paid bookings
                </p>
              </div>
              <div className="p-3 ">
                <BanknotesIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  Pending Payments
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analytics.pendingRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Awaiting payment confirmation
                </p>
              </div>
              <div className="p-3 ">
                <BanknotesIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <ParentCharts
        analytics={
          analytics as unknown as {
            registrationTrends: Array<{ month: string; registrations: number }>;
            monthlyRevenue: Array<{ month: string; revenue: number }>;
          }
        }
      />

      {/* Parents Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Parents</h2>
          <div className="text-sm text-gray-600">
            Manage parent accounts and view detailed information
          </div>
        </div>

        <ParentsTable initialParents={parentsData} />
      </div>

      {/* Add Parent Modal */}
      <AddParentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onParentAdded={handleParentAdded}
      />
    </div>
  );
}
