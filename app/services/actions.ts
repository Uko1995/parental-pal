"use server";

import { getCollection } from "@/lib/mongodb";
import { sortServicesWithEduvantaFirst } from "@/lib/service-utils";
import { ServiceInterface } from "@/models/Service";
import {
  getActivePromoCampSeason,
  type CampSeasonId,
} from "@/lib/camp-seasons";

export interface ClientServiceForDisplay extends Omit<ServiceInterface, "_id"> {
  _id?: string;
}

export async function isHolidayCampServiceActive(): Promise<boolean> {
  try {
    const collection = await getCollection("services");
    const service = await collection.findOne({
      type: "holiday-camps",
      status: "active",
    });
    return Boolean(service);
  } catch (error) {
    console.error("Error checking holiday camp service status:", error);
    return false;
  }
}

/** Promo season only when the DB service is active and the date window matches. */
export async function getVisiblePromoCampSeason(): Promise<CampSeasonId | null> {
  const season = getActivePromoCampSeason();
  if (!season) return null;

  const isActive = await isHolidayCampServiceActive();
  return isActive ? season : null;
}

export async function getPublicServices(): Promise<ClientServiceForDisplay[]> {
  try {
    const collection = await getCollection("services");

    const services = (await collection
      .find({ status: "active" }) // Only fetch active services for public display
      .sort({ createdAt: -1 })
      .toArray()) as ServiceInterface[];

    // Convert ObjectIds to strings for client components
    const serialized = services.map((service) => ({
      ...service,
      _id: service._id?.toString(),
    }));

    return sortServicesWithEduvantaFirst(serialized);
  } catch (error) {
    console.error("Error fetching public services:", error);
    return [];
  }
}
