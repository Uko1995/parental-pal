import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import {
  CouponInterface,
  CouponUsageInterface,
  CouponSchema,
  CouponValidationResult,
} from "../models/Coupon";
import { CartInterface } from "../models/Cart";

export class CouponRepository {
  private static collectionName = "coupons";
  private static usageCollectionName = "coupon_usages";

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

    const newCoupon: CouponInterface = {
      ...couponData,
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

  // Validate coupon for a cart
  static async validateCoupon(
    code: string,
    userId: string | ObjectId,
    cart: CartInterface
  ): Promise<CouponValidationResult> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, error: "This coupon is no longer active" };
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom) {
      return { valid: false, error: "This coupon is not yet valid" };
    }
    if (now > coupon.validUntil) {
      return { valid: false, error: "This coupon has expired" };
    }

    // Check max uses
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "This coupon has reached its usage limit" };
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
    if (coupon.applicableUsers.length > 0) {
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
    if (coupon.maxUsesPerUser > 0) {
      const userUsageCount = await this.getUserUsageCount(coupon._id!, userId);
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return { valid: false, error: "You have already used this coupon" };
      }
    }

    // Check first-time buyer restriction
    if (coupon.firstTimeOnly) {
      const hasOrdered = await this.hasUserOrderedBefore(userId);
      if (hasOrdered) {
        return {
          valid: false,
          error: "This coupon is only for first-time buyers",
        };
      }
    }

    // Check product restrictions
    if (
      coupon.applicableProducts.length > 0 ||
      coupon.excludedProducts.length > 0
    ) {
      const applicableItems = cart.items.filter((item) => {
        const itemProductId = item.productId;

        // Check if excluded
        if (coupon.excludedProducts.some((p) => p.equals(itemProductId))) {
          return false;
        }

        // Check if must be in applicable list
        if (coupon.applicableProducts.length > 0) {
          return coupon.applicableProducts.some((p) => p.equals(itemProductId));
        }

        return true;
      });

      if (applicableItems.length === 0) {
        return {
          valid: false,
          error: "This coupon does not apply to items in your cart",
        };
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      // Apply maximum discount cap if set
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      valid: true,
      coupon,
      discountAmount,
    };
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
    userId: ObjectId,
    orderId: ObjectId,
    discountApplied: number
  ): Promise<void> {
    const collection = await getCollection(this.usageCollectionName);
    const couponCollection = await getCollection(this.collectionName);

    // Record usage
    const usage: CouponUsageInterface = {
      couponId,
      couponCode,
      userId,
      orderId,
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

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
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
