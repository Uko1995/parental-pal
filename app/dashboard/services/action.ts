"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { getCollection } from "@/lib/mongodb";
import { sortServicesWithEduvantaFirst } from "@/lib/service-utils";
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

  const services = (await collection
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as ServiceInterface[];

  // Convert ObjectIds to strings for client components
  const serializedServices: ClientServiceInterface[] =
    sortServicesWithEduvantaFirst(
      services.map((service) => ({
        ...service,
        _id: service._id?.toString(),
      })),
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
      // Revalidate cache and path
      const { revalidateTag, revalidatePath } = await import("next/cache");
      revalidateTag(CACHE_TAGS.SERVICES);
      revalidatePath("/dashboard/services");

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
      // Revalidate cache and path
      const { revalidateTag, revalidatePath } = await import("next/cache");
      revalidateTag(CACHE_TAGS.SERVICES);
      revalidatePath("/dashboard/services");

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
      // Revalidate cache and path
      const { revalidateTag, revalidatePath } = await import("next/cache");
      revalidateTag(CACHE_TAGS.SERVICES);
      revalidatePath("/dashboard/services");

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
