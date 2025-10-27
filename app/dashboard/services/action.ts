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
    const sampleServices: Omit<ServiceInterface, "_id">[] = [
      {
        name: "Academic Tutoring",
        type: "tutoring",
        description:
          "One-on-one personalized tutoring sessions for students of all ages. Our experienced tutors provide comprehensive support in mathematics, science, English, and other subjects to help students excel academically.",
        shortDescription: "Personalized one-on-one tutoring sessions",
        image: "/tutoring.jpg",
        pricing: {
          baseRate: "15000",
          currency: "NGN",
          billingType: "hourly",
        },
        requirements: {
          minimumParticipants: 1,
          maximumParticipants: 1,
          minimumAge: 5,
          maximumAge: 18,
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
        image: "/childcare.jpg",
        pricing: {
          baseRate: "5000",
          currency: "NGN",
          billingType: "daily",
        },
        requirements: {
          minimumParticipants: 1,
          maximumParticipants: 8,
          minimumAge: 1,
          maximumAge: 12,
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
        image: "/camp.jpg",
        pricing: {
          baseRate: "30000",
          currency: "NGN",
          billingType: "weekly",
        },
        requirements: {
          minimumParticipants: 5,
          maximumParticipants: 20,
          minimumAge: 6,
          maximumAge: 16,
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

/**
 * Create a new service
 */
export async function createService(
  serviceData: Omit<ServiceInterface, "_id" | "createdAt" | "updatedAt">
) {
  try {
    const collection = await getCollection("services");

    const newService = {
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newService);

    if (result.acknowledged) {
      // Revalidate cache
      const { revalidateTag } = await import("next/cache");
      revalidateTag(CACHE_TAGS.SERVICES);

      return {
        success: true,
        data: {
          ...newService,
          _id: result.insertedId.toString(),
        },
      };
    }

    return {
      success: false,
      error: "Failed to create service",
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing service
 */
export async function updateService(
  serviceId: string,
  serviceData: Partial<Omit<ServiceInterface, "_id" | "createdAt">>
) {
  try {
    const collection = await getCollection("services");
    const { ObjectId } = await import("mongodb");

    const updateData = {
      ...serviceData,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(serviceId) },
      { $set: updateData }
    );

    if (result.matchedCount > 0) {
      // Revalidate cache
      const { revalidateTag } = await import("next/cache");
      revalidateTag(CACHE_TAGS.SERVICES);

      return { success: true };
    }

    return {
      success: false,
      error: "Service not found",
    };
  } catch (error) {
    console.error("Error updating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string) {
  try {
    const collection = await getCollection("services");
    const { ObjectId } = await import("mongodb");

    const result = await collection.deleteOne({ _id: new ObjectId(serviceId) });

    if (result.deletedCount > 0) {
      // Revalidate cache
      const { revalidateTag } = await import("next/cache");
      revalidateTag(CACHE_TAGS.SERVICES);

      return { success: true };
    }

    return {
      success: false,
      error: "Service not found",
    };
  } catch (error) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
