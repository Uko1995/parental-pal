"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface Order {
  _id: string;
  orderNumber: string;
  productTitle: string;
  productThumbnail: string;
  type: "softcopy" | "paperback";
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  delivery?: {
    address: string;
    city: string;
    state: string;
    estimatedDate: Date;
    actualDate?: Date;
  };
  payment: {
    amount: number;
    status: string;
    reference: string;
    provider: string;
  };
  download?: {
    token: string;
    expiresAt: Date;
    downloadCount: number;
    maxDownloads: number;
  };
  status: string;
  emailsSent: {
    orderConfirmation: boolean;
    downloadLink: boolean;
  };
  createdAt: Date;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdate: () => void;
}

export default function ViewOrderModal({
  isOpen,
  onClose,
  order,
}: ViewOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-base-100 z-10 pb-4">
          <h3 className="font-bold text-2xl">Order Details</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Product Information</h4>
              <div className="flex items-center gap-4">
                <Image
                  src={order.productThumbnail}
                  alt={order.productTitle}
                  className="w-24 h-32 object-cover rounded"
                  loading="lazy"
                />
                <div>
                  <p className="font-bold text-lg">{order.productTitle}</p>
                  <div className="badge badge-primary mt-2">
                    {order.type === "softcopy" ? "PDF" : "Paperback"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Name</p>
                  <p className="font-medium">{order.customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Email</p>
                  <p className="font-medium">{order.customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Phone</p>
                  <p className="font-medium">{order.customerInfo.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info (Paperback only) */}
          {order.type === "paperback" && order.delivery && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="font-semibold text-lg">Delivery Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-base-content/70">Address</p>
                    <p className="font-medium">{order.delivery.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">City</p>
                    <p className="font-medium">{order.delivery.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">State</p>
                    <p className="font-medium">{order.delivery.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">
                      Estimated Delivery
                    </p>
                    <p className="font-medium">
                      {new Date(
                        order.delivery.estimatedDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {order.delivery.actualDate && (
                    <div>
                      <p className="text-sm text-base-content/70">
                        Actual Delivery
                      </p>
                      <p className="font-medium">
                        {new Date(
                          order.delivery.actualDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Download Info (Softcopy only) */}
          {order.type === "softcopy" && order.download && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="font-semibold text-lg">Download Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-base-content/70">
                      Downloads Used
                    </p>
                    <p className="font-medium">
                      {order.download.downloadCount} /{" "}
                      {order.download.maxDownloads}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Expires</p>
                    <p className="font-medium">
                      {new Date(order.download.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Amount</p>
                  <p className="font-medium text-lg">
                    ₦{order.payment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Status</p>
                  <div
                    className={`badge ${
                      order.payment.status === "paid"
                        ? "badge-success"
                        : order.payment.status === "pending"
                        ? "badge-warning"
                        : "badge-error"
                    } mt-1`}
                  >
                    {order.payment.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Reference</p>
                  <p className="font-medium text-sm">
                    {order.payment.reference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Provider</p>
                  <p className="font-medium">{order.payment.provider}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Order Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Status</p>
                  <div
                    className={`badge badge-lg ${
                      order.status === "delivered"
                        ? "badge-success"
                        : order.status === "shipped"
                        ? "badge-primary"
                        : order.status === "paid"
                        ? "badge-info"
                        : order.status === "pending"
                        ? "badge-warning"
                        : "badge-error"
                    } mt-1`}
                  >
                    {order.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Order Number</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Emails Sent</p>
                  <div className="flex gap-2 mt-1">
                    {order.emailsSent.orderConfirmation && (
                      <div className="badge badge-success badge-sm">
                        Confirmation
                      </div>
                    )}
                    {order.emailsSent.downloadLink && (
                      <div className="badge badge-success badge-sm">
                        Download Link
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
