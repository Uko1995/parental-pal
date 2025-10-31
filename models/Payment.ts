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
        "gatewayResponse",
        "paystackResponse",
        "idempotencyKey",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        bookingId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        amount: { bsonType: "double", minimum: 0 },
        currency: { bsonType: "string", minLength: 1 },
        status: {
          enum: ["pending", "success", "failed", "cancelled"],
          description: "Must be a valid payment status",
        },
        reference: { bsonType: "string", minLength: 1 },
        channel: { bsonType: "string", minLength: 1 },
        gatewayResponse: { bsonType: "string" },
        paystackResponse: {}, // Accepts any type (object)
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        idempotencyKey: { bsonType: "string", minLength: 1 },
      },
      additionalProperties: false,
    },
  },
};
// Payment model is now managed via the native driver in lib/PaymentRepository.ts
// This file is kept for type reference only.
import { ObjectId } from "mongodb";

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
