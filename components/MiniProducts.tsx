"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  ageRange: string;
  description: string;
  thumbnail: {
    url: string;
  };
  pricing: {
    softcopy: {
      price: number;
      available: boolean;
    };
    paperback: {
      price: number;
      available: boolean;
    };
  };
  featured: boolean;
}

export default function MiniProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?featured=true&limit=4");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      storybook: "Story Book",
      educational: "Educational",
      "activity-book": "Activity Book",
      "coloring-book": "Coloring Book",
    };
    return labels[category] || category;
  };

  return (
    <section className="py-16 px-4 bg-linear-to-b from-white to-[#FFEACF]/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Children&apos;s Books
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our collection of carefully curated story books,
            educational materials, and activity books to inspire young minds
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-xl animate-pulse"
              >
                <div className="h-80 bg-gray-200"></div>
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-600">No featured products available</p>
            </div>
          ) : (
            products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <figure className="relative h-80">
                  <Image
                    src={product.thumbnail.url}
                    alt={product.title}
                    className="w-3/4 h-full object-contain"
                    loading="lazy"
                    width={100}
                    height={100}
                  />
                  <div className="absolute top-4 right-4 badge badge-primary badge-lg">
                    Featured
                  </div>
                  <div className="absolute top-4 left-4 badge badge-accent badge-lg">
                    {product.ageRange} yrs
                  </div>
                </figure>
                <div className="card-body">
                  <div className="badge badge-ghost badge-sm">
                    {getCategoryLabel(product.category)}
                  </div>
                  <h3 className="card-title text-lg">{product.title}</h3>
                  <p className="text-sm text-base-content/70">
                    by {product.author}
                  </p>
                  <p className="text-sm line-clamp-2 mt-2">
                    {product.description}
                  </p>
                  <div className="card-actions justify-between items-center mt-4">
                    <div className="flex flex-col gap-1">
                      {product.pricing.softcopy.available && (
                        <div className="text-sm">
                          <span className="font-medium">PDF:</span>{" "}
                          <span className="text-[#90AC19] font-bold">
                            ₦{product.pricing.softcopy.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {product.pricing.paperback.available && (
                        <div className="text-sm">
                          <span className="font-medium">Print:</span>{" "}
                          <span className="text-[#E8931A] font-bold">
                            ₦{product.pricing.paperback.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/products" className="btn btn-primary btn-lg gap-2">
            View All Products
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
