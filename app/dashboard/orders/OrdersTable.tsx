"use client";

import { useState, useRef } from "react";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import UpdateOrderStatusModal from "./UpdateOrderStatusModal";

interface Order {
  _id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productThumbnail: string;
  type: "softcopy" | "paperback";
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    amount: number;
    status: "pending" | "paid" | "failed";
    reference: string;
    provider: string;
  };
  download?: {
    token: string;
    expiresAt: Date;
    downloadCount: number;
    maxDownloads: number;
  };
  status: "pending" | "paid" | "shipped" | "delivered" | "failed";
  emailsSent: {
    orderConfirmation: boolean;
    downloadLink: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateOrder: () => void;
}

export default function OrdersTable({
  orders,
  onViewOrder,
  onUpdateOrder,
}: OrdersTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const itemsPerPage = 10;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? order.type === typeFilter : true;
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedOrder(null);
    onUpdateOrder();
    toast.success("Order status updated successfully!");
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: "badge-warning",
      paid: "badge-info",
      shipped: "badge-primary",
      delivered: "badge-success",
      failed: "badge-error",
    };
    return `badge ${badges[status] || "badge-ghost"} badge-sm`;
  };

  const getTypeBadge = (type: string) => {
    return type === "softcopy" ? "badge-accent" : "badge-primary";
  };

  return (
    <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="card-title text-2xl">
            Orders ({filteredOrders.length})
          </h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5" />
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-base-200 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Search</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Order number, name, email..."
                    className="input input-bordered w-full pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Type Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="softcopy">Softcopy (PDF)</option>
                  <option value="paperback">Paperback</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                <XMarkIcon className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <p className="text-base-content/70">No orders found</p>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-base-200">
                    <td>
                      <div className="font-bold">{order.orderNumber}</div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">
                          {order.customerInfo.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {order.customerInfo.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={order.productThumbnail}
                              alt={order.productTitle}
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <div className="font-medium">{order.productTitle}</div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`badge ${getTypeBadge(order.type)} badge-sm`}
                      >
                        {order.type === "softcopy" ? "PDF" : "Paperback"}
                      </div>
                    </td>
                    <td>₦{order.payment.amount.toLocaleString()}</td>
                    <td>
                      <div className={getStatusBadge(order.status)}>
                        {order.status}
                      </div>
                      {order.type === "softcopy" && order.download && (
                        <div className="text-xs text-base-content/70 mt-1">
                          {order.download.downloadCount}/
                          {order.download.maxDownloads} downloads
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-sm">
                          •••
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                          <li>
                            <button onClick={() => onViewOrder(order)}>
                              <EyeIcon className="w-4 h-4" />
                              View Details
                            </button>
                          </li>
                          {order.type === "paperback" &&
                            order.status === "paid" && (
                              <li>
                                <button
                                  onClick={() => handleUpdateStatus(order)}
                                >
                                  <TruckIcon className="w-4 h-4" />
                                  Update Status
                                </button>
                              </li>
                            )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-sm ${
                  currentPage === page ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateOrderStatusModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
