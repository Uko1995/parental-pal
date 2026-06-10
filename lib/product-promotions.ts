import type { ProductCategory } from "@/types/product";

const BDG_PROMO_CODE = "BDG";
export const BDG_SOFTCOPY_UNIT_PRICE = 1000;

export function normalizeProductPromoCode(code?: string | null): string {
  return (code || "").trim().toUpperCase();
}

export function isBdgPromoCode(code?: string | null): boolean {
  return normalizeProductPromoCode(code) === BDG_PROMO_CODE;
}

export function isBdgEligibleCategory(
  category: string | undefined,
): category is ProductCategory {
  return category === "storybook";
}

export function validateBdgPromoApplication({
  promoCode,
  orderType,
  productCategory,
}: {
  promoCode?: string | null;
  orderType: "softcopy" | "paperback";
  productCategory: string | undefined;
}): { valid: boolean; error?: string } {
  if (!isBdgPromoCode(promoCode)) {
    return { valid: false, error: "Invalid promo code." };
  }

  if (orderType !== "softcopy") {
    return {
      valid: false,
      error: "This promo code is valid for softcopy story books only.",
    };
  }

  if (!isBdgEligibleCategory(productCategory)) {
    return {
      valid: false,
      error: "This promo code does not apply to this product.",
    };
  }

  return { valid: true };
}

export function resolveProductUnitPrice({
  orderType,
  productCategory,
  listSoftcopyPrice,
  listPaperbackPrice,
  promoCode,
}: {
  orderType: "softcopy" | "paperback";
  productCategory: string | undefined;
  listSoftcopyPrice: number;
  listPaperbackPrice: number;
  promoCode?: string | null;
}): number {
  if (orderType === "softcopy") {
    const validation = validateBdgPromoApplication({
      promoCode,
      orderType,
      productCategory,
    });
    if (validation.valid) {
      return BDG_SOFTCOPY_UNIT_PRICE;
    }
    return listSoftcopyPrice;
  }

  return listPaperbackPrice;
}

export function getEffectiveCartItemUnitPrice(
  item: {
    orderType: "softcopy" | "paperback";
    unitPrice: number;
    productCategory?: string;
  },
  promoCode?: string | null,
): number {
  return resolveProductUnitPrice({
    orderType: item.orderType,
    productCategory: item.productCategory,
    listSoftcopyPrice: item.unitPrice,
    listPaperbackPrice: item.unitPrice,
    promoCode,
  });
}

export const BDG_PROMO_APPLIED_MESSAGE =
  "Promo applied — softcopy story books at ₦1,000 each";

export function getCartPromoDisplay(couponCode?: string | null): {
  promoApplied: boolean;
  promoMessage?: string;
  showCouponCode: boolean;
} {
  if (isBdgPromoCode(couponCode)) {
    return {
      promoApplied: true,
      promoMessage: BDG_PROMO_APPLIED_MESSAGE,
      showCouponCode: false,
    };
  }

  return {
    promoApplied: Boolean(couponCode),
    showCouponCode: Boolean(couponCode),
  };
}
