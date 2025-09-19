export default function Statistics() {
  const stats = [
    {
      number: "2,500+",
      label: "Families Served",
      description:
        "Happy families trust us with their children's care and education",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
    },
    {
      number: "15+",
      label: "Verified Tutors",
      description: "Qualified educators and caregivers in our network",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      ),
    },
    {
      number: "95%",
      label: "Success Rate",
      description: "Successful matches between families and service providers",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      number: "6+ Years",
      label: "Experience",
      description: "Trusted childcare solutions since 2020",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  const certifications = [
    {
      title: "Background Checked",
      description:
        "All service providers undergo comprehensive background verification",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: "Licensed & Insured",
      description:
        "Fully licensed childcare services with comprehensive insurance coverage",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fillRule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: "Safety Certified",
      description:
        "First aid and CPR certified professionals prioritizing child safety",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency assistance",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 px-4 bg-[#FFEACF]/30">
      <div className="max-w-7xl mx-auto">
        {/* Statistics Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Families Everywhere
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Our track record speaks for itself - real numbers that demonstrate
            our commitment to excellence
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-[#90AC19] mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-[#90AC19] mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators Section */}
        <div className="border-t border-gray-200 pt-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Safety & Trust Certifications
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your family&lsquo;s safety is our top priority. Every service
              provider meets our rigorous standards.
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 text-center"
              >
                <div className="text-[#90AC19] mb-3 flex justify-center">
                  {cert.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {cert.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center">
            <h4 className="text-xl font-semibold text-gray-900 mb-8">
              Recognized & Certified By
            </h4>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder for certification logos */}
              <div className="bg-gray-200 rounded-lg px-6 py-3 text-gray-600 font-medium">
                Child Care Licensing
              </div>
              <div className="bg-gray-200 rounded-lg px-6 py-3 text-gray-600 font-medium">
                Better Business Bureau
              </div>
              <div className="bg-gray-200 rounded-lg px-6 py-3 text-gray-600 font-medium">
                National Association
              </div>
              <div className="bg-gray-200 rounded-lg px-6 py-3 text-gray-600 font-medium">
                Safety First Certified
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
