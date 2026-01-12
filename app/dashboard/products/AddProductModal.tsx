"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "storybook",
    ageRange: "3-5",
    description: "",
    features: [] as string[],
    currentFeature: "",
    pages: 20,
    language: "English",
    isbn: "",
    softcopyPrice: 3000,
    paperbackPrice: 5000,
    softcopyAvailable: true,
    paperbackAvailable: true,
    paperbackStock: 50,
    lowStockThreshold: 10,
    status: "active" as "active" | "draft" | "archived",
    featured: false,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleAddFeature = () => {
    if (formData.currentFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, prev.currentFeature.trim()],
        currentFeature: "",
      }));
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!thumbnailFile) {
      toast.error("Please upload a thumbnail image");
      return;
    }

    if (!pdfFile) {
      toast.error("Please upload the PDF file");
      return;
    }

    setIsLoading(true);

    try {
      // Upload thumbnail to Cloudinary
      const thumbnailFormData = new FormData();
      thumbnailFormData.append("file", thumbnailFile);
      thumbnailFormData.append("type", "thumbnail");

      const thumbnailRes = await fetch("/api/upload", {
        method: "POST",
        body: thumbnailFormData,
      });

      if (!thumbnailRes.ok) {
        throw new Error("Failed to upload thumbnail");
      }

      const thumbnailData = await thumbnailRes.json();

      // Upload PDF to Cloudinary
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

      // Create product
      const productData = {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        ageRange: formData.ageRange,
        description: formData.description,
        features: formData.features,
        pages: formData.pages,
        language: formData.language,
        isbn: formData.isbn,
        thumbnail: thumbnailData.secure_url || thumbnailData.url, // Store URL directly as string
        pdfFile: {
          cloudinaryId: pdfData.public_id,
          cloudinaryUrl: pdfData.secure_url || pdfData.url,
          fileName: pdfFile.name,
          fileSize: pdfFile.size,
        },
        pricing: {
          softcopy: {
            price: formData.softcopyPrice,
            available: formData.softcopyAvailable,
          },
          paperback: {
            price: formData.paperbackPrice,
            available: formData.paperbackAvailable,
          },
        },
        stock: {
          paperback: formData.paperbackStock,
          lowStockThreshold: formData.lowStockThreshold,
        },
        status: formData.status,
        featured: formData.featured,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "storybook",
      ageRange: "3-5",
      description: "",
      features: [],
      currentFeature: "",
      pages: 20,
      language: "English",
      isbn: "",
      softcopyPrice: 3000,
      paperbackPrice: 5000,
      softcopyAvailable: true,
      paperbackAvailable: true,
      paperbackStock: 50,
      lowStockThreshold: 10,
      status: "draft",
      featured: false,
    });
    setThumbnailFile(null);
    setPdfFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-base-100 z-10 pb-4">
          <h3 className="font-bold text-2xl">Add New Product</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 ">
            <h4 className="font-semibold text-lg">Basic Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Author *</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Category</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="select select-bordered"
                >
                  <option value="storybook">Story Book</option>
                  <option value="educational">Educational</option>
                  <option value="activity-book">Activity Book</option>
                  <option value="coloring-book">Coloring Book</option>
                </select>
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Age Range</span>
                </label>
                <select
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleInputChange}
                  className="select select-bordered ps-2"
                >
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-8">6-8 years</option>
                  <option value="9-12">9-12 years</option>
                  <option value="13+">13+ years</option>
                </select>
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Pages</span>
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Language</span>
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">
                    ISBN (optional)
                  </span>
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
            </div>

            <div className="form-control flex flex-col w-full gap-1">
              <label className="label">
                <span className="label-text text-gray-700">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Enter product description..."
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Features</h4>

            <div className="form-control ">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.currentFeature}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentFeature: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="input input-bordered flex-1"
                  placeholder="Add a feature..."
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="btn btn-primary"
                >
                  Add
                </button>
              </div>
            </div>

            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="badge badge-lg gap-2">
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="btn btn-ghost btn-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Files</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">
                    Thumbnail Image *
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="file-input file-input-bordered"
                  required
                />
                {thumbnailFile && (
                  <span className="label-text-alt mt-1 text-success">
                    {thumbnailFile.name}
                  </span>
                )}
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">PDF File *</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="file-input file-input-bordered"
                  required
                />
                {pdfFile && (
                  <span className="label-text-alt mt-1 text-success">
                    {pdfFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Pricing & Stock</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h5 className="card-title text-base">Softcopy (PDF)</h5>
                  <div className="form-control flex flex-col gap-1">
                    <label className="label">
                      <span className="label-text text-gray-700">
                        Price (₦)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="softcopyPrice"
                      value={formData.softcopyPrice}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text text-gray-700">
                        Available
                      </span>
                      <input
                        type="checkbox"
                        name="softcopyAvailable"
                        checked={formData.softcopyAvailable}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h5 className="card-title text-base">Paperback (Print)</h5>
                  <div className="form-control flex flex-col gap-1">
                    <label className="label">
                      <span className="label-text text-gray-700">
                        Price (₦)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="paperbackPrice"
                      value={formData.paperbackPrice}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text text-gray-700">
                        Available
                      </span>
                      <input
                        type="checkbox"
                        name="paperbackAvailable"
                        checked={formData.paperbackAvailable}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  </div>
                  <div className="form-control flex flex-col gap-1">
                    <label className="label">
                      <span className="label-text text-gray-700">
                        Stock Quantity
                      </span>
                    </label>
                    <input
                      type="number"
                      name="paperbackStock"
                      value={formData.paperbackStock}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>
                  <div className="form-control flex flex-col gap-1">
                    <label className="label">
                      <span className="label-text text-gray-700">
                        Low Stock Alert
                      </span>
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Status</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text text-gray-700">Status</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered ps-2"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text text-gray-700">
                    Featured Product
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
