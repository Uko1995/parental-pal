import Image from "next/image";
import Link from "next/link";

export default function Services() {
  const services = [
    {
      id: "childcare",
      title: "Professional Childcare Services",
      shortDescription:
        "Safe, nurturing environment with qualified caregivers for your peace of mind.",
      fullDescription:
        "Our professional childcare services provide a secure, loving environment where children can learn, play, and grow. With qualified caregivers, educational activities, and flexible scheduling options.",
      image: "/childcare.jpg",
      features: [
        "Qualified and vetted caregivers",
        "Age-appropriate learning activities",
        "Flexible scheduling options",
        "Nutritious meals and snacks",
        "Regular progress updates",
        "Emergency care protocols",
      ],
      ageGroups: "6 months - 10 years",
      pricing: "₦6,000/day, 15% discount for monthly bookings",
      availability: "Monday - Friday",
    },
    {
      id: "homeschooling",
      title: "Comprehensive Homeschooling Program",
      shortDescription:
        "Complete educational curriculum and support for families choosing alternative education.",
      fullDescription:
        "Our homeschooling program offers a complete educational experience with certified teachers, structured curriculum, and personalized learning plans tailored to each child's unique needs and learning style.",
      image: "/homeschooling.jpg",
      features: [
        "Certified teacher supervision",
        "Personalized curriculum planning",
        "Progress tracking and assessment",
        "Social interaction opportunities",
        "College preparation support",
        "Flexible learning schedules",
      ],
      ageGroups: "2 - 10 years",
      pricing: "From ₦250,000/month",
      availability: "Monday - Sunday",
    },
    {
      id: "tutoring",
      title: "Academic Tutoring Excellence",
      shortDescription:
        "One-on-one and group tutoring sessions with qualified educators across all subjects.",
      fullDescription:
        "Boost your child's academic performance with our expert tutoring services. Our qualified educators provide personalized instruction in all subjects, helping students build confidence and achieve their full potential.",
      image: "/tutoring.jpg",
      features: [
        "Subject-specific expertise",
        "Personalized learning plans",
        "Exam preparation support",
        "Homework assistance",
        "Progress monitoring",
        "Both online and in-person options",
      ],
      ageGroups: "2 - 10 years",
      pricing: "From ₦15,000/hour",
      availability: "7 days a week",
    },
    {
      id: "space-rental",
      title: "Flexible Space Rentals",
      shortDescription:
        "Modern, safe spaces for educational activities, parties, and community events.",
      fullDescription:
        "Rent our fully equipped, child-friendly spaces for your events. Perfect for birthday parties, educational workshops, community gatherings, and special celebrations.",
      image: "/space.webp",
      features: [
        "Fully equipped facilities",
        "Child-safe environments",
        "Audio/visual equipment",
        "Flexible booking options",
        "Event planning assistance",
        "Catering arrangements available",
      ],
      ageGroups: "All ages welcome",
      pricing: "From ₦350,000/day",
      availability: "Weekends",
    },
    {
      id: "kiddies-enrichment",
      title: "Kids Enrichment Session",
      shortDescription:
        "Engaging educational sessions designed to enhance children's creativity, critical thinking, and social skills.",
      fullDescription:
        "Our Kids Enrichment Sessions provide structured activities that stimulate learning beyond traditional academics. Through interactive workshops, creative projects, and skill-building exercises, we help children develop confidence, creativity, and essential life skills in a fun, supportive environment.",
      image: "/Party.webp",
      features: [
        "Creative arts and crafts workshops",
        "STEM learning activities",
        "Social skills development",
        "Critical thinking exercises",
        "Team building activities",
        "Skill-based games and challenges",
      ],
      ageGroups: "2 - 10 years",
      pricing: "₦8,000 per session",
      availability: "Weekdays & Weekends",
    },
    {
      id: "holiday-camps",
      title: "Exciting Holiday Camps",
      shortDescription:
        "Fun-filled holiday programs with educational activities, sports, and creative workshops.",
      fullDescription:
        "Keep your children engaged during school holidays with our exciting camp programs. Featuring educational activities, sports, arts and crafts, and field trips in a safe, supervised environment.",
      image: "/childcare.jpg",
      features: [
        "Diverse activity programs",
        "Professional supervision",
        "Educational field trips",
        "Sports and recreation",
        "Arts and crafts workshops",
        "Healthy meals included",
      ],
      ageGroups: "2 - 10 years",
      pricing: "From ₦30,000/week",
      availability: "School Holidays and Midterm Breaks",
    },
  ];

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
            designed to support your family's journey. From professional
            childcare to academic excellence, we're here for every milestone.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-[#90AC19] w-24 h-1 rounded-full"></div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100"
            >
              {/* Service Header */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-white/90">{service.shortDescription}</p>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.fullDescription}
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-[#FFEACF]/30 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Age Groups</div>
                    <div className="font-semibold text-gray-900">
                      {service.ageGroups}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#FFEACF]/30 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Pricing</div>
                    <div className="font-semibold text-[#90AC19]">
                      {service.pricing}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#FFEACF]/30 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">
                      Availability
                    </div>
                    <div className="font-semibold text-gray-900">
                      {service.availability}
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Key Features:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature, featureIndex) => (
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
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/services/${service.id}`}
                    className="flex-1 bg-[#90AC19] hover:bg-[#7A9216] text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    Register your child
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
                Tailored services that adapt to your family's unique needs and
                schedule
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
            Contact us today to discuss your family's needs and discover how we
            can support your journey.
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
