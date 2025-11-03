"use client";

import { UserGroupIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Vision() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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
          type: "In your Home",
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
          type: "At out Centre",
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
          />
        </svg>
      ),
    },
    {
      category: "Homeschooling Programs",
      description:
        "Comprehensive educational programs for complete learning experience",
      services: [
        {
          type: "In your Home ",
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
          type: "At our Centre ",
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Our Approach Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <Image
              src="/woman2.webp"
              alt="Our teaching approach with children"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          

          {/* Text Content */}
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-[#90AC19] mb-6"
            >
              OUR APPROACH
            </motion.h2>
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
                    <div className="shrink-0 w-6 h-6 bg-[#E8931A] rounded-full flex items-center justify-center mr-4 mt-1">
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
                    <div className="shrink-0 w-6 h-6 bg-[#E8931A] rounded-full flex items-center justify-center mr-4 mt-1">
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
                    <div className="shrink-0 w-6 h-6 bg-[#E8931A] rounded-full flex items-center justify-center mr-4 mt-1">
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
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Childcare Services
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="shrink-0 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center mr-4 mt-1">
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
                    <div className="shrink-0 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center mr-4 mt-1">
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
                    <div className="shrink-0 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center mr-4 mt-1">
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
                  <div className="text-[#90AC19] shrink-0">{category.icon}</div>
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
            <div className="bg-[url('/orangeBG.webp')] object-cover rounded-xl p-8 text-white relative">
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
                    40% discount on all services
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
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-white font-bold text-[#90AC19] cursor-pointer px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-lg"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Membership Modal */}
      {showPremiumModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-linear-to-br from-white to-[#90AC19]/5">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <div className="text-center py-8">
              {/* Coming Soon Badge */}
              <div className="mb-6">
                <span className="inline-block bg-linear-to-r from-[#90AC19] to-[#E8931A] text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Premium Membership
              </h3>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
                We&apos;re working on something special! Premium membership will
                give you exclusive access to enhanced features, priority
                booking, and much more.
              </p>

              {/* Features Preview */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
                <h4 className="font-bold text-gray-800 mb-4">
                  What to Expect:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#90AC19] shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Priority booking access
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#90AC19] shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Exclusive discounts
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#90AC19] shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Dedicated support
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#90AC19] shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Early access to events
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification */}
              <div className="bg-[#E8931A]/10 border border-[#E8931A]/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  🔔 Want to be notified when we launch?{" "}
                  <Link
                    href="/contact"
                    className="text-[#E8931A] font-semibold hover:underline"
                  >
                    Contact us
                  </Link>{" "}
                  to join our waitlist!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowPremiumModal(false)}
                className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white border-none"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowPremiumModal(false)}
          ></div>
        </div>
      )}
    </section>
  );
}
