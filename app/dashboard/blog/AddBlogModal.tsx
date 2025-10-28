"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAdded: () => void;
}

const categoryOptions = [
  "Education Tips",
  "Success Stories",
  "Parenting Tips",
  "Child Development",
  "Technology",
  "Early Learning",
  "STEM Education",
  "General",
];

const serviceOptions = [
  "childcare",
  "tutoring",
  "homeschooling",
  "holiday-camps",
  "space-rental",
  "kiddies-enrichment",
];

export default function AddBlogModal({
  isOpen,
  onClose,
  onPostAdded,
}: AddBlogModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    authorName: "",
    authorBio: "",
    category: "General",
    tags: [] as string[],
    keywords: [] as string[],
    metaTitle: "",
    metaDescription: "",
    featuredImage: "",
    readTime: 5,
    isFeatured: false,
    relatedServices: [] as string[],
    targetAgeGroup: {
      min: "",
      max: "",
    },
    status: "draft" as "draft" | "published" | "archived",
  });
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name.startsWith("targetAgeGroup.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        targetAgeGroup: { ...prev.targetAgeGroup, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedServices: prev.relatedServices.includes(service)
        ? prev.relatedServices.filter((s) => s !== service)
        : [...prev.relatedServices, service],
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.authorName.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.readTime < 1) {
      toast.error("Read time must be at least 1 minute");
      return;
    }

    setIsLoading(true);

    try {
      const slug = generateSlug(formData.title);

      const postData = {
        ...formData,
        slug,
        targetAgeGroup: {
          min: formData.targetAgeGroup.min
            ? parseInt(formData.targetAgeGroup.min)
            : undefined,
          max: formData.targetAgeGroup.max
            ? parseInt(formData.targetAgeGroup.max)
            : undefined,
        },
        readTime: parseInt(formData.readTime.toString()),
      };

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Blog post created successfully!");
        onPostAdded();
        onClose();
        // Reset form
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          authorName: "",
          authorBio: "",
          category: "General",
          tags: [],
          keywords: [],
          metaTitle: "",
          metaDescription: "",
          featuredImage: "",
          readTime: 5,
          isFeatured: false,
          relatedServices: [],
          targetAgeGroup: { min: "", max: "" },
          status: "draft",
        });
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Create New Blog Post</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-base text-primary">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Author Name *</span>
                </label>
                <input
                  type="text"
                  name="authorName"
                  className="input input-bordered"
                  value={formData.authorName}
                  onChange={handleInputChange}
                  placeholder="Author full name"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category *</span>
                </label>
                <select
                  name="category"
                  className="select select-bordered"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Excerpt *</span>
                </label>
                <textarea
                  name="excerpt"
                  className="textarea textarea-bordered h-20"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description of the post"
                  required
                />
              </div>

              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Content *</span>
                </label>
                <textarea
                  name="content"
                  className="textarea textarea-bordered h-40"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Full post content (supports Markdown)"
                  required
                />
              </div>
            </div>
          </div>

          {/* SEO & Metadata */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-base text-primary">
              SEO & Metadata
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Meta Title</span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  className="input input-bordered"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO title (optional)"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Read Time (minutes)</span>
                </label>
                <input
                  type="number"
                  name="readTime"
                  className="input input-bordered"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Meta Description</span>
                </label>
                <textarea
                  name="metaDescription"
                  className="textarea textarea-bordered h-20"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO description (optional)"
                />
              </div>

              <div className="md:col-span-2 form-control">
                <label className="label">
                  <span className="label-text">Featured Image URL</span>
                </label>
                <input
                  type="url"
                  name="featuredImage"
                  className="input input-bordered"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Tags & Keywords */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-base text-primary">
              Tags & Keywords
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addTag}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div key={tag} className="badge badge-outline gap-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-error"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Keywords</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addKeyword())
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addKeyword}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <div key={keyword} className="badge badge-outline gap-2">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-error"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Services & Target Age */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-base text-primary">
              Related Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Related Services</span>
                </label>
                <div className="space-y-2">
                  {serviceOptions.map((service) => (
                    <label
                      key={service}
                      className="cursor-pointer label justify-start gap-2"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={formData.relatedServices.includes(service)}
                        onChange={() => toggleService(service)}
                      />
                      <span className="label-text capitalize">
                        {service.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Target Age Range</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="targetAgeGroup.min"
                      className="input input-bordered flex-1"
                      value={formData.targetAgeGroup.min}
                      onChange={handleInputChange}
                      placeholder="Min age"
                      min="0"
                      max="18"
                    />
                    <input
                      type="number"
                      name="targetAgeGroup.max"
                      className="input input-bordered flex-1"
                      value={formData.targetAgeGroup.max}
                      onChange={handleInputChange}
                      placeholder="Max age"
                      min="0"
                      max="18"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="cursor-pointer label justify-start gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      className="checkbox checkbox-primary"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <span className="label-text">Featured Post</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
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
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
}
