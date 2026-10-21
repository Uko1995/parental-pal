import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import {
  CouponInterface,
  CouponUsageInterface,
  CouponSchema,
  CouponValidationResult,
  type CouponTarget,
} from "../models/Coupon";
import { CartInterface } from "../models/Cart";
import {
  computeCouponDiscount,
  getCouponTarget,
  isCouponUsable,
  pickBestDiscount,
} from "./coupon-discount";
import {
  VIRTUAL_TUTORING_DISCOUNT_PERCENT,
  VIRTUAL_TUTORING_PROMO_CODE,
  getVirtualTutoringDiscountLabel,
  getVirtualTutoringPromoValidity,
} from "./tutoring-promotions";

/** Stable id used as createdBy for seeded system promos. */
const SYSTEM_PROMO_CREATED_BY = new ObjectId("000000000000000000000001");

let systemPromosEnsured: Promise<void> | null = null;

export class CouponRepository {
  private static collectionName = "coupons";
  private static usageCollectionName = "coupon_usages";

  /**
   * Upsert built-in promos (e.g. VIRTUAL15) so they appear on Discounts & Promos
   * and apply via the booking promo engine. Safe to call repeatedly.
   */
  static async ensureSystemPromos(): Promise<void> {
    if (!systemPromosEnsured) {
      systemPromosEnsured = this.seedVirtualTutoringPromo().catch((error) => {
        systemPromosEnsured = null;
        throw error;
      });
    }
    await systemPromosEnsured;
  }

