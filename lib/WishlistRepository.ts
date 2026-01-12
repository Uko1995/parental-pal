import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import {
  WishlistInterface,
  WishlistItemInterface,
  WishlistSchema,
} from "../models/Wishlist";

export class WishlistRepository {
  private static collectionName = "wishlists";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: WishlistSchema.validator,
        })
        .catch(() => {
          console.log("Creating wishlists collection with validation...");
        });

      // Create unique index on userId (one wishlist per user)
      try {
        await collection.createIndex(
          { userId: 1 },
          { unique: true, name: "idx_wishlist_userId" }
        );
      } catch {
        console.log("Wishlist userId index may already exist");
      }

      console.log(
        "✅ Wishlists collection initialized with schema and indexes"
      );
    } catch (error) {
      console.error("❌ Error initializing wishlists collection:", error);
      throw error;
    }
  }

  // Get wishlist by user ID
  static async getWishlistByUserId(
    userId: string | ObjectId
  ): Promise<WishlistInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const wishlist = await collection.findOne({ userId: id });
    return wishlist as WishlistInterface | null;
  }

  // Create or get wishlist for user
  static async getOrCreateWishlist(
    userId: string | ObjectId
  ): Promise<WishlistInterface> {
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    let wishlist = await this.getWishlistByUserId(id);

    if (!wishlist) {
      const collection = await getCollection(this.collectionName);
      const newWishlist: WishlistInterface = {
        userId: id,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newWishlist);
      wishlist = { ...newWishlist, _id: result.insertedId };
    }

    return wishlist;
  }

  // Add item to wishlist
  static async addItem(
    userId: string | ObjectId,
    item: Omit<WishlistItemInterface, "addedAt">
  ): Promise<WishlistInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    // Ensure wishlist exists
    await this.getOrCreateWishlist(id);

    // Check if item already exists
    const existingWishlist = await collection.findOne({
      userId: id,
      "items.productId": item.productId,
    });

    if (existingWishlist) {
      // Item already in wishlist
      return existingWishlist as WishlistInterface;
    }

    // Add new item
    const newItem: WishlistItemInterface = {
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

    return result as unknown as WishlistInterface | null;
  }

  // Remove item from wishlist
  static async removeItem(
    userId: string | ObjectId,
    productId: string | ObjectId
  ): Promise<WishlistInterface | null> {
    const collection = await getCollection(this.collectionName);
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const result = await collection.findOneAndUpdate(
      { userId: uid },
      {
        $pull: { items: { productId: pid } },
        $set: { updatedAt: new Date() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      { returnDocument: "after" }
    );

    return result as unknown as WishlistInterface | null;
  }

  // Check if product is in wishlist
  static async isInWishlist(
    userId: string | ObjectId,
    productId: string | ObjectId
  ): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const result = await collection.findOne({
      userId: uid,
      "items.productId": pid,
    });

    return result !== null;
  }

  // Clear wishlist
  static async clearWishlist(userId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.updateOne(
      { userId: id },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount === 1;
  }

  // Get wishlist item count
  static async getItemCount(userId: string | ObjectId): Promise<number> {
    const wishlist = await this.getWishlistByUserId(userId);
    return wishlist ? wishlist.items.length : 0;
  }

  // Move item from wishlist to cart
  static async moveToCart(
    userId: string | ObjectId,
    productId: string | ObjectId
  ): Promise<boolean> {
    // This will be handled at the API level by calling both repositories
    // Just remove from wishlist here
    const result = await this.removeItem(userId, productId);
    return result !== null;
  }

  // Delete wishlist
  static async deleteWishlist(userId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.deleteOne({ userId: id });
    return result.deletedCount === 1;
  }
}

export default WishlistRepository;
