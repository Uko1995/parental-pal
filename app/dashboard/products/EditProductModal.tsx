"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  title: string;
  author: string;
  category: string;
  ageRange: string;
  description: string;
  shortDescription?: string;
  pageCount?: number;
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
  status: string;
  featured: boolean;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: () => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: EditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    ageRange: "",
    description: "",
    shortDescription: "",
    pages: 0,
    softcopyPrice: 0,
    softcopyAvailable: true,
    paperbackPrice: 0,
    paperbackAvailable: true,
    paperbackStock: 0,
    status: "active",
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        author: product.author || "",
        category: product.category || "storybook",
        ageRange: product.ageRange || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        pages: product.pageCount || 0,
        softcopyPrice: product.pricing?.softcopy?.price || 0,
        softcopyAvailable: product.pricing?.softcopy?.available ?? true,
        paperbackPrice: product.pricing?.paperback?.price || 0,
        paperbackAvailable: product.pricing?.paperback?.available ?? true,
        paperbackStock: product.stock?.paperback ?? 0,
        status: product.status || "active",
        featured: product.featured || false,
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const updateData = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      ageRange: formData.ageRange,
      description: formData.description,
      shortDescription: formData.shortDescription,
      pages: formData.pages,
      pricing: {
        softcopy: {
          price: formData.softcopyPrice,
          available: formData.softcopyAvailable,
          currency: "NGN",
        },
        paperback: {
          price: formData.paperbackPrice,
          available: formData.paperbackAvailable,
          currency: "NGN",
          deliveryDays: 3,
        },
      },
      stock: {
        paperback: formData.paperbackStock,
      },
      status: formData.status,
      featured: formData.featured,
    };

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-base-100 z-10 pb-4">
          <h3 className="font-bold text-lg">Edit Product</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Author</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="select select-bordered"
                  >
                    <option value="storybook">Story Book</option>
                    <option value="educational">Educational</option>
                    <option value="activity-book">Activity Book</option>
                    <option value="coloring-book">Coloring Book</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Age Range</span>
                  </label>
                  <input
                    type="text"
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="e.g., 3-5 years"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Page Count</span>
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleChange}
                    className="input input-bordered"
                    min="0"
                    placeholder="Number of pages"
                  />
                </div>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Short Description</span>
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Brief description for listings"
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Full Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Detailed product description"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold">Pricing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="softcopyAvailable"
                        checked={formData.softcopyAvailable}
                        onChange={handleChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">
                        Softcopy (PDF) Available
                      </span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Softcopy Price (₦)</span>
                    </label>
                    <input
                      type="number"
                      name="softcopyPrice"
                      value={formData.softcopyPrice}
                      onChange={handleChange}
                      className="input input-bordered"
                      min="0"
                      disabled={!formData.softcopyAvailable}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="paperbackAvailable"
                        checked={formData.paperbackAvailable}
                        onChange={handleChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">Paperback Available</span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Paperback Price (₦)</span>
                    </label>
                    <input
                      type="number"
                      name="paperbackPrice"
                      value={formData.paperbackPrice}
                      onChange={handleChange}
                      className="input input-bordered"
                      min="0"
                      disabled={!formData.paperbackAvailable}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold">Stock Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Paperback Stock</span>
                  </label>
                  <input
                    type="number"
                    name="paperbackStock"
                    value={formData.paperbackStock}
                    onChange={handleChange}
                    className="input input-bordered"
                    min="0"
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Physical copies available
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Visibility */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold">Status & Visibility</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="select select-bordered"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div className="form-control flex flex-col justify-center items-center">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">Featured Product</span>
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Show on homepage
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
