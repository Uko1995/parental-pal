import Link from "next/link";
import { getPublicServices, ClientServiceForDisplay } from "./actions";
import {
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { formatBillingSuffix } from "@/lib/service-utils";
import Image from "next/image";

// Helper function to format pricing
const formatPricing = (service: ClientServiceForDisplay) => {
  const { baseRate, currency, billingType } = service.pricing;
  const currencySymbol = currency === "NGN" ? "₦" : "$";

  const billingSuffix = formatBillingSuffix(billingType);

  // Format the number with commas
  const formattedRate = Number(baseRate).toLocaleString("en-US");

  return `${currencySymbol}${formattedRate}${billingSuffix}`;
};

// Helper to format currency
const formatCurrency = (amount: number, currency: string = "NGN") => {
  const currencySymbol = currency === "NGN" ? "₦" : "$";
  // Ensure we have a number and format with commas
  const formattedAmount = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${currencySymbol}${formattedAmount}`;
};

export default async function Services() {
  const services = await getPublicServices();

  // WhatsApp consultation link
  const whatsappNumber = "+2348065394795";
  const whatsappMessage = encodeURIComponent(
    "Hello! I'd like to schedule a consultation about your services."
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Modern & Clean */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Comprehensive Care for{" "}
            <span className="text-[#90AC19]">Every Family</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our full range of childcare and educational services
            designed to support your family&apos;s journey.
          </p>
        </div>

        {/* Services Grid - Modern Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#90AC19]/30 group flex flex-col h-full"
            >
              {/* Service Header with Image */}
              <div className="relative h-52 md:h-56 overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={service.image || "/default-service.jpg"}
                  alt={service.name}
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linesr-to-t from-black/70 via-black/30 to-transparent"></div>

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 bg-[#90AC19] text-white px-4 py-2 rounded-xl shadow-lg">
                  <div className="text-xs font-medium mb-0.5">Starting at</div>
                  <div className="text-lg font-bold">
                    {formatPricing(service)}
                  </div>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6 md:p-7 flex flex-col flex-1 min-h-0">
                <h1 className="inline-flex items-center text-xl font-bold text-gray-900">
                  {service.name}
                </h1>

                <p className="text-gray-600 mb-5 leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {service?.requirements?.ageGroup && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <UserGroupIcon className="w-4 h-4" />
                      <span className="font-medium">
                        {service.requirements.ageGroup}
                      </span>
                    </div>
                  )}
                  {service?.availability && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                      <ClockIcon className="w-4 h-4" />
                      <span className="font-medium">
                        {service.availability}
                      </span>
                    </div>
                  )}
                </div>

                {/* Package Discounts */}
                {service.pricing?.packages &&
                  service.pricing.packages.length > 0 && (
                    <div className="mb-5 p-4 bg-[#FFEACF]/30 rounded-xl border border-[#E8931A]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Package Deals
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {service.pricing.packages.map((pkg, idx) => {
                          const basePrice =
                            Number(service.pricing.baseRate) || 0;

                          const discountedPrice =
                            service?.type === "childcare"
                              ? basePrice *
                                26 *
                                (1 - pkg.discountPercentage / 100)
                              : service?.type === "space-rental"
                              ? basePrice *
                                2 *
                                (1 - pkg.discountPercentage / 100)
                              : basePrice;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm p-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                              <div className="flex-1">
                                <span className="text-gray-700 font-medium block">
                                  {pkg.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {pkg.duration}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* <span className="text-gray-600 line-through text-xs">
                                  {formatCurrency(
                                    unDiscountedPrice,
                                    service.pricing.currency
                                  )}
                                </span> */}
                                <span className="text-[#90AC19] text-base font-bold">
                                  {formatCurrency(
                                    discountedPrice,
                                    service.pricing.currency
                                  )}
                                </span>
                                {/* <span className="text-xs bg-[#E8931A] text-white px-2 py-0.5 rounded-full font-semibold">
                                  -{pkg.discountPercentage}%
                                </span> */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Features List */}
                {service.keyFeatures && service.keyFeatures.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-[#90AC19]" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.keyFeatures
                        .slice(0, 6)
                        .map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-start gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-[#90AC19] rounded-full mt-2 shrink-0"></div>
                            <span className="text-sm text-gray-600">
                              {feature}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <Link
                    href={`/booking?service=${service.type}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#90AC19] hover:bg-[#7A9216] text-white text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <BookmarkIcon className="w-5 h-5" />
                    {service.type === "space-rental"
                      ? "Book Space"
                      : "Book Now"}
                  </Link>
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Consult</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Us Section - Modern Design */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-[#90AC19]">PARENTALPAL</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to providing exceptional care and educational
              services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="flex justify-center">
                <div className="p-4 bg-[#90AC19]/10 rounded-2xl">
                  <svg
                    className="w-12 h-12 text-[#90AC19]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Expert Team</h3>
              <p className="text-gray-600">
                Qualified professionals with years of experience in childcare
                and education
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="flex justify-center">
                <div className="p-4 bg-[#E8931A]/10 rounded-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-12 h-12 text-[#E8931A]"
                  >
                    <path d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Safe & Secure</h3>
              <p className="text-gray-600">
                Background-checked staff and secure facilities for your peace of
                mind
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
              <div className="flex justify-center">
                <div className="p-4 bg-[#A25F97]/10 rounded-2xl">
                  <svg
                    className="w-12 h-12 text-[#A25F97]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Personalized Care
              </h3>
              <p className="text-gray-600">
                Tailored services that adapt to your family&apos;s unique needs
                and schedule
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - Modern & Clean */}
        <div className="text-center space-y-8 py-16 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Contact us today to discuss your family&apos;s needs and discover
            how we can support your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              WhatsApp Consultation
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-[#90AC19] text-gray-700 hover:text-[#90AC19] px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
