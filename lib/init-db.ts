// Load environment variables first
import { config } from "dotenv";
config({ path: ".env.local" });

import { ObjectId } from "mongodb";
import { getCollection } from "./mongodb";
import { UserRepository } from "./UserRepository";
import { BookingRepository } from "./BookingRepository";
import { PostRepository } from "./PostRepository";
import { UserInterface } from "../models/User";
import { BookingInterface } from "../models/Booking";
import { ServiceInterface } from "../models/Service";
import { PostInterface, PostCategory, ServiceType } from "../models/Post";

// Nigerian names and data for realistic sample generation
const NIGERIAN_NAMES = {
  first: [
    "Adebayo",
    "Chioma",
    "Emeka",
    "Funmi",
    "Godwin",
    "Halima",
    "Ibrahim",
    "Joke",
    "Kemi",
    "Lanre",
    "Musa",
    "Ngozi",
    "Ola",
    "Patience",
    "Rasheed",
    "Sarah",
    "Tunde",
    "Uche",
    "Victor",
    "Wale",
    "Yemi",
    "Zainab",
    "Abigail",
    "Daniel",
    "Grace",
    "Joseph",
    "Mary",
    "Paul",
    "Ruth",
    "Samuel",
    "Esther",
    "Michael",
    "Joy",
    "David",
    "Faith",
    "John",
    "Hope",
    "Peter",
    "Love",
    "James",
  ],
  last: [
    "Adebayo",
    "Okafor",
    "Williams",
    "Johnson",
    "Okonkwo",
    "Adesanya",
    "Bello",
    "Ogbonna",
    "Fashola",
    "Okoro",
    "Adeyemi",
    "Nwosu",
    "Babatunde",
    "Chukwu",
    "Olumide",
    "Danjuma",
    "Ezeobi",
    "Fagbemi",
    "Gbolahan",
    "Ikechukwu",
    "Jegede",
    "Kalu",
    "Lawal",
    "Madu",
    "Nkem",
    "Oduya",
    "Philips",
    "Quadri",
  ],
};

const SCHOOLS = [
  "Lagos International School",
  "British International School",
  "Corona Schools",
  "Greensprings School",
  "Dowen College",
  "Caleb International School",
  "Nigerian Turkish International College",
  "Atlantic Hall",
  "The Ambassadors College",
  "Meadow Hall Education",
  "Chrisland Schools",
  "Lead City International School",
];

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature",
  "History",
  "Geography",
  "Computer Science",
  "Further Mathematics",
  "Agricultural Science",
  "French",
];

const LOCATIONS = [
  "Victoria Island, Lagos",
  "Lekki, Lagos",
  "Ikeja, Lagos",
  "Surulere, Lagos",
  "Ikoyi, Lagos",
  "Yaba, Lagos",
  "Gbagada, Lagos",
  "Ajah, Lagos",
  "Magodo, Lagos",
  "Festac, Lagos",
  "Isolo, Lagos",
  "Alimosho, Lagos",
];

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function generateNigerianPhoneNumber(): string {
  // Format: ####-###-#### as expected by validation schema
  const area = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  const exchange = Math.floor(Math.random() * 900) + 100; // 100-999
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `${area}-${exchange}-${number}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(
    domains
  )}`;
}

