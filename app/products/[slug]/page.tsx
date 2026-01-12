import ProductRepository from "@/lib/ProductRepository";
import { notFound } from "next/navigation";
import ProductPurchaseClient from "./ProductPurchaseClient";
import ProductReviews from "./ProductReviews";
import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";
import { ClientProduct } from "@/types/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductRepository.getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.title} - ParentalPal`,
    description: product.shortDescription || product.description,
    openGraph: {
      images: [product.thumbnail],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await ProductRepository.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const serializedProduct: ClientProduct = {
    _id: product._id?.toString() || "",
    title: product.title,
    slug: product.slug,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    author: product.author,
    category: product.category,
    ageRange: product.ageRange || "",
    thumbnail: product.thumbnail,
    images: product.images,
    pricing: product.pricing,
    pdfFile: product.pdfFile,
    pageCount: product.pageCount,
    isbn: product.isbn,
    publishedDate: product.publishedDate?.toISOString(),
    language: product.language,
    stock: product.stock,
    features: product.features,
    tags: product.tags,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    keywords: product.keywords,
    status: product.status,
    featured: product.featured,
    metrics: product.metrics,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt?.toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-[#90AC19] hover:text-[#7A9216] mb-8 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="space-y-6">
            <div className="relative h-150 bg-white rounded-xl shadow-lg overflow-hidden">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-contain p-8"
                priority
              />
              {product.featured && (
                <div className="absolute top-6 right-6 bg-[#E8931A] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Featured
                </div>
              )}
            </div>

            {/* Additional Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-24 bg-white rounded-lg shadow overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${product.title} preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Category & Age Range */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block bg-[#90AC19]/10 text-[#90AC19] text-sm font-semibold px-4 py-1 rounded-full capitalize">
                  {product.category.replace("-", " ")}
                </span>
                <span className="inline-block bg-[#E8931A]/10 text-[#E8931A] text-sm font-semibold px-4 py-1 rounded-full">
                  {product.ageRange}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6">by {product.author}</p>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Key Features:
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-[#90AC19] mr-2 mt-0.5 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Book Details */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.pageCount && (
                    <div>
                      <span className="text-gray-600">Pages:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {product.pageCount}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Language:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {product.language}
                    </span>
                  </div>
                  {product.isbn && (
                    <div>
                      <span className="text-gray-600">ISBN:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {product.isbn}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Component */}
              <ProductPurchaseClient product={serializedProduct} />
            </div>

            {/* Stock Status */}
            {product.pricing.paperback.available &&
              product.stock.paperback < 5 &&
              product.stock.paperback > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    ⚠️ Only {product.stock.paperback} paperback copies left in
                    stock!
                  </p>
                </div>
              )}

            {product.pricing.paperback.available &&
              product.stock.paperback === 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    ❌ Paperback currently out of stock. PDF version still
                    available!
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviews
          productId={serializedProduct._id}
          productSlug={product.slug}
        />
      </div>
    </div>
  );
}
