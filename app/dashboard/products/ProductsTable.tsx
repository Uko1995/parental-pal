"use client";

import { useState, useRef } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: "storybook" | "educational" | "activity-book" | "coloring-book";
  ageRange: string;
  description: string;
  thumbnail: {
    url: string;
    cloudinaryId: string;
  };
  images: Array<{
    url: string;
    cloudinaryId: string;
  }>;
  pdfFile: {
    cloudinaryId: string;
    url: string;
  };
  pricing: {
    softcopy: {
      price: number;
      available: boolean;
    };
    paperback: {
      price: number;
      available: boolean;
    };
  };
  stock: {
    paperback: number;
    lowStockThreshold: number;
  };
  pages: number;
  language: string;
  isbn: string;
  features: string[];
  status: "active" | "draft" | "archived";
  featured: boolean;
  metrics: {
    views: number;
    salesCount: number;
    revenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProductsTableProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onUpdateProduct: () => void;
}

export default function ProductsTable({
  products,
  onViewProduct,
  onUpdateProduct,
}: ProductsTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const itemsPerPage = 10;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;
    const matchesStatus = statusFilter ? product.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
    setCategoryFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    onUpdateProduct();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
    onUpdateProduct();
  };

  const getStockStatus = (product: Product) => {
    if (product.stock.paperback === 0) {
      return <div className="badge badge-error badge-sm">Out of Stock</div>;
    }
    if (product.stock.paperback <= product.stock.lowStockThreshold) {
      return <div className="badge badge-warning badge-sm">Low Stock</div>;
    }
    return <div className="badge badge-success badge-sm">In Stock</div>;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      storybook: "Story Book",
      educational: "Educational",
      "activity-book": "Activity Book",
      "coloring-book": "Coloring Book",
    };
    return labels[category] || category;
  };

  return (
    <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="card-title text-lg">
            Products ({filteredProducts.length})
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
                  <span className="label-text font-medium">
                    Search by Title/Author
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter title or author..."
                    className="input input-bordered w-full pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Category</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="storybook">Story Books</option>
                  <option value="educational">Educational</option>
                  <option value="activity-book">Activity Books</option>
                  <option value="coloring-book">Coloring Books</option>
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
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
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
                <th>Product</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <p className="text-base-content/70">No products found</p>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-base-200">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <Image
                              src={product.thumbnail.url}
                              alt={product.title}
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{product.title}</div>
                          <div className="text-sm text-base-content/70">
                            {product.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="badge badge-ghost badge-sm">
                        {getCategoryLabel(product.category)}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>
                          PDF: ₦
                          {product.pricing.softcopy.price.toLocaleString()}
                        </div>
                        <div>
                          Print: ₦
                          {product.pricing.paperback.price.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">
                          {product.stock.paperback} units
                        </span>
                        {getStockStatus(product)}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div
                          className={`badge badge-sm ${
                            product.status === "active"
                              ? "badge-success"
                              : product.status === "draft"
                              ? "badge-warning"
                              : "badge-ghost"
                          }`}
                        >
                          {product.status}
                        </div>
                        {product.featured && (
                          <div className="badge badge-primary badge-sm">
                            Featured
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{product.metrics.salesCount}</td>
                    <td>₦{product.metrics.revenue.toLocaleString()}</td>
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
                            <button onClick={() => onViewProduct(product)}>
                              <EyeIcon className="w-4 h-4" />
                              View Details
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleEdit(product)}>
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-error"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </li>
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

      {/* Modals */}
      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onSuccess={handleEditSuccess}
          />
          <DeleteProductModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
}
