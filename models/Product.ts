import { ObjectId } from "mongodb";

// TypeScript interface for Product
export interface ProductInterface {
  _id?: ObjectId;
  title: string;
  slug: string; // URL-friendly version of title
  description?: string;
  shortDescription?: string;
  author: string;
  averageRating?: number;
  reviewCount?: number;

  // Product type and category
  category: "storybook" | "educational" | "activity-book" | "coloring-book";
  ageRange?: string; // e.g., "3-5 years", "6-8 years"

  // Images stored in Cloudinary
  thumbnail: string; // Cloudinary URL for book cover
  images: string[]; // Additional preview images

  // Pricing for different formats
  pricing: {
    softcopy: {
      price: number; // ₦3,000
      currency: string; // "NGN"
      available: boolean;
    };
    paperback: {
      price: number; // ₦5,000
      currency: string; // "NGN"
      available: boolean;
      deliveryDays: number; // 3 days
    };
  };

  // PDF file stored in Cloudinary (private)
  pdfFile?: {
    cloudinaryId: string; // Cloudinary public_id
    cloudinaryUrl: string; // Secure URL
    fileName: string;
    fileSize: number; // in bytes
  };

  // Book details
  pageCount?: number;
  isbn?: string;
  publishedDate?: Date;
  language: string; // Default: "English"

  // Inventory
  stock: {
    paperback: number; // unlimited too since print-on-demand
    lowStockThreshold?: number; // e.g., 10 copies
  };

  // Features and highlights
  features?: string[];
  tags?: string[]; // e.g., ["adventure", "friendship", "animals"]

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  // Status and visibility
  status: "active" | "inactive" | "draft" | "out-of-stock";
  featured: boolean; // Show on homepage

  // Sales metrics
  metrics?: {
    totalSales: number;
    softcopySales: number;
    paperbackSales: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    viewCount: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// MongoDB schema validation
export const ProductSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "title",
        "slug",
        "author",
        "category",
        "thumbnail",
        "pricing",
        "stock",
        "status",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        title: {
          bsonType: "string",
          minLength: 3,
          maxLength: 200,
        },
        slug: {
          bsonType: "string",
          minLength: 3,
          maxLength: 250,
        },
        description: {
          bsonType: "string",
          minLength: 50,
          maxLength: 5000,
        },
        shortDescription: {
          bsonType: "string",
          maxLength: 300,
        },
        author: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
        },
        category: {
          enum: ["storybook", "educational", "activity-book", "coloring-book"],
        },
        ageRange: { bsonType: "string" },
        thumbnail: { bsonType: "string" },
        images: {
          bsonType: "array",
          items: { bsonType: "string" },
        },
        pricing: {
          bsonType: "object",
          required: ["softcopy", "paperback"],
          properties: {
            softcopy: {
              bsonType: "object",
              required: ["price", "currency", "available"],
              properties: {
                price: { bsonType: "double", minimum: 0 },
                currency: { bsonType: "string" },
                available: { bsonType: "bool" },
              },
            },
            paperback: {
              bsonType: "object",
              required: ["price", "currency", "available", "deliveryDays"],
              properties: {
                price: { bsonType: "double", minimum: 0 },
                currency: { bsonType: "string" },
                available: { bsonType: "bool" },
                deliveryDays: { bsonType: "int", minimum: 1 },
              },
            },
          },
        },
        stock: {
          bsonType: "object",
          required: ["softcopy", "paperback"],
          properties: {
            softcopy: { bsonType: "int", minimum: 0 },
            paperback: { bsonType: "int", minimum: 0 },
          },
        },
        status: {
          enum: ["active", "inactive", "draft", "out-of-stock"],
        },
        featured: { bsonType: "bool" },
        language: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};

const ProductModel = {
  collectionName: "products",
  schema: ProductSchema,
};

export default ProductModel;
