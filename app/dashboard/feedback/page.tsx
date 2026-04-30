"use client";

import { useCallback, useEffect, useState } from "react";
import FeedbackTable from "./FeedbackTable";
import ViewFeedbackModal from "./ViewFeedbackModal";
import type { FeedbackItem } from "./types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DashboardFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  const fetchFeedback = useCallback(async (targetPage: number) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/feedback?page=${targetPage}&limit=20`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to fetch feedback submissions.");
      }

      setItems(data.data || []);
      setPagination(data.pagination);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to fetch feedback submissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback(page);
  }, [fetchFeedback, page]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-base-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Parent Feedback</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review submissions from parents interested in our services.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Total submissions: {pagination.total}
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-base-200 bg-white p-6 text-center">
          <span className="loading loading-spinner loading-md"></span>
          <p className="mt-2 text-sm text-gray-600">Loading submissions...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <FeedbackTable items={items} onView={setSelectedItem} />

          <div className="flex items-center justify-end gap-2">
            <button
              className="btn btn-sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() =>
                setPage((prev) => Math.min(pagination.totalPages, prev + 1))
              }
              disabled={page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      <ViewFeedbackModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