// Initialize database with all repositories
async function initializeDatabase() {
  console.log("🔄 Initializing database collections...");

  try {
    await UserRepository.initialize();
    await BookingRepository.initialize();
    await PostRepository.initialize();

    // Initialize Services collection manually (no repository yet)
    const servicesCollection = await getCollection<ServiceInterface>(
      "services"
    );
    try {
      await servicesCollection.drop();
    } catch {
      // Collection doesn't exist
    }

    console.log("✅ Database collections initialized successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Generate sample users (100 total: 1 admin, 69 parents, 30 tutors)
async function createSampleUsers() {
  console.log("🔄 Creating 100 sample users...");

  const userRepository = new UserRepository();
  const users: UserInterface[] = [];
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  // Create 1 admin user
  for (let i = 0; i < 1; i++) {
    const firstName = getRandomElement(NIGERIAN_NAMES.first);
    const lastName = getRandomElement(NIGERIAN_NAMES.last);
    const email = generateEmail(firstName, lastName);

    const admin: UserInterface = {
      userData: {
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days
        user: {
          name: `${firstName} ${lastName}`,
          email,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        },
      },
      phone: generateNigerianPhoneNumber(),
      address: getRandomElement(LOCATIONS),
      role: "admin",
      isActive: true,
      lastLoginAt: getRandomDate(oneYearAgo, now),
      membershipType: "premium",
      createdAt: getRandomDate(oneYearAgo, now),
      updatedAt: new Date(),
    };

    const createdAdmin = await UserRepository.createUser(admin);
    users.push(createdAdmin);
  }

  // Create 69 parent users with children
  for (let i = 0; i < 69; i++) {
    const firstName = getRandomElement(NIGERIAN_NAMES.first);
    const lastName = getRandomElement(NIGERIAN_NAMES.last);
    const email = generateEmail(firstName, lastName);

    // Generate 1-4 children per parent
    const childrenCount = Math.floor(Math.random() * 4) + 1;
    const children = [];

    for (let j = 0; j < childrenCount; j++) {
      const childFirstName = getRandomElement(NIGERIAN_NAMES.first);
      const childAge = Math.floor(Math.random() * 10) + 1; // Ages 1-10

      children.push({
        name: `${childFirstName} ${lastName}`,
        age: childAge,
        class:
          childAge >= 6 ? `JSS${Math.floor(Math.random() * 3) + 1}` : "Nursery",
        schoolName: getRandomElement(SCHOOLS),
        subjects: getRandomElements(
          SUBJECTS,
          Math.floor(Math.random() * 5) + 2
        ),
      });
    }

    const parent: UserInterface = {
      userData: {
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        user: {
          name: `${firstName} ${lastName}`,
          email,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        },
      },
      phone: generateNigerianPhoneNumber(),
      address: getRandomElement(LOCATIONS),
      role: "parent",
      isActive: Math.random() > 0.1, // 90% active
      lastLoginAt: getRandomDate(oneYearAgo, now),
      membershipType: getRandomElement(["basic", "premium", "none"]),
      children,
      createdAt: getRandomDate(oneYearAgo, now),
      updatedAt: new Date(),
    };

    const createdParent = await UserRepository.createUser(parent);
    users.push(createdParent);
  }

  // Create 30 tutor users
  for (let i = 0; i < 30; i++) {
    const firstName = getRandomElement(NIGERIAN_NAMES.first);
    const lastName = getRandomElement(NIGERIAN_NAMES.last);
    const email = generateEmail(firstName, lastName);

    const tutorSubjects = getRandomElements(
      SUBJECTS,
      Math.floor(Math.random() * 4) + 2
    );
    const experience = Math.floor(Math.random() * 10) + 1; // 1-10 years

    const tutor: UserInterface = {
      userData: {
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        user: {
          name: `${firstName} ${lastName}`,
          email,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        },
      },
      phone: generateNigerianPhoneNumber(),
      address: getRandomElement(LOCATIONS),
      role: "tutor",
      isActive: Math.random() > 0.05, // 95% active
      lastLoginAt: getRandomDate(oneYearAgo, now),
      membershipType: getRandomElement(["basic", "premium"]),
      tutorProfile: {
        specialty: getRandomElement(tutorSubjects),
        experience,
        qualifications: [
          `${getRandomElement([
            "B.Sc",
            "B.A",
            "M.Sc",
            "M.A",
            "Ph.D",
          ])} in ${getRandomElement(tutorSubjects)}`,
          `${experience > 5 ? "Senior" : "Junior"} Teaching Certificate`,
        ],
        subjects: tutorSubjects,
        rating: Math.random() * 2 + 3, // 3.0 - 5.0 rating
        totalReviews: Math.floor(Math.random() * 50) + 5,
        availability: {
          days: getRandomElements(
            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            Math.floor(Math.random() * 4) + 3
          ),
          hours: {
            start: "08:00",
            end: "18:00",
          },
        },
        hourlyRate: Math.floor(Math.random() * 5000) + 10000, // ₦10,000 - ₦15,000 per hour,
        bio: `Experienced ${getRandomElement(
          tutorSubjects
        )} tutor with ${experience} years of teaching experience. Specializing in helping students achieve academic excellence.`,
        isVerified: Math.random() > 0.2, // 80% verified
      },
      createdAt: getRandomDate(oneYearAgo, now),
      updatedAt: new Date(),
    };

    const createdTutor = await UserRepository.createUser(tutor);
    users.push(createdTutor);
  }

  console.log(
    `✅ Created ${users.length} users (1 admin, 69 parents, 30 tutors)`
  );
  return users;
}

// Generate sample services
async function createSampleServices() {
  console.log("🔄 Creating sample services...");

  const servicesCollection = await getCollection<ServiceInterface>("services");

  const services: ServiceInterface[] = [
    {
      name: "Private Home Tutoring",
      type: "tutoring",
      description:
        "One-on-one personalized tutoring sessions at your home. Our certified tutors provide customized learning experiences tailored to your child's needs.",
      shortDescription: "Personalized home tutoring sessions",
      pricing: {
        baseRate: 15000,
        currency: "NGN",
        billingType: "hourly",
        packages: [
          {
            name: "Weekly Package",
            description: "4 sessions per week",
            duration: "1 week",
            discountPercentage: 5,
            minimumSessions: 4,
          },
          {
            name: "Monthly Package",
            description: "16 sessions per month",
            duration: "1 month",
            discountPercentage: 10,
            minimumSessions: 16,
          },
        ],
      },
      requirements: {
        minimumAge: 3,
        maximumAge: 18,
        ageGroups: ["toddler", "preschool", "primary", "secondary"],
        minimumParticipants: 1,
        maximumParticipants: 3,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    },

    {
      name: "Daily Childcare Services",
      type: "childcare",
      description:
        "Professional childcare services providing safe, nurturing environment for your children while you work or attend to other commitments.",
      shortDescription: "Professional daily childcare",
      pricing: {
        baseRate: 5000,
        currency: "NGN",
        billingType: "daily",
        packages: [
          {
            name: "Monthly Care Package",
            description: "Full month childcare service",
            duration: "1 month",
            discountPercentage: 15,
            minimumSessions: 22,
          },
        ],
      },
      requirements: {
        minimumAge: 2,
        maximumAge: 12,
        ageGroups: ["toddler", "preschool", "primary"],
        minimumParticipants: 1,
        maximumParticipants: 8,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    },

    {
      name: "Homeschooling Support Program",
      type: "homeschooling",
      description:
        "Comprehensive homeschooling support providing structured curriculum, teaching materials, and regular assessments for families choosing home education.",
      shortDescription: "Complete homeschooling curriculum and support",
      pricing: {
        baseRate: 50000,
        currency: "NGN",
        billingType: "monthly",
        packages: [
          {
            name: "Annual Package",
            description: "Full academic year support",
            duration: "12 months",
            discountPercentage: 20,
            minimumSessions: 12,
          },
        ],
      },
      requirements: {
        minimumAge: 3,
        maximumAge: 18,
        ageGroups: ["toddler", "preschool", "primary", "secondary"],
        minimumParticipants: 1,
        maximumParticipants: 5,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    },

    {
      name: "Holiday Adventure Camps",
      type: "holiday-camps",
      description:
        "Fun-filled educational holiday camps combining learning with adventure activities. Perfect for keeping children engaged during school breaks.",
      shortDescription: "Educational holiday camps with adventure activities",
      pricing: {
        baseRate: 30000,
        currency: "NGN",
        billingType: "weekly",
      },
      requirements: {
        minimumAge: 5,
        maximumAge: 16,
        ageGroups: ["preschool", "primary", "secondary"],
        minimumParticipants: 10,
        maximumParticipants: 50,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    },

    {
      name: "Event Space Rental & Planning",
      type: "space-rental",
      description:
        "Premium venue rental for children's parties and events, including indoor and outdoor spaces with full event planning services and entertainment options.",
      shortDescription: "Event venue rental with planning services",
      pricing: {
        baseRate: 250000,
        currency: "NGN",
        billingType: "per-event",
        packages: [
          {
            name: "Premium Package",
            description: "Both indoor & outdoor access",
            duration: "1 day",
            discountPercentage: 0,
            minimumSessions: 1,
          },
        ],
      },
      requirements: {
        minimumAge: 1,
        maximumAge: 18,
        ageGroups: ["toddler", "preschool", "primary", "secondary"],
        minimumParticipants: 20,
        maximumParticipants: 200,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    },

    {
      name: "Kids Enrichment Programs",
      type: "kiddies-enrichment",
      description:
        "Specialized enrichment programs including music, arts, sports, and STEM activities designed to develop children's talents and interests beyond regular academics.",
      shortDescription: "Music, arts, sports & STEM enrichment activities",
      pricing: {
        baseRate: 20000,
        currency: "NGN",
        billingType: "monthly",
        packages: [
          {
            name: "Multi-Activity Package",
            description: "Access to 3+ activities",
            duration: "1 month",
            discountPercentage: 15,
            minimumSessions: 8,
          },
          {
            name: "Term Package",
            description: "Full academic term",
            duration: "3 months",
            discountPercentage: 25,
            minimumSessions: 24,
          },
        ],
      },
      requirements: {
        minimumAge: 3,
        maximumAge: 16,
        ageGroups: ["toddler", "preschool", "primary", "secondary"],
        minimumParticipants: 1,
        maximumParticipants: 15,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    },
  ];

  for (const service of services) {
    await servicesCollection.insertOne(service);
  }

  console.log(
    `✅ Created ${services.length} sample services (all 6 service types)`
  );
  return services;
}

// Generate synchronized bookings spanning 12 months
async function createSampleBookings(
  users: UserInterface[],
  services: ServiceInterface[]
) {
  console.log("🔄 Creating synchronized bookings for 12 months...");

  const bookingRepository = new BookingRepository();
  const parents = users.filter((user) => user.role === "parent");
  const tutors = users.filter((user) => user.role === "tutor");

  const bookings: BookingInterface[] = [];
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );
  const sixMonthsFromNow = new Date(
    now.getFullYear(),
    now.getMonth() + 6,
    now.getDate()
  );

  // Create bookings for each month over 12 months (past 12 months only, no future)
  for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    );
    const bookingsThisMonth = Math.floor(Math.random() * 15) + 10; // 10-24 bookings per month

    for (let i = 0; i < bookingsThisMonth; i++) {
      const parent = getRandomElement(parents);
      const service = getRandomElement(services);
      const serviceType = service.type;

      if (!parent.children || parent.children.length === 0) continue;

      // Random booking date within the month
      const bookingDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        Math.floor(Math.random() * 28) + 1
      );

      const selectedChildren = parent.children.slice(
        0,
        Math.floor(Math.random() * parent.children.length) + 1
      );

      // Create a minimal valid booking for testing
      const booking: BookingInterface = {
        userId: new ObjectId(parent._id),
        serviceType: serviceType,
        parentName: parent.userData.user.name || "Unknown Parent",
        parentEmail: parent.userData.user.email || "unknown@example.com",
        parentPhone: parent.phone || generateNigerianPhoneNumber(),
        childrenCount: selectedChildren.length,
        children: selectedChildren.map((child) => ({
          name: child.name,
          age: child.age,
          class: child.class,
          schoolName: child.schoolName,
        })),
        serviceData: {},
        schedule: {
          startDate: bookingDate.toISOString().split("T")[0],
          isRecurring: false,
        },
        pricing: {
          baseAmount: getRandomElement([0, 5000, 15000, 30000, 45000]),
          totalAmount: getRandomElement([0, 5000, 15000, 30000, 45000]),
          currency: "NGN",
        },
        status: getRandomElement([
          "pending",
          "confirmed",
          "completed",
          "cancelled",
        ]),
        payment: {
          status: getRandomElement(["pending", "paid", "refunded"]),
          paidAmount: getRandomElement([0, 5000, 15000, 30000, 45000]),
          method: getRandomElement([
            "card",
            "bank_transfer",
            "cash",
            "installments",
          ]),
        },
        createdAt: bookingDate,
        updatedAt: bookingDate,
        source: getRandomElement([
          "social media",
          "online search",
          "signage",
          "referral",
          "walk in",
          "other",
        ]),
        followUpRequired: Math.random() > 0.8, // 20% chance
        isRepeatedCustomer: Math.random() > 0.2, // 80% chance
      };

      // Service-specific data generation
      switch (serviceType) {
        case "tutoring":
          const tutor = getRandomElement(tutors);
          const subjects = getRandomElements(
            SUBJECTS,
            Math.floor(Math.random() * 3) + 1
          );
          const hourlyRate = tutor.tutorProfile?.hourlyRate || 15000;
          const hours = Math.floor(Math.random() * 3) + 1; // 1-3 hours

          booking.serviceData = {
            subjects,
            academicLevel: getRandomElement(["Primary", "JSS", "SSS"]),
            learningGoals: "Improve academic performance and understanding",
            hourlyRate,
          };

          booking.schedule.weekdays = [
            {
              day: getRandomElement([
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
              ]),
              hours,
              startTime: "15:00",
              endTime: `${15 + hours}:00`,
            },
          ];
          booking.schedule.isRecurring = true;
          booking.schedule.frequency = "weekly";

          booking.pricing.baseAmount = hourlyRate * hours;
          booking.pricing.totalAmount = booking.pricing.baseAmount;
          break;

        case "childcare":
          const careType = getRandomElement(["daily", "monthly"]);
          const dailyRate = 5000;
          const days =
            careType === "monthly" ? 22 : Math.floor(Math.random() * 5) + 1;

          const specialNeeds =
            Math.random() > 0.8 ? "Allergic to nuts" : undefined;
          const monthlyRate =
            careType === "monthly" ? dailyRate * 22 * 0.85 : undefined;

          booking.serviceData = {
            careType: careType as "daily" | "monthly",
            dropoffTime: "07:30",
            pickupTime: "17:30",
            dailyRate,
            ...(specialNeeds && { specialNeeds }),
            ...(monthlyRate && { monthlyRate }),
          };

          booking.schedule.endDate = new Date(
            bookingDate.getTime() +
              (careType === "monthly" ? 30 : days) * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];
          booking.schedule.isRecurring = true;
          booking.schedule.frequency =
            careType === "monthly" ? "monthly" : "daily";

          booking.pricing.baseAmount =
            careType === "monthly" ? dailyRate * 22 * 0.85 : dailyRate * days;
          booking.pricing.totalAmount = booking.pricing.baseAmount;
          if (careType === "monthly") {
            booking.pricing.discount = {
              type: "percentage",
              value: 15,
              reason: "Monthly package discount",
            };
          }
          break;

        case "holiday-camps":
          const weeklyRate = 30000;
          const weeks = Math.floor(Math.random() * 3) + 1; // 1-3 weeks

          const campWeeks = [];
          for (let w = 0; w < weeks; w++) {
            const weekStart = new Date(
              bookingDate.getTime() + w * 7 * 24 * 60 * 60 * 1000
            );
            const weekEnd = new Date(
              weekStart.getTime() + 6 * 24 * 60 * 60 * 1000
            );

            campWeeks.push({
              startDate: weekStart.toISOString().split("T")[0],
              endDate: weekEnd.toISOString().split("T")[0],
              weekNumber: w + 1,
            });
          }

          booking.serviceData = {
            campWeeks,
            weeklyRate,
          };

          booking.schedule.endDate = campWeeks[campWeeks.length - 1].endDate;

          booking.pricing.baseAmount = weeklyRate * weeks;
          booking.pricing.totalAmount = booking.pricing.baseAmount;
          break;

        case "space-rental":
          const venueType = getRandomElement(["indoor", "outdoor", "both"]);
          const baseRate = venueType === "both" ? 470000 : 250000;
          const cautionFee = 50000;
          const extraServices = [];

          // Randomly add extra services
          if (Math.random() > 0.5) {
            extraServices.push({
              service: "dj" as const,
              quantity: 1,
              rate: 150000,
            });
          }
          if (Math.random() > 0.7) {
            extraServices.push({
              service: "mc" as const,
              quantity: 1,
              rate: 60000,
            });
          }

          booking.serviceData = {
            eventType: getRandomElement([
              "birthday",
              "ceremony",
              "meeting",
              "other",
            ]),
            eventDate: bookingDate.toISOString().split("T")[0],
            eventTime: "10:00",
            venueType: getRandomElement(["indoor", "outdoor", "both"]),
            expectedGuests: Math.floor(Math.random() * 100) + 20,
            extraServices,
            cautionFee,
            baseRate,
          };

          const extraServicesAmount = extraServices.reduce(
            (sum, service) => sum + service.rate,
            0
          );
          booking.pricing.baseAmount = baseRate;
          booking.pricing.extraServicesAmount = extraServicesAmount;
          booking.pricing.cautionFee = cautionFee;
          booking.pricing.totalAmount =
            baseRate + extraServicesAmount + cautionFee;
          break;

        case "homeschooling":
          const homeschoolingMonthlyRate = 50000;
          const monthsOfSupport = Math.floor(Math.random() * 6) + 1; // 1-6 months

          booking.serviceData = {
            subjects: getRandomElements(
              SUBJECTS,
              Math.floor(Math.random() * 6) + 3
            ),
            monthlyRate: homeschoolingMonthlyRate,
          };

          booking.schedule.isRecurring = true;
          booking.schedule.frequency = "monthly";
          booking.schedule.endDate = new Date(
            bookingDate.getTime() + monthsOfSupport * 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];

          const totalAmount = homeschoolingMonthlyRate * monthsOfSupport;
          const discount = monthsOfSupport >= 6 ? totalAmount * 0.2 : 0; // 20% discount for 6+ months

          booking.pricing.baseAmount = totalAmount;
          booking.pricing.totalAmount = totalAmount - discount;
          if (discount > 0) {
            booking.pricing.discount = {
              type: "percentage",
              value: 20,
              reason: "Annual package discount",
            };
          }
          break;

        case "kiddies-enrichment":
          const activities = getRandomElements(
            [
              "Music Lessons",
              "Art & Craft",
              "Sports Training",
              "STEM Projects",
              "Drama & Theatre",
              "Dance Classes",
              "Coding for Kids",
              "Public Speaking",
            ],
            Math.floor(Math.random() * 4) + 1
          );

          const enrichmentRate = 20000;
          const sessionsPerMonth = 8;
          const enrichmentMonths = Math.floor(Math.random() * 3) + 1; // 1-3 months

          booking.serviceData = {
            monthlyRate: enrichmentRate,
          };

          booking.schedule.isRecurring = true;
          booking.schedule.frequency = "monthly";
          booking.schedule.weekdays = Array.from({ length: 2 }, () => ({
            day: getRandomElement([
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ]),
            hours: 2,
            startTime: "15:00",
            endTime: "17:00",
          }));
          booking.schedule.endDate = new Date(
            bookingDate.getTime() + enrichmentMonths * 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];

          const enrichmentTotal = enrichmentRate * enrichmentMonths;
          const multiActivityDiscount =
            activities.length >= 3 ? enrichmentTotal * 0.15 : 0; // 15% for 3+ activities

          booking.pricing.baseAmount = enrichmentTotal;
          booking.pricing.totalAmount = enrichmentTotal - multiActivityDiscount;
          if (multiActivityDiscount > 0) {
            booking.pricing.discount = {
              type: "percentage",
              value: 15,
              reason: "Multi-activity discount",
            };
          }
          break;
      }

      try {
        const createdBooking = await BookingRepository.createBooking(booking);
        bookings.push(createdBooking);
      } catch (error: unknown) {
        console.error("❌ Booking validation failed for:", {
          serviceType: booking.serviceType,
          parentName: booking.parentName,
          parentEmail: booking.parentEmail,
          parentPhone: booking.parentPhone,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error("Full booking object:", JSON.stringify(booking, null, 2));
        throw error;
      }
    }
  }

  console.log(
    `✅ Created ${bookings.length} synchronized bookings spanning 12 months`
  );
  return bookings;
}

// Generate sample blog posts
async function createSamplePosts(users: UserInterface[]) {
  console.log("🔄 Creating sample blog posts...");

  const postRepository = new PostRepository();
  const admins = users.filter((user) => user.role === "admin");
  const tutors = users.filter((user) => user.role === "tutor");
  const authors = [...admins, ...tutors.slice(0, 5)]; // Mix of admins and some tutors

  const categories: PostCategory[] = [
    "Education Tips",
    "Success Stories",
    "Parenting Tips",
    "Child Development",
    "Technology",
    "Early Learning",
    "STEM Education",
    "General",
  ];

  const samplePosts = [
    {
      title: "10 Effective Study Techniques for Nigerian Students",
      excerpt:
        "Discover proven study methods that work specifically for the Nigerian education system and cultural context.",
      content:
        "In Nigeria's competitive academic environment, students need effective study strategies to excel. This comprehensive guide explores ten research-backed techniques that have proven successful for Nigerian students across different educational levels...",
      category: "Education Tips" as PostCategory,
      tags: [
        "study tips",
        "education",
        "students",
        "Nigeria",
        "academic success",
      ],
    },
    {
      title: "How PARENTALPAL Helped Kemi Achieve Excellence in Mathematics",
      excerpt:
        "A success story of how personalized tutoring transformed a struggling student into a mathematics champion.",
      content:
        "Meet Kemi, a 14-year-old JSS3 student who was struggling with mathematics. Through PARENTALPAL's personalized tutoring program, she not only improved her grades but also developed a genuine love for numbers...",
      category: "Success Stories" as PostCategory,
      tags: ["success story", "mathematics", "tutoring", "student achievement"],
    },
    {
      title: "Balancing Work and Parenting in Modern Lagos",
      excerpt:
        "Practical strategies for Lagos parents juggling demanding careers and quality family time.",
      content:
        "Lagos is one of the busiest cities in Africa, and for working parents, finding the right balance between career advancement and quality parenting can be challenging. Here are proven strategies...",
      category: "Parenting Tips" as PostCategory,
      tags: ["parenting", "work-life balance", "Lagos", "career", "family"],
    },
    {
      title: "Understanding Your Child's Learning Style",
      excerpt:
        "How to identify and nurture your child's unique learning preferences for better academic outcomes.",
      content:
        "Every child learns differently. Some are visual learners who need to see information, others are auditory learners who learn through listening, and kinesthetic learners who need hands-on activities...",
      category: "Child Development" as PostCategory,
      tags: ["learning styles", "child development", "education", "parenting"],
    },
    {
      title: "Digital Learning Tools Every Nigerian Student Should Know",
      excerpt:
        "Essential educational apps and platforms that can enhance learning for students across Nigeria.",
      content:
        "Technology has revolutionized education globally, and Nigerian students can benefit greatly from digital learning tools. This article explores the most effective educational technologies...",
      category: "Technology" as PostCategory,
      tags: ["technology", "digital learning", "education apps", "students"],
    },
  ];

  const posts: PostInterface[] = [];
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  for (let i = 0; i < 25; i++) {
    // Create 25 blog posts
    const basePost = getRandomElement(samplePosts);
    const author = getRandomElement(authors);
    const publishDate = getRandomDate(oneYearAgo, now);

    const post: Omit<PostInterface, "_id" | "createdAt" | "updatedAt"> = {
      title: `${basePost.title} ${
        i > 4 ? `- Part ${Math.floor(i / 5) + 1}` : ""
      }`,
      slug: "", // Will be generated by PostUtils
      excerpt: basePost.excerpt,
      content:
        basePost.content +
        `\n\nThis is an extended article providing more detailed insights and practical examples for Nigerian families and students.`,

      authorId: author._id,
      authorName: author.userData.user.name!,
      authorImage: author.userData.user.image || undefined,
      authorBio:
        author.role === "tutor"
          ? author.tutorProfile?.bio
          : "Educational content creator and child development expert",

      status: getRandomElement([
        "draft",
        "published",
        "published",
        "published",
      ]), // More published than drafts
      publishedAt: Math.random() > 0.2 ? publishDate : undefined, // 80% published

      category: getRandomElement(categories),
      tags: [
        ...basePost.tags,
        getRandomElement(["Nigeria", "Lagos", "education", "children"]),
      ],
      keywords: basePost.tags,

      featuredImage: `https://picsum.photos/800/400?random=${i}`,

      views: Math.floor(Math.random() * 1000) + 50,
      likes: Math.floor(Math.random() * 100) + 5,
      shares: Math.floor(Math.random() * 50) + 1,
      comments: [],

      readTime: Math.floor(Math.random() * 8) + 3, // 3-10 minutes
      displayOrder: i,
      isFeatured: Math.random() > 0.8, // 20% featured
      isPopular: Math.random() > 0.7, // 30% popular

      relatedServices: getRandomElements(
        [
          "childcare",
          "tutoring",
          "homeschooling",
          "holiday-camps",
          "space-rental",
          "kiddies-enrichment",
        ],
        Math.floor(Math.random() * 3) + 1
      ),
      targetAgeGroup: {
        min: Math.floor(Math.random() * 8) + 3, // 3-10
        max: Math.floor(Math.random() * 8) + 11, // 11-18
      },
    };

    const createdPost = await postRepository.create(post);
    posts.push(createdPost);
  }

  console.log(`✅ Created ${posts.length} sample blog posts`);
  return posts;
}

// Main initialization function
async function main() {
  try {
    console.log(
      "🚀 Starting PARENTALPAL comprehensive database initialization...\n"
    );

    await initializeDatabase();

    const users = await createSampleUsers();
    const services = await createSampleServices();
    const bookings = await createSampleBookings(users, services);
    const posts = await createSamplePosts(users);

    console.log("\n🎉 Database initialization completed successfully!");
    console.log("✅ Collections created with validation and indexes");
    console.log("✅ Comprehensive sample data inserted:");
    console.log(`   - ${users.length} Users (1 admin, 69 parents, 30 tutors)`);
    console.log(
      `   - ${services.length} Services (all 6 service types: tutoring, childcare, homeschooling, holiday-camps, space-rental, kiddies-enrichment)`
    );
    console.log(
      `   - ${bookings.length} Bookings (spanning 12 months with realistic data)`
    );
    console.log(
      `   - ${posts.length} Blog Posts (various categories and statuses)`
    );
    console.log(
      "\n📊 Data spans 12 months (past 12 months only, no future data)"
    );
    console.log(
      "🔗 All data is synchronized: parents have children, bookings reference real users and services"
    );
    console.log("\n🎊 Your PARENTALPAL development database is ready!");
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

export {
  initializeDatabase,
  createSampleUsers,
  createSampleServices,
  createSampleBookings,
  createSamplePosts,
};
