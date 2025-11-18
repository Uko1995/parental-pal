"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface Product {
  _id: string;
  title: string;
  author: string;
  category: string;
  ageRange: string;
  description: string;
  thumbnail: {
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
  status: string;
  featured: boolean;
  metrics: {
    views: number;
    salesCount: number;
    revenue: number;
  };
  createdAt: Date;
}

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onUpdate: () => void;
}

export default function ViewProductModal({
  isOpen,
  onClose,
  product,
}: ViewProductModalProps) {
  if (!isOpen) return null;

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
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-base-100 z-10 pb-4">
          <h3 className="font-bold text-2xl">Product Details</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="flex justify-center">
            <img
              src={product.thumbnail.url}
              alt={product.title}
              className="w-64 h-80 object-cover rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>

          {/* Basic Info */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Title</p>
                  <p className="font-medium">{product.title}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Author</p>
                  <p className="font-medium">{product.author}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Category</p>
                  <p className="font-medium">
                    {getCategoryLabel(product.category)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Age Range</p>
                  <p className="font-medium">{product.ageRange} years</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Pages</p>
                  <p className="font-medium">{product.pages}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Language</p>
                  <p className="font-medium">{product.language}</p>
                </div>
                {product.isbn && (
                  <div>
                    <p className="text-sm text-base-content/70">ISBN</p>
                    <p className="font-medium">{product.isbn}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Description</h4>
              <p>{product.description}</p>
            </div>
          </div>

          {/* Features */}
          {product.features.length > 0 && (
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="font-semibold text-lg">Features</h4>
                <ul className="list-disc list-inside space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Pricing & Stock</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Softcopy (PDF)</p>
                  <p className="font-medium text-lg">
                    ₦{product.pricing.softcopy.price.toLocaleString()}
                  </p>
                  <div
                    className={`badge ${
                      product.pricing.softcopy.available
                        ? "badge-success"
                        : "badge-error"
                    } badge-sm mt-1`}
                  >
                    {product.pricing.softcopy.available
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">
                    Paperback (Print)
                  </p>
                  <p className="font-medium text-lg">
                    ₦{product.pricing.paperback.price.toLocaleString()}
                  </p>
                  <div
                    className={`badge ${
                      product.pricing.paperback.available
                        ? "badge-success"
                        : "badge-error"
                    } badge-sm mt-1`}
                  >
                    {product.pricing.paperback.available
                      ? "Available"
                      : "Unavailable"}
                  </div>
                  <p className="text-sm mt-2">
                    Stock: {product.stock.paperback} units
                    {product.stock.paperback <=
                      product.stock.lowStockThreshold && (
                      <span className="text-warning ml-2">(Low Stock)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Metrics */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold text-lg">Status & Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/70">Status</p>
                  <div
                    className={`badge ${
                      product.status === "active"
                        ? "badge-success"
                        : product.status === "draft"
                        ? "badge-warning"
                        : "badge-ghost"
                    } mt-1`}
                  >
                    {product.status}
                  </div>
                  {product.featured && (
                    <div className="badge badge-primary mt-1 ml-2">
                      Featured
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Views</p>
                  <p className="font-medium">{product.metrics.views}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Total Sales</p>
                  <p className="font-medium">{product.metrics.salesCount}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Total Revenue</p>
                  <p className="font-medium">
                    ₦{product.metrics.revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Created</p>
                  <p className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
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
