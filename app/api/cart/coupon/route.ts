import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import CartRepository from "@/lib/CartRepository";
import CouponRepository from "@/lib/CouponRepository";
import ProductRepository from "@/lib/ProductRepository";
import {
  BDG_SOFTCOPY_UNIT_PRICE,
  getCartPromoDisplay,
  isBdgEligibleCategory,
  isBdgPromoCode,
} from "@/lib/product-promotions";
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

    const code = String(body.code).trim().toUpperCase();

    if (isBdgPromoCode(code)) {
      let hasEligibleItem = false;

      for (const item of cart.items) {
        const product = await ProductRepository.getProductById(item.productId);
        if (
          item.orderType === "softcopy" &&
          product &&
          isBdgEligibleCategory(product.category)
        ) {
          hasEligibleItem = true;
          break;
        }
      }

      if (!hasEligibleItem) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This promo applies to softcopy story books in your cart only.",
          },
          { status: 400 },
        );
      }

      const updatedCart = await CartRepository.applyCoupon(
        session.user.id,
        code,
        BDG_SOFTCOPY_UNIT_PRICE,
        "fixed",
      );

      if (!updatedCart) {
        return NextResponse.json(
          { success: false, error: "Failed to apply promo" },
          { status: 500 },
        );
      }

      const totals = CartRepository.calculateTotals(updatedCart);
      const promoDisplay = getCartPromoDisplay(code);

      revalidateTag(CACHE_TAGS.CART);

      return NextResponse.json({
        success: true,
        message: promoDisplay.promoMessage,
        data: {
          discountType: "fixed",
          discountValue: BDG_SOFTCOPY_UNIT_PRICE,
          discountAmount: totals.discount,
          ...promoDisplay,
          ...totals,
        },
      });
    }

    const validation = await CouponRepository.validateCoupon(
      body.code,
      session.user.id,
      cart,
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const updatedCart = await CartRepository.applyCoupon(
      session.user.id,
      validation.coupon!.code,
      validation.coupon!.discountValue,
      validation.coupon!.discountType,
    );

    if (!updatedCart) {
      return NextResponse.json(
        { success: false, error: "Failed to apply coupon" },
        { status: 500 },
      );
    }

    const totals = CartRepository.calculateTotals(updatedCart);
    const promoDisplay = getCartPromoDisplay(validation.coupon!.code);

    revalidateTag(CACHE_TAGS.CART);

    return NextResponse.json({
      success: true,
      message: `Coupon applied! You save ₦${validation.discountAmount?.toLocaleString()}`,
      data: {
        couponCode: validation.coupon!.code,
        discountType: validation.coupon!.discountType,
        discountValue: validation.coupon!.discountValue,
        discountAmount: validation.discountAmount,
        ...promoDisplay,
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
