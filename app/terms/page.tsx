import { Metadata } from "next";
import Link from "next/link";
import { generateMetadata } from "../../lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Terms of Service - ParentalPal Usage Terms",
  description:
    "Review ParentalPal's terms of service, including booking policies, cancellation rules, refund procedures, and user responsibilities. Important information for all users.",
  path: "/terms",
  noIndex: false,
});

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-base-100 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last Updated: November 3, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using ParentalPal&apos;s services, you agree to be
              bound by these Terms of Service and all applicable laws and
              regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this site.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              2. Service Description
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              ParentalPal provides childcare solutions including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Academic tutoring services</li>
              <li>Childcare services</li>
              <li>Holiday camps and enrichment programs</li>
              <li>Event space rental</li>
              <li>Homeschooling resources</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We act as an intermediary platform connecting parents with service
              providers.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              3. User Accounts
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Account Registration
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>You must provide accurate and complete information</li>
                  <li>You must be at least 18 years old to register</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per user is allowed</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Account Responsibilities
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Keep your password confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>
                    You are responsible for all activities under your account
                  </li>
                  <li>Do not share your account with others</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Bookings and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              4. Bookings and Payments
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Booking Process
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>All bookings are subject to availability</li>
                  <li>Prices are displayed in Nigerian Naira (₦)</li>
                  <li>
                    Confirmation emails will be sent after successful booking
                  </li>
                  <li>You must provide accurate child information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Payment Terms
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>All payments are processed securely through Paystack</li>
                  <li>Full payment is required at the time of booking</li>
                  <li>We accept card payments only</li>
                  <li>Payment confirmation will be sent via email</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cancellation and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              5. Cancellation and Refunds
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Cancellation Policy
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    Cancellations must be made at least 48 hours before the
                    scheduled service
                  </li>
                  <li>Contact us immediately to cancel a booking</li>
                  <li>Late cancellations may incur fees</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              6. User Conduct
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Harass, abuse, or harm service providers</li>
              <li>Provide false or misleading information</li>
              <li>Interfere with the proper functioning of the platform</li>
              <li>
                Attempt to gain unauthorized access to any part of the service
              </li>
              <li>Use automated systems to access the service</li>
              <li>Resell or commercialize the service</li>
            </ul>
          </section>

          {/* Service Providers */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              7. Service Providers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All tutors and childcare providers are:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Verified and background-checked</li>
              <li>Qualified and experienced in their fields</li>
              <li>Independent contractors, not ParentalPal employees</li>
              <li>Responsible for the quality of services provided</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              ParentalPal acts as a platform and is not directly responsible for
              the services provided by third-party providers.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this website, including text, graphics, logos,
              images, and software, is the property of ParentalPal and is
              protected by copyright and trademark laws. You may not reproduce,
              distribute, or create derivative works without our written
              permission.
            </p>
          </section>

          {/* Liability Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              ParentalPal shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or use</li>
              <li>Actions or omissions of service providers</li>
              <li>Interruptions or delays in service</li>
              <li>Unauthorized access to your data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Our total liability shall not exceed the amount paid by you for
              the specific service in question.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              10. Dispute Resolution
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these terms or use of our services shall
              be resolved through good faith negotiations. If negotiations fail,
              disputes will be resolved through arbitration in accordance with
              Nigerian law.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              11. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account immediately, without
              prior notice, for any reason including breach of these Terms. Upon
              termination, your right to use the service will immediately cease.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes by posting the new Terms of
              Service on this page and updating the &quot;Last Updated&quot;
              date. Continued use of the service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              13. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of Nigeria, without regard to its conflict of law
              provisions.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              14. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these Terms of Service, please{" "}
              <Link
                href="/contact"
                className="text-[#90AC19] hover:underlinen font-bold"
              >
                <span>contact us</span>
              </Link>
              .
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block bg-[#90AC19] hover:bg-[#7A9216] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
