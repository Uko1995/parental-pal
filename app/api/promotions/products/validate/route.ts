import { NextRequest, NextResponse } from "next/server";
import ProductRepository from "@/lib/ProductRepository";
import {
  BDG_SOFTCOPY_UNIT_PRICE,
  validateBdgPromoApplication,
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

    const validation = validateBdgPromoApplication({
      promoCode: code,
      orderType,
      productCategory: product.category,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        unitPrice: BDG_SOFTCOPY_UNIT_PRICE,
        message: "Promo applied.",
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
