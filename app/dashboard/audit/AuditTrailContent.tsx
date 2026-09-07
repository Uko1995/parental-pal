"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type ViewMode = "all" | "security";

const PAGE_SIZE = 20;

/** Client-safe mirror of server AuditEventType — do not import audit-logger-mongodb here. */
const EVENT_TYPE_OPTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "ACCOUNT_LOCKED",
  "REGISTER",
  "PASSWORD_RESET_REQUEST",
  "PASSWORD_RESET_SUCCESS",
  "PASSWORD_CHANGE",
  "UNAUTHORIZED_ACCESS",
  "FORBIDDEN_ACCESS",
  "SERVICE_CREATED",
  "SERVICE_UPDATED",
  "SERVICE_DELETED",
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
  "BOOKING_CREATED",
  "BOOKING_UPDATED",
  "BOOKING_DELETED",
  "RATE_LIMIT_EXCEEDED",
  "SUSPICIOUS_ACTIVITY",
  "FILE_UPLOADED",
  "FILE_UPLOAD_REJECTED",
  "ADMIN_ACTION",
] as const;

interface AuditLogRow {
  timestamp: string | Date;
  eventType: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string | Date;
}

function formatTimestamp(value: string | Date | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatEventType(eventType: string): string {
  return eventType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AuditTrailContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [eventType, setEventType] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      if (viewMode === "security") {
        params.set("type", "security");
      } else {
        if (eventType) params.set("eventType", eventType);
        if (startDate) params.set("startDate", new Date(startDate).toISOString());
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          params.set("endDate", end.toISOString());
        }
        if (userSearch.trim()) {
          const q = userSearch.trim();
          if (/^[a-f\d]{24}$/i.test(q)) {
            params.set("userId", q);
          } else {
            params.set("userEmail", q);
          }
        }
      }

      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch audit logs.");
      }

      const nextLogs: AuditLogRow[] =
        viewMode === "security" ? data.events || [] : data.logs || [];
      const nextTotal =
        typeof data.total === "number" ? data.total : nextLogs.length;
      const nextTotalPages =
        typeof data.totalPages === "number"
          ? data.totalPages
          : Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));

      setLogs(nextLogs);
      setTotal(nextTotal);
      setTotalPages(nextTotalPages);
      if (page > nextTotalPages) {
        setPage(nextTotalPages);
      }
      setExpandedId(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to fetch audit logs.",
      );
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [viewMode, eventType, userSearch, startDate, endDate, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when filters / view change
  useEffect(() => {
    setPage(1);
  }, [viewMode, eventType, userSearch, startDate, endDate]);

  const summary = useMemo(() => {
    const failures = logs.filter((log) => !log.success).length;
    return {
      pageCount: logs.length,
      failures,
      successes: logs.length - failures,
    };
  }, [logs]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-base-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
        <p className="mt-1 text-sm text-gray-600">
          Major activity across authentication, bookings, services, uploads and
          admin actions. Logs are retained for 90 days.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="badge badge-ghost">{total} total</span>
          <span className="badge badge-ghost">
            {summary.pageCount} on this page
          </span>
          <span className="badge badge-success badge-outline">
            {summary.successes} success
          </span>
          <span className="badge badge-error badge-outline">
            {summary.failures} failed
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-base-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${viewMode === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewMode("all")}
          >
            All activity
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === "security" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewMode("security")}
          >
            Security events
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline ml-auto"
            onClick={fetchLogs}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {viewMode === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">Event type</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">All types</option>
                {EVENT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {formatEventType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">User email or ID</span>
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full pl-9"
                  placeholder="parent@email.com"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">From</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs">To</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-base-200 bg-white p-6 text-center">
          <span className="loading loading-spinner loading-md" />
          <p className="mt-2 text-sm text-gray-600">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-base-200 bg-white p-8 text-center text-sm text-gray-600">
          No audit events match these filters.
        </div>
      ) : (
        <div className="rounded-xl border border-base-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-200/60">
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>User</th>
                  <th>IP</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const rowId = `${log.timestamp}-${log.eventType}-${index}`;
                  const isExpanded = expandedId === rowId;
                  return (
                    <Fragment key={rowId}>
                      <tr className="hover">
                        <td className="whitespace-nowrap text-xs">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-sm">
                            {formatEventType(log.eventType)}
                          </span>
                        </td>
                        <td className="max-w-[180px]">
                          <div className="truncate text-sm">
                            {log.userEmail || "—"}
                          </div>
                          {log.userId && (
                            <div className="truncate text-[10px] text-gray-500">
                              {log.userId}
                            </div>
                          )}
                        </td>
                        <td className="text-xs whitespace-nowrap">
                          {log.ipAddress || "—"}
                        </td>
                        <td className="text-xs">
                          {log.resource || log.action
                            ? `${log.resource || ""}${log.resource && log.action ? " · " : ""}${log.action || ""}`
                            : "—"}
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              log.success ? "badge-success" : "badge-error"
                            }`}
                          >
                            {log.success ? "OK" : "Fail"}
                          </span>
                        </td>
                        <td className="max-w-[220px]">
                          <span className="line-clamp-2 text-xs text-gray-700">
                            {log.message || "—"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : rowId)
                            }
                            aria-label="Toggle metadata"
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-base-200/40">
                          <td colSpan={8} className="p-4">
                            <pre className="text-xs whitespace-pre-wrap break-all bg-white border border-base-200 rounded-lg p-3 max-h-64 overflow-auto">
                              {JSON.stringify(
                                {
                                  message: log.message,
                                  metadata: log.metadata || {},
                                  userAgent: log.userAgent,
                                  createdAt: log.createdAt,
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-base-200 bg-base-100">
            <p className="text-sm text-gray-600">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>
            <div className="join">
              <button
                type="button"
                className="btn btn-sm join-item"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button type="button" className="btn btn-sm join-item btn-ghost pointer-events-none">
                Page {page} of {totalPages}
              </button>
              <button
                type="button"
                className="btn btn-sm join-item"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
