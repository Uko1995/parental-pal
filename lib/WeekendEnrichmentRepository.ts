import { ObjectId, type IndexSpecification } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import type { WeekendEnrollmentInterface } from "@/models/WeekendEnrollment";
import WeekendEnrollmentModel from "@/models/WeekendEnrollment";
import type { WeekendSaveSlotInterface } from "@/models/WeekendSaveSlot";
import WeekendSaveSlotModel from "@/models/WeekendSaveSlot";

export class WeekendEnrichmentRepository {
  /** Initialize weekend_enrollments collection with schema and indexes */
  static async initializeEnrollments() {
    const db = await getDb();
    const name = WeekendEnrollmentModel.collectionName;
    try {
      await db.createCollection(name, {
        validator: WeekendEnrollmentModel.schema.validator,
      });
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err.code !== 48) throw e; // 48 = collection already exists
      await db.command({
        collMod: name,
        validator: WeekendEnrollmentModel.schema.validator,
      });
    }
    const coll = await getCollection(name);
    for (const idx of WeekendEnrollmentModel.indexes) {
      await coll.createIndex(idx.key as unknown as IndexSpecification, { name: idx.name }).catch(() => {});
    }
  }

  /** Initialize weekend_save_slots collection with schema and indexes */
  static async initializeSaveSlots() {
    const db = await getDb();
    const name = WeekendSaveSlotModel.collectionName;
    try {
      await db.createCollection(name, {
        validator: WeekendSaveSlotModel.schema.validator,
      });
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err.code !== 48) throw e;
      await db.command({
        collMod: name,
        validator: WeekendSaveSlotModel.schema.validator,
      });
    }
    const coll = await getCollection(name);
    for (const idx of WeekendSaveSlotModel.indexes) {
      await coll.createIndex(idx.key as unknown as IndexSpecification, { name: idx.name }).catch(() => {});
    }
  }

  static async createEnrollment(
    data: Omit<WeekendEnrollmentInterface, "_id" | "createdAt" | "updatedAt">
  ): Promise<{ insertedId: string }> {
    const coll = await getCollection<WeekendEnrollmentInterface>(
      WeekendEnrollmentModel.collectionName
    );
    const now = new Date();
    const doc: WeekendEnrollmentInterface = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc as WeekendEnrollmentInterface & { _id?: ObjectId });
    return { insertedId: result.insertedId.toString() };
  }

  static async findEnrollmentById(id: string): Promise<WeekendEnrollmentInterface | null> {
    const coll = await getCollection<WeekendEnrollmentInterface>(
      WeekendEnrollmentModel.collectionName
    );
    const doc = await coll.findOne({ _id: new ObjectId(id) });
    return doc as WeekendEnrollmentInterface | null;
  }

  static async listEnrollments(): Promise<WeekendEnrollmentInterface[]> {
    const coll = await getCollection<WeekendEnrollmentInterface>(
      WeekendEnrollmentModel.collectionName
    );
    const list = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return list as WeekendEnrollmentInterface[];
  }

  static async updateEnrollmentPayment(
    id: string,
    updates: { paymentStatus: "paid" | "failed"; paystackReference?: string }
  ): Promise<boolean> {
    const coll = await getCollection<WeekendEnrollmentInterface>(
      WeekendEnrollmentModel.collectionName
    );
    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );
    return result.matchedCount > 0;
  }

  static async setEnrollmentPaystackReference(
    id: string,
    paystackReference: string
  ): Promise<boolean> {
    const coll = await getCollection<WeekendEnrollmentInterface>(
      WeekendEnrollmentModel.collectionName
    );
    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paystackReference,
          updatedAt: new Date(),
        },
      }
    );
    return result.matchedCount > 0;
  }

  static async createSaveSlot(
    data: Omit<WeekendSaveSlotInterface, "_id" | "createdAt">
  ): Promise<{ insertedId: string }> {
    const coll = await getCollection<WeekendSaveSlotInterface>(
      WeekendSaveSlotModel.collectionName
    );
    const doc: WeekendSaveSlotInterface = {
      ...data,
      createdAt: new Date(),
    };
    const result = await coll.insertOne(doc as WeekendSaveSlotInterface & { _id?: ObjectId });
    return { insertedId: result.insertedId.toString() };
  }

  static async listSaveSlots(): Promise<WeekendSaveSlotInterface[]> {
    const coll = await getCollection<WeekendSaveSlotInterface>(
      WeekendSaveSlotModel.collectionName
    );
    const list = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return list as WeekendSaveSlotInterface[];
  }
}
