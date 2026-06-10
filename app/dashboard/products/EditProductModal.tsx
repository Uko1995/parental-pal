"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
const PDF_MIME_TYPES = ["application/pdf", "application/x-pdf"];

interface Product {
  _id: string;
  title: string;
  author: string;
  category: string;
  ageRange: string;
  description: string;
  shortDescription?: string;
  pageCount?: number;
  pages?: number;
  pdfFile?: {
    cloudinaryId: string;
    cloudinaryUrl: string;
    fileName?: string;
    fileSize?: number;
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
        pages: product.pageCount || product.pages || 0,
        softcopyPrice: product.pricing?.softcopy?.price || 0,
        softcopyAvailable: product.pricing?.softcopy?.available ?? true,
        paperbackPrice: product.pricing?.paperback?.price || 0,
        paperbackAvailable: product.pricing?.paperback?.available ?? true,
        paperbackStock: product.stock?.paperback ?? 0,
        status: product.status || "active",
        featured: product.featured || false,
      });
      setPdfFile(null);
    }
  }, [product]);

  const handlePdfFileChange = (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      return;
    }

    const isPdfByMime = PDF_MIME_TYPES.includes(file.type);
    const isPdfByExtension = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfByMime && !isPdfByExtension) {
      toast.error("Only PDF files are allowed");
      setPdfFile(null);
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      toast.error("PDF must be 50MB or less");
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

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

    try {
      let pdfFileData = product.pdfFile;

      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append("file", pdfFile);
        pdfFormData.append("type", "pdf");

        const pdfRes = await fetch("/api/upload", {
          method: "POST",
          body: pdfFormData,
        });

        if (!pdfRes.ok) {
          throw new Error("Failed to upload PDF");
        }

        const pdfData = await pdfRes.json();
        pdfFileData = {
          cloudinaryId: pdfData.public_id,
          cloudinaryUrl: pdfData.secure_url || pdfData.url,
          fileName: pdfFile.name,
          fileSize: pdfFile.size,
        };
      }

      const updateData: Record<string, unknown> = {
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

      if (pdfFileData) {
        updateData.pdfFile = pdfFileData;
      }

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
      toast.error(
        error instanceof Error ? error.message : "Failed to update product",
      );
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

          {/* PDF File */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold">PDF File</h4>
              {product.pdfFile?.fileName && !pdfFile && (
                <p className="text-sm text-gray-600 mb-2">
                  Current: {product.pdfFile.fileName}
                  {product.pdfFile.fileSize ? (
                    <span>
                      {" "}
                      ({(product.pdfFile.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : null}
                </p>
              )}
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text">
                    {product.pdfFile ? "Replace PDF" : "Upload PDF"}
                  </span>
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) =>
                    handlePdfFileChange(e.target.files?.[0] || null)
                  }
                  className="file-input file-input-bordered"
                />
                <span className="label-text-alt mt-1 text-gray-500">
                  PDF only, maximum 50MB. Leave empty to keep the current file.
                </span>
                {pdfFile && (
                  <span className="label-text-alt mt-1 text-success">
                    New file: {pdfFile.name}
                  </span>
                )}
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
