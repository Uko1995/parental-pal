import { ObjectId } from "mongodb";

// TypeScript interface for Cart Item
export interface CartItemInterface {
  productId: ObjectId;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  orderType: "softcopy" | "paperback";
  unitPrice: number;
  quantity: number;
  addedAt: Date;
}

// TypeScript interface for Cart
export interface CartInterface {
  _id?: ObjectId;
  userId: ObjectId;
  items: CartItemInterface[];

  // Coupon/Discount
  couponCode?: string;
  couponDiscount?: number; // Percentage or fixed amount
  couponType?: "percentage" | "fixed";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Optional cart expiry
}

// MongoDB schema validation
export const CartSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "createdAt", "updatedAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "User ID is required",
        },
        items: {
          bsonType: "array",
          description: "Cart items array",
          items: {
            bsonType: "object",
            required: [
              "productId",
              "productTitle",
              "productSlug",
              "productThumbnail",
              "author",
              "orderType",
              "unitPrice",
              "quantity",
              "addedAt",
            ],
            properties: {
              productId: { bsonType: "objectId" },
              productTitle: { bsonType: "string" },
              productSlug: { bsonType: "string" },
              productThumbnail: { bsonType: "string" },
              author: { bsonType: "string" },
              orderType: { enum: ["softcopy", "paperback"] },
              unitPrice: { bsonType: "number", minimum: 0 },
              quantity: { bsonType: "int", minimum: 1 },
              addedAt: { bsonType: "date" },
            },
          },
        },
        couponCode: { bsonType: "string" },
        couponDiscount: { bsonType: "number" },
        couponType: { enum: ["percentage", "fixed"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
      },
    },
  },
};

// Client-side cart item type
export interface ClientCartItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  orderType: "softcopy" | "paperback";
  unitPrice: number;
  quantity: number;
  addedAt: string;
}

// Client-side cart type
export interface ClientCart {
  _id: string;
  userId: string;
  items: ClientCartItem[];
  couponCode?: string;
  couponDiscount?: number;
  couponType?: "percentage" | "fixed";
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}
