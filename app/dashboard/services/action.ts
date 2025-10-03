"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { getCollection } from "@/lib/mongodb";
import { ServiceInterface } from "@/models/Service";

interface ServicesData {
  services: ServiceInterface[];
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
    services,
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
  async (serviceType: string): Promise<ServiceInterface[]> => {
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
  async (): Promise<ServiceInterface[]> => {
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
