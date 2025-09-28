import Image from "next/image";
import Link from "next/link";

export default function Vision() {
  const ageGroups = [
    {
      range: "0-4 Years",
      title: "Nuture",
      description:
        "Our early foundation program is a montesorri inspired learning with focus on basic math, literacy and cultural skills",
      features: [
        "Interactive play sessions",
        "Basic numeracy & literacy",
        "Social interaction skills",
        "Creative expression",
      ],
    },
    {
      range: "5-6 Years",
      title: "Empower",
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
      title: "Lead",
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
      category: "Tutoring Services",
      description:
        "Personalized academic support tailored to your child's needs",
      services: [
        {
          type: "Virtual Tutoring",
          description:
            "One-on-one academic support with qualified tutors using interactive digital tools",
          features: [
            "1-on-1 subject tutoring",
            "Interactive whiteboards",
            "Screen sharing & recording",
            "Homework assistance",
            "Progress tracking",
            "Flexible timing",
          ],
          subjects: ["Mathematics", "English", "Science", "Social Studies"],
        },
        {
          type: "On-Site Tutoring",
          description:
            "Face-to-face academic support with hands-on learning activities",
          features: [
            "Personal attention",
            "Hands-on materials",
            "Immediate feedback",
            "Study skills development",
            "Learning environment",
            "Social interaction",
          ],
          subjects: [
            "All Academic Subjects",
            "Exam Preparation",
            "Study Skills",
          ],
        },
      ],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      category: "Homeschooling Programs",
      description:
        "Comprehensive educational programs for complete learning experience",
      services: [
        {
          type: "Virtual Homeschooling",
          description:
            "Comprehensive curriculum delivery with structured learning modules",
          features: [
            "Full curriculum coverage",
            "Live interactive classes",
            "Digital learning materials",
            "Weekly assessments",
            "Parent progress reports",
            "Personalized discussions",
          ],
          subjects: ["Complete K-12 Curriculum", "Specialized Programs"],
        },
        {
          type: "On-Site Homeschooling",
          description:
            "Traditional classroom experience with personalized curriculum",
          features: [
            "Structured classroom setting",
            "Physical learning materials",
            "Group activities",
            "Science experiments",
            "Art & craft sessions",
            "Peer collaboration",
          ],
          subjects: ["Core Subjects", "STEM Programs", "Arts & Humanities"],
        },
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
    <section className="py-16 px-4 ">
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
              experienced hands. So in our approach to care and teaching, we put
              ourselves in the shoes of the parents to guide the kids through
              the following activities:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {/* Tutoring Approach */}
              <div className="mb-8">
                <h4 className="text-base font-semibold text-[#E8931A] mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Academic Tutoring
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E8931A] rounded-full flex items-center justify-center mr-4 mt-1">
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
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E8931A] rounded-full flex items-center justify-center mr-4 mt-1">
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
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E8931A] rounded-full flex items-center justify-center mr-4 mt-1">
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
                      Self-management & socially acceptable ethics to dealing
                      with people/work.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Childcare Approach */}
              <div>
                <h4 className="text-base font-semibold text-[#90AC19] mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Childcare Services
                </h4>
                <ul className="space-y-3 text-sm">
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
                      Childhood enrichment activites
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
                      Life skill development
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
                      Building team spirit and cooperation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
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

        {/* Learning Options - Virtual and Physical Sessions Side by Side */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Learning Options
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sessionTypes?.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-[#90AC19] flex-shrink-0">
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {category.category}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Services under this category */}
                <div className="space-y-4">
                  {category.services?.map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      className="bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="mb-4">
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.type}
                        </h5>
                        <p className="text-gray-600 text-sm mb-3">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {service.subjects?.map((subject, subjectIndex) => (
                            <span
                              key={subjectIndex}
                              className="text-xs bg-[#E8931A]/10 text-[#E8931A] px-2 py-1 rounded-full font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.features?.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="text-xs bg-[#90AC19]/10 text-[#90AC19] px-2 py-1 rounded-full flex items-center"
                          >
                            <div className="w-1.5 h-1.5 bg-[#90AC19] rounded-full mr-2"></div>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership & Support - Now Below Learning Options */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Membership & Support
            </h3>

            {/* Membership Card */}
            <div className="bg-[url('/orangeBG.jpg')] object-cover rounded-xl p-8 text-white relative">
              <div className="absolute inset-0 bg-orange-700/50 rounded-xl"></div>
              <div className="relative z-10 text-white text-center">
                <h4 className="text-2xl font-semibold mb-4">
                  Premium Membership
                </h4>
                <p className="mb-6 text-lg">
                  Join our premium membership for exclusive benefits and
                  priority access to all services.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center justify-center md:justify-start">
                    <svg
                      className="w-5 h-5 mr-3"
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
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    20% discount on all services
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <svg
                      className="w-5 h-5 mr-3"
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
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <svg
                      className="w-5 h-5 mr-3"
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
                  </div>
                </div>
                <Link href={"/about"} passHref>
                  <button className="bg-white font-bold text-[#90AC19] cursor-pointer px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-lg">
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
