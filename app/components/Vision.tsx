import Image from "next/image";
import Link from "next/link";

export default function Vision() {
  const ageGroups = [
    {
      range: "2-4 Years",
      title: "Early Foundation",
      description:
        "Play-based learning with focus on social skills, basic concepts, and emotional development",
      features: [
        "Interactive play sessions",
        "Basic numeracy & literacy",
        "Social interaction skills",
        "Creative expression",
      ],
    },
    {
      range: "5-6 Years",
      title: "School Readiness",
      description:
        "Preparing children for formal education with structured learning and independence building",
      features: [
        "Reading & writing basics",
        "Mathematical concepts",
        "Following instructions",
        "Group activities",
      ],
    },
    {
      range: "7-10 Years",
      title: "Academic Growth",
      description:
        "Supporting school curriculum with advanced concepts and critical thinking development",
      features: [
        "Subject-specific tutoring",
        "Homework assistance",
        "Problem-solving skills",
        "Study habits formation",
      ],
    },
  ];

  const sessionTypes = [
    {
      type: "Virtual Sessions",
      description:
        "Online learning from the comfort of home with interactive tools and personalized attention",
      features: [
        "1-on-1 tutoring",
        "Interactive whiteboards",
        "Screen sharing",
        "Flexible scheduling",
      ],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
    },
    {
      type: "Physical Sessions",
      description:
        "In-person learning in our safe, nurturing environment with hands-on activities",
      features: [
        "Face-to-face interaction",
        "Hands-on materials",
        "Group learning",
        "Safe environment",
      ],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 px-4 bg-[#FFEACF]/30">
      <div className="max-w-7xl mx-auto">
        {/* Our Approach Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/vision.jpg"
              alt="Our teaching approach with children"
              fill
              className="object-cover"
            />
          </div>

          {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-[#90AC19] mb-6">
              OUR APPROACH
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              We recognize that parents have the biggest responsibility in
              raising children right so we provide support just as the parent
              would, but with the additional advantage of qualified and
              experienced hands. So in our approach to teaching, we put
              ourselves in the shoes of the parents to guide the kids through
              the following activities:
            </p>

            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Reinforcing concepts taught in school.
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Gathering fun resources to explain difficult concepts.
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center mr-4 mt-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Advising them on self-management & socially acceptable ethics
                  to dealing with people/work.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Age Groups Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Age-Appropriate Programs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ageGroups.map((group, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-center mb-6">
                  <div className="inline-block bg-[#E8931A] text-white text-sm font-bold px-4 py-2 rounded-full mb-3">
                    {group.range}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {group.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{group.description}</p>
                </div>
                <ul className="space-y-2">
                  {group.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <div className="w-4 h-4 bg-[#90AC19]/20 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#90AC19] rounded-full"></div>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types & Membership */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Session Types */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Learning Options
            </h3>
            <div className="space-y-6">
              {sessionTypes.map((session, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-[#90AC19] flex-shrink-0">
                      {session.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {session.type}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {session.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {session.features.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="text-xs bg-[#90AC19]/10 text-[#90AC19] px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Membership & Support */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Membership & Support
            </h3>

            {/* Membership Card */}
            <div className="bg-[url('/orangeBG.jpg')] object-cover rounded-xl p-6 text-white mb-6 relative">
              <div className="absolute inset-0 bg-black/30 rounded-xl"></div>
              <div className="relative z-10 text-white">
                <h4 className="text-xl font-semibold mb-4">
                  Premium Membership
                </h4>
                <p className="mb-4">
                  Join our premium membership for exclusive benefits and
                  priority access to all services.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Priority booking for sessions
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    15% discount on all services
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Monthly progress reports
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    24/7 support access
                  </li>
                </ul>
                <Link href={"/about"} passHref>
                  <button className="bg-white font-bold text-[#90AC19] cursor-pointer px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
