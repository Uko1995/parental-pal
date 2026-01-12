import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import ProductRepository from "@/lib/ProductRepository";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await ProductRepository.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await ProductRepository.incrementViewCount(id);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        _id: product._id?.toString(),
        publishedDate: product.publishedDate?.toISOString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        publishedAt: product.publishedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update a product (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.title) updateData.title = body.title;
    if (body.slug) updateData.slug = body.slug;
    if (body.description) updateData.description = body.description;
    if (body.shortDescription !== undefined)
      updateData.shortDescription = body.shortDescription;
    if (body.author) updateData.author = body.author;
    if (body.category) updateData.category = body.category;
    if (body.ageRange) updateData.ageRange = body.ageRange;
    if (body.thumbnail) updateData.thumbnail = body.thumbnail;
    if (body.images) updateData.images = body.images;
    if (body.pdfFile) updateData.pdfFile = body.pdfFile;
    if (body.pageCount !== undefined || body.pages !== undefined) {
      updateData.pageCount = body.pageCount ?? body.pages;
    }
    if (body.isbn) updateData.isbn = body.isbn;
    if (body.publishedDate)
      updateData.publishedDate = new Date(body.publishedDate);
    if (body.language) updateData.language = body.language;
    if (body.features) updateData.features = body.features;
    if (body.tags) updateData.tags = body.tags;
    if (body.metaTitle) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription) updateData.metaDescription = body.metaDescription;
    if (body.keywords) updateData.keywords = body.keywords;
    if (body.status) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;

    // Update pricing - handle both nested and flat formats
    if (body.pricing) {
      // Nested format from frontend
      if (body.pricing.softcopy) {
        if (body.pricing.softcopy.price !== undefined)
          updateData["pricing.softcopy.price"] = body.pricing.softcopy.price;
        if (body.pricing.softcopy.available !== undefined)
          updateData["pricing.softcopy.available"] =
            body.pricing.softcopy.available;
      }
      if (body.pricing.paperback) {
        if (body.pricing.paperback.price !== undefined)
          updateData["pricing.paperback.price"] = body.pricing.paperback.price;
        if (body.pricing.paperback.available !== undefined)
          updateData["pricing.paperback.available"] =
            body.pricing.paperback.available;
        if (body.pricing.paperback.deliveryDays !== undefined)
          updateData["pricing.paperback.deliveryDays"] =
            body.pricing.paperback.deliveryDays;
      }
    } else {
      // Flat format fallback
      if (
        body.softcopyPrice !== undefined ||
        body.softcopyAvailable !== undefined
      ) {
        if (body.softcopyPrice !== undefined)
          updateData["pricing.softcopy.price"] = body.softcopyPrice;
        if (body.softcopyAvailable !== undefined)
          updateData["pricing.softcopy.available"] = body.softcopyAvailable;
      }

      if (
        body.paperbackPrice !== undefined ||
        body.paperbackAvailable !== undefined ||
        body.paperbackDeliveryDays !== undefined
      ) {
        if (body.paperbackPrice !== undefined)
          updateData["pricing.paperback.price"] = body.paperbackPrice;
        if (body.paperbackAvailable !== undefined)
          updateData["pricing.paperback.available"] = body.paperbackAvailable;
        if (body.paperbackDeliveryDays !== undefined)
          updateData["pricing.paperback.deliveryDays"] =
            body.paperbackDeliveryDays;
      }
    }

    // Update stock - handle both nested and flat formats
    if (body.stock) {
      // Nested format from frontend
      if (body.stock.paperback !== undefined) {
        updateData["stock.paperback"] = body.stock.paperback;
      }
      if (body.stock.lowStockThreshold !== undefined) {
        updateData["stock.lowStockThreshold"] = body.stock.lowStockThreshold;
      }
    } else if (body.paperbackStock !== undefined) {
      // Flat format fallback
      updateData["stock.paperback"] = body.paperbackStock;
    }

    const updatedProduct = await ProductRepository.updateProduct(
      id,
      updateData
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.PRODUCTS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProduct,
        _id: updatedProduct._id?.toString(),
        publishedDate: updatedProduct.publishedDate?.toISOString(),
        createdAt: updatedProduct.createdAt.toISOString(),
        updatedAt: updatedProduct.updatedAt.toISOString(),
        publishedAt: updatedProduct.publishedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await ProductRepository.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.PRODUCTS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
