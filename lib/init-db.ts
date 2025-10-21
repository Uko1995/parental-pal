import { faker } from "@faker-js/faker";
import { ObjectId } from "mongodb";
import { UserInterface } from "../models/User";
import { BookingInterface } from "../models/Booking";
import { ServiceInterface } from "../models/Service";
import { PostInterface, PostCategory } from "../models/Post";
import clientPromise from "./mongodb";

const usersCollectionName = "users";
const bookingsCollectionName = "bookings";
const servicesCollectionName = "services";
const postsCollectionName = "posts";

// Set faker to generate consistent data
faker.seed(123);

// Helper function to generate dates spanning from January 2025 to current date
const generateDateInRange = (startMonth: number = 0, endMonth: number = 9) => {
  const start = new Date(2025, startMonth, 1);
  const end = new Date(2025, endMonth, 28);
  return faker.date.between({ from: start, to: end });
};

const generateUsers = (): UserInterface[] => {
  const users: UserInterface[] = [];

  // Generate Admin Users (5)
  for (let i = 0; i < 5; i++) {
    users.push({
      _id: new ObjectId(),
      userData: {
        expiresAt: faker.date.future().toISOString(),
        user: {
          name: `Admin ${faker.person.firstName()} ${faker.person.lastName()}`,
          email: `admin${i + 1}@parentalpal.com`,
          image: faker.image.avatar(),
        },
      },
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      role: "admin",
      isActive: faker.datatype.boolean(0.95),
      lastLoginAt: generateDateInRange(8, 9),
      membershipType: "none",
      createdAt: generateDateInRange(0, 2),
      updatedAt: generateDateInRange(8, 9),
    });
  }

  // Generate Parent Users (70)
  for (let i = 0; i < 70; i++) {
    const createdDate = generateDateInRange(0, 8);
    const hasEmergencyContact = faker.datatype.boolean(0.7);

    users.push({
      _id: new ObjectId(),
      userData: {
        expiresAt: faker.date.future().toISOString(),
        user: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          image: faker.image.avatar(),
        },
      },
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      googleId: faker.datatype.boolean(0.3) ? faker.string.uuid() : undefined,
      role: "parent",
      isActive: faker.datatype.boolean(0.9),
      lastLoginAt: generateDateInRange(7, 9),
      membershipType: faker.helpers.arrayElement(["basic", "premium", "none"]),
      children: Array.from(
        { length: faker.number.int({ min: 1, max: 4 }) },
        () => {
          const age = faker.number.int({ min: 1, max: 18 });
          return {
            name: faker.person.firstName(),
            age,
            class:
              age >= 5
                ? `${faker.helpers.arrayElement([
                    "K",
                    "1st",
                    "2nd",
                    "3rd",
                    "4th",
                    "5th",
                    "6th",
                    "7th",
                    "8th",
                    "9th",
                    "10th",
                    "11th",
                    "12th",
                  ])} Grade`
                : undefined,
            schoolName:
              age >= 3
                ? `${faker.location.city()} ${faker.helpers.arrayElement([
                    "Elementary",
                    "Primary",
                    "High School",
                    "Academy",
                  ])}`
                : undefined,
            subjects:
              age >= 6
                ? faker.helpers.arrayElements([
                    "Mathematics",
                    "English",
                    "Science",
                    "Social Studies",
                    "Art",
                  ])
                : undefined,
          };
        }
      ),
      preferences: {
        notifications: {
          email: faker.datatype.boolean(0.8),
          sms: faker.datatype.boolean(0.6),
          push: faker.datatype.boolean(0.7),
        },
        preferredServices: faker.helpers.arrayElements(
          [
            "childcare",
            "tutoring",
            "homeschooling",
            "holiday-camps",
            "space-rental",
            "kiddies-enrichment",
          ],
          { min: 1, max: 4 }
        ),
        emergencyContact: hasEmergencyContact
          ? {
              name: faker.person.fullName(),
              phone: faker.phone.number(),
              relationship: faker.helpers.arrayElement([
                "Spouse",
                "Parent",
                "Sibling",
                "Friend",
                "Relative",
              ]),
            }
          : undefined,
      },
      createdAt: createdDate,
      updatedAt: faker.date.between({ from: createdDate, to: new Date() }),
    });
  }

  // Generate Tutor Users (35)
  for (let i = 0; i < 35; i++) {
    const createdDate = generateDateInRange(0, 7);
    const experience = faker.number.int({ min: 1, max: 15 });
    const totalReviews = faker.number.int({ min: 0, max: 100 });

    users.push({
      _id: new ObjectId(),
      userData: {
        expiresAt: faker.date.future().toISOString(),
        user: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          image: faker.image.avatar(),
        },
      },
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      googleId: faker.datatype.boolean(0.2) ? faker.string.uuid() : undefined,
      role: "tutor",
      isActive: faker.datatype.boolean(0.85),
      lastLoginAt: generateDateInRange(7, 9),
      membershipType: "none",
      tutorProfile: {
        specialty: faker.helpers.arrayElement([
          "Mathematics",
          "Science",
          "English Language",
          "History",
          "Computer Science",
          "Physics",
          "Chemistry",
          "Biology",
          "Literature",
          "Foreign Languages",
        ]),
        experience,
        qualifications: Array.from(
          { length: faker.number.int({ min: 1, max: 4 }) },
          () =>
            faker.helpers.arrayElement([
              "B.Sc. in Mathematics",
              "M.Ed. in Education",
              "Certified Teaching License",
              "PhD in Science",
              "TESOL Certificate",
              "Montessori Training",
              "Special Education Certificate",
            ])
        ),
        subjects: faker.helpers.arrayElements(
          [
            "Algebra",
            "Geometry",
            "Calculus",
            "Statistics",
            "Biology",
            "Chemistry",
            "Physics",
            "English Literature",
            "Creative Writing",
            "Grammar",
            "World History",
            "Government",
            "Economics",
            "Computer Programming",
            "Web Design",
          ],
          { min: 2, max: 6 }
        ),
        rating: faker.number.float({ min: 3.5, max: 5 }),
        totalReviews,
        availability: {
          days: faker.helpers.arrayElements(
            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            { min: 3, max: 6 }
          ),
          hours: {
            start: faker.helpers.arrayElement([
              "08:00",
              "09:00",
              "10:00",
              "14:00",
              "15:00",
            ]),
            end: faker.helpers.arrayElement([
              "16:00",
              "17:00",
              "18:00",
              "19:00",
              "20:00",
            ]),
          },
        },
        hourlyRate: faker.number.int({ min: 8000, max: 25000 }),
        bio: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 4 })),
        isVerified: faker.datatype.boolean(0.7),
      },
      createdAt: createdDate,
      updatedAt: faker.date.between({ from: createdDate, to: new Date() }),
    });
  }

  return users;
};

