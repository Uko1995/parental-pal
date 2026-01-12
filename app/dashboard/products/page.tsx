"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpenIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ProductsTable from "./ProductsTable";
import ProductsCharts from "./ProductsCharts";
import AddProductModal from "./AddProductModal";
import ViewProductModal from "./ViewProductModal";

interface Product {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: "storybook" | "educational" | "activity-book" | "coloring-book";
  ageRange: string;
  description: string;
  thumbnail: string; // Cloudinary URL
  images: string[]; // Array of Cloudinary URLs
  pdfFile?: {
    cloudinaryId: string;
    cloudinaryUrl: string;
    fileName?: string;
    fileSize?: number;
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
  stock: {
    paperback: number;
    lowStockThreshold: number;
  };
  pages: number;
  language: string;
  isbn: string;
  features: string[];
  status: "active" | "draft" | "archived";
  featured: boolean;
  metrics?: {
    viewCount?: number;
    totalSales?: number;
    totalRevenue?: number;
    lastSaleDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProductsStats {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalSales: number;
  lowStockCount: number;
  outOfStockCount: number;
  featuredCount: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductsStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalRevenue: 0,
    totalSales: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    featuredCount: 0,
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products?includeAll=true");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        calculateStats(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const calculateStats = (productsData: Product[]) => {
    const totalRevenue = productsData.reduce(
      (sum, product) => sum + (product.metrics?.totalRevenue || 0),
      0
    );
    const totalSales = productsData.reduce(
      (sum, product) => sum + (product.metrics?.totalSales || 0),
      0
    );
    const activeProducts = productsData.filter(
      (p) => p.status === "active"
    ).length;
    const lowStockCount = productsData.filter(
      (p) =>
        p.stock.paperback > 0 && p.stock.paperback <= p.stock.lowStockThreshold
    ).length;
    const outOfStockCount = productsData.filter(
      (p) => p.stock.paperback === 0
    ).length;
    const featuredCount = productsData.filter((p) => p.featured).length;

    const categoryMap = new Map<string, { count: number; revenue: number }>();
    productsData.forEach((product) => {
      const existing = categoryMap.get(product.category) || {
        count: 0,
        revenue: 0,
      };
      categoryMap.set(product.category, {
        count: existing.count + 1,
        revenue: existing.revenue + (product.metrics?.totalRevenue || 0),
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        ...data,
      })
    );

    setStats({
      totalProducts: productsData.length,
      activeProducts,
      totalRevenue,
      totalSales,
      lowStockCount,
      outOfStockCount,
      featuredCount,
      categoryBreakdown,
    });
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleAddProductSuccess = () => {
    fetchProducts();
    setIsAddModalOpen(false);
  };

  const handleUpdateProduct = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-base-300 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-base-300 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-base-300 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-base-300 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-base-300 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-base-300 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-base-300 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="h-6 w-40 bg-base-300 rounded animate-pulse mb-4"></div>
                <div className="h-64 bg-base-300 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-32 bg-base-300 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-base-300 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-base-300 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold">Products Management</h1>
          <p className="text-base-content/70 mt-1">
            Manage children&apos;s story books and educational materials
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Total Products</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats.totalProducts}
                </h3>
                <p className="text-sm text-success mt-1">
                  {stats.activeProducts} active
                </p>
              </div>
              <BookOpenIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-1">
                  ₦{stats.totalRevenue.toLocaleString()}
                </h3>
                <p className="text-sm text-base-content/70 mt-1">
                  {stats.totalSales} sales
                </p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-success" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Stock Alerts</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats.lowStockCount + stats.outOfStockCount}
                </h3>
                <p className="text-sm text-warning mt-1">
                  {stats.lowStockCount} low, {stats.outOfStockCount} out
                </p>
              </div>
              <EyeIcon className="w-12 h-12 text-warning" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/70 text-sm">Featured</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats.featuredCount}
                </h3>
                <p className="text-sm text-base-content/70 mt-1">
                  products highlighted
                </p>
              </div>
              <BookOpenIcon className="w-12 h-12 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <ProductsCharts products={products} stats={stats} />

      {/* Products Table */}
      <ProductsTable
        products={products}
        onViewProduct={handleViewProduct}
        onUpdateProduct={handleUpdateProduct}
      />

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />

      {selectedProduct && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
}
