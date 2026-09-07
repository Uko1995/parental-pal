import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { CampSeasonId } from "@/lib/camp-seasons";
import {
  formatAvailability,
  formatCurrency,
  formatPricing,
  getPackageDisplayPrice,
  getPublicServiceHref,
  getServiceDisplayName,
} from "@/lib/service-utils";
import {
  SERVICE_CONSULT_WHATSAPP_URL,
  type ServicePageExtras,
} from "@/lib/service-page-content";
import type { ClientServiceForDisplay } from "@/app/services/actions";
import HomeschoolProgramSections from "./HomeschoolProgramSections";
import { resolveHomeschoolRates } from "@/lib/homeschool-pricing";

function ServiceMetaPills({ service }: { service: ClientServiceForDisplay }) {
  const availability = formatAvailability(service.availability);

  return (
    <div className="flex flex-wrap gap-2">
      {service.requirements?.ageGroup && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <UserGroupIcon className="w-4 h-4" />
          <span className="font-medium">{service.requirements.ageGroup}</span>
        </div>
      )}
      {availability && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
          <ClockIcon className="w-4 h-4" />
          <span className="font-medium">{availability}</span>
        </div>
      )}
    </div>
  );
}

function ServiceOfferings({ service }: { service: ClientServiceForDisplay }) {
  const packages = service.pricing?.packages ?? [];
  const features = service.keyFeatures ?? [];

  if (packages.length === 0 && features.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {packages.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Package Deals</h3>
          <div className="space-y-2">
            {packages.map((pkg, idx) => (
              <div
                key={`${pkg.name}-${idx}`}
                className="flex items-center justify-between text-sm p-3 rounded-lg bg-[#FFEACF]/30 border border-[#E8931A]/20"
              >
                <div className="flex-1 pr-4">
                  <span className="text-gray-700 font-medium block">
                    {pkg.name}
                  </span>
                  <span className="text-xs text-gray-500">{pkg.duration}</span>
                  {pkg.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {pkg.description}
                    </p>
                  )}
                </div>
                <span className="text-[#90AC19] text-base font-bold shrink-0">
                  {formatCurrency(
                    getPackageDisplayPrice(service, pkg),
                    service.pricing.currency,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-[#90AC19]" />
            Key Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#90AC19] rounded-full mt-2 shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiceDetail({
  services,
  extras,
  relatedServices,
  promoSeasonId,
}: {
  services: ClientServiceForDisplay[];
  extras: ServicePageExtras;
  relatedServices: ClientServiceForDisplay[];
  promoSeasonId?: CampSeasonId | null;
}) {
  const primary = services[0];
  const showMultiple = services.length > 1;
  const bookLabel =
    primary.type === "space-rental" ? "Book Space" : "Book Now";

  return (
    <section className="min-h-screen py-16 px-4 bg-base-200 text-base-content">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/services"
          className="inline-flex items-center text-[#90AC19] hover:text-[#7A9216] mb-8 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start mb-12">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 md:sticky md:top-24">
            <Image
              src={primary.image || "/default-service.jpg"}
              alt={getServiceDisplayName(primary)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold tracking-wide text-[#90AC19]">
              {extras.heroTagline}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {getServiceDisplayName(primary)}
            </h1>
            <p className="text-lg text-[#90AC19] font-semibold">
              Starting at {formatPricing(primary)}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {primary.description}
            </p>
            <ServiceMetaPills service={primary} />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/booking?service=${primary.type}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#90AC19] hover:bg-[#7A9216] text-white text-center py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                <BookmarkIcon className="w-5 h-5" />
                {bookLabel}
              </Link>
              <Link
                href={SERVICE_CONSULT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Consult
              </Link>
            </div>
          </div>
        </div>

        {showMultiple && (
          <div className="space-y-10 mb-12">
            {services.slice(1).map((service) => (
              <div key={service._id} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getServiceDisplayName(service)}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <ServiceMetaPills service={service} />
                <ServiceOfferings service={service} />
              </div>
            ))}
          </div>
        )}

        <div className="mb-12 empty:hidden">
          <ServiceOfferings service={primary} />
        </div>

        {primary.type === "homeschooling" && (
          <HomeschoolProgramSections
            rates={resolveHomeschoolRates(primary.pricing?.homeschool)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Who This Is For
            </h2>
            <ul className="space-y-3">
              {extras.whoItsFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircleIcon className="w-5 h-5 text-[#90AC19] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <ol className="space-y-4">
              {extras.howItWorks.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#90AC19]/10 text-[#90AC19] font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {extras.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-gray-100 p-4"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-gray-900">
                  {faq.question}
                  <QuestionMarkCircleIcon className="w-5 h-5 text-[#90AC19] shrink-0" />
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        {primary.type === "kiddies-enrichment" && (
          <div className="bg-[#90AC19]/10 border border-[#90AC19]/20 rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-[#90AC19] font-semibold mb-2">
                <SparklesIcon className="w-5 h-5" />
                Weekend Enrichment
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Saturday sessions in Art, STEM, and Performing Arts
              </h2>
              <p className="text-gray-600">
                Our flagship weekend programme is a structured, joyful way for
                children to learn every Saturday.
              </p>
            </div>
            <Link
              href="/weekend-enrichment"
              className="inline-flex items-center justify-center rounded-xl bg-[#90AC19] hover:bg-[#7A9216] text-white px-6 py-3 font-semibold transition-colors shrink-0"
            >
              Explore Weekend Enrichment
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href={`/booking?service=${primary.type}`}
            className="flex-1 flex items-center justify-center gap-2 bg-[#90AC19] hover:bg-[#7A9216] text-white text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <BookmarkIcon className="w-5 h-5" />
            {bookLabel}
          </Link>
          <Link
            href={SERVICE_CONSULT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Consult
          </Link>
        </div>

        {relatedServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedServices.map((service) => (
                <Link
                  key={service._id}
                  href={getPublicServiceHref(service, promoSeasonId)}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#90AC19]/30 transition-all duration-300 group"
                >
                  <div className="relative h-36 bg-gray-100">
                    <Image
                      src={service.image || "/default-service.jpg"}
                      alt={getServiceDisplayName(service)}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#90AC19] transition-colors">
                      {getServiceDisplayName(service)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Starting at {formatPricing(service)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
