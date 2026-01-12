import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import WishlistRepository from "@/lib/WishlistRepository";
import ProductRepository from "@/lib/ProductRepository";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/wishlist - Get user's wishlist
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to view your wishlist" },
        { status: 401 }
      );
    }

    const wishlist = await WishlistRepository.getOrCreateWishlist(
      session.user.id
    );

    // Get product details for each item to include pricing
    const itemsWithPricing = await Promise.all(
      wishlist.items.map(async (item) => {
        const product = await ProductRepository.getProductById(item.productId);
        return {
          ...item,
          productId: item.productId.toString(),
          addedAt: item.addedAt.toISOString(),
          pricing: product?.pricing,
          stock: product?.stock,
          status: product?.status,
        };
      })
    );

    const serializedWishlist = {
      _id: wishlist._id?.toString(),
      userId: wishlist.userId.toString(),
      items: itemsWithPricing,
      createdAt: wishlist.createdAt.toISOString(),
      updatedAt: wishlist.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedWishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to add items to wishlist" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product details
    const product = await ProductRepository.getProductById(body.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const wishlistItem = {
      productId: new ObjectId(body.productId),
      productTitle: product.title,
      productSlug: product.slug,
      productThumbnail: product.thumbnail,
      author: product.author,
    };

    const wishlist = await WishlistRepository.addItem(
      session.user.id,
      wishlistItem
    );

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: "Failed to add item to wishlist" },
        { status: 500 }
      );
    }

    // Invalidate wishlist cache immediately
    revalidateTag(CACHE_TAGS.WISHLIST);

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
      itemCount: wishlist.items.length,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to modify wishlist" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const wishlist = await WishlistRepository.removeItem(
      session.user.id,
      body.productId
    );

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: "Failed to remove item" },
        { status: 500 }
      );
    }

    // Invalidate wishlist cache immediately
    revalidateTag(CACHE_TAGS.WISHLIST);

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
      itemCount: wishlist.items.length,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
