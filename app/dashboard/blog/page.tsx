"use client";

// Interfaces for blog components (coming soon)
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
    | "STEM Education";
  tags: string[];
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  avgReadTime: number;
  monthlyViews: Array<{
    month: string;
    views: number;
    posts: number;
  }>;
  categoryStats: Array<{
    category: string;
    posts: number;
    views: number;
  }>;
  topPosts: Array<{
    title: string;
    views: number;
    comments: number;
    shares: number;
    publishedAt: string;
  }>;
  recentActivity: Array<{
    action: string;
    post: string;
    timestamp: string;
    author: string;
  }>;
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Blog Management
          </h1>
          <p className="text-gray-600">
            Create, edit, and manage your blog posts
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-[#90AC19]/20 to-[#E8931A]/20 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-16 h-16 text-[#90AC19]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Blog Management Coming Soon!
              </h2>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                The blog management system is currently being developed. Soon
                you&apos;ll be able to create, edit, and manage all your blog
                posts from this dashboard with features like:
              </p>

              <div className="bg-white rounded-xl p-6 shadow-lg mb-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Upcoming Features:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#90AC19]/10 rounded-full p-1 mt-1">
                      <svg
                        className="w-4 h-4 text-[#90AC19]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">
                      Rich text editor
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#90AC19]/10 rounded-full p-1 mt-1">
                      <svg
                        className="w-4 h-4 text-[#90AC19]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">
                      Media management
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#90AC19]/10 rounded-full p-1 mt-1">
                      <svg
                        className="w-4 h-4 text-[#90AC19]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">
                      SEO optimization
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#90AC19]/10 rounded-full p-1 mt-1">
                      <svg
                        className="w-4 h-4 text-[#90AC19]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">
                      Content scheduling
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#90AC19]/10 rounded-full p-1 mt-1">
                      <svg
                        className="w-4 h-4 text-[#90AC19]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">
                      Analytics tracking
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#90AC19]/10 rounded-full p-1 mt-1">
                      <svg
                        className="w-4 h-4 text-[#90AC19]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">
                      Category management
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  className="bg-[#90AC19] hover:bg-[#7A9216] text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 shadow-lg cursor-not-allowed opacity-50"
                  disabled
                >
                  Coming Soon
                </button>

                <p className="text-sm text-gray-500">
                  In the meantime, you can manage other aspects of your platform
                  from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
