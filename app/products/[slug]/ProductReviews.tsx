"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  StarIcon,
  HandThumbUpIcon,
  UserCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  hasVoted?: boolean;
  adminResponse?: {
    message: string;
    respondedAt: string;
  };
  createdAt: string;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<
    "recent" | "helpful" | "highest" | "lowest"
  >("recent");

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/reviews?productId=${productId}&status=approved&sortBy=${sortBy}`
      );
      const data = await response.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy]);

  const checkCanReview = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const response = await fetch(
        `/api/reviews/can-review?productId=${productId}`
      );
      const data = await response.json();
      if (data.success) {
        setCanReview(data?.data?.canReview);
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  }, [productId, status]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    checkCanReview();
  }, [checkCanReview]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Review submitted! It will appear after approval.");
        setShowForm(false);
        setFormData({ rating: 5, title: "", comment: "" });
        setCanReview(false);
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string) => {
    if (status !== "authenticated") {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote" }),
      });

      const data = await response.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? { ...r, helpfulVotes: r.helpfulVotes + 1, hasVoted: true }
              : r
          )
        );
      }
    } catch {
      toast.error("Failed to vote");
    }
  };

  const StarRating = ({
    rating,
    interactive = false,
    onChange,
    size = "md",
  }: {
    rating: number;
    interactive?: boolean;
    onChange?: (r: number) => void;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClass =
      size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            {star <= rating ? (
              <StarIcon className={`${sizeClass} text-yellow-400`} />
            ) : (
              <StarOutlineIcon className={`${sizeClass} text-gray-300`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
          <div className="h-32 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="text-5xl font-bold text-gray-900">
              {summary?.averageRating.toFixed(1) || "0.0"}
            </div>
            <div>
              <StarRating
                rating={Math.round(summary?.averageRating || 0)}
                size="lg"
              />
              <p className="text-gray-500 mt-1">
                {summary?.totalReviews || 0} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary?.ratingDistribution?.[rating] || 0;
            const percentage =
              summary?.totalReviews && summary.totalReviews > 0
                ? (count / summary.totalReviews) * 100
                : 0;
            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-gray-600">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-gray-500 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button / Form */}
      {status === "authenticated" ? (
        canReview ? (
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="mb-8 bg-[#90AC19] hover:bg-[#7A9216] text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Write a Review
            </button>
          ) : (
            <form
              onSubmit={handleSubmitReview}
              className="mb-8 bg-gray-50 rounded-xl p-6 space-y-4"
            >
              <h3 className="font-semibold text-gray-900">Write Your Review</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <StarRating
                  rating={formData.rating}
                  interactive
                  onChange={(r) =>
                    setFormData((prev) => ({ ...prev, rating: r }))
                  }
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="What did you like or dislike? What did your child think?"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#90AC19] hover:bg-[#7A9216] text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )
        ) : (
          <p className="mb-8 text-gray-500 text-sm">
            {reviews?.some((r) => r.userId === session?.user?.id)
              ? "You have already reviewed this product"
              : "Purchase this product to leave a review"}
          </p>
        )
      ) : (
        <p className="mb-8 text-gray-500 text-sm">
          <Link href="/auth/signin" className="text-[#90AC19] hover:underline">
            Sign in
          </Link>{" "}
          to write a review
        </p>
      )}

      {/* Sort Options */}
      {reviews?.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="select select-bordered select-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {reviews?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <StarOutlineIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No reviews yet. Be the first to review this book!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews?.map((review) => (
            <div key={review._id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-10 h-10 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {review.userName}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckBadgeIcon className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mt-3">
                {review.title}
              </h4>
              <p className="text-gray-700 mt-2 leading-relaxed">
                {review.comment}
              </p>

              {/* Admin Response */}
              {review.adminResponse && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="font-medium text-blue-900 text-sm">
                    Response from ParentalPal
                  </p>
                  <p className="text-blue-800 text-sm mt-1">
                    {review.adminResponse.message}
                  </p>
                </div>
              )}

              {/* Helpful Vote */}
              <div className="mt-4">
                <button
                  onClick={() => handleVote(review._id)}
                  disabled={review.hasVoted}
                  className={`flex items-center gap-1 text-sm ${
                    review.hasVoted
                      ? "text-gray-400"
                      : "text-gray-600 hover:text-[#90AC19]"
                  }`}
                >
                  <HandThumbUpIcon className="w-4 h-4" />
                  Helpful ({review.helpfulVotes})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
