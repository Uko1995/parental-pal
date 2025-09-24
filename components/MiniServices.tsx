import Image from "next/image";
import Link from "next/link";

export default function MiniServices() {
  const services = [
    {
      title: "Childcare Services",
      description:
        "Professional childcare solutions for busy parents. Safe, nurturing environment with qualified caregivers.",
      img: "/childcare.jpg",
    },
    {
      title: "Home Schooling Program",
      description:
        "Comprehensive homeschooling curriculum and support for families choosing alternative education.",
      img: "/homeschooling.jpg",
    },
    {
      title: "Academic Tutoring",
      description:
        "One-on-one and group tutoring sessions with qualified educators across all subjects and grade levels.",
      img: "/tutoring.jpg",
    },
    {
      title: "Space Rentals",
      description:
        "Flexible space rental options for educational activities, birthday parties, and community events.",
      img: "/space.webp",
    },
    {
      title: "Kiddies Party/ Event Planning",
      description:
        "Comprehensive event planning services for children&apos;s parties, including themes, activities, and logistics.",
      img: "/Party.webp",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive childcare and educational solutions designed to
            support your family&apos;s unique needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white  shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden"
            >
              {/* Service Image */}
              <div className="w-full h-48 relative overflow-hidden">
                <Image
                  src={service.img}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* CTA Link */}
                <Link href={"/services"} passHref>
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
          ))}
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
