import { MetadataRoute } from "next";
import {
  getPublicServices,
  getVisiblePromoCampSeason,
} from "@/app/services/actions";
import { getCampSeason } from "@/lib/camp-seasons";
import { getPublicServicePath } from "@/lib/service-utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parentalpal.org";
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tutors`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2025-11-03"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2025-11-03"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date("2025-11-03"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const [services, promoSeason] = await Promise.all([
    getPublicServices(),
    getVisiblePromoCampSeason(),
  ]);

  const seenTypes = new Set<string>();
  const servicePages: MetadataRoute.Sitemap = [];

  for (const service of services) {
    if (seenTypes.has(service.type)) continue;
    seenTypes.add(service.type);
    servicePages.push({
      url: `${baseUrl}${getPublicServicePath(service.type)}`,
      lastModified: service.updatedAt
        ? new Date(service.updatedAt)
        : currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  if (promoSeason) {
    const landingPath = getCampSeason(promoSeason).landingPath;
    if (landingPath.startsWith("/services/")) {
      servicePages.push({
        url: `${baseUrl}${landingPath}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  return [...staticPages, ...servicePages];
}