  private static async seedVirtualTutoringPromo(): Promise<void> {
    const collection = await getCollection(this.collectionName);
    const existing = await collection.findOne({
      code: VIRTUAL_TUTORING_PROMO_CODE,
    });
    if (existing) return;

    const { validFrom, validUntil } = getVirtualTutoringPromoValidity();
    await collection.insertOne({
      code: VIRTUAL_TUTORING_PROMO_CODE,
      description: getVirtualTutoringDiscountLabel(),
      target: "bookings",
      autoApply: true,
      applicableServiceTypes: ["tutoring"],
      tutoringLocation: "virtual",
      discountType: "percentage",
      discountValue: VIRTUAL_TUTORING_DISCOUNT_PERCENT,
      maxUses: 0,
      usedCount: 0,
      maxUsesPerUser: 0,
      minimumOrderAmount: 0,
      applicableProducts: [],
      applicableCategories: [],
      excludedProducts: [],
      applicableUsers: [],
      firstTimeOnly: false,
      validFrom,
      validUntil,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: SYSTEM_PROMO_CREATED_BY,
    });
  }

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: CouponSchema.validator,
        })
        .catch(() => {
          console.log("Creating coupons collection with validation...");
        });

      // Create unique index on code
      try {
        await collection.createIndex(
          { code: 1 },
          { unique: true, name: "idx_coupon_code" }
        );
      } catch {
        console.log("Coupon code index may already exist");
      }

      // Create indexes
      try {
        await collection.createIndex(
          { isActive: 1, validFrom: 1, validUntil: 1 },
          { name: "idx_coupon_validity" }
        );
      } catch {
        console.log("Coupon validity index may already exist");
      }

      // Create usage tracking collection indexes
      const usageCollection = await getCollection(this.usageCollectionName);
      try {
        await usageCollection.createIndex(
          { couponId: 1, userId: 1 },
          { name: "idx_usage_coupon_user" }
        );
      } catch {
        console.log("Usage index may already exist");
      }

      console.log("✅ Coupons collection initialized with schema and indexes");
      await this.ensureSystemPromos();
    } catch (error) {
      console.error("❌ Error initializing coupons collection:", error);
      throw error;
    }
  }

  // Create a new coupon
  static async createCoupon(
    couponData: Omit<
      CouponInterface,
      "_id" | "usedCount" | "createdAt" | "updatedAt"
    >
  ): Promise<CouponInterface> {
    const collection = await getCollection(this.collectionName);

    const definedData = Object.fromEntries(
      Object.entries(couponData).filter(([, value]) => value !== undefined),
    ) as typeof couponData;
    const newCoupon: CouponInterface = {
      ...definedData,
      code: couponData.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newCoupon);
    return { ...newCoupon, _id: result.insertedId };
  }

  // Get coupon by code
  static async getCouponByCode(code: string): Promise<CouponInterface | null> {
    const collection = await getCollection(this.collectionName);
    const coupon = await collection.findOne({ code: code.toUpperCase() });
    return coupon as CouponInterface | null;
  }

  // Get coupon by ID
  static async getCouponById(
    couponId: string | ObjectId
  ): Promise<CouponInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof couponId === "string" ? new ObjectId(couponId) : couponId;

    const coupon = await collection.findOne({ _id: id });
    return coupon as CouponInterface | null;
  }

  // Get all coupons
  static async getAllCoupons(filters?: {
    isActive?: boolean;
    validOnly?: boolean;
  }): Promise<CouponInterface[]> {
    await this.ensureSystemPromos();
    const collection = await getCollection(this.collectionName);

    const query: Record<string, unknown> = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.validOnly) {
      const now = new Date();
      query.validFrom = { $lte: now };
      query.validUntil = { $gte: now };
    }

    const coupons = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return coupons as CouponInterface[];
  }

  /** Active, in-window automatic promos for a target (bookings or products). */
  static async getActiveAutoApplyCoupons(
    target: CouponTarget,
    now: Date = new Date(),
  ): Promise<CouponInterface[]> {
    await this.ensureSystemPromos();
    const collection = await getCollection(this.collectionName);
    const targetQuery =
      target === "products"
        ? { $or: [{ target: "products" }, { target: { $exists: false } }] }
        : { target };
    const coupons = await collection
      .find({
        ...targetQuery,
        autoApply: true,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      })
      .toArray();
    return coupons as CouponInterface[];
  }

  // Validate coupon for a cart
  static async validateCoupon(
    code: string,
    userId: string | ObjectId,
    cart: CartInterface
  ): Promise<CouponValidationResult> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon || getCouponTarget(coupon) !== "products") {
      return { valid: false, error: "Invalid coupon code" };
    }

    return this.evaluateCouponForCart(coupon, userId, cart);
  }

  /** Best automatic product promo for this cart, if any. */
  static async findBestAutoProductCoupon(
    userId: string | ObjectId | null,
    cart: Pick<CartInterface, "items">,
  ): Promise<CouponValidationResult | null> {
    const candidates = await this.getActiveAutoApplyCoupons("products");
    const results: Array<CouponValidationResult & { discountAmount: number }> =
      [];
    for (const coupon of candidates) {
      const result = await this.evaluateCouponForCart(coupon, userId, cart);
      if (result.valid && result.discountAmount) {
        results.push({ ...result, discountAmount: result.discountAmount });
      }
    }
    return pickBestDiscount(results);
  }

  private static async evaluateCouponForCart(
    coupon: CouponInterface,
    userId: string | ObjectId | null,
    cart: Pick<CartInterface, "items">,
  ): Promise<CouponValidationResult> {
    const usable = isCouponUsable(coupon);
    if (!usable.ok) {
      return { valid: false, error: usable.error };
    }

    const hasCustomerRules =
      coupon.applicableUsers.length > 0 ||
      coupon.maxUsesPerUser > 0 ||
      coupon.firstTimeOnly;
    if (!userId && hasCustomerRules) {
      return { valid: false, error: "Please sign in to use this coupon" };
    }

    // Calculate cart subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Check minimum order amount
    if (subtotal < coupon.minimumOrderAmount) {
      return {
        valid: false,
        error: `Minimum order amount is ₦${coupon.minimumOrderAmount.toLocaleString()}`,
      };
    }

    // Check user-specific restrictions
    if (userId && coupon.applicableUsers.length > 0) {
      const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
      const userAllowed = coupon.applicableUsers.some((u) => u.equals(uid));
      if (!userAllowed) {
        return {
          valid: false,
          error: "This coupon is not valid for your account",
        };
      }
    }

    // Check per-user usage limit
    if (userId && coupon.maxUsesPerUser > 0) {
      const userUsageCount = await this.getUserUsageCount(coupon._id!, userId);
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return { valid: false, error: "You have already used this coupon" };
      }
    }

    // Check first-time buyer restriction
    if (userId && coupon.firstTimeOnly) {
      const hasOrdered = await this.hasUserOrderedBefore(userId);
      if (hasOrdered) {
        return {
          valid: false,
          error: "This coupon is only for first-time buyers",
        };
      }
    }

    const eligibleSubtotal = this.getEligibleCartSubtotal(coupon, cart);
    if (eligibleSubtotal <= 0) {
      return {
        valid: false,
        error: "This coupon does not apply to items in your cart",
      };
    }

    const discountAmount = computeCouponDiscount(
      { ...coupon, minimumOrderAmount: 0 },
      eligibleSubtotal,
    );

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  }

  /** Subtotal of cart items covered by the coupon's product/category rules. */
  static getEligibleCartSubtotal(
    coupon: Pick<
      CouponInterface,
      "applicableProducts" | "excludedProducts" | "applicableCategories"
    >,
    cart: Pick<CartInterface, "items">,
  ): number {
    const applicableProducts = coupon.applicableProducts ?? [];
    const excludedProducts = coupon.excludedProducts ?? [];
    const categories = coupon.applicableCategories ?? [];

    return cart.items
      .filter((item) => {
        const productId = item.productId.toString();
        if (excludedProducts.some((p) => p.toString() === productId)) {
          return false;
        }
        if (
          applicableProducts.length > 0 &&
          !applicableProducts.some((p) => p.toString() === productId)
        ) {
          return false;
        }
        if (
          categories.length > 0 &&
          (!item.productCategory || !categories.includes(item.productCategory))
        ) {
          return false;
        }
        return true;
      })
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  // Get user's usage count for a coupon
  static async getUserUsageCount(
    couponId: ObjectId,
    userId: string | ObjectId
  ): Promise<number> {
    const collection = await getCollection(this.usageCollectionName);
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;

    const count = await collection.countDocuments({
      couponId,
      userId: uid,
    });

    return count;
  }

  // Check if user has ordered before
  static async hasUserOrderedBefore(
    userId: string | ObjectId
  ): Promise<boolean> {
    const ordersCollection = await getCollection("orders");
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;

    const order = await ordersCollection.findOne({
      userId: uid,
      "payment.status": "success",
    });

    return order !== null;
  }

  // Record coupon usage
  static async recordUsage(
    couponId: ObjectId,
    couponCode: string,
    userId: ObjectId | null,
    ref: { orderId?: ObjectId; bookingId?: ObjectId },
    discountApplied: number
  ): Promise<void> {
    const collection = await getCollection(this.usageCollectionName);
    const couponCollection = await getCollection(this.collectionName);

    // Record usage
    const usage: CouponUsageInterface = {
      couponId,
      couponCode,
      ...(userId ? { userId } : {}),
      ...(ref.orderId ? { orderId: ref.orderId } : {}),
      ...(ref.bookingId ? { bookingId: ref.bookingId } : {}),
      discountApplied,
      usedAt: new Date(),
    };

    await collection.insertOne(usage);

    // Increment coupon usage count
    await couponCollection.updateOne(
      { _id: couponId },
      {
        $inc: { usedCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );
  }

  // Update coupon
  static async updateCoupon(
    couponId: string | ObjectId,
    updateData: Partial<CouponInterface>
  ): Promise<CouponInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof couponId === "string" ? new ObjectId(couponId) : couponId;

    // Uppercase code if being updated
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    // Undefined values clear the field instead of storing null.
    const $set: Record<string, unknown> = { updatedAt: new Date() };
    const $unset: Record<string, ""> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value === undefined) $unset[key] = "";
      else $set[key] = value;
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      Object.keys($unset).length ? { $set, $unset } : { $set },
      { returnDocument: "after" }
    );

    return result as CouponInterface | null;
  }

  // Toggle coupon active status
  static async toggleActive(
    couponId: string | ObjectId
  ): Promise<CouponInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof couponId === "string" ? new ObjectId(couponId) : couponId;

    const coupon = await this.getCouponById(id);
    if (!coupon) return null;

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          isActive: !coupon.isActive,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result as CouponInterface | null;
  }

  // Delete coupon
  static async deleteCoupon(couponId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof couponId === "string" ? new ObjectId(couponId) : couponId;

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  // Get coupon usage statistics
  static async getCouponStats(couponId: string | ObjectId): Promise<{
    totalUses: number;
    totalDiscount: number;
    uniqueUsers: number;
  }> {
    const collection = await getCollection(this.usageCollectionName);
    const id = typeof couponId === "string" ? new ObjectId(couponId) : couponId;

    const stats = await collection
      .aggregate([
        { $match: { couponId: id } },
        {
          $group: {
            _id: null,
            totalUses: { $sum: 1 },
            totalDiscount: { $sum: "$discountApplied" },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            totalUses: 1,
            totalDiscount: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
          },
        },
      ])
      .toArray();

    return (
      (stats[0] as {
        totalUses: number;
        totalDiscount: number;
        uniqueUsers: number;
      }) || {
        totalUses: 0,
        totalDiscount: 0,
        uniqueUsers: 0,
      }
    );
  }
}

export default CouponRepository;
