"use client";"use client";



import { PostInterface } from "./page";import { useState, useRef } from "react";

import {

interface BlogTableProps {  MagnifyingGlassIcon,

  posts: PostInterface[];  FunnelIcon,

  searchTerm: string;  EyeIcon,

  statusFilter: string;  PencilIcon,

  categoryFilter: string;  TrashIcon,

  onView: (post: PostInterface) => void;  EllipsisVerticalIcon,

  onEdit: (post: PostInterface) => void;  XMarkIcon,

  onDelete: (id: string) => void;  ChevronLeftIcon,

}  ChevronRightIcon,

} from "@heroicons/react/24/outline";

export default function BlogTable({import toast from "react-hot-toast";

  posts,import { PostInterface } from "./page";

  searchTerm,

  statusFilter,interface BlogTableProps {

  categoryFilter,  posts: PostInterface[];

  onView,  onEdit: (post: PostInterface) => void;

  onEdit,  onView: (post: PostInterface) => void;

  onDelete,  onRefresh: () => void;

}: BlogTableProps) {}

  return (

    <div className="card bg-base-100 shadow-lg">export default function BlogTable({

      <div className="card-body">  posts,

        <div className="text-center py-20">  onEdit,

          <div className="bg-gradient-to-br from-[#90AC19]/20 to-[#E8931A]/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">  onView,

            <svg className="w-12 h-12 text-[#90AC19]" fill="none" stroke="currentColor" viewBox="0 0 24 24">  onRefresh,

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />}: BlogTableProps) {

            </svg>  const [showFilters, setShowFilters] = useState(true);

          </div>  const [titleFilter, setTitleFilter] = useState("");

            const [statusFilter, setStatusFilter] = useState("");

          <h3 className="text-2xl font-bold text-gray-900 mb-4">  const [categoryFilter, setCategoryFilter] = useState("");

            Blog Management Coming Soon!  const [currentPage, setCurrentPage] = useState(1);

          </h3>  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

            const [deleteModal, setDeleteModal] = useState<{

          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">    isOpen: boolean;

            The blog management system is currently being developed. Soon you&apos;ll be able to create, edit, and manage all your blog posts from this dashboard.    post: PostInterface | null;

          </p>  }>({ isOpen: false, post: null });

        </div>

      </div>  const itemsPerPage = 10;

    </div>  const tableRef = useRef<HTMLDivElement>(null);

  );

}  // Get unique categories and statuses for filters
  const uniqueCategories = [...new Set(posts.map((p) => p.category))];
  const uniqueStatuses = [...new Set(posts.map((p) => p.status))];

  // Apply filters
  const filteredPosts = posts.filter((post) => {
    const matchesTitle = post.title
      .toLowerCase()
      .includes(titleFilter.toLowerCase());
    const matchesStatus = !statusFilter || post.status === statusFilter;
    const matchesCategory = !categoryFilter || post.category === categoryFilter;

    return matchesTitle && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTable();
  };

  const clearFilters = () => {
    setTitleFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = titleFilter || statusFilter || categoryFilter;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      published: "badge-success",
      draft: "badge-warning",
      archived: "badge-error",
    };

    return (
      <div
        className={`badge badge-sm ${
          statusStyles[status as keyof typeof statusStyles] || "badge-neutral"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const openDeleteModal = (post: PostInterface) => {
    setDeleteModal({ isOpen: true, post });
  };

  const handleDelete = async () => {
    const post = deleteModal.post;
    if (!post) return;

    setDeletingIds((prev) => new Set(prev).add(post._id));

    try {
      const response = await fetch(`/api/blog/${post._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted successfully");
        onRefresh();
      } else {
        toast.error("Failed to delete post");
      }
    } catch {
      toast.error("Error deleting post");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(post._id);
        return newSet;
      });
      setDeleteModal({ isOpen: false, post: null });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, post: null });
  };

  return (
    <div ref={tableRef} className="card bg-base-100 shadow-lg scroll-smooth">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">Blog Posts ({filteredPosts.length})</h2>
          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
            {hasActiveFilters && (
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-base-200 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Title Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Search by Title
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter title..."
                    className="input input-bordered w-full pr-10"
                    value={titleFilter}
                    onChange={(e) => setTitleFilter(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
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
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
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
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {titleFilter && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Title: {titleFilter}
                    <button onClick={() => setTitleFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {statusFilter && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {categoryFilter && (
                  <div className="badge badge-primary badge-sm gap-1">
                    Category: {categoryFilter}
                    <button onClick={() => setCategoryFilter("")}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th className="text-left">Author</th>
                <th className="text-left">Category</th>
                <th className="text-left">Status</th>
                <th className="text-left">Views</th>
                <th className="text-left">Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPosts.map((post) => (
                <tr
                  key={post._id}
                  className={`hover:bg-base-200 ${
                    post.status === "published"
                      ? "border-l-4 border-l-success"
                      : post.status === "draft"
                      ? "border-l-4 border-l-warning"
                      : "border-l-4 border-l-error"
                  }`}
                >
                  <td>
                    <div>
                      <div className="font-bold line-clamp-2">{post.title}</div>
                      <div className="text-sm opacity-50 line-clamp-1">
                        {post.excerpt}
                      </div>
                      {post.isFeatured && (
                        <div className="badge badge-accent badge-xs mt-1">
                          Featured
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {post.authorImage && (
                        <img
                          src={post.authorImage}
                          alt={post.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="font-medium">{post.authorName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-outline badge-sm">
                      {post.category}
                    </div>
                  </td>
                  <td>{getStatusBadge(post.status)}</td>
                  <td className="font-semibold">
                    {post.views.toLocaleString()}
                  </td>
                  <td>{formatDate(post.createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-sm"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu menu-sm bg-base-100 rounded-box w-40 p-2 shadow-lg border z-50"
                        >
                          <li>
                            <a onClick={() => onView(post)}>
                              <EyeIcon className="w-4 h-4" />
                              View
                            </a>
                          </li>
                          <li>
                            <a onClick={() => onEdit(post)}>
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </a>
                          </li>
                          <li>
                            <a
                              onClick={() => openDeleteModal(post)}
                              className="text-error"
                            >
                              {deletingIds.has(post._id) ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <TrashIcon className="w-4 h-4" />
                              )}
                              Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-info/10 rounded-lg">
            <p className="text-sm text-info">
              📊 Showing {filteredPosts.length} of {posts.length} posts based on
              your filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredPosts.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredPosts.length)} of{" "}
              {filteredPosts.length} posts
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`join-item btn btn-sm ${
                      currentPage === page ? "btn-active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.post && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-error/20 rounded-full flex items-center justify-center mr-4">
                <TrashIcon className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-error">
                  Delete Blog Post
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the post{" "}
                <span className="font-semibold">
                  &quot;{deleteModal.post.title}&quot;
                </span>
                ?
              </p>

              <div className="bg-base-200 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Author:</span>
                    <p>{deleteModal.post.authorName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p>{deleteModal.post.category}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div>{getStatusBadge(deleteModal.post.status)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Views:</span>
                    <p>{deleteModal.post.views.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={closeDeleteModal}
                disabled={deletingIds.has(deleteModal.post._id)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={deletingIds.has(deleteModal.post._id)}
              >
                {deletingIds.has(deleteModal.post._id) ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete Post
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeDeleteModal}></div>
        </div>
      )}
    </div>
  );
}
