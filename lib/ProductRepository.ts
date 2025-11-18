import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import { ProductInterface, ProductSchema } from "../models/Product";

export class ProductRepository {
  private static collectionName = "products";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: ProductSchema.validator,
        })
        .catch(() => {
          console.log("Creating products collection with validation...");
        });

      // Create indexes
      const indexSpecs = [
        "slug",
        "category",
        "status",
        "featured",
        "createdAt",
        "author",
      ];

      for (const field of indexSpecs) {
        try {
          await collection.createIndex(
            { [field]: 1 },
            { name: `idx_product_${field}` }
          );
        } catch {
          console.log(`Index idx_product_${field} may already exist`);
        }
      }

      // Create unique index on slug
      try {
        await collection.createIndex({ slug: 1 }, { unique: true });
      } catch {
        console.log("Unique slug index may already exist");
      }

      // Create text index for search
      try {
        await collection.createIndex(
          { title: "text", description: "text", author: "text" },
          { name: "idx_product_search" }
        );
      } catch {
        console.log("Text search index may already exist");
      }

      console.log("✅ Products collection initialized with schema and indexes");
    } catch (error) {
      console.error("❌ Error initializing products collection:", error);
      throw error;
    }
  }

  // Create a new product
  static async createProduct(
    productData: Omit<ProductInterface, "_id" | "createdAt" | "updatedAt">
  ): Promise<ProductInterface> {
    const collection = await getCollection(this.collectionName);

    const newProduct: ProductInterface = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        totalSales: 0,
        softcopySales: 0,
        paperbackSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        viewCount: 0,
      },
    };

    const result = await collection.insertOne(newProduct);
    return { ...newProduct, _id: result.insertedId };
  }

  // Get all products with optional filters
  static async getAllProducts(filters?: {
    status?: string;
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<ProductInterface[]> {
    const collection = await getCollection(this.collectionName);

    const query: Record<string, unknown> = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.featured !== undefined) {
      query.featured = filters.featured;
    }
    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    const products = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return products as ProductInterface[];
  }

  // Get product by ID
  static async getProductById(
    productId: string | ObjectId
  ): Promise<ProductInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const product = await collection.findOne({ _id: id });
    return product as ProductInterface | null;
  }

  // Get product by slug
  static async getProductBySlug(
    slug: string
  ): Promise<ProductInterface | null> {
    const collection = await getCollection(this.collectionName);
    const product = await collection.findOne({ slug });
    return product as ProductInterface | null;
  }

  // Update product
  static async updateProduct(
    productId: string | ObjectId,
    updateData: Partial<ProductInterface>
  ): Promise<ProductInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id =
      typeof productId === "string" ? new ObjectId(productId) : productId;

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

    return result as ProductInterface | null;
  }

  // Delete product
  static async deleteProduct(productId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  // Increment view count
  static async incrementViewCount(productId: string | ObjectId): Promise<void> {
    const collection = await getCollection(this.collectionName);
    const id =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    await collection.updateOne(
      { _id: id },
      {
        $inc: { "metrics.viewCount": 1 },
        $set: { updatedAt: new Date() },
      }
    );
  }

  // Update product metrics after sale
  static async updateSalesMetrics(
    productId: string | ObjectId,
    orderType: "softcopy" | "paperback",
    amount: number,
    quantity: number = 1
  ): Promise<void> {
    const collection = await getCollection(this.collectionName);
    const id =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const updateFields: Record<string, number> = {
      "metrics.totalSales": quantity,
      "metrics.totalRevenue": amount,
    };

    if (orderType === "softcopy") {
      updateFields["metrics.softcopySales"] = quantity;
    } else {
      updateFields["metrics.paperbackSales"] = quantity;
      updateFields["stock.paperback"] = -quantity;
    }

    await collection.updateOne(
      { _id: id },
      {
        $inc: updateFields,
        $set: { updatedAt: new Date() },
      }
    );
  }

  // Check stock availability
  static async checkStock(
    productId: string | ObjectId,
    orderType: "softcopy" | "paperback",
    quantity: number = 1
  ): Promise<boolean> {
    const product = await this.getProductById(productId);
    if (!product) return false;

    if (orderType === "softcopy") {
      return product.stock.softcopy >= quantity;
    } else {
      return product.stock.paperback >= quantity;
    }
  }

  // Get featured products
  static async getFeaturedProducts(
    limit: number = 6
  ): Promise<ProductInterface[]> {
    const collection = await getCollection(this.collectionName);

    const products = await collection
      .find({ featured: true, status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return products as ProductInterface[];
  }

  // Get products by category
  static async getProductsByCategory(
    category: string
  ): Promise<ProductInterface[]> {
    const collection = await getCollection(this.collectionName);

    const products = await collection
      .find({ category, status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    return products as ProductInterface[];
  }

  // Search products
  static async searchProducts(query: string): Promise<ProductInterface[]> {
    const collection = await getCollection(this.collectionName);

    const products = await collection
      .find({
        $text: { $search: query },
        status: "active",
      })
      .sort({ score: { $meta: "textScore" } })
      .toArray();

    return products as ProductInterface[];
  }

  // Get best selling products
  static async getBestSellers(limit: number = 6): Promise<ProductInterface[]> {
    const collection = await getCollection(this.collectionName);

    const products = await collection
      .find({ status: "active" })
      .sort({ "metrics.totalSales": -1 })
      .limit(limit)
      .toArray();

    return products as ProductInterface[];
  }
}

export default ProductRepository;
