import { ObjectId } from "mongodb";
import { getCollection, getDb } from "../lib/mongodb";
import { BookingInterface, BookingSchema } from "../models/Booking";
import { enrichBookingWithHtrCamperIds } from "../lib/camper-id";

// Helper interfaces
interface RepeatCustomer {
  _id: string;
  bookingCount: number;
  totalSpent: number;
  services: string[];
  lastBooking: Date;
  firstBooking: Date;
}

export class BookingRepository {
  private static collectionName = "bookings";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: BookingSchema.validator,
        })
        .catch(() => {
          console.log("Creating bookings collection with validation...");
        });

      // Create indexes individually
      const indexSpecs = [
        "userId",
        "parentEmail",
        "parentPhone",
        "status",
        "serviceType",
        "createdAt",
        "assignedTo",
      ];

      for (const field of indexSpecs) {
        try {
          await collection.createIndex(
            { [field]: 1 },
            {
              name: `idx_booking_${field}`,
            }
          );
        } catch {
          console.log(`Index idx_booking_${field} may already exist`);
        }
      }

      // Create compound indexes
      try {
        await collection.createIndex(
          { status: 1, priority: 1 },
          { name: "idx_status_priority" }
        );
        await collection.createIndex(
          { serviceType: 1, status: 1 },
          { name: "idx_service_status" }
        );
        await collection.createIndex(
          { "payment.status": 1, "payment.paymentDueDate": 1 },
          { name: "idx_payment_status_due_date" }
        );
      } catch {
        console.log("Compound indexes may already exist");
      }

      console.log("✅ Bookings collection initialized with schema and indexes");
    } catch (error) {
      console.error("❌ Error initializing bookings collection:", error);
      throw error;
    }
  }

  // Create a new booking
  static async createBooking(
    bookingData: Omit<BookingInterface, "_id" | "createdAt" | "updatedAt">
  ): Promise<BookingInterface> {
    const collection = await getCollection(this.collectionName);

    // Validate required fields
    if (
      !bookingData.parentName ||
      !bookingData.parentEmail ||
      !bookingData.serviceType
    ) {
      throw new Error("Parent name, email, and service type are required");
    }

    const now = new Date();
    const booking: BookingInterface = {
      ...bookingData,
      createdAt: now,
      updatedAt: now,
    };

    await enrichBookingWithHtrCamperIds(booking);

    try {
      const result = await collection.insertOne(booking);
      return { ...booking, _id: result.insertedId };
    } catch (error: unknown) {
      if (error instanceof Error && "errInfo" in (error as object)) {
        const mongoError = error as Error & { errInfo: unknown };
        console.error(
          "❌ Detailed validation error:",
          JSON.stringify(mongoError.errInfo, null, 2)
        );
      }
      throw error;
    }
  }

  // Find booking by ID
  static async findById(
    id: string | ObjectId
  ): Promise<BookingInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return (await collection.findOne({
      _id: objectId,
    })) as BookingInterface | null;
  }

  // Find bookings by user ID
  static async findByUserId(
    userId: string | ObjectId
  ): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    const userIdString = objectId.toHexString();
    return (await collection
      .find({
        $or: [{ userId: objectId }, { userId: userIdString }],
      })
      .sort({ createdAt: -1 })
      .toArray()) as BookingInterface[];
  }

  // Find bookings by parent email
  static async findByParentEmail(email: string): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({ parentEmail: email })
      .sort({ createdAt: -1 })
      .toArray()) as BookingInterface[];
  }

  // Find bookings by service type
  static async findByServiceType(
    serviceType: string
  ): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({ serviceType })
      .sort({ createdAt: -1 })
      .toArray()) as BookingInterface[];
  }

  // Find bookings by status
  static async findByStatus(status: string): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray()) as BookingInterface[];
  }

  // Find pending bookings
  static async findPendingBookings(): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        status: "pending",
      })
      .sort({ priority: 1, createdAt: 1 })
      .toArray()) as BookingInterface[];
  }

  static async findUnpaidByPaymentDueDate(
    dueDate: string,
  ): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        "payment.status": "pending",
        "payment.paymentDueDate": dueDate,
        status: { $nin: ["cancelled", "completed"] },
        "pricing.totalAmount": { $gt: 0 },
      })
      .toArray()) as BookingInterface[];
  }

  static async markPaymentReminderSent(
    id: string | ObjectId,
    reminderType: "4_day" | "1_day",
    sentAt: string,
  ): Promise<void> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const field =
      reminderType === "4_day"
        ? "paymentReminders.fourDaySentAt"
        : "paymentReminders.oneDaySentAt";
    await collection.updateOne(
      { _id: objectId },
      { $set: { [field]: sentAt, updatedAt: new Date() } },
    );
  }

  // Update booking
  static async updateBooking(
    id: string | ObjectId,
    updateData: Partial<Omit<BookingInterface, "_id" | "createdAt">>
  ): Promise<BookingInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const existing = await collection.findOne({ _id: objectId });
    const nextDueDate = updateData.payment?.paymentDueDate;
    const dueDateChanged =
      nextDueDate !== undefined &&
      nextDueDate !== existing?.payment?.paymentDueDate;

    const setPayload: Record<string, unknown> = {
      ...updateData,
      updatedAt: new Date(),
    };
    const unsetPayload: Record<string, ""> = {};
    if (dueDateChanged) {
      unsetPayload["paymentReminders.fourDaySentAt"] = "";
      unsetPayload["paymentReminders.oneDaySentAt"] = "";
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: setPayload,
        ...(Object.keys(unsetPayload).length ? { $unset: unsetPayload } : {}),
      },
      { returnDocument: "after" }
    );

    return result as BookingInterface | null;
  }

  static async updateDriveFolderIfAbsent(
    id: string | ObjectId,
    driveFolder: {
      driveFolderId: string;
      driveFolderUrl: string;
      driveFolderName: string;
    },
  ): Promise<BookingInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.findOneAndUpdate(
      {
        _id: objectId,
        $or: [
          { driveFolderId: { $exists: false } },
          { driveFolderId: null },
          { driveFolderId: "" },
        ],
      },
      {
        $set: {
          ...driveFolder,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    return result as BookingInterface | null;
  }

  // Update booking status
  static async updateStatus(
    id: string | ObjectId,
    status: string,
    notes?: string
  ): Promise<BookingInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const updateData: Partial<BookingInterface> = {
      status: status as BookingInterface["status"],
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    switch (status) {
      case "confirmed":
        updateData.assignedAt = new Date();
        break;
      case "in-progress":
        updateData.startedAt = new Date();
        break;
      case "completed":
        updateData.completedAt = new Date();
        break;
      case "cancelled":
        updateData.cancelledAt = new Date();
        if (notes) {
          updateData.cancellationReason = notes;
        }
        break;
    }

    return (await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: "after" }
    )) as BookingInterface | null;
  }

  // Update payment status
  static async updatePaymentStatus(
    id: string | ObjectId,
    paymentStatus: string,
    paidAmount?: number,
    transactionId?: string
  ): Promise<BookingInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const updateData: Record<string, string | number | Date> = {
      "payment.status": paymentStatus,
      updatedAt: new Date(),
    };

    if (paidAmount !== undefined) {
      updateData["payment.paidAmount"] = paidAmount;
      updateData["payment.paymentDate"] = new Date().toISOString();
    }

    if (transactionId) {
      updateData["payment.transactionId"] = transactionId;
    }

    return (await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: "after" }
    )) as BookingInterface | null;
  }

  // Find bookings requiring follow-up
  static async findFollowUpRequired(): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        followUpRequired: true,
        followUpDate: { $lte: new Date() },
      })
      .sort({ followUpDate: 1 })
      .toArray()) as BookingInterface[];
  }

  // Find overdue payments
  static async findOverduePayments(): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        "payment.status": { $in: ["pending", "partial"] },
        "schedule.startDate": { $lte: new Date().toISOString() },
      })
      .sort({ "schedule.startDate": 1 })
      .toArray()) as BookingInterface[];
  }

  // Search bookings
  static async searchBookings(query: string): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        $text: { $search: query },
      })
      .sort({ score: { $meta: "textScore" } })
      .toArray()) as BookingInterface[];
  }

  // Get booking statistics
  static async getBookingStats(startDate?: Date, endDate?: Date) {
    const collection = await getCollection(this.collectionName);

    const matchStage: Record<string, unknown> = {};
    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    return await collection
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              serviceType: "$serviceType",
              status: "$status",
            },
            count: { $sum: 1 },
            totalRevenue: { $sum: "$pricing.totalAmount" },
            avgRating: { $avg: "$rating" },
          },
        },
        {
          $group: {
            _id: "$_id.serviceType",
            statusBreakdown: {
              $push: {
                status: "$_id.status",
                count: "$count",
                totalRevenue: "$totalRevenue",
                avgRating: "$avgRating",
              },
            },
            totalBookings: { $sum: "$count" },
            totalRevenue: { $sum: "$totalRevenue" },
          },
        },
      ])
      .toArray();
  }

  // Get revenue by month
  static async getMonthlyRevenue(year: number) {
    const collection = await getCollection(this.collectionName);

    return await collection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(year + 1, 0, 1),
            },
            "payment.status": "paid",
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              serviceType: "$serviceType",
            },
            revenue: { $sum: "$pricing.totalAmount" },
            bookingCount: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.month": 1 },
        },
      ])
      .toArray();
  }

  // Find repeat customers
  static async findRepeatCustomers(): Promise<RepeatCustomer[]> {
    const collection = await getCollection(this.collectionName);

    return (await collection
      .aggregate([
        {
          $group: {
            _id: "$parentEmail",
            bookingCount: { $sum: 1 },
            totalSpent: { $sum: "$pricing.totalAmount" },
            services: { $addToSet: "$serviceType" },
            lastBooking: { $max: "$createdAt" },
            firstBooking: { $min: "$createdAt" },
          },
        },
        {
          $match: { bookingCount: { $gte: 2 } },
        },
        {
          $sort: { totalSpent: -1 },
        },
      ])
      .toArray()) as RepeatCustomer[];
  }

  // Update follow-up status
  static async updateFollowUp(
    id: string | ObjectId,
    followUpRequired: boolean,
    followUpDate?: Date
  ): Promise<BookingInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const updateData: Partial<BookingInterface> = {
      followUpRequired,
      updatedAt: new Date(),
    };

    if (followUpDate) {
      updateData.followUpDate = followUpDate;
    }

    return (await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: "after" }
    )) as BookingInterface | null;
  }

  // Delete booking (for admin purposes)
  static async deleteBooking(id: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount === 1;
  }

  // Get bookings by date range
  static async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);

    return (await collection
      .find({
        "schedule.startDate": {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString(),
        },
      })
      .sort({ "schedule.startDate": 1 })
      .toArray()) as BookingInterface[];
  }

  // Get high priority bookings
  static async getHighPriorityBookings(): Promise<BookingInterface[]> {
    const collection = await getCollection(this.collectionName);

    return (await collection
      .find({
        priority: { $in: ["high", "urgent"] },
        status: { $in: ["pending", "confirmed", "in-progress"] },
      })
      .sort({ priority: 1, createdAt: 1 })
      .toArray()) as BookingInterface[];
  }
}

export default BookingRepository;
