import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import type { ParentInvoiceInterface } from "@/models/ParentInvoice";

export class ParentInvoiceRepository {
  private static collectionName = "parent_invoices";

  static async create(
    data: Omit<ParentInvoiceInterface, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ParentInvoiceInterface> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    const now = new Date();
    const doc: ParentInvoiceInterface = { ...data, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  static async findById(id: string): Promise<ParentInvoiceInterface | null> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId: ObjectId): Promise<ParentInvoiceInterface[]> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findAll(): Promise<ParentInvoiceInterface[]> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    return collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async findPendingApproval(): Promise<ParentInvoiceInterface[]> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    return collection
      .find({ status: "pending_approval" })
      .sort({ "approval.submittedAt": 1 })
      .toArray();
  }

  static async findSubmittedInvoices(): Promise<ParentInvoiceInterface[]> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    return collection
      .find({
        status: { $in: ["pending_payment", "pending_approval"] },
      })
      .sort({ "approval.submittedAt": -1, createdAt: -1 })
      .toArray();
  }

  static async update(
    id: string,
    updates: Partial<ParentInvoiceInterface>,
  ): Promise<ParentInvoiceInterface | null> {
    const collection = await getCollection<ParentInvoiceInterface>(
      this.collectionName,
    );
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    return result ?? null;
  }
}
