"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

interface WishlistIconProps {
  isTransparent?: boolean;
}

export default function WishlistIcon({
  isTransparent = false,
}: WishlistIconProps) {
  const { data: session, status } = useSession();
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWishlistCount = useCallback(async () => {
    setLoading(true);
    try {
      // Check localStorage for guest users
      if (status !== "authenticated" || !session?.user) {
        const guestWishlist = localStorage.getItem("guest_wishlist");
        if (guestWishlist) {
          const wishlist = JSON.parse(guestWishlist);
          setItemCount(wishlist.items?.length || 0);
        } else {
          setItemCount(0);
        }
        setLoading(false);
        return;
      }

      // Fetch from API for authenticated users
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

  return (
    <Link
      href="/wishlist"
      className={`relative p-2 rounded-lg transition-colors ${
        isTransparent ? "hover:bg-white/10" : "hover:bg-base-200"
      }`}
      aria-label={`Wishlist${itemCount > 0 ? ` with ${itemCount} items` : ""}`}
    >
      {itemCount > 0 ? (
        <HeartSolidIcon
          className={`w-6 h-6 ${
            isTransparent ? "text-white" : "text-[#A25F97]"
          }`}
        />
      ) : (
        <HeartIcon
          className={`w-6 h-6 ${
            isTransparent ? "text-white" : "text-base-content"
          }`}
        />
      )}
      {!loading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#A25F97] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
