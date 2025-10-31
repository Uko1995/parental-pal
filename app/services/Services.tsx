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
    <section className="py-10 px-4 bg-linear-to-br from-[#FFEACF]/50 via-white to-[#FFEACF]/50">
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
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>

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
                            className="w-4 h-4 text-[#90AC19] mr-2 shrink-0"
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
        <div className="bg-linear-to-r from-[#90AC19] to-[#7A9216] rounded-3xl p-12 text-white text-center">
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
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#E8931A"
                  className="w-16 h-16"
                >
                  <path d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08Z" />
                  {/* White exclamation */}
                  <path
                    fill="white"
                    d="M12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H12Z"
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
