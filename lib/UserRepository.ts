import { ObjectId } from "mongodb";
import { getCollection, getDb } from "../lib/mongodb";
import { UserInterface, UserSchema } from "../models/User";

export class UserRepository {
  private static collectionName = "users";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: UserSchema.validator,
        })
        .catch(() => {
          console.log("Creating users collection with validation...");
        });

      // Create indexes individually
      const indexSpecs = [
        "email",
        "googleId",
        "role",
        "isActive",
        "membershipType",
        "createdAt",
      ];

      for (const field of indexSpecs) {
        try {
          await collection.createIndex(
            { [field]: 1 },
            {
              name: `idx_${field}`,
            }
          );
        } catch {
          console.log(`Index idx_${field} may already exist`);
        }
      }

      // Create compound indexes
      try {
        await collection.createIndex(
          { role: 1, isActive: 1 },
          { name: "idx_role_active" }
        );
        await collection.createIndex(
          { email: 1 },
          { unique: true, name: "idx_email_unique" }
        );
      } catch {
        console.log("Compound indexes may already exist");
      }

      console.log("✅ Users collection initialized with schema and indexes");
    } catch (error) {
      console.error("❌ Error initializing users collection:", error);
      throw error;
    }
  }

  // Create a new user
  static async createUser(
    userData: Omit<UserInterface, "_id" | "createdAt" | "updatedAt">
  ): Promise<UserInterface> {
    const collection = await getCollection(this.collectionName);

    // Validate required fields
    if (!userData?.userData?.user?.name || !userData?.userData?.user?.email) {
      throw new Error("Name and email are required");
    }

    // Check if email already exists
    const existingUser = await collection.findOne({
      email: userData?.userData?.user?.email,
    });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const now = new Date();
    const user: UserInterface = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  // Find user by ID
  static async findById(id: string | ObjectId): Promise<UserInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return (await collection.findOne({
      _id: objectId,
    })) as UserInterface | null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<UserInterface | null> {
    const collection = await getCollection(this.collectionName);
    return (await collection.findOne({ email })) as UserInterface | null;
  }

  // Find user by Google ID
  static async findByGoogleId(googleId: string): Promise<UserInterface | null> {
    const collection = await getCollection(this.collectionName);
    return (await collection.findOne({ googleId })) as UserInterface | null;
  }

  // Find users by role
  static async findByRole(
    role: "admin" | "parent" | "tutor"
  ): Promise<UserInterface[]> {
    const collection = await getCollection<UserInterface>(this.collectionName);
    return await collection.find({ role }).sort({ createdAt: -1 }).toArray();
  }

  // Update user
  static async updateUser(
    id: string | ObjectId,
    updateData: Partial<Omit<UserInterface, "_id" | "createdAt">>
  ): Promise<UserInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result as UserInterface | null;
  }

  // Find tutors by subject
  static async findTutorsBySubject(subject: string): Promise<UserInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        role: "tutor",
        isActive: true,
        "tutorProfile.subjects": subject,
        "tutorProfile.isVerified": true,
      })
      .sort({ "tutorProfile.rating": -1 })
      .toArray()) as UserInterface[];
  }

  // Find tutors by specialty
  static async findTutorsBySpecialty(
    specialty: string
  ): Promise<UserInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        role: "tutor",
        isActive: true,
        "tutorProfile.specialty": { $regex: specialty, $options: "i" },
        "tutorProfile.isVerified": true,
      })
      .sort({ "tutorProfile.rating": -1 })
      .toArray()) as UserInterface[];
  }

  // Find available tutors on specific days
  static async findAvailableTutors(days: string[]): Promise<UserInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        role: "tutor",
        isActive: true,
        "tutorProfile.availability.days": { $in: days },
        "tutorProfile.isVerified": true,
      })
      .sort({ "tutorProfile.rating": -1 })
      .toArray()) as UserInterface[];
  }

  // Search tutors with text search
  static async searchTutors(query: string): Promise<UserInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        role: "tutor",
        isActive: true,
        "tutorProfile.isVerified": true,
        $text: { $search: query },
      })
      .sort({ score: { $meta: "textScore" } })
      .toArray()) as UserInterface[];
  }

  // Get top-rated tutors
  static async getTopRatedTutors(limit: number = 10): Promise<UserInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        role: "tutor",
        isActive: true,
        "tutorProfile.isVerified": true,
        "tutorProfile.totalReviews": { $gte: 1 },
      })
      .sort({ "tutorProfile.rating": -1 })
      .limit(limit)
      .toArray()) as UserInterface[];
  }

  // Find parents with children in age range
  static async findParentsByChildAge(
    minAge: number,
    maxAge: number
  ): Promise<UserInterface[]> {
    const collection = await getCollection(this.collectionName);
    return (await collection
      .find({
        role: "parent",
        isActive: true,
        "children.age": { $gte: minAge, $lte: maxAge },
      })
      .toArray()) as UserInterface[];
  }

  // Get user statistics
  static async getUserStats() {
    const collection = await getCollection(this.collectionName);
    return await collection
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            premium: {
              $sum: { $cond: [{ $eq: ["$membershipType", "premium"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();
  }

  // Update tutor rating
  static async updateTutorRating(
    tutorId: string | ObjectId,
    newRating: number
  ): Promise<UserInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId =
      typeof tutorId === "string" ? new ObjectId(tutorId) : tutorId;

    // Get current tutor data
    const tutor = (await collection.findOne({
      _id: objectId,
      role: "tutor",
    })) as UserInterface | null;

    if (!tutor || !tutor.tutorProfile) {
      throw new Error("Tutor not found");
    }

    // Calculate new average rating
    const currentTotal =
      tutor.tutorProfile.rating * tutor.tutorProfile.totalReviews;
    const newTotal = currentTotal + newRating;
    const newReviewCount = tutor.tutorProfile.totalReviews + 1;
    const newAverageRating = newTotal / newReviewCount;

    return (await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          "tutorProfile.rating": parseFloat(newAverageRating.toFixed(2)),
          "tutorProfile.totalReviews": newReviewCount,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )) as UserInterface | null;
  }

  // Add child to parent
  static async addChildToParent(
    parentId: string | ObjectId,
    childData: {
      name: string;
      age: number;
      class?: string;
      schoolName?: string;
      subjects?: string[];
    }
  ): Promise<UserInterface | null> {
    const collection = await getCollection<UserInterface>(this.collectionName);
    const objectId =
      typeof parentId === "string" ? new ObjectId(parentId) : parentId;

    return (await collection.findOneAndUpdate(
      { _id: objectId, role: "parent" },
      {
        $push: { children: childData },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    )) as UserInterface | null;
  }

  // Get all children from all parents with services and service counts
  static async getAllChildren(): Promise<{
    children: Array<{
      childId?: string;
      name: string;
      age: number;
      class?: string;
      schoolName?: string;
      subjects?: string[];
      parentId: ObjectId;
      parentName: string | null;
      parentEmail: string | null;
      services: Array<{
        serviceType: string;
        status: string;
        bookingId: string;
        createdAt: Date;
      }>;
    }>;
    serviceStats: Array<{
      serviceType: string;
      childrenCount: number;
      totalBookings: number;
    }>;
  }> {
    const collection = await getCollection<UserInterface>(this.collectionName);
    const bookingsCollection = await getCollection("bookings");

    const parents = await collection
      .find({
        role: "parent",
        children: { $exists: true, $ne: [] },
      })
      .toArray();

    // Define booking type for better type safety
    interface BookingData {
      _id?: ObjectId;
      userId?: ObjectId;
      parentEmail?: string;
      serviceType?: string;
      status?: string;
      bookingId?: string;
      createdAt?: Date;
      children?: Array<{
        name: string;
        age: number;
        class?: string;
        schoolName?: string;
      }>;
    }

    // Get all bookings to match with children
    const bookings = (await bookingsCollection
      .find({})
      .toArray()) as BookingData[];

    const allChildren: Array<{
      childId?: string;
      name: string;
      age: number;
      class?: string;
      schoolName?: string;
      subjects?: string[];
      parentId: ObjectId;
      parentName: string | null;
      parentEmail: string | null;
      services: Array<{
        serviceType: string;
        status: string;
        bookingId: string;
        createdAt: Date;
      }>;
    }> = [];

    // Service statistics
    const serviceStatsMap = new Map<
      string,
      { childrenSet: Set<string>; totalBookings: number }
    >();

    parents.forEach((parent) => {
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach((child, index) => {
          const childId = `${parent._id}_${index}`;

          // Find bookings for this parent that might include this child
          const parentBookings = bookings.filter(
            (booking: BookingData) =>
              booking.userId?.toString() === parent._id?.toString() ||
              booking.parentEmail === parent?.userData?.user?.email
          );

          // Get services for this child
          const childServices = parentBookings
            .filter((booking: BookingData) => {
              // Check if this child is in the booking's children array
              return booking.children?.some(
                (bookingChild) =>
                  bookingChild.name === child.name &&
                  Math.abs(bookingChild.age - child.age) <= 1 // Allow for age differences due to time passage
              );
            })
            .map((booking: BookingData) => ({
              serviceType: booking.serviceType || "unknown",
              status: booking.status || "unknown",
              bookingId:
                booking.bookingId || booking._id?.toString() || "unknown",
              createdAt: booking.createdAt || new Date(),
            }));

          // Update service statistics
          childServices.forEach((service) => {
            if (!serviceStatsMap.has(service.serviceType)) {
              serviceStatsMap.set(service.serviceType, {
                childrenSet: new Set(),
                totalBookings: 0,
              });
            }

            const stats = serviceStatsMap.get(service.serviceType)!;
            stats.childrenSet.add(childId);
            stats.totalBookings++;
          });

          allChildren.push({
            childId,
            name: child.name,
            age: child.age,
            class: child.class,
            schoolName: child.schoolName,
            subjects: child.subjects,
            parentId: parent._id!,
            parentName: parent?.userData?.user?.name,
            parentEmail: parent?.userData?.user?.email,
            services: childServices,
          });
        });
      }
    });

    // Convert service statistics to array format
    const serviceStats = Array.from(serviceStatsMap.entries()).map(
      ([serviceType, stats]) => ({
        serviceType,
        childrenCount: stats.childrenSet.size,
        totalBookings: stats.totalBookings,
      })
    );

    return {
      children: allChildren.sort((a, b) => a.age - b.age),
      serviceStats: serviceStats.sort(
        (a, b) => b.childrenCount - a.childrenCount
      ),
    };
  }

  // Get children by age range
  static async getChildrenByAgeRange(
    minAge: number,
    maxAge: number
  ): Promise<
    Array<{
      childId?: string;
      name: string;
      age: number;
      class?: string;
      schoolName?: string;
      subjects?: string[];
      parentId: ObjectId;
      parentName: string | null;
      parentEmail: string | null;
      services: Array<{
        serviceType: string;
        status: string;
        bookingId: string;
        createdAt: Date;
      }>;
    }>
  > {
    const result = await this.getAllChildren();
    return result.children.filter(
      (child) => child.age >= minAge && child.age <= maxAge
    );
  }

  // Get children statistics with service data
  static async getChildrenStats(): Promise<{
    totalChildren: number;
    ageGroups: {
      toddler: number;
      preschool: number;
      elementary: number;
      middle: number;
      high: number;
    };
    averageAge: number;
    schoolDistribution: { [key: string]: number };
    serviceStats: Array<{
      serviceType: string;
      childrenCount: number;
      totalBookings: number;
    }>;
    ageRange: {
      youngest: number;
      oldest: number;
    };
  }> {
    const result = await this.getAllChildren();
    const allChildren = result.children;

    const totalChildren = allChildren.length;
    const ageGroups = {
      toddler: allChildren.filter((child) => child.age >= 1 && child.age <= 3)
        .length,
      preschool: allChildren.filter((child) => child.age >= 4 && child.age <= 5)
        .length,
      elementary: allChildren.filter(
        (child) => child.age >= 6 && child.age <= 10
      ).length,
      middle: allChildren.filter((child) => child.age >= 11 && child.age <= 14)
        .length,
      high: allChildren.filter((child) => child.age >= 15 && child.age <= 18)
        .length,
    };

    const averageAge =
      totalChildren > 0
        ? allChildren.reduce((sum, child) => sum + child.age, 0) / totalChildren
        : 0;

    const schoolDistribution: { [key: string]: number } = {};
    allChildren.forEach((child) => {
      if (child.schoolName) {
        schoolDistribution[child.schoolName] =
          (schoolDistribution[child.schoolName] || 0) + 1;
      }
    });

    return {
      totalChildren,
      ageGroups,
      averageAge: Math.round(averageAge * 10) / 10,
      schoolDistribution,
      serviceStats: result.serviceStats,
      ageRange: {
        youngest:
          totalChildren > 0 ? Math.min(...allChildren.map((c) => c.age)) : 0,
        oldest:
          totalChildren > 0 ? Math.max(...allChildren.map((c) => c.age)) : 0,
      },
    };
  }

  // Update last login
  static async updateLastLogin(userId: string | ObjectId): Promise<void> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId;

    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }

  // Deactivate user
  static async deactivateUser(
    userId: string | ObjectId
  ): Promise<UserInterface | null> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId;

    return (await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )) as UserInterface | null;
  }

  // Delete user (for GDPR compliance)
  static async deleteUser(userId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount === 1;
  }
}

export default UserRepository;
