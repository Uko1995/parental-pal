import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Payment {
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

const COLLECTION = "payments";

export async function findPaymentByIdempotencyKey(idempotencyKey: string) {
  const db = await getDb();
  return db.collection<Payment>(COLLECTION).findOne({ idempotencyKey });
}

export async function findPaymentByReference(reference: string) {
  const db = await getDb();
  return db.collection<Payment>(COLLECTION).findOne({ reference });
}

export async function createPayment(
  payment: Omit<Payment, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  const now = new Date();
  const doc = { ...payment, createdAt: now, updatedAt: now };
  const result = await db.collection<Payment>(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function updatePaymentByReference(
  reference: string,
  update: Partial<Payment>
) {
  const db = await getDb();
  const result = await db
    .collection<Payment>(COLLECTION)
    .findOneAndUpdate(
      { reference },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  return result;
}
