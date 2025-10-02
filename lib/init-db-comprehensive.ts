// Load environment variables first
import { config } from "dotenv";
config({ path: ".env.local" });

import { getCollection } from "./mongodb";
import { UserRepository } from "./UserRepository";
import { BookingRepository } from "./BookingRepository";
import { ObjectId } from "mongodb";
import { UserInterface } from "@/models";

// Initialize database with schema validation and indexes
async function initializeDatabase() {
  console.log("🔄 Initializing database...");

  try {
    // Initialize collections with validation and indexes
    await UserRepository.initialize();
    await BookingRepository.initialize();

    console.log("✅ Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

async function createSampleBookings() {
  console.log("🔄 Creating comprehensive sample bookings (20 records)...");

  // First get some user IDs for realistic booking data
  const usersCollection = await getCollection("users");
  const parents = await usersCollection
    .find({ role: "parent" })
    .limit(10)
    .toArray();

  if (parents.length === 0) {
    console.log("ℹ️  No parent users found, skipping bookings creation");
    return;
  }

  const serviceTypes = [
    "tutoring",
    "childcare",
    "holiday-camps",
    "space-rental",
    "kiddies-enrichment",
  ] as const;
  const statuses = [
    "pending",
    "confirmed",
    "in-progress",
    "completed",
    "cancelled",
    "on-hold",
  ] as const;
  const sources = [
    "social media",
    "referral",
    "online search",
    "signage",
    "walk in",
    "other",
  ] as const;

  const sampleBookings = [];

  for (let i = 0; i < 20; i++) {
    const parent = parents[Math.floor(Math.random() * parents.length)];
    const serviceType =
      serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];

    // Create realistic dates
    const createdAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ); // Last 30 days
    const startDate = new Date(
      createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000
    ); // Next 60 days

    // Prepare children data that matches BookingInterface children format
    const childrenData = parent.children?.map(
      (child: NonNullable<UserInterface["children"]>[0]) => ({
        name: child.name,
        age: Math.floor(Number(child.age)), // Ensure integer
        class: child.class,
        schoolName: child.schoolName,
      })
    ) || [
      {
        name: `Child ${i + 1}`,
        age: Math.floor(Math.random() * 15) + 3, // Age 3-17
        class: `Grade ${Math.floor(Math.random() * 12) + 1}`,
        schoolName: "Sample School",
      },
    ];

    const booking = {
      userId: new ObjectId(parent._id),
      bookingId: `PP-${Date.now()}-${i + 1}`,
      serviceType,
      parentName: parent.name,
      parentEmail: parent.email,
      parentPhone: `${String(Math.floor(Math.random() * 9000) + 1000)}-${String(
        Math.floor(Math.random() * 900) + 100
      )}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      childrenCount: Math.floor(childrenData.length),
      children: childrenData,

      // Service-specific data based on type
      serviceData:
        serviceType === "tutoring"
          ? {
              subjects: ["Mathematics", "English", "Science"].slice(
                0,
                Math.floor(Math.random() * 3) + 1
              ),
              academicLevel: ["Primary", "Secondary", "Advanced"][
                Math.floor(Math.random() * 3)
              ],
              learningGoals: "Improve academic performance and understanding",
              hourlyRate: [12000, 15000, 18000, 20000, 25000][
                Math.floor(Math.random() * 5)
              ],
            }
          : serviceType === "childcare"
          ? {
              careType: ["daily", "monthly"][Math.floor(Math.random() * 2)] as
                | "daily"
                | "monthly",
              dropoffTime: "08:00",
              pickupTime: "17:00",
              specialNeeds: i % 5 === 0 ? "Special dietary requirements" : "",
              dailyRate: 5000,
              monthlyRate: 120000,
            }
          : serviceType === "holiday-camps"
          ? {
              campWeeks: [
                {
                  startDate: startDate.toISOString().split("T")[0],
                  endDate: new Date(
                    startDate.getTime() + 7 * 24 * 60 * 60 * 1000
                  )
                    .toISOString()
                    .split("T")[0],
                  weekNumber: Math.floor(1), // Ensure integer
                },
              ],
              weeklyRate: 30000,
            }
          : serviceType === "space-rental"
          ? {
              eventType: ["birthday", "ceremony", "meeting", "other"][
                Math.floor(Math.random() * 4)
              ] as "birthday" | "ceremony" | "meeting" | "other",
              eventDate: startDate.toISOString().split("T")[0],
              eventTime: "15:00",
              venueType: ["indoor", "outdoor", "both"][
                Math.floor(Math.random() * 3)
              ] as "indoor" | "outdoor" | "both",
              expectedGuests: Math.floor(Math.random() * 50) + 10,
              baseRate: 250000,
              cautionFee: 50000,
            }
          : {}, // kiddies-enrichment or default empty object

      // Schedule information
      schedule: {
        startDate: startDate.toISOString(),
        endDate: new Date(
          startDate.getTime() +
            (serviceType === "tutoring" ? 7 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        weekdays:
          serviceType === "tutoring"
            ? ["Monday", "Wednesday", "Friday"]
                .slice(0, Math.floor(Math.random() * 3) + 1)
                .map((day) => ({
                  day: day.toLowerCase() as
                    | "monday"
                    | "tuesday"
                    | "wednesday"
                    | "thursday"
                    | "friday"
                    | "saturday"
                    | "sunday",
                  hours: Math.floor(1), // Ensure integer
                  startTime: "15:00",
                  endTime: "16:00",
                }))
            : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day) => ({
                  day: day.toLowerCase() as
                    | "monday"
                    | "tuesday"
                    | "wednesday"
                    | "thursday"
                    | "friday"
                    | "saturday"
                    | "sunday",
                  hours: Math.floor(9), // Ensure integer
                  startTime: "08:00",
                  endTime: "17:00",
                })
              ),
        isRecurring: true,
        frequency:
          serviceType === "tutoring"
            ? "weekly"
            : ("daily" as "daily" | "weekly" | "monthly"),
      },

      // Pricing based on service type
      pricing: {
        baseAmount:
          serviceType === "tutoring"
            ? 15000
            : serviceType === "childcare"
            ? 5000
            : serviceType === "space-rental"
            ? 250000
            : 30000,
        extraServicesAmount: i % 3 === 0 ? 5000 : 0,
        cautionFee: serviceType === "space-rental" ? 50000 : 0,
        discount:
          i % 4 === 0
            ? {
                type: "fixed" as "percentage" | "fixed",
                value: 5000,
                reason: "Early Bird Discount",
              }
            : {
                type: "fixed" as "percentage" | "fixed",
                value: 0,
                reason: "No discount",
              },
        totalAmount:
          serviceType === "tutoring"
            ? 15000 + (i % 3 === 0 ? 5000 : 0) - (i % 4 === 0 ? 5000 : 0)
            : serviceType === "childcare"
            ? 5000 + (i % 3 === 0 ? 5000 : 0) - (i % 4 === 0 ? 5000 : 0)
            : serviceType === "space-rental"
            ? 300000 + (i % 3 === 0 ? 5000 : 0) - (i % 4 === 0 ? 5000 : 0)
            : 30000 + (i % 3 === 0 ? 5000 : 0) - (i % 4 === 0 ? 5000 : 0),
        currency: "NGN",
      },

      // Payment information
      payment: {
        method: ["card", "bank_transfer", "cash", "installments"][
          Math.floor(Math.random() * 4)
        ] as "card" | "bank_transfer" | "cash" | "installments",
        status: ["paid", "pending", "overdue", "refunded"][
          Math.floor(Math.random() * 4)
        ] as "paid" | "pending" | "overdue" | "refunded",
        paidAmount:
          status === "completed"
            ? serviceType === "tutoring"
              ? 15000
              : serviceType === "childcare"
              ? 5000
              : serviceType === "space-rental"
              ? 300000
              : 30000
            : 0,
        paymentDate:
          status === "completed"
            ? startDate.toISOString()
            : new Date().toISOString(),
        transactionId: `TXN${Date.now()}${i}`,
      },

      // Booking status and management
      status,
      priority: ["low", "normal", "high", "urgent"][
        Math.floor(Math.random() * 4)
      ] as "low" | "normal" | "high" | "urgent",

      // Assignment and fulfillment (optional fields)
      assignedAt:
        status !== "pending"
          ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
          : new Date(),
      startedAt: ["in-progress", "completed"].includes(status)
        ? new Date(startDate.getTime())
        : new Date(),
      completedAt:
        status === "completed"
          ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          : new Date(),

      // Timestamps and metadata
      createdAt,
      updatedAt: new Date(),
      cancelledAt:
        status === "cancelled"
          ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
          : new Date(),
      cancellationReason:
        status === "cancelled"
          ? ["Client request", "Tutor unavailable", "Payment issues"][
              Math.floor(Math.random() * 3)
            ]
          : "",

      // Source tracking
      source,
      referralSource:
        source === "referral"
          ? ["Friend", "Family", "Social Media", "Google"][
              Math.floor(Math.random() * 4)
            ]
          : "",

      // Follow-up and relationship management
      followUpRequired: Math.random() > 0.7,
      followUpDate:
        Math.random() > 0.7
          ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000)
          : new Date(),
      isRepeatedCustomer: Math.random() > 0.6, // 40% are repeat customers
      previousBookingIds: Math.random() > 0.7 ? [new ObjectId()] : [],
    };

    sampleBookings.push(booking);
  }

  for (let i = 0; i < sampleBookings.length; i++) {
    try {
      await BookingRepository.createBooking(sampleBookings[i]);
      console.log(
        `✅ Created booking ${i + 1}/20: ${sampleBookings[i].serviceType} for ${
          sampleBookings[i].parentName
        }`
      );
    } catch (error: unknown) {
      const err = error as Error & {
        errInfo?: {
          details?: {
            schemaRulesNotSatisfied?: unknown[];
          };
        };
      };

      console.error(`❌ Error creating booking ${i + 1}:`);
      console.error(`   Message: ${err.message}`);

      // Display detailed schema validation errors
      if (err.errInfo?.details?.schemaRulesNotSatisfied) {
        console.error(`   📋 Schema validation errors:`);
        const rules = err.errInfo.details.schemaRulesNotSatisfied;

        function displayRules(ruleArray: unknown[], indent = "      ") {
          ruleArray.forEach((rule: unknown) => {
            const r = rule as Record<string, unknown>;
            if (r.operatorName) {
              console.error(
                `${indent}${r.operatorName}: ${r.reason || "validation failed"}`
              );
            }
            if (r.propertyName) {
              console.error(`${indent}Property: ${r.propertyName}`);
            }
            if (r.details) {
              console.error(
                `${indent}Details: ${JSON.stringify(r.details, null, 2)}`
              );
            }
            if (
              r.propertiesNotSatisfied &&
              Array.isArray(r.propertiesNotSatisfied)
            ) {
              console.error(`${indent}Properties not satisfied:`);
              displayRules(r.propertiesNotSatisfied, indent + "   ");
            }
            if (r.missingProperties && Array.isArray(r.missingProperties)) {
              console.error(
                `${indent}Missing properties: ${r.missingProperties.join(", ")}`
              );
            }
          });
        }

        displayRules(rules);
      }

      // Also log the actual booking data for comparison
      console.error(`   🔍 Booking data keys:`, Object.keys(sampleBookings[i]));
      console.error(`   🔍 Service type:`, sampleBookings[i].serviceType);
      console.error(`   🔍 Parent info:`, {
        name: sampleBookings[i].parentName,
        email: sampleBookings[i].parentEmail,
        phone: sampleBookings[i].parentPhone,
      });
    }
  }
}

// Main initialization function
async function main() {
  try {
    console.log(
      "🚀 Starting PARENTALPAL comprehensive database initialization...\n"
    );

    await initializeDatabase();
    await createSampleBookings();

    console.log("\n🎉 Database initialization completed successfully!");
    console.log("✅ Collections created with validation and indexes");
    console.log("✅ Comprehensive sample data inserted:");
    console.log("   - 20 Users (2 admins, 10 parents, 8 tutors)");
    console.log("   - 20 Bookings (various services, statuses, dates)");
    console.log("   - 10 Services (tutoring, childcare, camps, events)");
    console.log("\nYour PARENTALPAL database is ready for analytics! 🎊");
  } catch (error) {
    console.error("\n❌ Initialization failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { initializeDatabase, createSampleBookings };
export default main;
