"use server";

import { getCollection } from "@/lib/mongodb";
import { ServiceInterface } from "@/models/Service";

export interface ClientServiceForDisplay extends Omit<ServiceInterface, "_id"> {
  _id?: string;
}

export async function getPublicServices(): Promise<ClientServiceForDisplay[]> {
  try {
    const collection = await getCollection("services");

    const services = (await collection
      .find({ status: "active" }) // Only fetch active services for public display
      .sort({ createdAt: -1 })
      .toArray()) as ServiceInterface[];

    // Convert ObjectIds to strings for client components
    return services.map((service) => ({
      ...service,
      _id: service._id?.toString(),
    }));
  } catch (error) {
    console.error("Error fetching public services:", error);
    return [];
  }
}
