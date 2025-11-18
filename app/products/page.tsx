import ProductRepository from "@/lib/ProductRepository";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Children's Story Books - ParentalPal",
  description:
    "Browse our collection of engaging children's story books. Available in PDF and paperback formats.",
};

export default async function ProductsPage() {
  const products = await ProductRepository.getAllProducts({
    status: "active",
  });

  const categories = [
    { value: "all", label: "All Books" },
    { value: "storybook", label: "Story Books" },
    { value: "educational", label: "Educational" },
    { value: "activity-book", label: "Activity Books" },
    { value: "coloring-book", label: "Coloring Books" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Children&apos;s Story Books
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing stories that inspire, educate, and entertain your
            children. Available in digital PDF and physical paperback formats.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <Link
              key={category.value}
              href={
                category.value === "all"
                  ? "/products"
                  : `/products?category=${category.value}`
              }
              className="px-6 py-2 rounded-full border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white transition-colors font-medium"
            >
              {category.label}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No books available yet
            </h3>
            <p className="text-gray-600">
              Check back soon for exciting new children&apos;s books!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id?.toString()}
                href={`/products/${product.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                {/* Book Cover */}
                <div className="relative h-72 bg-gray-200">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.featured && (
                    <div className="absolute top-3 right-3 bg-[#E8931A] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="p-5">
                  <div className="mb-2">
                    <span className="inline-block bg-[#90AC19]/10 text-[#90AC19] text-xs font-semibold px-3 py-1 rounded-full">
                      {product.ageRange}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#90AC19] transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    by {product.author}
                  </p>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {product.shortDescription}
                  </p>

                  {/* Pricing */}
                  <div className="border-t pt-4 space-y-2">
                    {product.pricing.softcopy.available && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">PDF:</span>
                        <span className="text-lg font-bold text-[#90AC19]">
                          ₦{product.pricing.softcopy.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {product.pricing.paperback.available && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Paperback:
                        </span>
                        <span className="text-lg font-bold text-[#E8931A]">
                          ₦{product.pricing.paperback.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <div className="mt-4">
                    <span className="block w-full bg-[#90AC19] group-hover:bg-[#7A9216] text-white text-center font-semibold py-2 px-4 rounded-lg transition-colors">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#90AC19]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#90AC19]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-sm text-gray-600">
                Get your PDF immediately after purchase via email
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8931A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#E8931A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">
                Paperback books delivered within 2 business days
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#A25F97]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#A25F97]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">
                Safe and secure checkout with Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
