import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import WishlistRepository from "@/lib/WishlistRepository";
import CartRepository from "@/lib/CartRepository";
import ProductRepository from "@/lib/ProductRepository";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// POST /api/wishlist/move-to-cart - Move item from wishlist to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productId || !body.orderType) {
      return NextResponse.json(
        { success: false, error: "Product ID and order type are required" },
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

    if (product.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Product is not available" },
        { status: 400 }
      );
    }

    // Check availability
    if (body.orderType === "softcopy" && !product.pricing.softcopy.available) {
      return NextResponse.json(
        { success: false, error: "Softcopy is not available" },
        { status: 400 }
      );
    }

    if (body.orderType === "paperback") {
      if (
        !product.pricing.paperback.available ||
        product.stock.paperback <= 0
      ) {
        return NextResponse.json(
          { success: false, error: "Paperback is not available" },
          { status: 400 }
        );
      }
    }

    const price =
      body.orderType === "softcopy"
        ? product.pricing.softcopy.price
        : product.pricing.paperback.price;

    // Add to cart
    const cartItem = {
      productId: new ObjectId(body.productId),
      productTitle: product.title,
      productSlug: product.slug,
      productThumbnail: product.thumbnail,
      author: product.author,
      orderType: body.orderType as "softcopy" | "paperback",
      unitPrice: price,
      quantity: 1,
    };

    await CartRepository.addItem(session.user.id, cartItem);

    // Remove from wishlist
    await WishlistRepository.removeItem(session.user.id, body.productId);

    // Invalidate cart and wishlist caches immediately
    revalidateTag(CACHE_TAGS.CART);
    revalidateTag(CACHE_TAGS.WISHLIST);

    return NextResponse.json({
      success: true,
      message: "Item moved to cart",
    });
  } catch (error) {
    console.error("Error moving to cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to move item to cart" },
      { status: 500 }
    );
  }
}
