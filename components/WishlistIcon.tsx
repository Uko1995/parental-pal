"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

export default function WishlistIcon() {
  const { data: session, status } = useSession();
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWishlistCount = useCallback(async () => {
    if (status !== "authenticated" || !session?.user) {
      setItemCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success && data.data?.items) {
        setItemCount(data.data.items.length);
      }
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status]);

  useEffect(() => {
    fetchWishlistCount();
  }, [fetchWishlistCount]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, [fetchWishlistCount]);

  // Don't show wishlist icon if not logged in
  if (status !== "authenticated") {
    return null;
  }

  return (
    <Link
      href="/wishlist"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={`Wishlist${itemCount > 0 ? ` with ${itemCount} items` : ""}`}
    >
      {itemCount > 0 ? (
        <HeartSolidIcon className="w-6 h-6 text-[#A25F97]" />
      ) : (
        <HeartIcon className="w-6 h-6 text-gray-700" />
      )}
      {!loading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#A25F97] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
