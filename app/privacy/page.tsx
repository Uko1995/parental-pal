import { Metadata } from "next";
import Link from "next/link";
import { generateMetadata } from "../../lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Privacy Policy - How We Protect Your Data",
  description:
    "Read ParentalPal's privacy policy to understand how we collect, use, and protect your personal information. Your privacy and data security are our top priorities.",
  path: "/privacy",
  noIndex: false,
});

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-base-100 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last Updated: November 3, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to ParentalPal. We respect your privacy and are committed
              to protecting your personal data. This privacy policy will inform
              you about how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials (username and password)</li>
                  <li>Address and location information</li>
                  <li>Child&apos;s information (name, age, academic level)</li>
                  <li>
                    Payment information (processed securely through Paystack)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>IP address and browser information</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To provide and maintain our services</li>
              <li>To process bookings and payments</li>
              <li>To send booking confirmations and updates</li>
              <li>To communicate with you about our services</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
              <li>To detect and prevent fraud</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              4. Information Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Service Providers:</strong> Tutors and childcare
                providers to fulfill your bookings
              </li>
              <li>
                <strong>Payment Processors:</strong> Paystack for secure payment
                processing
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger,
                acquisition, or sale of assets
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal data. However, no method of
              transmission over the internet is 100% secure. We use encryption,
              secure servers, and regular security audits to protect your
              information.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              6. Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at{" "}
              <a
                href="mailto:privacy@parentalpal.com"
                className="text-[#90AC19] hover:underline"
              >
                admin@parentalpal.org
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              7. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity
              on our website and store certain information. You can instruct
              your browser to refuse all cookies or indicate when a cookie is
              being sent. For more information, see our{" "}
              <Link
                href="/cookie-policy"
                className="text-[#90AC19] hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are provided to parents and guardians for their
              children. We do not knowingly collect personal information
              directly from children under 13 without parental consent. Parents
              provide information about their children as part of the booking
              process.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              9. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data for as long as necessary to provide
              our services and comply with legal obligations. When you close
              your account, we will delete or anonymize your data unless we are
              required to retain it by law.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              10. International Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and maintained on computers
              located outside of your country where data protection laws may
              differ. We take appropriate safeguards to ensure your data is
              protected.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page and updating the &quot;Last Updated&quot; date. You are
              advised to review this privacy policy periodically for any
              changes.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this privacy policy, please
              contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@parentalpal.com"
                  className="text-[#90AC19] hover:underline"
                >
                  privacy@parentalpal.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Address:</strong> ParentalPal Nigeria
              </p>
            </div>
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