const generateServices = (): ServiceInterface[] => {
  const services: ServiceInterface[] = [
    {
      name: "Academic Tutoring",
      type: "tutoring",
      description:
        "Expert one-on-one tutoring for all academic levels. Our certified tutors provide personalized learning experiences tailored to each student's needs, helping them excel in their studies and build confidence.",
      shortDescription: "Personalized academic support from certified tutors.",
      image: "/images/services/tutoring.jpg",
      pricing: {
        baseRate: 15000,
        currency: "NGN",
        billingType: "hourly",
        packages: [
          {
            name: "Monthly Package",
            description: "10% off for 20+ hours monthly",
            duration: "1 month",
            discountPercentage: 10,
            minimumSessions: 20,
          },
          {
            name: "Semester Package",
            description: "15% off for 100+ hours",
            duration: "6 months",
            discountPercentage: 15,
            minimumSessions: 100,
          },
        ],
      },
      requirements: {
        minimumAge: 5,
        maximumAge: 18,
        minimumParticipants: 1,
        maximumParticipants: 1,
      },
      status: "active",
      metrics: {
        totalBookings: 150,
        totalRevenue: 2250000,
        averageRating: 4.7,
        totalReviews: 85,
        conversionRate: 0.8,
        repeatCustomerRate: 0.65,
        monthlyStats: [
          {
            month: "January",
            year: 2025,
            bookings: 12,
            revenue: 180000,
            avgRating: 4.5,
          },
          {
            month: "February",
            year: 2025,
            bookings: 18,
            revenue: 270000,
            avgRating: 4.6,
          },
          {
            month: "March",
            year: 2025,
            bookings: 25,
            revenue: 375000,
            avgRating: 4.8,
          },
        ],
      },
      integrations: {
        calendarSync: true,
        autoAssignment: false,
        paymentGateway: ["stripe", "paystack"],
      },
      createdAt: generateDateInRange(0, 1),
      updatedAt: generateDateInRange(8, 9),
      lastBookedAt: generateDateInRange(8, 9),
    },
    {
      name: "Daily Childcare",
      type: "childcare",
      description:
        "Safe, nurturing, and engaging daily childcare services for children aged 1-10. Our experienced caregivers provide structured activities, meals, and supervision in a secure environment.",
      shortDescription: "Safe and engaging daily childcare services.",
      image: "/images/services/childcare.jpg",
      pricing: {
        baseRate: 5000,
        currency: "NGN",
        billingType: "daily",
        packages: [
          {
            name: "Monthly Discount",
            description: "15% off for monthly bookings",
            duration: "1 month",
            discountPercentage: 15,
          },
          {
            name: "Weekly Package",
            description: "8% off for weekly bookings",
            duration: "1 week",
            discountPercentage: 8,
          },
        ],
      },
      requirements: {
        minimumAge: 1,
        maximumAge: 10,
        minimumParticipants: 1,
        maximumParticipants: 15,
      },
      status: "active",
      metrics: {
        totalBookings: 320,
        totalRevenue: 1360000,
        averageRating: 4.8,
        totalReviews: 245,
        conversionRate: 0.9,
        repeatCustomerRate: 0.75,
        monthlyStats: [
          {
            month: "January",
            year: 2025,
            bookings: 28,
            revenue: 119000,
            avgRating: 4.7,
          },
          {
            month: "February",
            year: 2025,
            bookings: 35,
            revenue: 148750,
            avgRating: 4.8,
          },
          {
            month: "March",
            year: 2025,
            bookings: 42,
            revenue: 178500,
            avgRating: 4.9,
          },
        ],
      },
      integrations: {
        calendarSync: true,
        autoAssignment: true,
        paymentGateway: ["stripe", "paystack", "bank_transfer"],
      },
      createdAt: generateDateInRange(0, 1),
      updatedAt: generateDateInRange(8, 9),
      lastBookedAt: generateDateInRange(8, 9),
    },
    {
      name: "Holiday Camps",
      type: "holiday-camps",
      description:
        "Fun-filled holiday camps with educational activities, sports, arts and crafts, and outdoor adventures. Perfect for keeping children engaged during school breaks while learning new skills.",
      shortDescription: "Educational and fun holiday camps for kids.",
      image: "/images/services/holiday-camps.jpg",
      pricing: {
        baseRate: 30000,
        currency: "NGN",
        billingType: "weekly",
        packages: [
          {
            name: "Multi-week Discount",
            description: "12% off for 3+ weeks",
            duration: "3 weeks",
            discountPercentage: 12,
          },
        ],
      },
      requirements: {
        minimumAge: 4,
        maximumAge: 16,
        minimumParticipants: 8,
        maximumParticipants: 30,
      },
      status: "active",
      metrics: {
        totalBookings: 85,
        totalRevenue: 2250000,
        averageRating: 4.6,
        totalReviews: 68,
        conversionRate: 0.7,
        repeatCustomerRate: 0.45,
      },
      integrations: {
        calendarSync: true,
        autoAssignment: false,
        paymentGateway: ["stripe", "paystack"],
      },
      createdAt: generateDateInRange(0, 1),
      updatedAt: generateDateInRange(8, 9),
      lastBookedAt: generateDateInRange(6, 8),
    },
    {
      name: "Event Space Rental",
      type: "space-rental",
      description:
        "Rent our versatile indoor and outdoor spaces for children's parties, celebrations, and special events. Includes basic decorations, tables, chairs, and sound system.",
      shortDescription: "Flexible event spaces for children's celebrations.",
      image: "/images/services/space-rental.jpg",
      pricing: {
        baseRate: 250000,
        currency: "NGN",
        billingType: "per-event",
      },
      requirements: {
        minimumParticipants: 10,
        maximumParticipants: 100,
        venueTypes: ["indoor", "outdoor", "both"],
      },
      status: "active",
      metrics: {
        totalBookings: 45,
        totalRevenue: 13500000,
        averageRating: 4.9,
        totalReviews: 38,
        conversionRate: 0.6,
        repeatCustomerRate: 0.35,
      },
      integrations: {
        calendarSync: true,
        autoAssignment: false,
        paymentGateway: ["stripe", "bank_transfer"],
      },
      createdAt: generateDateInRange(0, 1),
      updatedAt: generateDateInRange(8, 9),
      lastBookedAt: generateDateInRange(7, 9),
    },
    {
      name: "Homeschooling Support",
      type: "homeschooling",
      description:
        "Comprehensive homeschooling curriculum support and guidance for parents. Includes lesson plans, educational materials, progress tracking, and expert consultation.",
      shortDescription: "Complete homeschooling curriculum and support.",
      image: "/images/services/homeschooling.jpg",
      pricing: {
        baseRate: 45000,
        currency: "NGN",
        billingType: "monthly",
      },
      requirements: {
        minimumAge: 5,
        maximumAge: 16,
        minimumParticipants: 1,
        maximumParticipants: 5,
      },
      status: "active",
      metrics: {
        totalBookings: 28,
        totalRevenue: 1260000,
        averageRating: 4.5,
        totalReviews: 22,
        conversionRate: 0.65,
        repeatCustomerRate: 0.8,
      },
      integrations: {
        calendarSync: false,
        autoAssignment: true,
        paymentGateway: ["stripe", "paystack"],
      },
      createdAt: generateDateInRange(1, 2),
      updatedAt: generateDateInRange(8, 9),
      lastBookedAt: generateDateInRange(8, 9),
    },
    {
      name: "Kids Enrichment Programs",
      type: "kiddies-enrichment",
      description:
        "Specialized enrichment programs including music lessons, art classes, coding workshops, and STEM activities designed to develop children's talents and interests.",
      shortDescription: "Specialized programs for talent development.",
      image: "/images/services/enrichment.jpg",
      pricing: {
        baseRate: 20000,
        currency: "NGN",
        billingType: "weekly",
      },
      requirements: {
        minimumAge: 3,
        maximumAge: 14,
        minimumParticipants: 3,
        maximumParticipants: 12,
      },
      status: "active",
      metrics: {
        totalBookings: 95,
        totalRevenue: 1900000,
        averageRating: 4.7,
        totalReviews: 76,
        conversionRate: 0.75,
        repeatCustomerRate: 0.6,
      },
      integrations: {
        calendarSync: true,
        autoAssignment: true,
        paymentGateway: ["stripe", "paystack"],
      },
      createdAt: generateDateInRange(1, 2),
      updatedAt: generateDateInRange(8, 9),
      lastBookedAt: generateDateInRange(8, 9),
    },
  ];
  return services;
};

