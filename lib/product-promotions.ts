import type { ProductCategory } from "@/types/product";

const BDG_PROMO_CODE = "BDG";
export const BDG_SOFTCOPY_UNIT_PRICE = 1000;

const GH2026_PROMO_CODE = "GH2026";
export const GH2026_SOFTCOPY_UNIT_PRICE = 3000;

const GIRLS_HANGOUT_2026_SLUG = "girls-hangout-2026";
const GIRLS_HANGOUT_2026_TITLE = "girls hangout 2026";

export type ProductOrderType = "softcopy" | "paperback";

export function normalizeProductPromoCode(code?: string | null): string {
  return (code || "").trim().toUpperCase();
}

export function isBdgPromoCode(code?: string | null): boolean {
  return normalizeProductPromoCode(code) === BDG_PROMO_CODE;
}

export function isGh2026PromoCode(code?: string | null): boolean {
  return normalizeProductPromoCode(code) === GH2026_PROMO_CODE;
}

export function isBuiltInProductPromoCode(code?: string | null): boolean {
  return isBdgPromoCode(code) || isGh2026PromoCode(code);
}

export function isGirlsHangout2026Product(product: {
  slug?: string | null;
  title?: string | null;
}): boolean {
  const slug = (product.slug || "").trim().toLowerCase();
  const title = (product.title || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return slug === GIRLS_HANGOUT_2026_SLUG || title === GIRLS_HANGOUT_2026_TITLE;
}

export function isBdgEligibleCategory(
  category: string | undefined,
): category is ProductCategory {
  return category === "storybook";
}

export function isFormatAvailable(
  available: boolean | undefined | null,
): boolean {
  return available === true;
}

type FormatPricing = {
  softcopy?: { available?: boolean; price?: number };
  paperback?: { available?: boolean; price?: number };
};

export function productOffersFormat(
  product: {
    slug?: string | null;
    title?: string | null;
    pricing?: FormatPricing | null;
  },
  orderType: ProductOrderType,
): boolean {
  if (orderType === "paperback" && isGirlsHangout2026Product(product)) {
    return false;
  }

  const format =
    orderType === "softcopy"
      ? product.pricing?.softcopy
      : product.pricing?.paperback;
  return isFormatAvailable(format?.available);
}

export function withCommercialProductRules<
  T extends {
    slug?: string | null;
    title?: string | null;
    pricing?: {
      softcopy: {
        price: number;
        currency: string;
        available: boolean;
      };
      paperback: {
        price: number;
        currency: string;
        available: boolean;
        deliveryDays: number;
      };
    };
  },
>(product: T): T {
  if (!product.pricing?.paperback || !isGirlsHangout2026Product(product)) {
    return product;
  }

  if (product.pricing.paperback.available === false) {
    return product;
  }

  return {
    ...product,
    pricing: {
      ...product.pricing,
      paperback: {
        ...product.pricing.paperback,
        available: false,
      },
    },
  };
}

export function validateGh2026PromoApplication({
  promoCode,
  orderType,
  productSlug,
  productTitle,
}: {
  promoCode?: string | null;
  orderType: ProductOrderType;
  productSlug?: string | null;
  productTitle?: string | null;
}): { valid: boolean; error?: string } {
  if (!isGh2026PromoCode(promoCode)) {
    return { valid: false, error: "Invalid promo code." };
  }

  if (orderType !== "softcopy") {
    return {
      valid: false,
      error: "This promo code is valid for the PDF only.",
    };
  }

  if (
    !isGirlsHangout2026Product({ slug: productSlug, title: productTitle })
  ) {
    return {
      valid: false,
      error: "This promo code does not apply to this product.",
    };
  }

  return { valid: true };
}

export function validateBdgPromoApplication({
  promoCode,
  orderType,
  productCategory,
  productSlug,
  productTitle,
}: {
  promoCode?: string | null;
  orderType: ProductOrderType;
  productCategory: string | undefined;
  productSlug?: string | null;
  productTitle?: string | null;
}): { valid: boolean; error?: string } {
  if (!isBdgPromoCode(promoCode)) {
    return { valid: false, error: "Invalid promo code." };
  }

  if (isGirlsHangout2026Product({ slug: productSlug, title: productTitle })) {
    return {
      valid: false,
      error: "This promo code does not apply to this product.",
    };
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

export function validateSubmittedProductPromo(input: {
  promoCode?: string | null;
  orderType: ProductOrderType;
  productCategory: string | undefined;
  productSlug?: string | null;
  productTitle?: string | null;
}): { valid: boolean; error?: string } {
  if (isGh2026PromoCode(input.promoCode)) {
    return validateGh2026PromoApplication(input);
  }

  if (isBdgPromoCode(input.promoCode)) {
    return validateBdgPromoApplication(input);
  }

  return { valid: false, error: "Invalid promo code." };
}

export function resolveProductUnitPrice({
  orderType,
  productCategory,
  productSlug,
  productTitle,
  listSoftcopyPrice,
  listPaperbackPrice,
  promoCode,
}: {
  orderType: ProductOrderType;
  productCategory: string | undefined;
  productSlug?: string | null;
  productTitle?: string | null;
  listSoftcopyPrice: number;
  listPaperbackPrice: number;
  promoCode?: string | null;
}): number {
  if (isGh2026PromoCode(promoCode)) {
    const validation = validateGh2026PromoApplication({
      promoCode,
      orderType,
      productSlug,
      productTitle,
    });
    if (validation.valid) {
      return GH2026_SOFTCOPY_UNIT_PRICE;
    }
  }

  if (orderType === "softcopy") {
    const validation = validateBdgPromoApplication({
      promoCode,
      orderType,
      productCategory,
      productSlug,
      productTitle,
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
    orderType: ProductOrderType;
    unitPrice: number;
    productCategory?: string;
    productSlug?: string;
    productTitle?: string;
  },
  promoCode?: string | null,
): number {
  return resolveProductUnitPrice({
    orderType: item.orderType,
    productCategory: item.productCategory,
    productSlug: item.productSlug,
    productTitle: item.productTitle,
    listSoftcopyPrice: item.unitPrice,
    listPaperbackPrice: item.unitPrice,
    promoCode,
  });
}

export function productAcceptsPromoCode(product: {
  slug?: string | null;
  title?: string | null;
  category?: string | null;
}): boolean {
  return (
    isGirlsHangout2026Product(product) ||
    isBdgEligibleCategory(product.category || undefined)
  );
}

export const BDG_PROMO_APPLIED_MESSAGE =
  "Promo applied — softcopy story books at ₦1,000 each";

export const GH2026_PROMO_APPLIED_MESSAGE =
  "Promo applied — Girls Hangout 2026 PDF at ₦3,000";

export function getCartPromoDisplay(couponCode?: string | null): {
  promoApplied: boolean;
  promoMessage?: string;
  showCouponCode: boolean;
} {
  if (isGh2026PromoCode(couponCode)) {
    return {
      promoApplied: true,
      promoMessage: GH2026_PROMO_APPLIED_MESSAGE,
      showCouponCode: false,
    };
  }

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
