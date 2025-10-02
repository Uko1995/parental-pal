// Load environment variables first
import { config } from "dotenv";
config({ path: ".env.local" });

import { getCollection } from "./mongodb";
import { UserRepository } from "./UserRepository";
import { BookingRepository } from "./BookingRepository";

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

// Sample data insertion functions
async function createSampleUsers() {
  console.log("🔄 Creating sample users...");

  const sampleUsers = [
    {
      name: "Admin User",
      email: "admin@parentalpal.com",
      role: "admin" as const,
      isActive: true,
      membershipType: "premium" as const,
    },
    {
      name: "John Parent",
      email: "john.parent@example.com",
      role: "parent" as const,
      isActive: true,
      membershipType: "basic" as const,
      children: [
        {
          name: "Emma Johnson",
          age: 8,
          class: "Grade 3",
          schoolName: "Greenwood Elementary",
          subjects: ["Mathematics", "English"],
        },
      ],
    },
    {
      name: "Sarah Tutor",
      email: "sarah.tutor@example.com",
      role: "tutor" as const,
      isActive: true,
      membershipType: "basic" as const,
      tutorProfile: {
        specialty: "Mathematics and Science",
        experience: 5,
        qualifications: ["B.Ed Mathematics", "M.Sc Physics"],
        subjects: ["Mathematics", "Physics", "Chemistry"],
        rating: 4.8,
        totalReviews: 24,
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as (
            | "Monday"
            | "Tuesday"
            | "Wednesday"
            | "Thursday"
            | "Friday"
            | "Saturday"
            | "Sunday"
          )[],
          hours: {
            start: "09:00",
            end: "17:00",
          },
        },
        hourlyRate: 15000,
        bio: "Experienced mathematics and science tutor with 5+ years of teaching experience.",
        isVerified: true,
        isAvailable: true,
      },
    },
  ];

  for (const userData of sampleUsers) {
    try {
      await UserRepository.createUser(userData);
      console.log(`✅ Created user: ${userData.name}`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Email already exists")
      ) {
        console.log(`ℹ️  User ${userData.name} already exists`);
      } else {
        console.error(`❌ Error creating user ${userData.name}:`, error);
      }
    }
  }
}

async function createSampleServices() {
  console.log("🔄 Creating sample services...");

  const servicesCollection = await getCollection("services");

  const sampleServices = [
    {
      name: "Academic Tutoring",
      type: "tutoring",
      category: "education",
      description:
        "Personalized one-on-one tutoring sessions for primary and secondary school students. Our qualified tutors help students excel in their studies with customized learning plans.",
      shortDescription: "One-on-one tutoring for academic excellence",
      features: [
        "Personalized learning plans",
        "Qualified and experienced tutors",
        "Flexible scheduling",
        "Progress tracking",
        "Subject expertise across curriculum",
      ],
      benefits: [
        "Improved academic performance",
        "Increased confidence",
        "Better study habits",
        "Exam preparation support",
      ],
      pricing: {
        baseRate: 15000,
        currency: "NGN",
        billingType: "hourly",
      },
      availability: {
        days: [
          { day: "monday", available: true },
          { day: "tuesday", available: true },
          { day: "wednesday", available: true },
          { day: "thursday", available: true },
          { day: "friday", available: true },
          { day: "saturday", available: true },
          { day: "sunday", available: false },
        ],
        minimumAdvanceBooking: 1,
        maximumAdvanceBooking: 30,
        cancellationPolicy: "24 hours notice required for cancellation",
      },
      requirements: {
        minimumParticipants: 1,
        maximumParticipants: 1,
        minimumAge: 5,
        maximumAge: 18,
      },
      staffing: {
        staffRequired: 1,
        qualificationRequirements: ["Bachelor's degree", "Teaching experience"],
        experienceLevel: "intermediate",
        backgroundCheckRequired: true,
      },
      delivery: {
        location: "both",
        setupTime: 15,
        cleanupTime: 10,
        materialsIncluded: ["Study materials", "Practice exercises"],
        safetyMeasures: ["COVID-19 protocols", "Safe environment"],
        insuranceCovered: true,
      },
      presentation: {
        tags: ["tutoring", "education", "academic", "personalized"],
        keywords: ["tutor", "homework", "exam", "study", "learning"],
        targetAudience: ["students", "parents", "academic improvement"],
      },
      status: "active",
      priority: 1,
      featured: true,
      popular: true,
      metrics: {
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        conversionRate: 0,
        repeatCustomerRate: 0,
      },
      createdBy: null, // Will be set to admin user ID
      lastModifiedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Daily Childcare",
      type: "childcare",
      category: "care",
      description:
        "Professional daily childcare services providing a safe, nurturing environment for your children. Our trained caregivers ensure your child's development and well-being.",
      shortDescription: "Professional daily childcare services",
      features: [
        "Trained and certified caregivers",
        "Safe and nurturing environment",
        "Educational activities",
        "Nutritious meals",
        "Regular progress updates",
      ],
      benefits: [
        "Peace of mind for parents",
        "Child development support",
        "Social skill development",
        "Structured daily routine",
      ],
      pricing: {
        baseRate: 5000,
        currency: "NGN",
        billingType: "daily",
      },
      availability: {
        days: [
          { day: "monday", available: true },
          { day: "tuesday", available: true },
          { day: "wednesday", available: true },
          { day: "thursday", available: true },
          { day: "friday", available: true },
          { day: "saturday", available: true },
          { day: "sunday", available: false },
        ],
        minimumAdvanceBooking: 2,
        maximumAdvanceBooking: 60,
        cancellationPolicy: "48 hours notice required for cancellation",
      },
      requirements: {
        minimumParticipants: 1,
        maximumParticipants: 8,
        minimumAge: 1,
        maximumAge: 12,
      },
      staffing: {
        staffRequired: 2,
        qualificationRequirements: [
          "Childcare certification",
          "First aid training",
        ],
        experienceLevel: "intermediate",
        backgroundCheckRequired: true,
      },
      delivery: {
        location: "on-site",
        setupTime: 30,
        cleanupTime: 20,
        materialsIncluded: ["Educational toys", "Art supplies", "Books"],
        safetyMeasures: ["Child-proofed environment", "Emergency protocols"],
        insuranceCovered: true,
      },
      presentation: {
        tags: ["childcare", "daycare", "children", "care"],
        keywords: ["babysitter", "nanny", "childcare", "daycare"],
        targetAudience: ["working parents", "families", "children"],
      },
      status: "active",
      priority: 2,
      featured: true,
      popular: true,
      metrics: {
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        conversionRate: 0,
        repeatCustomerRate: 0,
      },
      createdBy: null,
      lastModifiedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const serviceData of sampleServices) {
    try {
      await servicesCollection.insertOne(serviceData);
      console.log(`✅ Created service: ${serviceData.name}`);
    } catch (error) {
      console.error(`❌ Error creating service ${serviceData.name}:`, error);
    }
  }
}

// Main initialization function
async function main() {
  try {
    console.log("🚀 Starting PARENTALPAL database initialization...\n");

    await initializeDatabase();
    await createSampleUsers();
    await createSampleServices();

    console.log("\n🎉 Database initialization completed successfully!");
    console.log("✅ Collections created with validation and indexes");
    console.log("✅ Sample data inserted");
    console.log("\nYour PARENTALPAL database is ready! 🎊");
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

export { initializeDatabase, createSampleUsers, createSampleServices };
export default main;