const generateBookings = (
  users: UserInterface[],
  services: ServiceInterface[]
): BookingInterface[] => {
  const bookings: BookingInterface[] = [];
  const parents = users.filter((u) => u.role === "parent");

  parents.forEach((parent, parentIndex) => {
    if (!parent._id || !parent.children) return;

    // Generate 2-8 bookings per parent
    const numBookings = faker.number.int({ min: 2, max: 8 });

    for (let i = 0; i < numBookings; i++) {
      const service = faker.helpers.arrayElement(services);
      const child = faker.helpers.arrayElement(parent.children);
      const createdDate = generateDateInRange(1, 8);
      const isRepeatedCustomer = parentIndex < 40; // First 40 parents are repeat customers

      interface ServiceDataType {
        subjects?: string[];
        academicLevel?: string;
        learningGoals?: string;
        hourlyRate?: number;
        careType?: "daily" | "monthly";
        dropoffTime?: string;
        pickupTime?: string;
        specialNeeds?: string;
        dailyRate?: number;
        campWeeks?: Array<{
          startDate: string;
          endDate: string;
          weekNumber: number;
        }>;
        weeklyRate?: number;
        eventType?: string;
        eventDate?: string;
        eventTime?: string;
        venueType?: "indoor" | "outdoor" | "both";
        expectedGuests?: number;
        extraServices?: Array<{
          service: "dj" | "mc" | "event-planning" | "extra-carers";
          quantity?: number;
          rate?: number;
        }>;
        cautionFee?: number;
        baseRate?: number;
      }

      interface ScheduleType {
        startDate: string;
        isRecurring: boolean;
        frequency?: "daily" | "weekly" | "monthly";
        weekdays?: Array<{
          day:
            | "monday"
            | "tuesday"
            | "wednesday"
            | "thursday"
            | "friday"
            | "saturday"
            | "sunday";
          hours: number;
          startTime?: string;
          endTime?: string;
        }>;
      }

      let serviceData: ServiceDataType = {};
      const schedule: ScheduleType = {
        startDate: faker.date
          .between({ from: createdDate, to: new Date() })
          .toISOString(),
        isRecurring: faker.datatype.boolean(0.6),
      };

      // Service-specific data based on type
      switch (service.type) {
        case "tutoring":
          serviceData = {
            subjects: faker.helpers.arrayElements(
              ["Mathematics", "English", "Science", "History"],
              { min: 1, max: 3 }
            ),
            academicLevel: faker.helpers.arrayElement([
              "Elementary",
              "Middle School",
              "High School",
            ]),
            learningGoals: faker.lorem.sentence(),
            hourlyRate: service.pricing.baseRate,
          };
          schedule.frequency = "weekly";
          schedule.weekdays = [
            {
              day: faker.helpers.arrayElement([
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
              ]),
              hours: faker.number.int({ min: 1, max: 3 }),
              startTime: "15:00",
              endTime: "18:00",
            },
          ];
          break;

        case "childcare":
          serviceData = {
            careType: faker.helpers.arrayElement(["daily", "monthly"]),
            dropoffTime: "08:00",
            pickupTime: "17:00",
            specialNeeds: faker.datatype.boolean(0.2)
              ? faker.lorem.sentence()
              : undefined,
            dailyRate: service.pricing.baseRate,
          };
          if (schedule.isRecurring) {
            schedule.frequency = "daily";
          }
          break;

        case "holiday-camps":
          const weekStart = faker.date.between({
            from: createdDate,
            to: new Date(),
          });
          serviceData = {
            campWeeks: [
              {
                startDate: weekStart.toISOString(),
                endDate: new Date(
                  weekStart.getTime() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
                weekNumber: 1,
              },
            ],
            weeklyRate: service.pricing.baseRate,
          };
          break;

        case "space-rental":
          serviceData = {
            eventType: faker.helpers.arrayElement([
              "birthday",
              "ceremony",
              "meeting",
              "other",
            ]),
            eventDate: faker.date.future().toISOString(),
            eventTime: "14:00",
            venueType: faker.helpers.arrayElement([
              "indoor",
              "outdoor",
              "both",
            ]),
            expectedGuests: faker.number.int({ min: 15, max: 80 }),
            extraServices: faker.helpers.arrayElements(
              [
                { service: "dj", quantity: 1, rate: 150000 },
                { service: "mc", quantity: 1, rate: 60000 },
                { service: "event-planning", quantity: 1, rate: 150000 },
                {
                  service: "extra-carers",
                  quantity: faker.number.int({ min: 1, max: 4 }),
                  rate: 8000,
                },
              ],
              { min: 0, max: 3 }
            ),
            cautionFee: 50000,
            baseRate: service.pricing.baseRate,
          };
          break;
      }

      const baseAmount = service.pricing.baseRate;
      const extraAmount = serviceData.extraServices
        ? serviceData.extraServices.reduce(
            (sum: number, extra) =>
              sum + (extra.rate || 0) * (extra.quantity || 1),
            0
          )
        : 0;
      const totalAmount =
        baseAmount + extraAmount + (serviceData.cautionFee || 0);

      const paymentStatus = faker.helpers.weightedArrayElement([
        { weight: 70, value: "paid" },
        { weight: 20, value: "pending" },
        { weight: 10, value: "refunded" },
      ]);

      const bookingStatus = faker.helpers.weightedArrayElement([
        { weight: 40, value: "completed" },
        { weight: 25, value: "confirmed" },
        { weight: 15, value: "in-progress" },
        { weight: 10, value: "pending" },
        { weight: 8, value: "cancelled" },
        { weight: 2, value: "on-hold" },
      ]);

      bookings.push({
        _id: new ObjectId(),
        userId: parent._id,
        serviceType: service.type,
        parentName: parent.userData.user.name,
        parentEmail: parent.userData.user.email,
        parentPhone: parent.phone || faker.phone.number(),
        childrenCount: 1,
        children: [child],
        source: faker.helpers.arrayElement([
          "social media",
          "online search",
          "referral",
          "walk in",
          "signage",
          "other",
        ]),
        isRepeatedCustomer,
        followUpRequired: faker.datatype.boolean(0.3),
        serviceData,
        schedule,
        pricing: {
          baseAmount,
          extraServicesAmount: extraAmount,
          cautionFee: serviceData.cautionFee,
          totalAmount,
          currency: "NGN",
        },
        payment: {
          status: paymentStatus,
          method: faker.helpers.arrayElement(["card", "bank_transfer", "cash"]),
          paidAmount:
            paymentStatus === "paid"
              ? totalAmount
              : faker.number.int({ min: 0, max: totalAmount }),
          paymentDate:
            paymentStatus === "paid"
              ? faker.date
                  .between({ from: createdDate, to: new Date() })
                  .toISOString()
              : undefined,
          transactionId:
            paymentStatus === "paid" ? faker.string.uuid() : undefined,
        },
        status: bookingStatus,
        priority: faker.helpers.arrayElement([
          "low",
          "normal",
          "high",
          "urgent",
        ]),
        assignedAt:
          bookingStatus !== "pending"
            ? faker.date.between({ from: createdDate, to: new Date() })
            : undefined,
        startedAt: ["in-progress", "completed"].includes(bookingStatus)
          ? faker.date.between({ from: createdDate, to: new Date() })
          : undefined,
        completedAt:
          bookingStatus === "completed"
            ? faker.date.between({ from: createdDate, to: new Date() })
            : undefined,
        createdAt: createdDate,
        updatedAt: faker.date.between({ from: createdDate, to: new Date() }),
        cancelledAt:
          bookingStatus === "cancelled"
            ? faker.date.between({ from: createdDate, to: new Date() })
            : undefined,
        cancellationReason:
          bookingStatus === "cancelled" ? faker.lorem.sentence() : undefined,
        referralSource: isRepeatedCustomer
          ? faker.person.fullName()
          : undefined,
        followUpDate: faker.datatype.boolean(0.2)
          ? faker.date.future()
          : undefined,
      });
    }
  });

  return bookings;
};

const generatePosts = (users: UserInterface[]): PostInterface[] => {
  const posts: PostInterface[] = [];
  const tutors = users.filter((u) => u.role === "tutor");
  const admins = users.filter((u) => u.role === "admin");
  const authors = [...tutors, ...admins];

  // Generate 25-35 posts
  const numPosts = faker.number.int({ min: 25, max: 35 });

  for (let i = 0; i < numPosts; i++) {
    const author = faker.helpers.arrayElement(authors);
    if (!author._id) continue;

    const createdDate = generateDateInRange(1, 8);
    const isPublished = faker.datatype.boolean(0.85);
    const title = faker.lorem.sentence({ min: 4, max: 8 });
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const content = faker.lorem.paragraphs(
      faker.number.int({ min: 8, max: 15 })
    );

    posts.push({
      _id: new ObjectId(),
      title,
      slug,
      excerpt: faker.lorem.paragraph({ min: 2, max: 4 }),
      content,
      authorId: author._id,
      authorName: author.userData.user.name || "Anonymous",
      authorImage: author.userData.user.image || undefined,
      authorBio:
        author.role === "tutor" && author.tutorProfile
          ? author.tutorProfile.bio
          : faker.lorem.paragraph(),
      status: isPublished
        ? "published"
        : faker.helpers.arrayElement(["draft", "archived"]),
      publishedAt: isPublished
        ? faker.date.between({ from: createdDate, to: new Date() })
        : undefined,
      scheduledFor:
        !isPublished && faker.datatype.boolean(0.3)
          ? faker.date.future()
          : undefined,
      category: faker.helpers.arrayElement([
        "Education Tips",
        "Success Stories",
        "Parenting Tips",
        "Child Development",
        "Technology",
        "Early Learning",
        "STEM Education",
        "General",
      ] as PostCategory[]),
      tags: faker.helpers.arrayElements(
        [
          "education",
          "parenting",
          "children",
          "learning",
          "development",
          "tutoring",
          "childcare",
          "activities",
          "tips",
          "success",
          "STEM",
          "creativity",
          "behavior",
          "nutrition",
          "safety",
        ],
        { min: 2, max: 6 }
      ),
      keywords: faker.helpers.arrayElements(
        [
          "child education",
          "parenting tips",
          "learning strategies",
          "child development",
          "academic success",
          "behavioral guidance",
        ],
        { min: 1, max: 4 }
      ),
      metaTitle: title.slice(0, 60),
      metaDescription: faker.lorem.sentence({ min: 8, max: 12 }).slice(0, 160),
      featuredImage: faker.image.url({ width: 800, height: 400 }),
      images: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () =>
        faker.image.url()
      ),
      videos: faker.datatype.boolean(0.2) ? [faker.internet.url()] : undefined,
      views: faker.number.int({ min: 50, max: 2000 }),
      likes: faker.number.int({ min: 5, max: 150 }),
      shares: faker.number.int({ min: 0, max: 50 }),
      comments: Array.from(
        { length: faker.number.int({ min: 0, max: 8 }) },
        () => ({
          _id: new ObjectId(),
          authorName: faker.person.fullName(),
          authorEmail: faker.internet.email(),
          content: faker.lorem.paragraph(),
          isApproved: faker.datatype.boolean(0.8),
          createdAt: faker.date.between({ from: createdDate, to: new Date() }),
        })
      ),
      readTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
      displayOrder: faker.number.int({ min: 0, max: 100 }),
      isFeatured: faker.datatype.boolean(0.15),
      isPopular: faker.datatype.boolean(0.1),
      relatedServices: faker.helpers.arrayElements(
        [
          "childcare",
          "tutoring",
          "homeschooling",
          "holiday-camps",
          "space-rental",
          "kiddies-enrichment",
        ],
        { min: 0, max: 3 }
      ),
      targetAgeGroup: faker.datatype.boolean(0.6)
        ? {
            min: faker.number.int({ min: 1, max: 8 }),
            max: faker.number.int({ min: 10, max: 18 }),
          }
        : undefined,
      createdAt: createdDate,
      updatedAt: faker.date.between({ from: createdDate, to: new Date() }),
    });
  }

  return posts;
};

