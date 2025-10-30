"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import AddBlogModal from "./AddBlogModal";
import ViewBlogModal from "./ViewBlogModal";
import EditBlogModal from "./EditBlogModal";
import BlogCharts from "./BlogCharts";

export interface PostInterface {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId?: string;
  authorName: string;
  authorImage?: string;
  authorBio?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  scheduledFor?: Date;
  category:
    | "Education Tips"
    | "Success Stories"
    | "Parenting Tips"
    | "Child Development"
    | "Technology"
    | "Early Learning"
    | "STEM Education"
    | "General";
  tags: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  images?: string[];
  videos?: string[];
  views: number;
  likes: number;
  shares: number;
  comments: Array<{
    _id?: string;
    authorName: string;
    authorEmail?: string;
    content: string;
    isApproved: boolean;
    createdAt: Date;
  }>;
  readTime: number;
  displayOrder: number;
  isFeatured: boolean;
  isPopular: boolean;
  relatedServices?: (
    | "childcare"
    | "tutoring"
    | "homeschooling"
    | "holiday-camps"
    | "space-rental"
    | "kiddies-enrichment"
  )[];
  targetAgeGroup?: {
    min?: number;
    max?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  averageReadTime: number;
  topCategories: Array<{ name: string; count: number }>;
  monthlyStats: Array<{ month: string; posts: number; views: number }>;
  engagementMetrics: Array<{ metric: string; value: number; change: number }>;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [analytics, setAnalytics] = useState<BlogAnalytics>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    archivedPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    averageReadTime: 0,
    topCategories: [],
    monthlyStats: [],
    engagementMetrics: [],
  });
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostInterface | null>(null);

  // Modal handlers
  const handleViewPost = (post: PostInterface) => {
    setSelectedPost(post);
    setViewModal(true);
  };

  const handleEditPost = (post: PostInterface) => {
    setSelectedPost(post);
    setEditModal(true);
  };

  // Fetch posts and analytics
  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const [postsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/blog"),
        fetch("/api/blog/analytics"),
      ]);

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics || analytics);
      }
    } catch (error) {
      console.error("Error fetching blog data:", error);
      toast.error("Failed to load blog data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchBlogData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-48 mb-2"></div>
            <div className="skeleton h-4 w-64"></div>
          </div>
          <div className="skeleton h-10 w-24"></div>
        </div>

        {/* Analytics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-4 w-20 mb-2"></div>
                <div className="skeleton h-8 w-16 mb-2"></div>
                <div className="skeleton h-3 w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="skeleton h-64 w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-12 w-12 rounded"></div>
                    <div>
                      <div className="skeleton h-4 w-32 mb-2"></div>
                      <div className="skeleton h-3 w-20"></div>
                    </div>
                  </div>
                  <div className="skeleton h-6 w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your blog posts, analytics, and content strategy
          </p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Analytics Dashboard */}
      <BlogCharts analytics={analytics} />

      {/* Blog Posts Table */}
      {/* <BlogTable
        posts={posts}
        onEdit={handleEditPost}
        onView={handleViewPost}
        onRefresh={handleRefresh}
      /> */}

      {/* Modals */}
      <AddBlogModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onPostAdded={handleRefresh}
      />

      <ViewBlogModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        post={selectedPost}
      />

      <EditBlogModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        post={selectedPost}
        onPostUpdated={handleRefresh}
      />
    </div>
  );
}
