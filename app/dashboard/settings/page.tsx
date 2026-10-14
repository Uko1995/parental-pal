"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  DEFAULT_BANK_TRANSFER,
  type BankTransferDetails,
} from "@/models/PlatformSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [bankTransfer, setBankTransfer] = useState<BankTransferDetails>({
    ...DEFAULT_BANK_TRANSFER,
  });

  const loadBankTransfer = useCallback(async () => {
    setIsLoadingBank(true);
    try {
      const res = await fetch("/api/settings/bank-transfer");
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as { bankTransfer?: BankTransferDetails };
      if (data.bankTransfer) {
        setBankTransfer({ ...DEFAULT_BANK_TRANSFER, ...data.bankTransfer });
      }
    } catch {
      toast.error("Could not load bank transfer details");
    } finally {
      setIsLoadingBank(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "payment") void loadBankTransfer();
  }, [activeTab, loadBankTransfer]);

  const updateBankField = (field: keyof BankTransferDetails, value: string) =>
    setBankTransfer((prev) => ({ ...prev, [field]: value }));

  const handleSaveChanges = async () => {
    if (activeTab !== "payment") {
      toast.success("Settings saved successfully!");
      return;
    }

    const accountName = bankTransfer.accountName.trim();
    const accountNumber = bankTransfer.accountNumber.trim();
    const bankName = bankTransfer.bankName.trim();
    if (!accountName || !accountNumber || !bankName) {
      toast.error("Account name, bank, and account number are required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/bank-transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankTransfer: {
            accountName,
            accountNumber,
            bankName,
            narrationHint: bankTransfer.narrationHint.trim(),
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        bankTransfer?: BankTransferDetails;
        error?: string;
      } | null;
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      if (data?.bankTransfer) {
        setBankTransfer({ ...DEFAULT_BANK_TRANSFER, ...data.bankTransfer });
      }
      toast.success("Bank transfer details saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
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
          disabled={isSaving || (activeTab === "payment" && isLoadingBank)}
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

                <div className="divider" />

                <h3 className="font-semibold text-lg">Bank transfer details</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Shown on invoices and payment reminder emails as an
                  alternative to paying online from the parent profile.
                </p>

                {isLoadingBank ? (
                  <div className="flex items-center gap-2 text-sm text-base-content/70 py-4">
                    <span className="loading loading-spinner loading-sm" />
                    Loading bank details…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text font-medium">
                          Account name
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={bankTransfer.accountName}
                        onChange={(e) =>
                          updateBankField("accountName", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Bank name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={bankTransfer.bankName}
                        onChange={(e) =>
                          updateBankField("bankName", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Account number
                        </span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="input input-bordered font-mono"
                        value={bankTransfer.accountNumber}
                        onChange={(e) =>
                          updateBankField("accountNumber", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text font-medium">
                          Narration hint
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={bankTransfer.narrationHint}
                        onChange={(e) =>
                          updateBankField("narrationHint", e.target.value)
                        }
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/70">
                          Invoices and reminders insert the specific booking ID
                          or invoice number when one is available.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
