import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import { OrderInterface, OrderSchema } from "../models/Order";
import crypto from "crypto";

export class OrderRepository {
  private static collectionName = "orders";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: OrderSchema.validator,
        })
        .catch(() => {
          console.log("Creating orders collection with validation...");
        });

      // Create indexes
      const indexSpecs = [
        "orderNumber",
        "customerEmail",
        "productId",
        "status",
        "orderType",
        "createdAt",
        "userId",
      ];

      for (const field of indexSpecs) {
        try {
          await collection.createIndex(
            { [field]: 1 },
            { name: `idx_order_${field}` }
          );
        } catch {
          console.log(`Index idx_order_${field} may already exist`);
        }
      }

      // Create unique index on orderNumber
      try {
        await collection.createIndex(
          { orderNumber: 1 },
          { unique: true, name: "idx_order_number_unique" }
        );
      } catch {
        console.log("Unique orderNumber index may already exist");
      }

      // Create unique index on payment reference
      try {
        await collection.createIndex(
          { "payment.reference": 1 },
          { unique: true, name: "idx_payment_reference_unique" }
        );
      } catch {
        console.log("Unique payment reference index may already exist");
      }

      // Create compound indexes
      try {
        await collection.createIndex(
          { status: 1, orderType: 1 },
          { name: "idx_status_type" }
        );
      } catch {
        console.log("Compound index may already exist");
      }

      console.log("✅ Orders collection initialized with schema and indexes");
    } catch (error) {
      console.error("❌ Error initializing orders collection:", error);
      throw error;
    }
  }

  // Generate unique order number
  static generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `ORD-${dateStr}-${randomNum}`;
  }

  // Generate download token
  static generateDownloadToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Create a new order
  static async createOrder(
    orderData: Omit<
      OrderInterface,
      "_id" | "orderNumber" | "createdAt" | "updatedAt"
    >
  ): Promise<OrderInterface> {
    const collection = await getCollection(this.collectionName);

    const orderNumber = this.generateOrderNumber();

    // For softcopy orders, generate download token
    let downloadInfo;
    if (orderData.orderType === "softcopy") {
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 30); // 30 days expiry

      downloadInfo = {
        downloadToken: this.generateDownloadToken(),
        tokenExpiry,
        downloadCount: 0,
        maxDownloads: 5,
        downloadIPs: [],
      };
    }

    const newOrder: OrderInterface = {
      ...orderData,
      orderNumber,
      download: downloadInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newOrder);
    return { ...newOrder, _id: result.insertedId };
  }

  // Get all orders with optional filters
  static async getAllOrders(filters?: {
    status?: string;
    orderType?: string;
    customerEmail?: string;
    userId?: string;
  }): Promise<OrderInterface[]> {
    const collection = await getCollection(this.collectionName);

    const query: Record<string, unknown> = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.orderType) {
      query.orderType = filters.orderType;
    }
    if (filters?.customerEmail) {
      query.customerEmail = filters.customerEmail;
    }
    if (filters?.userId) {
      query.userId = new ObjectId(filters.userId);
    }

    const orders = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return orders as OrderInterface[];
  }

  // Get order by ID
  static async getOrderById(
    orderId: string | ObjectId
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    const order = await collection.findOne({ _id: id });
    return order as OrderInterface | null;
  }

  // Get order by order number
  static async getOrderByNumber(
    orderNumber: string
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const order = await collection.findOne({ orderNumber });
    return order as OrderInterface | null;
  }

  // Get order by payment reference
  static async getOrderByReference(
    reference: string
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const order = await collection.findOne({ "payment.reference": reference });
    return order as OrderInterface | null;
  }

  // Get order by download token
  static async getOrderByDownloadToken(
    token: string
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const order = await collection.findOne({ "download.downloadToken": token });
    return order as OrderInterface | null;
  }

  // Update order
  static async updateOrder(
    orderId: string | ObjectId,
    updateData: Partial<OrderInterface>
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

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

    return result as OrderInterface | null;
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string | ObjectId,
    status: OrderInterface["status"]
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    const updateFields: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamp based on status
    if (status === "paid") {
      updateFields.paidAt = new Date();
    } else if (status === "shipped") {
      updateFields.shippedAt = new Date();
    } else if (status === "delivered") {
      updateFields.deliveredAt = new Date();
    } else if (status === "cancelled") {
      updateFields.cancelledAt = new Date();
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    return result as OrderInterface | null;
  }

  // Update payment status
  static async updatePaymentStatus(
    orderId: string | ObjectId,
    paymentData: Partial<OrderInterface["payment"]>
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          "payment.status": paymentData.status,
          "payment.paidAt": paymentData.paidAt,
          "payment.gatewayResponse": paymentData.gatewayResponse,
          "payment.paystackResponse": paymentData.paystackResponse,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result as OrderInterface | null;
  }

  // Increment download count
  static async incrementDownloadCount(
    orderId: string | ObjectId,
    ipAddress: string
  ): Promise<OrderInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $inc: { "download.downloadCount": 1 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $push: { "download.downloadIPs": ipAddress } as any,
        $set: {
          "download.lastDownloadAt": new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result?.value ? (result.value as OrderInterface) : null;
  }

  // Update email tracking
  static async updateEmailTracking(
    orderId: string | ObjectId,
    emailType:
      | "confirmation"
      | "downloadLink"
      | "shippingNotification"
      | "deliveryConfirmation"
  ): Promise<void> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    await collection.updateOne(
      { _id: id },
      {
        $set: {
          [`emailsSent.${emailType}`]: true,
          updatedAt: new Date(),
        },
      }
    );
  }

  // Delete order
  static async deleteOrder(orderId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  // Get orders by customer email
  static async getOrdersByCustomerEmail(
    email: string
  ): Promise<OrderInterface[]> {
    const collection = await getCollection(this.collectionName);

    const orders = await collection
      .find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return orders as OrderInterface[];
  }

  // Get orders by user ID
  static async getOrdersByUserId(
    userId: string | ObjectId
  ): Promise<OrderInterface[]> {
    const collection = await getCollection(this.collectionName);
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;

    const orders = await collection
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .toArray();

    return orders as OrderInterface[];
  }

  // Get recent orders
  static async getRecentOrders(limit: number = 10): Promise<OrderInterface[]> {
    const collection = await getCollection(this.collectionName);

    const orders = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return orders as OrderInterface[];
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    softcopyOrders: number;
    paperbackOrders: number;
  }> {
    const collection = await getCollection(this.collectionName);

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
            },
            softcopyOrders: {
              $sum: { $cond: [{ $eq: ["$orderType", "softcopy"] }, 1, 0] },
            },
            paperbackOrders: {
              $sum: { $cond: [{ $eq: ["$orderType", "paperback"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = stats[0] as any;
    return (
      result || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        softcopyOrders: 0,
        paperbackOrders: 0,
      }
    );
  }
}

export default OrderRepository;
