import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import ProductRepository from "@/lib/ProductRepository";
import { ProductInterface } from "@/models/Product";

// GET /api/products - Get all products (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured");
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit");

    const filters: {
      status?: string;
      category?: string;
      featured?: boolean;
      search?: string;
    } = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (featured) filters.featured = featured === "true";
    if (search) filters.search = search;

    let products = await ProductRepository.getAllProducts(filters);

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        products = products.slice(0, limitNum);
      }
    }

    // Convert ObjectIds to strings for client
    const serializedProducts = products.map((product) => ({
      ...product,
      _id: product._id?.toString(),
      publishedDate: product.publishedDate?.toISOString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      publishedAt: product.publishedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      products: serializedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    // You can add admin role check here
    // if (session.user.role !== 'admin') { ... }

    const body = await request.json();

    // Generate slug from title
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const productData: Omit<
      ProductInterface,
      "_id" | "createdAt" | "updatedAt"
    > = {
      title: body.title,
      slug,
      description: body.description,
      shortDescription: body.shortDescription || "",
      author: body.author,
      category: body.category,
      ageRange: body.ageRange,
      thumbnail: body.thumbnail,
      images: body.images || [],
      pricing: {
        softcopy: {
          price: body.softcopyPrice || 3000,
          currency: "NGN",
          available: body.softcopyAvailable ?? true,
        },
        paperback: {
          price: body.paperbackPrice || 5000,
          currency: "NGN",
          available: body.paperbackAvailable ?? true,
          deliveryDays: body.paperbackDeliveryDays || 2,
        },
      },
      pdfFile: body.pdfFile,
      pageCount: body.pageCount,
      isbn: body.isbn,
      publishedDate: body.publishedDate
        ? new Date(body.publishedDate)
        : undefined,
      language: body.language || "English",
      stock: {
        softcopy: 999999, // Unlimited for digital
        paperback: body.paperbackStock || 0,
      },
      features: body.features || [],
      tags: body.tags || [],
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      keywords: body.keywords || [],
      status: body.status || "draft",
      featured: body.featured || false,
    };

    const newProduct = await ProductRepository.createProduct(productData);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newProduct,
          _id: newProduct._id?.toString(),
          createdAt: newProduct.createdAt.toISOString(),
          updatedAt: newProduct.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
