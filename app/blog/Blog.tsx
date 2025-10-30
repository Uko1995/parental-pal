import Link from "next/link";
// import Image from "next/image";
// import { getPublishedPosts, getFeaturedPost, BlogPost } from "./actions";

// interface BlogProps {
//   featuredPost: BlogPost | null;
//   blogPosts: BlogPost[];
// }

// export default function Blog({ featuredPost, blogPosts }: BlogProps) {
export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PARENTALPAL Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover expert insights, success stories, and practical tips to
            support your child&apos;s learning journey
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="text-center py-20">
          <div className="max-w-lg mx-auto">
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
              Blog Coming Soon!
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We&apos;re working hard to bring you amazing content about
              childcare, education tips, success stories, and parenting
              insights. Our blog will be launching soon with expert articles to
              help you on your parenting journey.
            </p>

            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What to expect:
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
                    Expert parenting tips
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
                    Educational resources
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
                  <span className="text-sm text-gray-700">Success stories</span>
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
                    Child development insights
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/services">
                <button className="bg-[#90AC19] hover:bg-[#7A9216] text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
                  Explore Our Services
                </button>
              </Link>

              <p className="text-sm text-gray-500">
                In the meantime, discover our childcare services and book what
                you need for your family.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
