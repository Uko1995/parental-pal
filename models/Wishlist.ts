import { ObjectId } from "mongodb";

// TypeScript interface for Wishlist Item
export interface WishlistItemInterface {
  productId: ObjectId;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  addedAt: Date;
}

// TypeScript interface for Wishlist
export interface WishlistInterface {
  _id?: ObjectId;
  userId: ObjectId;
  items: WishlistItemInterface[];
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB schema validation
export const WishlistSchema = {
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
          description: "Wishlist items array",
          items: {
            bsonType: "object",
            required: [
              "productId",
              "productTitle",
              "productSlug",
              "productThumbnail",
              "author",
              "addedAt",
            ],
            properties: {
              productId: { bsonType: "objectId" },
              productTitle: { bsonType: "string" },
              productSlug: { bsonType: "string" },
              productThumbnail: { bsonType: "string" },
              author: { bsonType: "string" },
              addedAt: { bsonType: "date" },
            },
          },
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};

// Client-side wishlist item type
export interface ClientWishlistItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productThumbnail: string;
  author: string;
  addedAt: string;
}

// Client-side wishlist type
export interface ClientWishlist {
  _id: string;
  userId: string;
  items: ClientWishlistItem[];
  createdAt: string;
  updatedAt: string;
}
