import { ObjectId } from "mongodb";

// TypeScript interface for Order
export interface OrderInterface {
  _id?: ObjectId;
  orderNumber: string; // Unique order identifier (e.g., "ORD-20231115-001")

  // Customer information
  userId?: ObjectId; // Optional: link to registered user
  customerEmail: string;
  customerName: string;
  customerPhone: string;

  // Product details
  productId: ObjectId;
  productTitle: string;
  productThumbnail: string;

  // Order type and pricing
  orderType: "softcopy" | "paperback";
  unitPrice: number;
  quantity: number; // Usually 1 for books
  totalAmount: number;
  currency: string; // "NGN"

  // Delivery information (for paperback only)
  delivery?: {
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    deliveryNotes?: string;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    trackingNumber?: string;
  };

  // Payment information
  payment: {
    reference: string; // Paystack reference
    status: "pending" | "success" | "failed" | "refunded";
    method: string; // "card", "bank_transfer", "ussd"
    paidAt?: Date;
    amount: number;
    currency: string;
    gatewayResponse?: string;
    paystackResponse?: unknown;
  };

  // Order status
  status:
    | "pending"
    | "processing"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";

  // Download tracking (for softcopy)
  download?: {
    downloadToken: string; // Unique token for secure download
    tokenExpiry: Date; // Token expiration (e.g., 30 days)
    downloadCount: number; // Track number of downloads
    maxDownloads: number; // Limit downloads (e.g., 5)
    lastDownloadAt?: Date;
    downloadIPs?: string[]; // Track IPs for security
  };

  // Email tracking
  emailsSent: {
    confirmation: boolean;
    downloadLink?: boolean; // For softcopy
    shippingNotification?: boolean; // For paperback
    deliveryConfirmation?: boolean; // For paperback
  };

  // Notes and metadata
  notes?: string; // Admin notes
  customerNotes?: string; // Customer notes during checkout
  idempotencyKey: string; // Prevent duplicate orders

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

// MongoDB schema validation
export const OrderSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "orderNumber",
        "customerEmail",
        "customerName",
        "productId",
        "productTitle",
        "orderType",
        "unitPrice",
        "quantity",
        "totalAmount",
        "currency",
        "payment",
        "status",
        "idempotencyKey",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        orderNumber: {
          bsonType: "string",
          pattern: "^ORD-[0-9]{8}-[0-9]{3}$",
        },
        userId: { bsonType: "objectId" },
        customerEmail: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
        customerName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
        },
        customerPhone: {
          bsonType: "string",
          minLength: 10,
          maxLength: 20,
        },
        productId: { bsonType: "objectId" },
        productTitle: { bsonType: "string" },
        productThumbnail: { bsonType: "string" },
        orderType: {
          enum: ["softcopy", "paperback"],
        },
        unitPrice: { bsonType: "double", minimum: 0 },
        quantity: { bsonType: "int", minimum: 1 },
        totalAmount: { bsonType: "double", minimum: 0 },
        currency: { bsonType: "string" },
        payment: {
          bsonType: "object",
          required: ["reference", "status", "amount", "currency"],
          properties: {
            reference: { bsonType: "string" },
            status: {
              enum: ["pending", "success", "failed", "refunded"],
            },
            method: { bsonType: "string" },
            amount: { bsonType: "double" },
            currency: { bsonType: "string" },
          },
        },
        status: {
          enum: [
            "pending",
            "processing",
            "paid",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ],
        },
        idempotencyKey: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};

const OrderModel = {
  collectionName: "orders",
  schema: OrderSchema,
};

export default OrderModel;
