import Image from "next/image";
import Link from "next/link";

export default function Blog() {
  const featuredPost = {
    id: 1,
    title: "The Complete Guide to Choosing the Right Tutor for Your Child",
    excerpt: "Discover the essential factors to consider when selecting a tutor, from qualifications and teaching style to personality fit and learning goals.",
    content: "Finding the right tutor can make all the difference in your child's academic journey...",
    image: "/vision.jpg",
    author: "Dr. Sarah Mitchell",
    authorImage: "/woman1.jpg",
    date: "September 15, 2025",
    readTime: "8 min read",
    category: "Education Tips",
    tags: ["Tutoring", "Education", "Parenting", "Academic Success"]
  };

  const blogPosts = [
    {
      id: 2,
      title: "5 Creative Learning Activities for Preschoolers at Home",
      excerpt: "Transform your home into a learning playground with these engaging activities that promote early childhood development.",
      image: "/tutoring.jpg",
      author: "Emily Rodriguez",
      authorImage: "/woman2.jpg",
      date: "September 12, 2025",
      readTime: "6 min read",
      category: "Early Learning",
      tags: ["Preschool", "Activities", "Home Learning"]
    },
    {
      id: 3,
      title: "Success Story: How Marcus Overcame Math Anxiety",
      excerpt: "Read about 8-year-old Marcus's journey from math struggles to confidence, and the strategies that made the difference.",
      image: "/kid.webp",
      author: "Michael Chen",
      authorImage: "/man1.jpg",
      date: "September 10, 2025",
      readTime: "5 min read",
      category: "Success Stories",
      tags: ["Math", "Success Story", "Confidence Building"]
    },
    {
      id: 4,
      title: "Preparing Your Child for Back-to-School: A Parent's Checklist",
      excerpt: "Essential tips and strategies to help your child transition smoothly into a new school year with confidence.",
      image: "/childcare.jpg",
      author: "Lisa Park",
      authorImage: "/woman1.jpg",
      date: "September 8, 2025",
      readTime: "7 min read",
      category: "Parenting Tips",
      tags: ["Back to School", "Preparation", "Parenting"]
    },
    {
      id: 5,
      title: "The Benefits of Virtual Learning: What Parents Need to Know",
      excerpt: "Explore how virtual learning can complement traditional education and provide flexible learning opportunities.",
      image: "/children1.webp",
      author: "James Wilson",
      authorImage: "/man2.jpg",
      date: "September 5, 2025",
      readTime: "6 min read",
      category: "Technology",
      tags: ["Virtual Learning", "Technology", "Online Education"]
    },
    {
      id: 6,
      title: "Building Social Skills in Children: Age-Appropriate Activities",
      excerpt: "Discover fun and effective ways to help your child develop essential social skills through play and interaction.",
      image: "/camp.jpg",
      author: "Emily Rodriguez",
      authorImage: "/woman3.jpg",
      date: "September 3, 2025",
      readTime: "8 min read",
      category: "Child Development",
      tags: ["Social Skills", "Development", "Activities"]
    },
    {
      id: 7,
      title: "STEM Learning Made Fun: Hands-On Projects for Kids",
      excerpt: "Engage your child's curiosity with these exciting STEM projects that make science, technology, engineering, and math come alive.",
      image: "/workshop.jpg",
      author: "Michael Chen",
      authorImage: "/man1.jpg",
      date: "September 1, 2025",
      readTime: "9 min read",
      category: "STEM Education",
      tags: ["STEM", "Projects", "Science", "Engineering"]
    }
  ];

  const categories = [
    { name: "All Posts", count: 12, active: true },
    { name: "Education Tips", count: 4, active: false },
    { name: "Success Stories", count: 3, active: false },
    { name: "Parenting Tips", count: 5, active: false },
    { name: "Child Development", count: 2, active: false },
    { name: "Technology", count: 1, active: false }
  ];

  const recentPosts = [
    {
      title: "How to Create a Productive Study Space at Home",
      date: "September 18, 2025",
      image: "/workshop.jpg"
    },
    {
      title: "Understanding Different Learning Styles in Children",
      date: "September 16, 2025",
      image: "/tutoring.jpg"
    },
    {
      title: "The Importance of Reading Together as a Family",
      date: "September 14, 2025",
      image: "/tutor.webp"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PARENTALPAL Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover expert insights, success stories, and practical tips to support your child's learning journey
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Featured Image */}
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 70vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#90AC19] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              </div>

              {/* Featured Content */}
              <div className="p-8">
                <div className="mb-4">
                  <span className="text-[#90AC19] font-medium text-sm">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                {/* Author Info */}
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={featuredPost.authorImage}
                      alt={featuredPost.author}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{featuredPost.author}</p>
                    <div className="text-sm text-gray-500">
                      {featuredPost.date} • {featuredPost.readTime}
                    </div>
                  </div>
                </div>

                <Link href={`/blog/${featuredPost.id}`}>
                  <button className="bg-[#90AC19] hover:bg-[#7A9216] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300">
                    Read Full Article
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      category.active
                        ? "bg-[#90AC19] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Post Image */}
                  <div className="relative h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[#90AC19]/10 text-[#90AC19] px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Author & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          <Image
                            src={post.authorImage}
                            alt={post.author}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>

                    {/* Read More Link */}
                    <Link href={`/blog/${post.id}`}>
                      <button className="mt-4 text-[#90AC19] font-medium hover:text-[#7A9216] transition-colors duration-300 flex items-center">
                        Read More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-white border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                Load More Posts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Search Blog</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-[#90AC19] to-[#7A9216] rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
              <p className="text-sm opacity-90 mb-4">
                Get the latest articles and tips delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded-lg border-2 text-white placeholder-white focus:outline-none"
                />
                <button className="w-full bg-white text-[#90AC19] py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}