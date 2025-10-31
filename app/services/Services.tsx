import Image from "next/image";
import Link from "next/link";
import { getPublicServices, ClientServiceForDisplay } from "./actions";

// Helper function to format pricing
const formatPricing = (service: ClientServiceForDisplay) => {
  const { baseRate, currency, billingType } = service.pricing;
  const currencySymbol = currency === "NGN" ? "₦" : "$";

  const billingMap = {
    hour: "/hour",
    day: "/day",
    week: "/week",
    month: "/month",
    term: "/term",
    session: "/session",
    event: "/event",
    custom: "",
  };

  return `From ${currencySymbol}${baseRate?.toLocaleString()}${
    billingMap[billingType]
  }`;
};

export default async function Services() {
  const services = await getPublicServices();
  return (
    <section className="py-10 px-4 bg-gradient-to-br from-[#FFEACF]/50 via-white to-[#FFEACF]/50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Services for Every Family
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our full range of childcare and educational services
            designed to support your family&apos;s journey. From professional
            childcare to academic excellence, we&apos;re here for every
            milestone.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-[#90AC19] w-24 h-1 rounded-full"></div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100"
            >
              {/* Service Header */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={service.image || "/default-service.jpg"}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                  <p className="text-white/90">{service.shortDescription}</p>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-[#FFEACF]/30 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Age Groups</div>
                    <div className="font-semibold text-gray-900">
                      {service?.requirements?.ageGroup || "All Ages"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#FFEACF]/30 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Pricing</div>
                    <div className="font-semibold text-[#90AC19]">
                      {formatPricing(service)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#FFEACF]/30 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">
                      Availability
                    </div>
                    <div className="font-semibold text-gray-900">
                      {service?.availability}
                    </div>
                  </div>
                </div>

                {/* Features List */}
                {service.keyFeatures && service.keyFeatures.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Key Features:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.keyFeatures.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <svg
                            className="w-4 h-4 text-[#90AC19] mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/booking?service=${service.type}`}
                    className="flex-1 bg-[#90AC19] hover:bg-[#7A9216] text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    {service.type === "space-rental"
                      ? "Book our Space"
                      : "Enroll your Child"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-r from-[#90AC19] to-[#7A9216] rounded-3xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Why Choose PARENTALPAL?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-[#E8931A]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  <circle cx="12" cy="12" r="3" fill="#FFEACF" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
              <p className="text-white/90">
                Qualified professionals with years of experience in childcare
                and education
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-[#E8931A]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  <path
                    d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                    fill="#FFEACF"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-white/90">
                Background-checked staff and secure facilities for your peace of
                mind
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-[#E8931A]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  <circle cx="12" cy="10" r="4" fill="#FFEACF" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Care</h3>
              <p className="text-white/90">
                Tailored services that adapt to your family&apos;s unique needs
                and schedule
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your family&apos;s needs and discover
            how we can support your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-[#90AC19] hover:bg-[#7A9216] text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Schedule Consultation
            </Link>
            <Link
              href="/about"
              className="border-2 border-gray-300 hover:border-[#90AC19] text-gray-700 hover:text-[#90AC19] px-8 py-4 rounded-lg font-semibold transition-all duration-300"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
