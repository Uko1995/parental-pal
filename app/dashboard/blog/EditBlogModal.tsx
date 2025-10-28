"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, PencilIcon, PhotoIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { PostInterface } from "./page";

interface EditBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostInterface | null;
  onPostUpdated: () => void;
}

export default function EditBlogModal({
  isOpen,
  onClose,
  post,
  onPostUpdated,
}: EditBlogModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    authorName: "",
    authorBio: "",
    status: "draft" as "draft" | "published" | "archived",
    category: "General" as PostInterface["category"],
    tags: [] as string[],
    keywords: [] as string[],
    metaTitle: "",
    metaDescription: "",
    featuredImage: "",
    readTime: 5,
    isFeatured: false,
    isPopular: false,
    displayOrder: 0,
    relatedServices: [] as PostInterface["relatedServices"],
    targetAgeGroup: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
    },
    scheduledFor: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  // Initialize form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        authorName: post.authorName || "",
        authorBio: post.authorBio || "",
        status: post.status || "draft",
        category: post.category || "General",
        tags: post.tags || [],
        keywords: post.keywords || [],
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        featuredImage: post.featuredImage || "",
        readTime: post.readTime || 5,
        isFeatured: post.isFeatured || false,
        isPopular: post.isPopular || false,
        displayOrder: post.displayOrder || 0,
        relatedServices: post.relatedServices || [],
        targetAgeGroup: {
          min: post.targetAgeGroup?.min || undefined,
          max: post.targetAgeGroup?.max || undefined,
        },
        scheduledFor: post.scheduledFor
          ? new Date(post.scheduledFor).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        scheduledFor: formData.scheduledFor
          ? new Date(formData.scheduledFor)
          : undefined,
        targetAgeGroup: {
          min: formData.targetAgeGroup.min || undefined,
          max: formData.targetAgeGroup.max || undefined,
        },
      };

      const response = await fetch(`/api/blog/${post._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      toast.success("Blog post updated successfully!");
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  const handleServiceToggle = (
    service: NonNullable<PostInterface["relatedServices"]>[0]
  ) => {
    setFormData((prev) => {
      const services = prev.relatedServices || [];
      const isSelected = services.includes(service);

      return {
        ...prev,
        relatedServices: isSelected
          ? services.filter((s) => s !== service)
          : [...services, service],
      };
    });
  };

  if (!isOpen || !post) return null;

  const categories: PostInterface["category"][] = [
    "Education Tips",
    "Success Stories",
    "Parenting Tips",
    "Child Development",
    "Technology",
    "Early Learning",
    "STEM Education",
    "General",
  ];

  const services: NonNullable<PostInterface["relatedServices"]>[0][] = [
    "childcare",
    "tutoring",
    "homeschooling",
    "holiday-camps",
    "space-rental",
    "kiddies-enrichment",
  ];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <PencilIcon className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-xl">Edit Blog Post</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter post title"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug: title
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    }));
                  }}
                  required
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Slug</span>
                </label>
                <input
                  type="text"
                  placeholder="auto-generated-from-title"
                  className="input input-bordered"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium">Excerpt</span>
              </label>
              <textarea
                placeholder="Brief description of the post..."
                className="textarea w-full textarea-bordered h-20"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium">Content *</span>
              </label>
              <textarea
                placeholder="Write your blog post content here..."
                className="textarea w-full textarea-bordered h-40"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Author Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">
              Author Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Author Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Author full name"
                  className="input input-bordered"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      authorName: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">
                    Read Time (minutes)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="input input-bordered"
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      readTime: parseInt(e.target.value) || 5,
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium">Author Bio</span>
              </label>
              <textarea
                placeholder="Brief bio about the author..."
                className="textarea w-full textarea-bordered h-20"
                value={formData.authorBio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    authorBio: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Publishing Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">
              Publishing Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as typeof formData.status,
                    }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as PostInterface["category"],
                    }))
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Display Order</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-medium">
                  Schedule For Later
                </span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered"
                value={formData.scheduledFor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledFor: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                />
                <span className="label-text">Featured Post</span>
              </label>

              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-secondary mr-2"
                  checked={formData.isPopular}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPopular: e.target.checked,
                    }))
                  }
                />
                <span className="label-text">Popular Post</span>
              </label>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Media</h4>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Featured Image URL
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="input input-bordered flex-1"
                  value={formData.featuredImage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featuredImage: e.target.value,
                    }))
                  }
                />
                <button type="button" className="btn btn-outline">
                  <PhotoIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags and Keywords */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Tags & SEO</h4>

            {/* Tags */}
            <div className="form-control ">
              <label className="label">
                <span className="label-text font-medium">Tags</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  className="input input-bordered flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="badge badge-outline gap-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-error hover:text-error-focus"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">SEO Keywords</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a keyword"
                  className="input input-bordered flex-1"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addKeyword())
                  }
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <div key={index} className="badge badge-neutral gap-2">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="text-error hover:text-error-focus"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Meta Title</span>
                </label>
                <input
                  type="text"
                  placeholder="SEO title for search engines"
                  className="input input-bordered"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaTitle: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">
                    Meta Description
                  </span>
                </label>
                <textarea
                  placeholder="SEO description for search engines"
                  className="textarea textarea-bordered h-20"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Related Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">
              Related Services
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {services.map((service) => (
                <label key={service} className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mr-2"
                    checked={
                      formData.relatedServices?.includes(service) || false
                    }
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span className="label-text">
                    {service.charAt(0).toUpperCase() +
                      service.slice(1).replace("-", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Age Group */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">
              Target Age Group
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Minimum Age (years)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  placeholder="e.g., 3"
                  className="input input-bordered"
                  value={formData.targetAgeGroup.min || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetAgeGroup: {
                        ...prev.targetAgeGroup,
                        min: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Maximum Age (years)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  placeholder="e.g., 12"
                  className="input input-bordered"
                  value={formData.targetAgeGroup.max || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetAgeGroup: {
                        ...prev.targetAgeGroup,
                        max: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                "Update Post"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
