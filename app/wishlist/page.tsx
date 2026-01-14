"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { CartItem } from "../cart/page";

interface WishlistItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  softcopyPrice?: number;
  paperbackPrice?: number;
  addedAt: string;
}

interface Wishlist {
  _id: string;
  items: WishlistItem[];
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        // Check if user is guest
        if (data.isGuest) {
          setIsGuest(true);
          // Load wishlist from localStorage for guest users
          const guestWishlist = localStorage.getItem("guest_wishlist");
          if (guestWishlist) {
            const parsedWishlist = JSON.parse(guestWishlist);
            setWishlist(parsedWishlist);
          } else {
            setWishlist(null);
          }
        } else {
          setIsGuest(false);
          setWishlist(data.data);
        }
      } else if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (productId: string) => {
    setActionLoading(productId);
    try {
      if (isGuest) {
        // Remove from guest wishlist in localStorage
        const guestWishlist = localStorage.getItem("guest_wishlist");
        if (guestWishlist) {
          const parsedWishlist = JSON.parse(guestWishlist);
          parsedWishlist.items = parsedWishlist.items.filter(
            (item: WishlistItem) => item.productId !== productId
          );
          localStorage.setItem(
            "guest_wishlist",
            JSON.stringify(parsedWishlist)
          );
          setWishlist(parsedWishlist.items.length > 0 ? parsedWishlist : null);
          window.dispatchEvent(new Event("wishlist-updated"));
          toast.success("Removed from wishlist");
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();
        if (data.success) {
          setWishlist(data.data);
          toast.success("Removed from wishlist");
        } else {
          toast.error(data.error || "Failed to remove item");
        }
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setActionLoading(null);
    }
  };

  const moveToCart = async (
    productId: string,
    orderType: "softcopy" | "paperback"
  ) => {
    setActionLoading(`${productId}-${orderType}`);
    try {
      if (isGuest) {
        // Move from guest wishlist to guest cart in localStorage
        const guestWishlist = localStorage.getItem("guest_wishlist");
        const guestCart = localStorage.getItem("guest_cart");

        if (guestWishlist) {
          const parsedWishlist = JSON.parse(guestWishlist);
          const item = parsedWishlist.items.find(
            (item: WishlistItem) => item.productId === productId
          );

          if (item) {
            // Get the price based on order type
            const unitPrice =
              orderType === "softcopy"
                ? item.softcopyPrice
                : item.paperbackPrice;

            if (!unitPrice) {
              toast.error("Price not available for this format");
              setActionLoading(null);
              return;
            }

            // Add to cart
            const cart = guestCart
              ? JSON.parse(guestCart)
              : { items: [], subtotal: 0, discount: 0, total: 0 };

            // Check if item already exists in cart
            const existingItemIndex = cart.items.findIndex(
              (cartItem: CartItem) =>
                cartItem.productId === productId &&
                cartItem.orderType === orderType
            );

            if (existingItemIndex !== -1) {
              cart.items[existingItemIndex].quantity += 1;
            } else {
              cart.items.push({
                productId: item.productId,
                productTitle: item.productTitle,
                productSlug: item.productSlug,
                productThumbnail: item.productThumbnail,
                author: item.author,
                orderType,
                unitPrice,
                quantity: 1,
                addedAt: new Date().toISOString(),
              });
            }

            // Recalculate cart totals
            cart.subtotal = cart.items.reduce(
              (sum: number, item: CartItem) =>
                sum + item.unitPrice * item.quantity,
              0
            );
            cart.total = cart.subtotal - (cart.discount || 0);

            localStorage.setItem("guest_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("cart-updated"));

            // Remove from wishlist
            parsedWishlist.items = parsedWishlist.items.filter(
              (item: WishlistItem) => item.productId !== productId
            );
            localStorage.setItem(
              "guest_wishlist",
              JSON.stringify(parsedWishlist)
            );
            setWishlist(
              parsedWishlist.items.length > 0 ? parsedWishlist : null
            );
            window.dispatchEvent(new Event("wishlist-updated"));

            toast.success("Added to cart!");
          }
        }
      } else {
        const response = await fetch("/api/wishlist/move-to-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, orderType }),
        });

        const data = await response.json();
        if (data.success) {
          setWishlist(data.data.wishlist);
          toast.success("Added to cart!");
          router.refresh();
        } else {
          toast.error(data.error || "Failed to add to cart");
        }
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <HeartSolidIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Wishlist is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Save your favorite books here to buy them later!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-[#90AC19] hover:bg-[#7A9216] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HeartIcon className="w-8 h-8 text-[#A25F97]" />
            My Wishlist
            <span className="text-lg font-normal text-gray-500">
              ({wishlist.items.length} items)
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <Link href={`/products/${item.productSlug}`}>
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={item.productThumbnail}
                    alt={item.productTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(item.productId);
                    }}
                    disabled={actionLoading === item.productId}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    {actionLoading === item.productId ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    )}
                  </button>
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-4">
                <Link href={`/products/${item.productSlug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-[#90AC19] line-clamp-2 mb-1">
                    {item.productTitle}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-3">by {item.author}</p>

                {/* Prices */}
                <div className="flex items-center gap-4 mb-4">
                  {item.softcopyPrice && (
                    <div className="text-sm">
                      <span className="text-gray-500">PDF: </span>
                      <span className="font-bold text-[#90AC19]">
                        ₦{item.softcopyPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {item.paperbackPrice && (
                    <div className="text-sm">
                      <span className="text-gray-500">Paperback: </span>
                      <span className="font-bold text-[#E8931A]">
                        ₦{item.paperbackPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Buttons */}
                <div className="flex gap-2">
                  {item.softcopyPrice && (
                    <button
                      onClick={() => moveToCart(item.productId, "softcopy")}
                      disabled={actionLoading === `${item.productId}-softcopy`}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#90AC19] hover:bg-[#7A9216] text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `${item.productId}-softcopy` ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <ShoppingCartIcon className="w-4 h-4" />
                          PDF
                        </>
                      )}
                    </button>
                  )}
                  {item.paperbackPrice && (
                    <button
                      onClick={() => moveToCart(item.productId, "paperback")}
                      disabled={actionLoading === `${item.productId}-paperback`}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#E8931A] hover:bg-[#d0820f] text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `${item.productId}-paperback` ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <ShoppingCartIcon className="w-4 h-4" />
                          Book
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="text-[#90AC19] hover:text-[#7A9216] font-medium"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