const main = async () => {
  try {
    const client = await clientPromise;
    const db = client.db();

    console.log("🚀 Connected to database.");

    // Clear existing collections
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      db.collection(usersCollectionName).deleteMany({}),
      db.collection(bookingsCollectionName).deleteMany({}),
      db.collection(servicesCollectionName).deleteMany({}),
      db.collection(postsCollectionName).deleteMany({}),
    ]);
    console.log("✅ Collections cleared.");

    // Generate sample data
    console.log("📊 Generating sample data...");
    const users = generateUsers();
    const services = generateServices();
    const bookings = generateBookings(users, services);
    const posts = generatePosts(users);

    console.log(`Generated:
    - ${users.length} users (${
      users.filter((u) => u.role === "parent").length
    } parents, ${users.filter((u) => u.role === "tutor").length} tutors, ${
      users.filter((u) => u.role === "admin").length
    } admins)
    - ${services.length} services
    - ${bookings.length} bookings  
    - ${posts.length} posts`);

    // Insert data into collections
    console.log("💾 Inserting data into database...");

    if (users.length > 0) {
      await db.collection<UserInterface>(usersCollectionName).insertMany(users);
      console.log(`✅ ${users.length} users inserted.`);
    }

    if (services.length > 0) {
      await db
        .collection<ServiceInterface>(servicesCollectionName)
        .insertMany(services);
      console.log(`✅ ${services.length} services inserted.`);
    }

    if (bookings.length > 0) {
      await db
        .collection<BookingInterface>(bookingsCollectionName)
        .insertMany(bookings);
      console.log(`✅ ${bookings.length} bookings inserted.`);
    }

    if (posts.length > 0) {
      await db.collection<PostInterface>(postsCollectionName).insertMany(posts);
      console.log(`✅ ${posts.length} posts inserted.`);
    }

    console.log("🎉 Database seeding completed successfully!");

    // Display summary statistics
    console.log("\n📈 Summary Statistics:");
    console.log(`- Total Users: ${users.length}`);
    console.log(`- Total Bookings: ${bookings.length}`);
    console.log(
      `- Total Revenue: ₦${bookings
        .reduce((sum, booking) => sum + booking.pricing.totalAmount, 0)
        .toLocaleString()}`
    );
    console.log(
      `- Published Posts: ${
        posts.filter((p) => p.status === "published").length
      }`
    );
    console.log(
      `- Active Services: ${
        services.filter((s) => s.status === "active").length
      }`
    );
  } catch (error) {
    console.error("❌ An error occurred during database seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

main();
