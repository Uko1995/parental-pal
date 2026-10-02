import { NextRequest, NextResponse } from "next/server";
import ProductRepository from "@/lib/ProductRepository";
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
