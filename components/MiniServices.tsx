"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getPublicServices,
  ClientServiceForDisplay,
} from "@/app/services/actions";

export default function MiniServices() {
  const [services, setServices] = useState<ClientServiceForDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const allServices = await getPublicServices();
        // Limit to 6 services for the mini display
        setServices(allServices.slice(0, 6));
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-16 px-4 bg-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-base-content mb-4">
            Our Services
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Comprehensive childcare and educational solutions designed to
            support your family&apos;s unique needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-base-100 shadow-lg overflow-hidden animate-pulse border border-base-300"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : services.length > 0 ? (
            services.map((service) => (
              <div
                key={service._id}
                className="bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden flex flex-col h-full border border-base-300"
              >
                {/* Service Image */}
                <div className="w-full h-48 md:h-52 relative overflow-hidden shrink-0">
                  <Image
                    src={service.image || "/default-service.jpg"}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 min-h-0">
                  <h3 className="text-xl font-semibold text-base-content mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.shortDescription || service.description}
                  </p>

                  {/* CTA Link */}
                  <Link href="/services" passHref className="mt-auto">
                    <button className="text-[#90AC19] cursor-pointer font-medium hover:text-[#7A9216] transition-colors duration-300 flex items-center group">
                      Learn More
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No services available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link href={"/services"} passHref>
            <button className="bg-[#90AC19] cursor-pointer hover:bg-[#7A9216] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
              View All Services
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
