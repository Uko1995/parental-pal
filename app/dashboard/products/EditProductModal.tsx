"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  title: string;
  author: string;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Product</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control flex flex-col gap-1">
            <label className="label">
              <span className="label-text text-gray-700 ">Title</span>
            </label>
            <input
              type="text"
              name="title"
              defaultValue={product.title}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control flex flex-col gap-1">
            <label className="label">
              <span className="label-text text-gray-700">Author</span>
            </label>
            <input
              type="text"
              name="author"
              defaultValue={product.author}
              className="input input-bordered"
              required
            />
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
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
