import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import { CartInterface, CartItemInterface, CartSchema } from "../models/Cart";
import {
  getEffectiveCartItemUnitPrice,
  isBdgPromoCode,
} from "./product-promotions";

export class CartRepository {
  private static collectionName = "carts";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: CartSchema.validator,
        })
        .catch(() => {
          console.log("Creating carts collection with validation...");
        });

      // Create unique index on userId (one cart per user)
      try {
        await collection.createIndex(
          { userId: 1 },
          { unique: true, name: "idx_cart_userId" }
        );
      } catch {
        console.log("Cart userId index may already exist");
      }

      // Create index on updatedAt for cleanup
      try {
        await collection.createIndex(
          { updatedAt: 1 },
          { name: "idx_cart_updatedAt" }
        );
      } catch {
        console.log("Cart updatedAt index may already exist");
      }

      console.log("✅ Carts collection initialized with schema and indexes");
    } catch (error) {
      console.error("❌ Error initializing carts collection:", error);
      throw error;
    }
  }

  // Get cart by user ID
  static async getCartByUserId(
    userId: string | ObjectId
  ): Promise<CartInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const cart = await collection.findOne({ userId: id });
    return cart as CartInterface | null;
  }

  // Create or get cart for user
  static async getOrCreateCart(
    userId: string | ObjectId
  ): Promise<CartInterface> {
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    let cart = await this.getCartByUserId(id);

    if (!cart) {
      const collection = await getCollection(this.collectionName);
      const newCart: CartInterface = {
        userId: id,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newCart);
      cart = { ...newCart, _id: result.insertedId };
    }

    return cart;
  }

  // Add item to cart
  static async addItem(
    userId: string | ObjectId,
    item: Omit<CartItemInterface, "addedAt">
  ): Promise<CartInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    // First, ensure cart exists
    await this.getOrCreateCart(id);

    // Check if item already exists (same product + same orderType)
    const existingCart = await collection.findOne({
      userId: id,
      "items.productId": item.productId,
      "items.orderType": item.orderType,
    });

    if (existingCart) {
      // Update quantity of existing item
      const result = await collection.findOneAndUpdate(
        {
          userId: id,
          "items.productId": item.productId,
          "items.orderType": item.orderType,
        },
        {
          $inc: { "items.$.quantity": item.quantity },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: "after" }
      );
      return result as CartInterface | null;
    } else {
      // Add new item
      const newItem: CartItemInterface = {
        ...item,
        addedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { userId: id },
        {
          $push: { items: newItem },
          $set: { updatedAt: new Date() },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        { returnDocument: "after" }
      );
      return result as unknown as CartInterface | null;
    }
  }

  // Update item quantity
  static async updateItemQuantity(
    userId: string | ObjectId,
    productId: string | ObjectId,
    orderType: "softcopy" | "paperback",
    quantity: number
  ): Promise<CartInterface | null> {
    const collection = await getCollection(this.collectionName);
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return this.removeItem(uid, pid, orderType);
    }

    const result = await collection.findOneAndUpdate(
      {
        userId: uid,
        "items.productId": pid,
        "items.orderType": orderType,
      },
      {
        $set: {
          "items.$.quantity": quantity,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result as CartInterface | null;
  }

  // Remove item from cart
  static async removeItem(
    userId: string | ObjectId,
    productId: string | ObjectId,
    orderType: "softcopy" | "paperback"
  ): Promise<CartInterface | null> {
    const collection = await getCollection(this.collectionName);
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const result = await collection.findOneAndUpdate(
      { userId: uid },
      {
        $pull: {
          items: { productId: pid, orderType: orderType },
        },
        $set: { updatedAt: new Date() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      { returnDocument: "after" }
    );

    return result as unknown as CartInterface | null;
  }

  // Clear cart
  static async clearCart(userId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.updateOne(
      { userId: id },
      {
        $set: {
          items: [],
          couponCode: null,
          couponDiscount: null,
          couponType: null,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount === 1;
  }

  // Apply coupon to cart
  static async applyCoupon(
    userId: string | ObjectId,
    couponCode: string,
    discountValue: number,
    discountType: "percentage" | "fixed"
  ): Promise<CartInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.findOneAndUpdate(
      { userId: id },
      {
        $set: {
          couponCode,
          couponDiscount: discountValue,
          couponType: discountType,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result as CartInterface | null;
  }

  // Remove coupon from cart
  static async removeCoupon(
    userId: string | ObjectId
  ): Promise<CartInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.findOneAndUpdate(
      { userId: id },
      {
        $unset: {
          couponCode: "",
          couponDiscount: "",
          couponType: "",
        },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result as CartInterface | null;
  }

  // Get cart item count
  static async getItemCount(userId: string | ObjectId): Promise<number> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Calculate cart totals
  static calculateTotals(cart: CartInterface): {
    subtotal: number;
    discount: number;
    total: number;
  } {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    if (isBdgPromoCode(cart.couponCode)) {
      const total = cart.items.reduce(
        (sum, item) =>
          sum +
          getEffectiveCartItemUnitPrice(item, cart.couponCode) * item.quantity,
        0,
      );

      return {
        subtotal,
        discount: subtotal - total,
        total,
      };
    }

    let discount = 0;
    if (cart.couponDiscount && cart.couponType) {
      if (cart.couponType === "percentage") {
        discount = Math.round((subtotal * cart.couponDiscount) / 100);
      } else {
        discount = cart.couponDiscount;
      }
    }

    discount = Math.min(discount, subtotal);

    return {
      subtotal,
      discount,
      total: subtotal - discount,
    };
  }

  // Delete cart
  static async deleteCart(userId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.deleteOne({ userId: id });
    return result.deletedCount === 1;
  }

  // Cleanup old carts (for scheduled job)
  static async cleanupOldCarts(daysOld: number = 30): Promise<number> {
    const collection = await getCollection(this.collectionName);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await collection.deleteMany({
      updatedAt: { $lt: cutoffDate },
      "items.0": { $exists: false }, // Only delete empty carts
    });

    return result.deletedCount;
  }
}

export default CartRepository;
