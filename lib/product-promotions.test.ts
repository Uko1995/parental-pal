import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BDG_SOFTCOPY_UNIT_PRICE,
  GH2026_SOFTCOPY_UNIT_PRICE,
  getEffectiveCartItemUnitPrice,
  isGh2026PromoCode,
  productOffersFormat,
  resolveProductUnitPrice,
  validateBdgPromoApplication,
  validateGh2026PromoApplication,
  withCommercialProductRules,
} from "./product-promotions";

const girlsHangout = {
  slug: "girls-hangout-2026",
  title: "Girls Hangout 2026",
  category: "educational",
};

describe("product-promotions", () => {
  it("accepts GH2026 variants for the Girls Hangout 2026 PDF", () => {
    assert.equal(isGh2026PromoCode(" gh2026 "), true);
    assert.equal(isGh2026PromoCode("BDG"), false);

    assert.deepEqual(
      validateGh2026PromoApplication({
        promoCode: "GH2026",
        orderType: "softcopy",
        productSlug: girlsHangout.slug,
        productTitle: girlsHangout.title,
      }),
      { valid: true },
    );

    assert.equal(
      resolveProductUnitPrice({
        orderType: "softcopy",
        productCategory: girlsHangout.category,
        productSlug: girlsHangout.slug,
        productTitle: "  girls   hangout 2026 ",
        listSoftcopyPrice: 5000,
        listPaperbackPrice: 5000,
        promoCode: "gh2026",
      }),
      GH2026_SOFTCOPY_UNIT_PRICE,
    );
  });

  it("charges ₦3,000 per copy when GH2026 is applied", () => {
    const unitPrice = getEffectiveCartItemUnitPrice(
      {
        orderType: "softcopy",
        unitPrice: 5000,
        productSlug: girlsHangout.slug,
        productTitle: girlsHangout.title,
        productCategory: girlsHangout.category,
      },
      "GH2026",
    );

    assert.equal(unitPrice, 3000);
    assert.equal(unitPrice * 2, 6000);
  });

  it("rejects GH2026 for other products and for paperback", () => {
    assert.equal(
      validateGh2026PromoApplication({
        promoCode: "GH2026",
        orderType: "softcopy",
        productSlug: "another-book",
        productTitle: "Another Book",
      }).valid,
      false,
    );
    assert.equal(
      validateGh2026PromoApplication({
        promoCode: "GH2026",
        orderType: "paperback",
        productSlug: girlsHangout.slug,
        productTitle: girlsHangout.title,
      }).valid,
      false,
    );
    assert.equal(
      resolveProductUnitPrice({
        orderType: "softcopy",
        productCategory: "storybook",
        productSlug: "another-book",
        productTitle: "Another Book",
        listSoftcopyPrice: 5000,
        listPaperbackPrice: 7000,
        promoCode: "GH2026",
      }),
      5000,
    );
  });

  it("keeps BDG at ₦1,000 for storybook PDFs and blocks it on Girls Hangout", () => {
    assert.equal(
      resolveProductUnitPrice({
        orderType: "softcopy",
        productCategory: "storybook",
        productSlug: "bedtime-tales",
        productTitle: "Bedtime Tales",
        listSoftcopyPrice: 3000,
        listPaperbackPrice: 5000,
        promoCode: "BDG",
      }),
      BDG_SOFTCOPY_UNIT_PRICE,
    );

    const blocked = validateBdgPromoApplication({
      promoCode: "BDG",
      orderType: "softcopy",
      productCategory: "storybook",
      productSlug: girlsHangout.slug,
      productTitle: girlsHangout.title,
    });
    assert.equal(blocked.valid, false);
    assert.equal(
      resolveProductUnitPrice({
        orderType: "softcopy",
        productCategory: "storybook",
        productSlug: girlsHangout.slug,
        productTitle: girlsHangout.title,
        listSoftcopyPrice: 5000,
        listPaperbackPrice: 5000,
        promoCode: "BDG",
      }),
      5000,
    );
  });

  it("offers only the PDF for Girls Hangout even when paperback is flagged available", () => {
    const product = {
      ...girlsHangout,
      pricing: {
        softcopy: { available: true, price: 5000 },
        paperback: { available: true, price: 5000 },
      },
    };

    assert.equal(productOffersFormat(product, "softcopy"), true);
    assert.equal(productOffersFormat(product, "paperback"), false);

    const normalized = withCommercialProductRules({
      ...product,
      pricing: {
        softcopy: { price: 5000, currency: "NGN", available: true },
        paperback: {
          price: 5000,
          currency: "NGN",
          available: true,
          deliveryDays: 2,
        },
      },
    });
    assert.equal(normalized.pricing.paperback.available, false);
    assert.equal(normalized.pricing.softcopy.available, true);
  });

  it("hides a format unless it is explicitly available", () => {
    const product = {
      slug: "pdf-only-book",
      title: "PDF Only Book",
      pricing: {
        softcopy: { available: true },
        paperback: { available: false },
      },
    };

    assert.equal(productOffersFormat(product, "softcopy"), true);
    assert.equal(productOffersFormat(product, "paperback"), false);
    assert.equal(
      productOffersFormat(
        {
          slug: "missing-flags",
          title: "Missing Flags",
          pricing: { softcopy: {}, paperback: {} },
        },
        "paperback",
      ),
      false,
    );
  });
});
