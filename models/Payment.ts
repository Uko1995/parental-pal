import { ObjectId } from "mongodb";

// MongoDB JSON schema for payments collection validation
export const paymentCollectionValidation = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "bookingId",
        "userId",
        "amount",
        "currency",
        "status",
        "reference",
        "channel",
        "idempotencyKey",
      ],
      properties: {
        bookingId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        amount: { bsonType: "double", minimum: 0 },
        currency: { bsonType: "string" },
        status: { enum: ["pending", "success", "failed", "cancelled"] },
        reference: { bsonType: "string" },
        channel: { bsonType: "string" },
        gatewayResponse: { bsonType: "string" },
        idempotencyKey: { bsonType: "string" },
      },
    },
  },
};
// Payment model is now managed via the native driver in lib/PaymentRepository.ts
// This file is kept for type reference only.

export interface PaymentInterface {
  _id?: ObjectId;
  bookingId: ObjectId;
  userId: ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "cancelled";
  reference: string;
  channel: string;
  gatewayResponse: string;
  paystackResponse: unknown;
  createdAt: Date;
  updatedAt: Date;
  idempotencyKey: string;
}
