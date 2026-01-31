"use client";

import { useState, useEffect } from "react";
import {
  SparklesIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface Enrollment {
  _id: string;
  type: "enrollment";
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  children: { name: string; age: string }[];
  programId: string;
  programName: string;
  startDate: string;
  amount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
}

interface SaveSlot {
  _id: string;
  type: "save_slot";
  parentName: string;
  parentEmail: string;
  childName: string;
  childAge: string;
  createdAt: string;
}

export default function DashboardWeekendEnrichmentPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"enrollments" | "save-slots">("enrollments");

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch("/api/weekend-enrichment/enroll");
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.enrollments || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    const fetchSaveSlots = async () => {
      try {
        const res = await fetch("/api/weekend-enrichment/save-slots");
        if (res.ok) {
          const data = await res.json();
          setSaveSlots(data.saveSlots || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    Promise.all([fetchEnrollments(), fetchSaveSlots()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const paidCount = enrollments.filter((e) => e.paymentStatus === "paid").length;
  const pendingCount = enrollments.filter((e) => e.paymentStatus === "pending").length;
  const totalRevenue = enrollments
    .filter((e) => e.paymentStatus === "paid")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
        <div className="skeleton h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Weekend Enrichment</h1>
        <p className="text-gray-600 mt-1">
          Enrollments and save-slot requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrollments (paid)</p>
                <p className="text-2xl font-bold text-[#90AC19]">{paidCount}</p>
              </div>
              <BanknotesIcon className="w-10 h-10 text-[#90AC19]/60" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending payment</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <CalendarDaysIcon className="w-10 h-10 text-amber-500/60" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue (paid)</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{totalRevenue.toLocaleString()}
                </p>
              </div>
              <SparklesIcon className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg w-fit">
        <button
          type="button"
          className={`tab ${activeTab === "enrollments" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("enrollments")}
        >
          Enrollments ({enrollments.length})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "save-slots" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("save-slots")}
        >
          Save Slots ({saveSlots.length})
        </button>
      </div>

      {/* Enrollments table */}
      {activeTab === "enrollments" && (
        <div className="card bg-base-100 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Email / Phone</th>
                  <th>Program</th>
                  <th>Start date</th>
                  <th>Children</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-8">
                      No enrollments yet
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e) => (
                    <tr key={e._id}>
                      <td className="font-medium">{e.parentName}</td>
                      <td>
                        <div className="text-sm">{e.parentEmail}</div>
                        <div className="text-xs text-gray-500">{e.parentPhone}</div>
                      </td>
                      <td className="text-sm">{e.programName}</td>
                      <td>{e.startDate}</td>
                      <td>
                        {e.children?.length || 0} —{" "}
                        {e.children
                          ?.map((c) => `${c.name} (${c.age})`)
                          .join(", ") || "—"}
                      </td>
                      <td className="font-semibold">
                        ₦{(e.amount || 0).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            e.paymentStatus === "paid"
                              ? "badge-success"
                              : e.paymentStatus === "pending"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {e.paymentStatus}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {e.createdAt
                          ? new Date(e.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save slots table */}
      {activeTab === "save-slots" && (
        <div className="card bg-base-100 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Email</th>
                  <th>Child name</th>
                  <th>Child age</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {saveSlots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-8">
                      No save-slot requests yet
                    </td>
                  </tr>
                ) : (
                  saveSlots.map((s) => (
                    <tr key={s._id}>
                      <td className="font-medium">{s.parentName}</td>
                      <td>{s.parentEmail}</td>
                      <td>{s.childName}</td>
                      <td>{s.childAge}</td>
                      <td className="text-sm text-gray-500">
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
