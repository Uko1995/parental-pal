import Image from "next/image";

export default function AboutPage() {
  const values = [
    {
      title: "Child-Centered Approach",
      description:
        "Every decision we make puts the child's development, safety, and happiness first.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Quality Excellence",
      description:
        "We maintain rigorous standards for all our tutors, programs, and services.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: "Personalized Care",
      description:
        "We understand every child is unique and tailor our approach to individual needs.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: "Family Partnership",
      description:
        "We work closely with parents as partners in their child's educational journey.",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "Founded ParentalPal, formerly 'VanPebbles Hub'",
      description:
        "Started with a vision to support working parents with quality childcare, tutoring, and kids party solutions. Our humble beginnings were rooted in a passion for helping families balance work and parenting.",
    },
    {
      year: "2023",
      title: "Tutoring Network Milestone",
      description:
        "Connected over 500 families with qualified tutors across various subjects and achieved over 1,000 hours of tutoring worldwide. Our growing network ensured every child received personalized academic support.",
    },
    {
      year: "2024",
      title: "Rebranding to ParentalPal",
      description:
        "Embraced a new identity as ParentalPal to reflect our expanded mission and commitment to family support, while introducing new services and a refreshed brand experience.",
    },

    {
      year: "2025",
      title: "Community Hub",
      description:
        "Opened our first physical learning center and community space, providing a safe, nurturing environment for children to learn, play, and grow together.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#90AC19]/10 to-[#E8931A]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                About <span className="text-[#90AC19]">ParentalPal</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                We are your trusted partner in finding the best childcare
                solutions. Dedicated to connecting parents with top-notch
                tutors, holiday camps, playgroups, homeschooling resources, and
                events that nurture your child's growth.
              </p>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#90AC19]">
                    2,500+
                  </div>
                  <div className="text-gray-600">Families Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#E8931A]">15+</div>
                  <div className="text-gray-600">Qualified Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A25F97]">6+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/vision.jpg"
                alt="Children learning and playing together"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/kid.webp"
                alt="Our mission in action"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-[#90AC19]">Mission</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To empower parents by providing access to exceptional childcare
                and educational services that foster children's academic,
                social, and emotional development. We bridge the gap between
                busy family schedules and quality child development through
                trusted, professional, and nurturing support systems.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
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
                    Support working parents with reliable, quality childcare
                    solutions
                  </span>
                </div>
                <div className="flex items-start">
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
                    Create safe, nurturing environments where children can
                    thrive
                  </span>
                </div>
                <div className="flex items-start">
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
                    Build strong community connections between families and
                    educators
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-[#E8931A]">Vision</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To be the leading platform that transforms how families access
                and experience childcare and educational services. We envision a
                world where every child has access to personalized, high-quality
                learning experiences that unlock their full potential, while
                giving parents the confidence and support they need to balance
                work and family life successfully.
              </p>
              <div className="bg-[#E8931A]/10 rounded-xl p-6">
                <h3 className="font-semibold text-[#E8931A] mb-3">
                  Our Future Goals
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Expand to serve 10,000+ families nationwide</li>
                  <li>• Launch innovative virtual learning platforms</li>
                  <li>
                    • Establish community learning centers in every major city
                  </li>
                  <li>• Pioneer new standards in childcare excellence</li>
                </ul>
              </div>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/tutor.webp"
                alt="Our vision for the future"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core <span className="text-[#90AC19]">Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These fundamental principles guide everything we do and shape how
              we serve families
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="text-[#90AC19] mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-[#A25F97]">Journey</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a small startup to a trusted community partner - here's how
              we've grown
            </p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div className="flex-1">
                  <div
                    className={`bg-white rounded-xl p-6 shadow-md ${
                      index % 2 === 0 ? "mr-8" : "ml-8"
                    }`}
                  >
                    <div className="text-2xl font-bold text-[#A25F97] mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-[#A25F97] rounded-full"></div>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#90AC19] to-[#7A9216]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discover how PARENTALPAL can support your family's educational
            journey. From tutoring to holiday camps, we're here to help your
            child thrive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-[#90AC19] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300">
              Explore Our Services
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#90AC19] transition-colors duration-300">
              Contact Us Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
