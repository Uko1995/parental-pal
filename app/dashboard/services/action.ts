"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { getCollection } from "@/lib/mongodb";
import { ServiceInterface } from "@/models/Service";

// Client-safe interface with string _id
export interface ClientServiceInterface extends Omit<ServiceInterface, "_id"> {
  _id?: string;
}

interface ServicesData {
  services: ClientServiceInterface[];
  serviceStats: {
    totalServices: number;
    activeServices: number;
    categories: Record<string, number>;
  };
}

const fetchServices = async (): Promise<ServicesData> => {
  const collection = await getCollection("services");
  let services = (await collection
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as ServiceInterface[];

  // If no services exist, create some sample data
  if (services.length === 0) {
    const sampleServices: Partial<ServiceInterface>[] = [
      {
        name: "Academic Tutoring",
        type: "tutoring",
        description:
          "One-on-one personalized tutoring sessions for students of all ages. Our experienced tutors provide comprehensive support in mathematics, science, English, and other subjects to help students excel academically.",
        shortDescription: "Personalized one-on-one tutoring sessions",
        image: "/images/services/tutoring.jpg",
        pricing: {
          baseRate: 15000,
          currency: "NGN",
          billingType: "hourly",
          packages: [
            {
              name: "Weekly Package",
              description: "4 sessions per week",
              duration: "1 month",
              discountPercentage: 10,
              minimumSessions: 16,
            },
            {
              name: "Monthly Package",
              description: "16 sessions per month",
              duration: "1 month",
              discountPercentage: 15,
              minimumSessions: 16,
            },
          ],
        },
        requirements: {
          minimumAge: 5,
          maximumAge: 18,
          minimumParticipants: 1,
          maximumParticipants: 1,
          idealGroupSize: 1,
          ageGroups: ["primary", "secondary"],
        },
        status: "active",
        metrics: {
          totalBookings: 156,
          totalRevenue: 2340000,
          averageRating: 4.8,
          totalReviews: 89,
          conversionRate: 75.2,
          repeatCustomerRate: 68.5,
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(),
        lastBookedAt: new Date("2024-10-18"),
      },
      {
        name: "Daily Childcare",
        type: "childcare",
        description:
          "Professional daily childcare services providing a safe, nurturing environment for children. Our trained caregivers ensure your child receives the attention and care they deserve while you're away.",
        shortDescription: "Professional daily childcare services",
        image: "/images/services/childcare.jpg",
        pricing: {
          baseRate: 5000,
          currency: "NGN",
          billingType: "daily",
          packages: [
            {
              name: "Monthly Care",
              description: "Full month of daily care",
              duration: "1 month",
              discountPercentage: 15,
            },
          ],
        },
        requirements: {
          minimumAge: 1,
          maximumAge: 12,
          minimumParticipants: 1,
          maximumParticipants: 8,
          idealGroupSize: 4,
          ageGroups: ["toddler", "preschool", "primary"],
          venueTypes: ["indoor"],
          equipmentProvided: [
            "toys",
            "educational materials",
            "safety equipment",
          ],
        },
        status: "active",
        metrics: {
          totalBookings: 89,
          totalRevenue: 445000,
          averageRating: 4.7,
          totalReviews: 52,
          conversionRate: 82.1,
          repeatCustomerRate: 78.3,
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date(),
        lastBookedAt: new Date("2024-10-19"),
      },
      {
        name: "Holiday Camps",
        type: "holiday-camps",
        description:
          "Fun and educational holiday programs designed to keep children engaged during school breaks. Activities include arts and crafts, sports, games, and educational workshops.",
        shortDescription: "Fun and educational holiday programs",
        image: "/images/services/holiday-camps.jpg",
        pricing: {
          baseRate: 30000,
          currency: "NGN",
          billingType: "weekly",
        },
        requirements: {
          minimumAge: 6,
          maximumAge: 16,
          minimumParticipants: 5,
          maximumParticipants: 20,
          idealGroupSize: 12,
          ageGroups: ["primary", "secondary"],
          venueTypes: ["indoor", "outdoor"],
          equipmentProvided: [
            "sports equipment",
            "art supplies",
            "educational materials",
          ],
        },
        status: "active",
        metrics: {
          totalBookings: 34,
          totalRevenue: 1020000,
          averageRating: 4.9,
          totalReviews: 28,
          conversionRate: 71.4,
          repeatCustomerRate: 85.2,
        },
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date(),
        lastBookedAt: new Date("2024-09-15"),
      },
      {
        name: "Homeschooling Support",
        type: "homeschooling",
        description:
          "Comprehensive homeschooling support services including curriculum planning, progress tracking, and educational resources for parents who choose to educate their children at home.",
        shortDescription: "Comprehensive homeschooling support services",
        image: "/images/services/homeschooling.jpg",
        pricing: {
          baseRate: 25000,
          currency: "NGN",
          billingType: "monthly",
        },
        requirements: {
          minimumAge: 5,
          maximumAge: 18,
          minimumParticipants: 1,
          maximumParticipants: 3,
          idealGroupSize: 1,
          ageGroups: ["primary", "secondary"],
        },
        status: "active",
        metrics: {
          totalBookings: 23,
          totalRevenue: 575000,
          averageRating: 4.6,
          totalReviews: 18,
          conversionRate: 68.9,
          repeatCustomerRate: 91.3,
        },
        createdAt: new Date("2024-04-01"),
        updatedAt: new Date(),
        lastBookedAt: new Date("2024-10-10"),
      },
      {
        name: "Event Space Rental",
        type: "space-rental",
        description:
          "Premium event spaces available for children's parties, educational workshops, and family gatherings. Our spaces are equipped with modern amenities and safety features.",
        shortDescription: "Premium event spaces for special occasions",
        image: "/images/services/space-rental.jpg",
        pricing: {
          baseRate: 50000,
          currency: "NGN",
          billingType: "per-event",
        },
        requirements: {
          minimumParticipants: 10,
          maximumParticipants: 100,
          idealGroupSize: 25,
          venueTypes: ["indoor", "outdoor"],
          equipmentProvided: [
            "tables",
            "chairs",
            "sound system",
            "decorations",
          ],
        },
        status: "active",
        metrics: {
          totalBookings: 12,
          totalRevenue: 600000,
          averageRating: 4.4,
          totalReviews: 9,
          conversionRate: 58.7,
          repeatCustomerRate: 33.3,
        },
        createdAt: new Date("2024-05-01"),
        updatedAt: new Date(),
        lastBookedAt: new Date("2024-10-05"),
      },
      {
        name: "Kids Enrichment Programs",
        type: "kiddies-enrichment",
        description:
          "Specialized enrichment programs focusing on creativity, critical thinking, and skill development. Programs include coding for kids, music lessons, art classes, and STEM activities.",
        shortDescription:
          "Specialized enrichment programs for skill development",
        image: "/images/services/enrichment.jpg",
        pricing: {
          baseRate: 20000,
          currency: "NGN",
          billingType: "weekly",
        },
        requirements: {
          minimumAge: 4,
          maximumAge: 14,
          minimumParticipants: 3,
          maximumParticipants: 12,
          idealGroupSize: 8,
          ageGroups: ["preschool", "primary"],
          venueTypes: ["indoor"],
          equipmentProvided: [
            "computers",
            "musical instruments",
            "art supplies",
            "STEM kits",
          ],
        },
        status: "active",
        metrics: {
          totalBookings: 67,
          totalRevenue: 1340000,
          averageRating: 4.9,
          totalReviews: 45,
          conversionRate: 79.3,
          repeatCustomerRate: 82.1,
        },
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date(),
        lastBookedAt: new Date("2024-10-17"),
      },
    ];

    // Insert sample services
    await collection.insertMany(sampleServices);

    // Fetch the newly created services
    services = (await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as ServiceInterface[];
  }

  // Convert ObjectIds to strings for client components
  const serializedServices: ClientServiceInterface[] = services.map(
    (service) => ({
      ...service,
      _id: service._id?.toString(),
    })
  );

  const serviceStats = {
    totalServices: services.length,
    activeServices: services.filter((service) => service.status === "active")
      .length,
    categories: services.reduce((acc: Record<string, number>, service) => {
      acc[service.type || "Other"] = (acc[service.type || "Other"] || 0) + 1;
      return acc;
    }, {}),
  };

  return {
    services: serializedServices,
    serviceStats,
  };
};

/**
 * Get all services with caching
 */
export const getServices = unstable_cache(fetchServices, ["services-data"], {
  revalidate: CACHE_TIMES.STATIC_DATA,
  tags: [CACHE_TAGS.SERVICES],
});

/**
 * Get services by type with caching
 */
export const getServicesByType = unstable_cache(
  async (serviceType: string): Promise<ClientServiceInterface[]> => {
    const data = await fetchServices();
    return data.services.filter((service) => service.type === serviceType);
  },
  ["services-by-type"],
  {
    revalidate: CACHE_TIMES.STATIC_DATA,
    tags: [CACHE_TAGS.SERVICES],
  }
);

/**
 * Get active services with caching
 */
export const getActiveServices = unstable_cache(
  async (): Promise<ClientServiceInterface[]> => {
    const data = await fetchServices();
    return data.services.filter((service) => service.status === "active");
  },
  ["services-active"],
  {
    revalidate: CACHE_TIMES.STATIC_DATA,
    tags: [CACHE_TAGS.SERVICES],
  }
);

/**
 * Get service statistics
 */
export const getServiceStatistics = unstable_cache(
  async () => {
    const data = await fetchServices();
    return data.serviceStats;
  },
  ["service-statistics"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.SERVICES, CACHE_TAGS.ANALYTICS],
  }
);
