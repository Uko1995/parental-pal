"use client";

import { useState } from "react";
import {
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage platform settings, preferences, and configurations
          </p>
        </div>
        <button
          className={`btn btn-primary ${isSaving ? "loading" : ""}`}
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
              <h2 className="card-title text-lg mb-4">Settings Categories</h2>
              <ul className="menu menu-vertical space-y-1">
                <li>
                  <a
                    className={`${
                      activeTab === "general" ? "active text-primary" : ""
                    }`}
                    onClick={() => setActiveTab("general")}
                  >
                    <UserIcon className="w-5 h-5" />
                    General
                  </a>
                </li>
                <li>
                  <a
                    className={`${
                      activeTab === "notifications" ? "active text-primary" : ""
                    }`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <BellIcon className="w-5 h-5" />
                    Notifications
                  </a>
                </li>
                <li>
                  <a
                    className={`${
                      activeTab === "security" ? "active text-primary" : ""
                    }`}
                    onClick={() => setActiveTab("security")}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    Security
                  </a>
                </li>
                <li>
                  <a
                    className={`${
                      activeTab === "payment" ? "active text-primary" : ""
                    }`}
                    onClick={() => setActiveTab("payment")}
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Payment & Billing
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <UserIcon className="w-6 h-6 text-primary" />
                  General Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className=" flex">
                    <span className="font-meduim">Email: {"  "} </span>
                    <div className="font-mono">admin@parentalpal.com</div>
                  </div>

                  <div className="flex flex-col ">
                    <span className=" font-medium">Contact Phone: {"  "} </span>
                    <div className="font-mono">+234 XXX XXX XXXX</div>
                  </div>
                </div>

                <div className="flex flex-col mt-4">
                  <span className=" font-medium">Business Address: {"  "}</span>
                  <div className="font-mono">
                    12 Fola Jinadu Crescent, Gbagada, Lagos State
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <BellIcon className="w-6 h-6 text-secondary" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        Email notifications for new bookings
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        Monthly revenue reports
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        Payment confirmation emails
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-warning" />
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Change Password
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="input input-bordered"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="input input-bordered"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        Enable two-factor authentication
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-warning"
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Login alerts via email</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-warning"
                        defaultChecked
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-success" />
                  Payment & Billing Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Default Currency
                      </span>
                    </label>
                    <select className="select select-bordered">
                      <option>Nigerian Naira (₦)</option>
                      <option>US Dollar ($)</option>
                      <option>British Pound (£)</option>
                      <option>Euro (€)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Auto-invoice Generation
                      </span>
                    </label>
                    <select className="select select-bordered">
                      <option>Immediate</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Manual</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        Send payment reminders automatically
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-success"
                        defaultChecked
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
