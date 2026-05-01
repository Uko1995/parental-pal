"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { CartItem } from "../cart/page";

interface Product {
  _id: string;
  title: string;
  slug: string;
  author: string;
  shortDescription: string;
  thumbnail: string;
  category: string;
  ageRange: string;
  featured: boolean;
  averageRating?: number;
  reviewCount?: number;
  pricing: {
    softcopy: { available: boolean; price: number };
    paperback: { available: boolean; price: number };
  };
}

interface ProductListingProps {
  products: Product[];
}

const categories = [
  { value: "all", label: "All Books" },
  { value: "storybook", label: "Story Books" },
  { value: "educational", label: "Educational" },
  { value: "activity-book", label: "Activity Books" },
  { value: "coloring-book", label: "Coloring Books" },
];

const ageRanges = [
  { value: "all", label: "All Ages" },
  { value: "0-3", label: "0-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-8", label: "5-8 years" },
  { value: "8-12", label: "8-12 years" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-2000", label: "Under ₦2,000" },
  { value: "2000-5000", label: "₦2,000 - ₦5,000" },
  { value: "5000-10000", label: "₦5,000 - ₦10,000" },
  { value: "10000+", label: "Over ₦10,000" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "title", label: "Alphabetical" },
];

export default function ProductListing({ products }: ProductListingProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState<
    "all" | "softcopy" | "paperback"
  >("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [loadingCart, setLoadingCart] = useState<string | null>(null);
  const [loadingWishlist, setLoadingWishlist] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.shortDescription.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Age filter
    if (ageFilter !== "all") {
      result = result.filter((p) => p.ageRange.includes(ageFilter));
    }

    // Price filter
    if (priceFilter !== "all") {
      result = result.filter((p) => {
        const minPrice = Math.min(
          p.pricing.softcopy.available ? p.pricing.softcopy.price : Infinity,
          p.pricing.paperback.available ? p.pricing.paperback.price : Infinity
        );

        switch (priceFilter) {
          case "0-2000":
            return minPrice < 2000;
          case "2000-5000":
            return minPrice >= 2000 && minPrice < 5000;
          case "5000-10000":
            return minPrice >= 5000 && minPrice < 10000;
          case "10000+":
            return minPrice >= 10000;
          default:
            return true;
        }
      });
    }

    // Format filter
    if (formatFilter !== "all") {
      result = result.filter((p) =>
        formatFilter === "softcopy"
          ? p.pricing.softcopy.available
          : p.pricing.paperback.available
      );
    }

    // Sorting
    switch (sortBy) {
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "newest":
        // Assuming _id order is chronological
        result.reverse();
        break;
      case "price-low":
        result.sort((a, b) => {
          const aPrice = Math.min(
            a.pricing.softcopy.available ? a.pricing.softcopy.price : Infinity,
            a.pricing.paperback.available ? a.pricing.paperback.price : Infinity
          );
          const bPrice = Math.min(
            b.pricing.softcopy.available ? b.pricing.softcopy.price : Infinity,
            b.pricing.paperback.available ? b.pricing.paperback.price : Infinity
          );
          return aPrice - bPrice;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const aPrice = Math.max(
            a.pricing.softcopy.available ? a.pricing.softcopy.price : 0,
            a.pricing.paperback.available ? a.pricing.paperback.price : 0
          );
          const bPrice = Math.max(
            b.pricing.softcopy.available ? b.pricing.softcopy.price : 0,
            b.pricing.paperback.available ? b.pricing.paperback.price : 0
          );
          return bPrice - aPrice;
        });
        break;
      case "rating":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    categoryFilter,
    ageFilter,
    priceFilter,
    formatFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setAgeFilter("all");
    setPriceFilter("all");
    setFormatFilter("all");
    setSortBy("featured");
  };

  const handleAddToCart = async (
    e: React.MouseEvent,
    productId: string,
    orderType: "softcopy" | "paperback"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingCart(productId);
    try {
      // Handle guest users with localStorage
      if (!session) {
        // Find the product to get all details
        const product = products.find((p) => p._id === productId);
        if (!product) {
          toast.error("Product not found");
          return;
        }

        const unitPrice =
          orderType === "softcopy"
            ? product.pricing.softcopy.price
            : product.pricing.paperback.price;

        const guestCart = JSON.parse(
          localStorage.getItem("guest_cart") ||
            '{"items":[], "subtotal": 0, "discount": 0, "total": 0}'
        );
        const existingItemIndex = guestCart.items.findIndex(
          (item: { productId: string; orderType: string }) =>
            item.productId === productId && item.orderType === orderType
        );

        if (existingItemIndex !== -1) {
          guestCart.items[existingItemIndex].quantity += 1;
        } else {
          guestCart.items.push({
            productId,
            productTitle: product.title,
            productSlug: product.slug,
            productThumbnail: product.thumbnail,
            author: product.author,
            orderType,
            unitPrice,
            quantity: 1,
            addedAt: new Date().toISOString(),
          });
        }

        // Recalculate totals
        guestCart.subtotal = guestCart.items.reduce(
          (sum: number, item: CartItem) => sum + item.unitPrice * item.quantity,
          0
        );
        guestCart.total = guestCart.subtotal - (guestCart.discount || 0);

        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        // Handle authenticated users with API
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, orderType, quantity: 1 }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success("Added to cart!");
          window.dispatchEvent(new Event("cart-updated"));
        } else {
          toast.error(data.error || "Failed to add to cart");
        }
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setLoadingCart(null);
    }
  };

  const handleToggleWishlist = async (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingWishlist(productId);
    const isInWishlist = wishlistItems.has(productId);

    try {
      // Handle guest users with localStorage
      if (!session) {
        const guestWishlist = JSON.parse(
          localStorage.getItem("guest_wishlist") || '{"items":[]}'
        );

        if (isInWishlist) {
          guestWishlist.items = guestWishlist.items.filter(
            (item: CartItem) => item.productId !== productId
          );
          localStorage.setItem("guest_wishlist", JSON.stringify(guestWishlist));
          setWishlistItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          toast.success("Removed from wishlist");
        } else {
          // Find the product to get all details
          const product = products.find((p) => p._id === productId);
          if (!product) {
            toast.error("Product not found");
            return;
          }

          guestWishlist.items.push({
            productId,
            productTitle: product.title,
            productSlug: product.slug,
            productThumbnail: product.thumbnail,
            author: product.author,
            softcopyPrice: product.pricing.softcopy.available
              ? product.pricing.softcopy.price
              : undefined,
            paperbackPrice: product.pricing.paperback.available
              ? product.pricing.paperback.price
              : undefined,
            addedAt: new Date().toISOString(),
          });
          localStorage.setItem("guest_wishlist", JSON.stringify(guestWishlist));
          setWishlistItems((prev) => new Set(prev).add(productId));
          toast.success("Added to wishlist!");
        }
        window.dispatchEvent(new Event("wishlist-updated"));
      } else {
        // Handle authenticated users with API
        if (isInWishlist) {
          const response = await fetch(`/api/wishlist?productId=${productId}`, {
            method: "DELETE",
          });
          const data = await response.json();
          if (data.success) {
            setWishlistItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
            toast.success("Removed from wishlist");
            window.dispatchEvent(new Event("wishlist-updated"));
          }
        } else {
          const response = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          const data = await response.json();
          if (data.success) {
            setWishlistItems((prev) => new Set(prev).add(productId));
            toast.success("Added to wishlist!");
            window.dispatchEvent(new Event("wishlist-updated"));
          }
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setLoadingWishlist(null);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== "all" ||
    ageFilter !== "all" ||
    priceFilter !== "all" ||
    formatFilter !== "all";

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className=" p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 ">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#90AC19]/25 focus:border-[#90AC19]"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 py-3 border border-gray-300 bg-white rounded-full pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#90AC19]/25 focus:border-[#90AC19]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-full text-sm transition-colors ${
              showFilters
                ? "bg-[#90AC19] text-white border-[#90AC19]"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#90AC19]/25 focus:border-[#90AC19]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#90AC19]/25 focus:border-[#90AC19]"
              >
                {ageRanges.map((age) => (
                  <option key={age.value} value={age.value}>
                    {age.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#90AC19]/25 focus:border-[#90AC19]"
              >
                {priceRanges.map((price) => (
                  <option key={price.value} value={price.value}>
                    {price.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={formatFilter}
                onChange={(e) =>
                  setFormatFilter(e.target.value as typeof formatFilter)
                }
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#90AC19]/25 focus:border-[#90AC19]"
              >
                <option value="all">All Formats</option>
                <option value="softcopy">PDF Only</option>
                <option value="paperback">Paperback Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-[#90AC19]/10 text-[#90AC19] text-sm px-3 py-1 rounded-full">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#90AC19]/10 text-[#90AC19] text-sm px-3 py-1 rounded-full">
                {categories.find((c) => c.value === categoryFilter)?.label}
                <button onClick={() => setCategoryFilter("all")}>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {ageFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#E8931A]/10 text-[#E8931A] text-sm px-3 py-1 rounded-full">
                {ageRanges.find((a) => a.value === ageFilter)?.label}
                <button onClick={() => setAgeFilter("all")}>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 text-gray-600">
        Showing {filteredProducts.length} of {products.length} books
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
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
            No books found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={clearFilters}
            className="text-[#90AC19] hover:text-[#7A9216] font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 px-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              <Link
                href={`/products/${product.slug}`}
                className="block lg:flex lg:items-stretch"
              >
                {/* Book Cover */}
                <div className="relative h-80 border-b border-gray-100 bg-gray-50 lg:h-auto lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
                  {product.thumbnail ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        priority={false}
                        quality={85}
                        sizes="
            (max-width: 640px) 90vw,
            (max-width: 1024px) 45vw,
            (max-width: 1280px) 30vw,
            300px
          "
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <svg
                        className="w-16 h-16 text-gray-400"
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
                  )}
                  {product.featured && (
                    <div className="absolute right-3 top-3 rounded-full bg-[#E8931A] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Featured
                    </div>
                  )}
                  {/* Format badges */}
                  {/* <div className="absolute bottom-3 left-3 flex gap-1">
                    {product.pricing.softcopy.available && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        PDF
                      </span>
                    )}
                    {product.pricing.paperback.available && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        HardCover
                      </span>
                    )}
                  </div> */}
                </div>

                {/* Book Details */}
                <div className="flex flex-1 flex-col p-4 lg:p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-[#90AC19]/10 px-2.5 py-1 text-xs font-medium text-[#90AC19]">
                      {product.ageRange}
                    </span>
                    {/* {product?.averageRating && product?.averageRating > 0 && (
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <StarIcon className="w-4 h-4 text-black " />
                        {product.averageRating.toFixed(1)}
                      </span>
                    )} */}
                  </div>

                  <h3 className="mb-1 line-clamp-2 text-lg font-semibold leading-7 text-gray-900 transition-colors group-hover:text-[#90AC19]">
                    {product.title}
                  </h3>

                  <p className="mb-2 text-sm text-gray-500">
                    by {product.author}
                  </p>

                  <p className="mb-3 line-clamp-3 text-sm text-gray-600">
                    {product.shortDescription}
                  </p>

                  {/* Pricing */}
                  <div className="space-y-2 border-t border-gray-100 pt-3 lg:max-w-sm">
                    {product.pricing.softcopy.available && (
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
                        <span className="text-xs font-medium text-gray-600">
                          PDF
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          ₦{product.pricing.softcopy.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {product.pricing.paperback.available && (
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
                        <span className="text-xs font-medium text-gray-600">
                          Paperback:
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          ₦{product.pricing.paperback.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex gap-2 px-4 pb-4 pt-1">
                {/* Add to Cart Dropdown */}
                {(product.pricing.softcopy.available ||
                  product.pricing.paperback.available) && (
                  <div className="dropdown dropdown-top flex-1">
                    <button
                      tabIndex={0}
                      className="btn btn-sm w-full gap-2 border-none bg-gray-900 text-white hover:bg-gray-800"
                      disabled={loadingCart === product._id}
                    >
                      {loadingCart === product._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <ShoppingCartIcon className="w-4 h-4" />
                      )}
                      Add to Cart
                    </button>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52 mb-2"
                    >
                      {product.pricing.softcopy.available && (
                        <li>
                          <button
                            onClick={(e) =>
                              handleAddToCart(e, product._id, "softcopy")
                            }
                          >
                            <span>
                              PDF - ₦
                              {product.pricing.softcopy.price.toLocaleString()}
                            </span>
                          </button>
                        </li>
                      )}
                      {product.pricing.paperback.available && (
                        <li>
                          <button
                            onClick={(e) =>
                              handleAddToCart(e, product._id, "paperback")
                            }
                          >
                            <span>
                              Paperback - ₦
                              {product.pricing.paperback.price.toLocaleString()}
                            </span>
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleToggleWishlist(e, product._id)}
                  disabled={loadingWishlist === product._id}
                  className="btn btn-sm border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  title={
                    wishlistItems.has(product._id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  {loadingWishlist === product._id ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : wishlistItems.has(product._id) ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
