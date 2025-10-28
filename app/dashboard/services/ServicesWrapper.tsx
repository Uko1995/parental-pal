"use client";

import { useState, useEffect } from "react";
import ServicesContent from "./ServicesContent";
import { ClientServiceInterface } from "./action";

interface ServicesWrapperProps {
  services: ClientServiceInterface[];
  serviceStats: {
    totalServices: number;
    activeServices: number;
    categories: Record<string, number>;
  };
}

export default function ServicesWrapper({
  services: initialServices,
  serviceStats: initialServiceStats,
}: ServicesWrapperProps) {
  const [services, setServices] = useState<ClientServiceInterface[]>(
    initialServices || []
  );
  const [serviceStats, setServiceStats] = useState(initialServiceStats);

  // Update local state when props change
  useEffect(() => {
    setServices(initialServices || []);
    setServiceStats(initialServiceStats);
  }, [initialServices, initialServiceStats]);

  const handleServiceAdded = (newService: ClientServiceInterface) => {
    setServices((prev) => [newService, ...prev]);
    // Update stats
    setServiceStats((prev) => ({
      totalServices: prev.totalServices + 1,
      activeServices:
        newService.status === "active"
          ? prev.activeServices + 1
          : prev.activeServices,
      categories: {
        ...prev.categories,
        [newService.type || "Other"]:
          (prev.categories[newService.type || "Other"] || 0) + 1,
      },
    }));
  };

  const handleServiceUpdated = (updatedService: ClientServiceInterface) => {
    setServices((prev) =>
      prev.map((service) =>
        service._id === updatedService._id ? updatedService : service
      )
    );
  };

  const handleServiceDeleted = (serviceId: string) => {
    setServices((prev) => prev.filter((service) => service._id !== serviceId));
    // Update stats
    const deletedService = services.find((s) => s._id === serviceId);
    if (deletedService) {
      setServiceStats((prev) => ({
        totalServices: prev.totalServices - 1,
        activeServices:
          deletedService.status === "active"
            ? prev.activeServices - 1
            : prev.activeServices,
        categories: {
          ...prev.categories,
          [deletedService.type || "Other"]: Math.max(
            0,
            (prev.categories[deletedService.type || "Other"] || 0) - 1
          ),
        },
      }));
    }
  };

  return (
    <ServicesContent
      services={services}
      serviceStats={serviceStats}
      onServiceAdded={handleServiceAdded}
      onServiceUpdated={handleServiceUpdated}
      onServiceDeleted={handleServiceDeleted}
    />
  );
}
