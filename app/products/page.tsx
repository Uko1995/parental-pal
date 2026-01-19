import ProductRepository from "@/lib/ProductRepository";
import ProductListing from "./ProductListing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Children's Story Books - ParentalPal",
  description:
    "Browse our collection of engaging children's story books. Available in PDF and paperback formats.",
};

// Revalidate on every request to ensure fresh data
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await ProductRepository.getAllProducts({
    status: "active",
  });

  // Serialize products for client component
  const serializedProducts = products.map((product) => ({
    _id: product._id?.toString() || "",
    title: product.title,
    slug: product.slug,
    author: product.author,
    shortDescription: product.shortDescription || "",
    thumbnail: product.thumbnail || "",
    category: product.category,
    ageRange: product.ageRange || "",
    featured: product.featured,
    averageRating: product.averageRating || 0,
    reviewCount: product.reviewCount || 0,
    pricing: {
      softcopy: {
        available: product.pricing.softcopy.available,
        price: product.pricing.softcopy.price,
      },
      paperback: {
        available: product.pricing.paperback.available,
        price: product.pricing.paperback.price,
      },
    },
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Children&apos;s Books
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Discover amazing books that inspire, educate, and entertain your
            children. Available in digital PDF and physical paperback formats.
          </p>
        </div>

        {/* Products Listing with Filters */}
        <ProductListing products={serializedProducts} />

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
