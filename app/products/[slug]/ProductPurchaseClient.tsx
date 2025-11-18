"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ClientProduct } from "@/types/product";

interface ProductPurchaseClientProps {
  product: ClientProduct;
}

export default function ProductPurchaseClient({
  product,
}: ProductPurchaseClientProps) {
  const [selectedType, setSelectedType] = useState<"softcopy" | "paperback">(
    product.pricing.softcopy.available ? "softcopy" : "paperback"
  );
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const currentPrice =
    selectedType === "softcopy"
      ? product.pricing.softcopy.price
      : product.pricing.paperback.price;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (
        !formData.customerName ||
        !formData.customerEmail ||
        !formData.customerPhone
      ) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate delivery address for paperback
      if (selectedType === "paperback") {
        if (!formData.address || !formData.city || !formData.state) {
          toast.error("Please provide delivery address");
          setLoading(false);
          return;
        }
      }

      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          orderType: selectedType,
          quantity: 1,
          ...formData,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Initialize payment
      const paymentResponse = await fetch("/api/orders/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.data._id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.error || "Failed to initialize payment");
      }

      // Redirect to Paystack
      window.location.href = paymentData.data.authorization_url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process purchase"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Format Selection */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Choose Format:</h3>
        <div className="space-y-3">
          {/* Softcopy Option */}
          {product.pricing.softcopy.available && (
            <button
              onClick={() => {
                setSelectedType("softcopy");
                setShowCheckoutForm(false);
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedType === "softcopy"
                  ? "border-[#90AC19] bg-[#90AC19]/5"
                  : "border-gray-200 hover:border-[#90AC19]/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      PDF (Softcopy)
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                      Instant
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Download immediately after purchase
                  </p>
                </div>
                <span className="text-2xl font-bold text-[#90AC19]">
                  ₦{product.pricing.softcopy.price.toLocaleString()}
                </span>
              </div>
            </button>
          )}

          {/* Paperback Option */}
          {product.pricing.paperback.available && (
            <button
              onClick={() => {
                setSelectedType("paperback");
                setShowCheckoutForm(false);
              }}
              disabled={product.stock.paperback === 0}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                product.stock.paperback === 0
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : selectedType === "paperback"
                  ? "border-[#E8931A] bg-[#E8931A]/5"
                  : "border-gray-200 hover:border-[#E8931A]/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      Paperback (Physical Book)
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                      2 Days Delivery
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.stock.paperback === 0
                      ? "Out of stock"
                      : "Delivered to your address"}
                  </p>
                </div>
                <span className="text-2xl font-bold text-[#E8931A]">
                  ₦{product.pricing.paperback.price.toLocaleString()}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Checkout Button */}
      {!showCheckoutForm && (
        <button
          onClick={() => setShowCheckoutForm(true)}
          className="w-full bg-[#90AC19] hover:bg-[#7A9216] text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          Proceed to Checkout - ₦{currentPrice.toLocaleString()}
        </button>
      )}

      {/* Checkout Form */}
      {showCheckoutForm && (
        <form onSubmit={handlePurchase} className="mt-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>

            {/* Delivery Address (for paperback only) */}
            {selectedType === "paperback" && (
              <>
                <h4 className="font-semibold text-gray-900 mt-6 mb-3">
                  Delivery Address
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required={selectedType === "paperback"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required={selectedType === "paperback"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required={selectedType === "paperback"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19]"
                    placeholder="Any special instructions for delivery?"
                  />
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-[#90AC19]/5 rounded-lg p-6 border-2 border-[#90AC19]">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium text-gray-900">
                  {product.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {selectedType}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-[#90AC19]">
                  ₦{currentPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCheckoutForm(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#90AC19] hover:bg-[#7A9216] text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      )}

      {/* Secure Payment Badge */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Secure payment powered by Paystack
        </div>
      </div>
    </div>
  );
}
