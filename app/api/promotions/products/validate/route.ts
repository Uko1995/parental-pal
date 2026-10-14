import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import ProductRepository from "@/lib/ProductRepository";
import { findAutoPromotionForPurchase } from "@/lib/product-auto-promotions";
import {
  GH2026_PROMO_APPLIED_MESSAGE,
  isGh2026PromoCode,
  resolveProductUnitPrice,
  validateSubmittedProductPromo,
} from "@/lib/product-promotions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim();
    const orderType = body?.orderType as "softcopy" | "paperback" | undefined;
    const productId = body?.productId as string | undefined;

    // No code: report the best automatic promo (admin dashboard) for this purchase.
    if (!code && body?.auto === true && orderType && productId) {
      const product = await ProductRepository.getProductById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found." },
          { status: 404 },
        );
      }
      const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));
      const unitPrice =
        orderType === "softcopy"
          ? product.pricing.softcopy.price
          : product.pricing.paperback.price;
      const session = await auth();
      const autoPromotion = await findAutoPromotionForPurchase({
        product,
        orderType,
        unitPrice,
        quantity,
        userId: session?.user?.id ?? null,
      });
      return NextResponse.json({
        success: true,
        data: {
          autoPromotion: autoPromotion
            ? {
                label: autoPromotion.label,
                discountAmount: autoPromotion.discountAmount,
              }
            : null,
        },
      });
    }

    if (!code || !orderType || !productId) {
      return NextResponse.json(
        { success: false, error: "Promo code, format, and product are required." },
        { status: 400 },
      );
    }

    const product = await ProductRepository.getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 },
      );
    }

    const validation = validateSubmittedProductPromo({
      promoCode: code,
      orderType,
      productCategory: product.category,
      productSlug: product.slug,
      productTitle: product.title,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const unitPrice = resolveProductUnitPrice({
      orderType,
      productCategory: product.category,
      productSlug: product.slug,
      productTitle: product.title,
      listSoftcopyPrice: product.pricing.softcopy.price,
      listPaperbackPrice: product.pricing.paperback.price,
      promoCode: code,
    });

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        unitPrice,
        message: isGh2026PromoCode(code)
          ? GH2026_PROMO_APPLIED_MESSAGE
          : "Promo applied.",
      },
    });
  } catch (error) {
    console.error("Product promo validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate promo code." },
      { status: 500 },
    );
  }
}
