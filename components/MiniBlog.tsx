import Link from "next/link";

export default function MiniBlog() {
  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with expert insights, success stories, and educational tips
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#90AC19]/20 to-[#E8931A]/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#90AC19]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Blog Articles Coming Soon!
            </h3>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              We&apos;re preparing amazing content including success stories, educational tips, and expert insights to help you on your parenting journey.
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                What&apos;s coming:
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="bg-[#90AC19]/10 rounded-full p-0.5">
                    <svg className="w-3 h-3 text-[#90AC19]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Parent success stories</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#90AC19]/10 rounded-full p-0.5">
                    <svg className="w-3 h-3 text-[#90AC19]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Educational guidance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#90AC19]/10 rounded-full p-0.5">
                    <svg className="w-3 h-3 text-[#90AC19]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Expert tips & advice</span>
                </div>
              </div>
            </div>
            
            <Link href="/services">
              <button className="bg-[#90AC19] hover:bg-[#7A9216] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
                Explore Our Services
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}