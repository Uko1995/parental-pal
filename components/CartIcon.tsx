"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

interface CartIconProps {
  isTransparent?: boolean;
}

export default function CartIcon({ isTransparent = false }: CartIconProps) {
  const { data: session, status } = useSession();
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCartCount = useCallback(async () => {
    setLoading(true);
    try {
      // Check localStorage for guest users
      if (status !== "authenticated" || !session?.user) {
        const guestCart = localStorage.getItem("guest_cart");
        if (guestCart) {
          const cart = JSON.parse(guestCart);
          const count =
            cart.items?.reduce(
              (sum: number, item: { quantity: number }) => sum + item.quantity,
              0
            ) || 0;
          setItemCount(count);
        } else {
          setItemCount(0);
        }
        setLoading(false);
        return;
      }

      // Fetch from API for authenticated users
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success && data.data?.items) {
        const count = data.data.items.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        setItemCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [fetchCartCount]);

  return (
    <Link
      href="/cart"
      className={`relative p-2 rounded-lg transition-colors ${
        isTransparent ? "hover:bg-white/10" : "hover:bg-base-200"
      }`}
      aria-label={`Shopping cart${
        itemCount > 0 ? ` with ${itemCount} items` : ""
      }`}
    >
      <ShoppingCartIcon
        className={`w-6 h-6 ${isTransparent ? "text-white" : "text-base-content"}`}
      />
      {!loading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#90AC19] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
