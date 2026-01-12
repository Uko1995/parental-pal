import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import CartRepository from "@/lib/CartRepository";
import ProductRepository from "@/lib/ProductRepository";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to view your cart" },
        { status: 401 }
      );
    }

    const cart = await CartRepository.getOrCreateCart(session.user.id);
    const totals = CartRepository.calculateTotals(cart);

    // Serialize for client
    const serializedCart = {
      _id: cart._id?.toString(),
      userId: cart.userId.toString(),
      items: cart.items.map((item) => ({
        ...item,
        productId: item.productId.toString(),
        addedAt: item.addedAt.toISOString(),
      })),
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      couponType: cart.couponType,
      ...totals,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedCart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to add items to cart" },
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
        { success: false, error: "Softcopy is not available for this product" },
        { status: 400 }
      );
    }

    if (body.orderType === "paperback") {
      if (!product.pricing.paperback.available) {
        return NextResponse.json(
          {
            success: false,
            error: "Paperback is not available for this product",
          },
          { status: 400 }
        );
      }
      if (product.stock.paperback <= 0) {
        return NextResponse.json(
          { success: false, error: "Paperback is out of stock" },
          { status: 400 }
        );
      }
    }

    const price =
      body.orderType === "softcopy"
        ? product.pricing.softcopy.price
        : product.pricing.paperback.price;

    const cartItem = {
      productId: new ObjectId(body.productId),
      productTitle: product.title,
      productSlug: product.slug,
      productThumbnail: product.thumbnail,
      author: product.author,
      orderType: body.orderType as "softcopy" | "paperback",
      unitPrice: price,
      quantity: body.quantity || 1,
    };

    const cart = await CartRepository.addItem(session.user.id, cartItem);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Failed to add item to cart" },
        { status: 500 }
      );
    }

    const totals = CartRepository.calculateTotals(cart);

    const serializedCart = {
      _id: cart._id?.toString(),
      userId: cart.userId.toString(),
      items: cart.items.map((item) => ({
        ...item,
        productId: item.productId.toString(),
        addedAt: item.addedAt.toISOString(),
      })),
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      couponType: cart.couponType,
      ...totals,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };

    // Invalidate cart cache immediately
    revalidateTag(CACHE_TAGS.CART);

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      data: serializedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to update cart" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productId || !body.orderType || body.quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID, order type, and quantity are required",
        },
        { status: 400 }
      );
    }

    const cart = await CartRepository.updateItemQuantity(
      session.user.id,
      body.productId,
      body.orderType,
      body.quantity
    );

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Failed to update cart" },
        { status: 500 }
      );
    }

    const totals = CartRepository.calculateTotals(cart);

    const serializedCart = {
      _id: cart._id?.toString(),
      userId: cart.userId.toString(),
      items: cart.items.map((item) => ({
        ...item,
        productId: item.productId.toString(),
        addedAt: item.addedAt.toISOString(),
      })),
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      couponType: cart.couponType,
      ...totals,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };

    // Invalidate cart cache immediately
    revalidateTag(CACHE_TAGS.CART);

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      data: serializedCart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to modify cart" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // If productId is provided, remove specific item
    if (body.productId && body.orderType) {
      const cart = await CartRepository.removeItem(
        session.user.id,
        body.productId,
        body.orderType
      );

      if (!cart) {
        return NextResponse.json(
          { success: false, error: "Failed to remove item" },
          { status: 500 }
        );
      }

      const totals = CartRepository.calculateTotals(cart);

      const serializedCart = {
        _id: cart._id?.toString(),
        userId: cart.userId.toString(),
        items: cart.items.map((item) => ({
          ...item,
          productId: item.productId.toString(),
          addedAt: item.addedAt.toISOString(),
        })),
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        couponType: cart.couponType,
        ...totals,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      // Invalidate cart cache immediately
      revalidateTag(CACHE_TAGS.CART);

      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
        data: serializedCart,
      });
    }

    // Clear entire cart
    const cleared = await CartRepository.clearCart(session.user.id);
    if (!cleared) {
      return NextResponse.json(
        { success: false, error: "Failed to clear cart" },
        { status: 500 }
      );
    }

    // Invalidate cart cache immediately
    revalidateTag(CACHE_TAGS.CART);

    return NextResponse.json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Error modifying cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to modify cart" },
      { status: 500 }
    );
  }
}
