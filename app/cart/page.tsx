"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PhoneInput from "@/components/PhoneInput";

export interface CartItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  orderType: "softcopy" | "paperback";
  unitPrice: number;
  quantity: number;
  addedAt: string;
}

interface Cart {
  _id: string;
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
  couponType?: "percentage" | "fixed";
  promoApplied?: boolean;
  promoMessage?: string;
  showCouponCode?: boolean;
  subtotal: number;
  discount: number;
  total: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    deliveryNotes: "",
  });

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success) {
        // Check if user is guest
        if (data.isGuest) {
          setIsGuest(true);
          // Load cart from localStorage for guest users
          const guestCart = localStorage.getItem("guest_cart");
          if (guestCart) {
            const parsedCart = JSON.parse(guestCart);
            setCart(parsedCart);
          } else {
            setCart(null);
          }
        } else {
          setIsGuest(false);
          setCart(data.data);
        }
      } else if (response.status === 401) {
        router.push("/auth/signin?callbackUrl=/cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (
    productId: string,
    orderType: "softcopy" | "paperback",
    newQuantity: number
  ) => {
    setUpdating(true);
    try {
      if (isGuest) {
        // Update guest cart in localStorage
        const guestCart = localStorage.getItem("guest_cart");
        if (guestCart) {
          const parsedCart = JSON.parse(guestCart);
          const itemIndex = parsedCart.items.findIndex(
            (item: CartItem) =>
              item.productId === productId && item.orderType === orderType
          );
          if (itemIndex !== -1) {
            parsedCart.items[itemIndex].quantity = newQuantity;
            // Recalculate totals
            const subtotal = parsedCart.items.reduce(
              (sum: number, item: CartItem) =>
                sum + item.unitPrice * item.quantity,
              0
            );
            parsedCart.subtotal = subtotal;
            parsedCart.total = subtotal - (parsedCart.discount || 0);
            localStorage.setItem("guest_cart", JSON.stringify(parsedCart));
            setCart(parsedCart);
            window.dispatchEvent(new Event("cart-updated"));
          }
        }
      } else {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, orderType, quantity: newQuantity }),
        });

        const data = await response.json();
        if (data.success) {
          setCart(data.data);
        } else {
          toast.error(data.error || "Failed to update quantity");
        }
      }
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (
    productId: string,
    orderType: "softcopy" | "paperback"
  ) => {
    setUpdating(true);
    try {
      if (isGuest) {
        // Remove from guest cart in localStorage
        const guestCart = localStorage.getItem("guest_cart");
        if (guestCart) {
          const parsedCart = JSON.parse(guestCart);
          parsedCart.items = parsedCart.items.filter(
            (item: CartItem) =>
              !(item.productId === productId && item.orderType === orderType)
          );
          // Recalculate totals
          const subtotal = parsedCart.items.reduce(
            (sum: number, item: CartItem) =>
              sum + item.unitPrice * item.quantity,
            0
          );
          parsedCart.subtotal = subtotal;
          parsedCart.total = subtotal - (parsedCart.discount || 0);
          localStorage.setItem("guest_cart", JSON.stringify(parsedCart));
          setCart(parsedCart.items.length > 0 ? parsedCart : null);
          window.dispatchEvent(new Event("cart-updated"));
          toast.success("Item removed from cart");
        }
      } else {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, orderType }),
        });

        const data = await response.json();
        if (data.success) {
          setCart(data.data);
          toast.success("Item removed from cart");
        } else {
          toast.error(data.error || "Failed to remove item");
        }
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplyingCoupon(true);
    try {
      const response = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchCart(); // Refresh cart with updated totals
        setCouponCode("");
      } else {
        toast.error(data.error || "Failed to apply coupon");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await fetch("/api/cart/coupon", {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Coupon removed");
        fetchCart();
      }
    } catch {
      toast.error("Failed to remove coupon");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingOut(true);

    try {
      // Validate form
      if (
        !formData.customerName ||
        !formData.customerEmail ||
        !formData.customerPhone
      ) {
        toast.error("Please fill in all required fields");
        setCheckingOut(false);
        return;
      }

      // Check if delivery address needed
      const hasPaperback = cart?.items.some(
        (item) => item.orderType === "paperback"
      );
      if (
        hasPaperback &&
        (!formData.address || !formData.city || !formData.state)
      ) {
        toast.error("Please provide delivery address for paperback orders");
        setCheckingOut(false);
        return;
      }

      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Paystack
        window.location.href = data.data.authorization_url;
      } else {
        toast.error(data.error || "Failed to process checkout");
        setCheckingOut(false);
      }
    } catch {
      toast.error("Failed to process checkout");
      setCheckingOut(false);
    }
  };

  const hasPaperback = cart?.items.some(
    (item) => item.orderType === "paperback"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBagIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added any books yet.
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
    <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <div
                key={`${item.productId}-${item.orderType}-${index}`}
                className="bg-white rounded-sm shadow-sm p-6 flex gap-4"
              >
                {/* Product Image */}
                <div className="relative w-20 h-28 shrink-0">
                  {item?.productThumbnail && (
                    <Image
                      src={item.productThumbnail}
                      alt={item.productTitle}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-semibold text-gray-900 hover:text-[#90AC19] line-clamp-2"
                  >
                    {item.productTitle}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">by {item.author}</p>
                  <div className="mt-2">
                    <span
                      className={`badge badge-sm ${
                        item.orderType === "softcopy"
                          ? "badge-success"
                          : "badge-info"
                      }`}
                    >
                      {item.orderType === "softcopy" ? "PDF" : "Paperback"}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-300 bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.orderType,
                            item.quantity - 1
                          )
                        }
                        disabled={updating || item.quantity <= 1}
                        className="p-2 border-r border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium text-gray-900 min-w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.orderType,
                            item.quantity + 1
                          )
                        }
                        disabled={updating}
                        className="p-2 border-l border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.orderType)}
                      disabled={updating}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-lg font-bold text-[#90AC19]">
                    ₦{(item.unitPrice * item.quantity)?.toLocaleString()}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">
                      ₦{item.unitPrice?.toLocaleString()} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Coupon Code */}
              {!cart.promoApplied && !cart.couponCode ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter code"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                      />
                    </div>
                    <button
                      onClick={applyCoupon}
                      disabled={applyingCoupon}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium text-sm">
                      <TagIcon className="w-4 h-4 inline mr-1" />
                      {cart.promoMessage ||
                        cart.couponCode ||
                        "Promo applied"}
                    </p>
                    {!cart.promoMessage && cart.couponCode && (
                      <p className="text-green-600 text-xs">
                        {cart.couponType === "percentage"
                          ? `${cart.couponDiscount}% off`
                          : `₦${cart.couponDiscount?.toLocaleString()} off`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{cart.subtotal?.toLocaleString()}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₦{cart.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                  <span>Total</span>
                  <span>₦{cart.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-6 bg-[#90AC19] hover:bg-[#7A9216] text-white font-bold py-4 rounded-lg transition-colors"
                >
                  Proceed to Payment
                </button>
              ) : (
                <form onSubmit={handleCheckout} className="mt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 border-t pt-4">
                    Checkout Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerEmail: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                    />
                  </div>

                  <PhoneInput
                    label="Phone *"
                    required
                    value={formData.customerPhone}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerPhone: value,
                      }))
                    }
                    showPreview={false}
                    wrapperClassName="form-control"
                    inputClassName="w-full px-4 py-2 border rounded-r-lg focus:ring-2 focus:ring-[#90AC19]"
                    selectClassName="select select-bordered rounded-r-none border-r-0 px-2 py-2 bg-white focus:outline-none"
                  />

                  {hasPaperback && (
                    <>
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          📦 Delivery Address (for paperback orders)
                        </p>
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Street Address *"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="City *"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="State *"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#90AC19]"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={checkingOut}
                    className="w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkingOut ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      `Pay ₦${cart.total.toLocaleString()}`
                    )}
                  </button>
                </form>
              )}

              <Link
                href="/products"
                className="block text-center text-[#90AC19] hover:text-[#7A9216] mt-4 text-sm font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
