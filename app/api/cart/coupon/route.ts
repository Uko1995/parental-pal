import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import CartRepository from "@/lib/CartRepository";
import CouponRepository from "@/lib/CouponRepository";
import { CACHE_TAGS } from "@/lib/cache-config";

// POST /api/cart/coupon - Apply coupon to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to apply coupon" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await CartRepository.getOrCreateCart(session.user.id);

    if (cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Validate coupon
    const validation = await CouponRepository.validateCoupon(
      body.code,
      session.user.id,
      cart
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Apply coupon to cart
    const updatedCart = await CartRepository.applyCoupon(
      session.user.id,
      validation.coupon!.code,
      validation.coupon!.discountValue,
      validation.coupon!.discountType
    );

    if (!updatedCart) {
      return NextResponse.json(
        { success: false, error: "Failed to apply coupon" },
        { status: 500 }
      );
    }

    const totals = CartRepository.calculateTotals(updatedCart);

    // Invalidate cart cache immediately
    revalidateTag(CACHE_TAGS.CART);

    return NextResponse.json({
      success: true,
      message: `Coupon applied! You save ₦${validation.discountAmount?.toLocaleString()}`,
      data: {
        couponCode: validation.coupon!.code,
        discountType: validation.coupon!.discountType,
        discountValue: validation.coupon!.discountValue,
        discountAmount: validation.discountAmount,
        ...totals,
      },
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/coupon - Remove coupon from cart
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to remove coupon" },
        { status: 401 }
      );
    }

    const cart = await CartRepository.removeCoupon(session.user.id);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Failed to remove coupon" },
        { status: 500 }
      );
    }

    const totals = CartRepository.calculateTotals(cart);

    // Invalidate cart cache immediately
    revalidateTag(CACHE_TAGS.CART);

    return NextResponse.json({
      success: true,
      message: "Coupon removed",
      data: totals,
    });
  } catch (error) {
    console.error("Error removing coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove coupon" },
      { status: 500 }
    );
  }
}
