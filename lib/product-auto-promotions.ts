import type { ObjectId } from "mongodb";
import { CouponRepository } from "@/lib/CouponRepository";
import {
  toAutoProductPromotion,
  type AutoProductPromotion,
} from "@/lib/CartRepository";
import type { CartItemInterface } from "@/models/Cart";

interface PurchasableProduct {
  _id?: ObjectId;
  title: string;
  slug: string;
  thumbnail: string;
  author: string;
  category: string;
}

/** Best automatic product promo for a single buy-now purchase at list price. */
export async function findAutoPromotionForPurchase(input: {
  product: PurchasableProduct;
  orderType: "softcopy" | "paperback";
  unitPrice: number;
  quantity: number;
  userId: string | null;
}): Promise<AutoProductPromotion | null> {
  if (!input.product._id) return null;

  const item: CartItemInterface = {
    productId: input.product._id,
    productTitle: input.product.title,
    productSlug: input.product.slug,
    productThumbnail: input.product.thumbnail,
    author: input.product.author,
    orderType: input.orderType,
    unitPrice: input.unitPrice,
    quantity: input.quantity,
    productCategory: input.product.category,
    addedAt: new Date(),
  };

  const best = await CouponRepository.findBestAutoProductCoupon(input.userId, {
    items: [item],
  });
  if (!best?.valid || !best.coupon || !best.discountAmount) return null;
  return toAutoProductPromotion(best.coupon, best.discountAmount);
}
