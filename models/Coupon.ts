import { ObjectId } from "mongodb";

// TypeScript interface for Coupon
export interface CouponInterface {
  _id?: ObjectId;
  code: string; // Unique coupon code (e.g., "SAVE20")
  description: string;

  // Discount details
  discountType: "percentage" | "fixed";
  discountValue: number; // 20 for 20% or 500 for ₦500 off

  // Usage limits
  maxUses: number; // Total times coupon can be used (0 = unlimited)
  usedCount: number; // How many times it's been used
  maxUsesPerUser: number; // Per user limit (0 = unlimited)

  // Order requirements
  minimumOrderAmount: number; // Minimum cart total (0 = no minimum)
  maximumDiscount?: number; // Cap on discount for percentage type

  // Product restrictions
  applicableProducts: ObjectId[]; // Empty = all products
  applicableCategories: string[]; // Empty = all categories
  excludedProducts: ObjectId[]; // Products excluded from discount

  // User restrictions
  applicableUsers: ObjectId[]; // Empty = all users
  firstTimeOnly: boolean; // Only for first-time buyers

  // Validity
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
}

// Coupon usage tracking
export interface CouponUsageInterface {
  _id?: ObjectId;
  couponId: ObjectId;
  couponCode: string;
  userId: ObjectId;
  orderId: ObjectId;
  discountApplied: number;
  usedAt: Date;
}

// MongoDB schema validation for Coupon
export const CouponSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "code",
        "description",
        "discountType",
        "discountValue",
        "maxUses",
        "usedCount",
        "maxUsesPerUser",
        "minimumOrderAmount",
        "validFrom",
        "validUntil",
        "isActive",
        "createdAt",
        "updatedAt",
        "createdBy",
      ],
      properties: {
        code: {
          bsonType: "string",
          description: "Unique coupon code",
        },
        description: { bsonType: "string" },
        discountType: { enum: ["percentage", "fixed"] },
        discountValue: { bsonType: "number", minimum: 0 },
        maxUses: { bsonType: "int", minimum: 0 },
        usedCount: { bsonType: "int", minimum: 0 },
        maxUsesPerUser: { bsonType: "int", minimum: 0 },
        minimumOrderAmount: { bsonType: "number", minimum: 0 },
        maximumDiscount: { bsonType: "number" },
        applicableProducts: { bsonType: "array" },
        applicableCategories: { bsonType: "array" },
        excludedProducts: { bsonType: "array" },
        applicableUsers: { bsonType: "array" },
        firstTimeOnly: { bsonType: "bool" },
        validFrom: { bsonType: "date" },
        validUntil: { bsonType: "date" },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        createdBy: { bsonType: "objectId" },
      },
    },
  },
};

// Client-side coupon type
export interface ClientCoupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  applicableUsers: string[];
  firstTimeOnly: boolean;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Coupon validation result
export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: CouponInterface;
  discountAmount?: number;
}
