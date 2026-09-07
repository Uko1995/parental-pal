import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@/lib/metadata";
import { getServicePageContent } from "@/lib/service-page-content";
import {
  getServiceDisplayName,
  isPublicServiceType,
} from "@/lib/service-utils";
import {
  getPublicServiceByType,
  getRelatedPublicServices,
  getVisiblePromoCampSeason,
} from "../actions";
import ServiceDetail from "./ServiceDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isPublicServiceType(slug)) {
    return { title: "Service Not Found" };
  }

  const services = await getPublicServiceByType(slug);
  if (services.length === 0) {
    return { title: "Service Not Found" };
  }

  const primary = services[0];
  const extras = getServicePageContent(slug);

  return genMeta({
    title: `${getServiceDisplayName(primary)} - ${extras.heroTagline}`,
    description: primary.shortDescription || primary.description,
    path: `/services/${slug}`,
    image: primary.image,
    keywords: extras.keywords,
  });
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  if (!isPublicServiceType(slug)) {
    notFound();
  }

  const [services, relatedServices, promoSeasonId] = await Promise.all([
    getPublicServiceByType(slug),
    getRelatedPublicServices(slug),
    getVisiblePromoCampSeason(),
  ]);

  if (services.length === 0) {
    notFound();
  }

  return (
    <ServiceDetail
      services={services}
      extras={getServicePageContent(slug)}
      relatedServices={relatedServices}
      promoSeasonId={promoSeasonId}
    />
  );
}
