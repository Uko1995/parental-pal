import { Metadata } from "next";
import Link from "next/link";
import { generateMetadata } from "../../lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Cookie Policy - How We Use Cookies",
  description:
    "Learn about how ParentalPal uses cookies to improve your experience. Understand cookie types, purposes, and how to manage your cookie preferences.",
  path: "/cookie-policy",
  noIndex: false,
});

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-base-100 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600">Last Updated: November 3, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              1. What Are Cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device when
              you visit a website. They are widely used to make websites work
              more efficiently, provide information to website owners, and
              enhance your browsing experience.
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              2. Why We Use Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To remember your login information and preferences</li>
              <li>To analyze how visitors use our website</li>
              <li>To improve our services and user experience</li>
              <li>To provide personalized content and recommendations</li>
              <li>To ensure the security of our platform</li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              3. Types of Cookies We Use
            </h2>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-green-50 border-l-4 border-[#90AC19] p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Essential Cookies
                </h3>
                <p className="text-gray-700 mb-2">
                  <strong>Purpose:</strong> Required for the website to function
                  properly
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Examples:</strong> Authentication, session management,
                  security
                </p>
                <p className="text-gray-700">
                  <strong>Duration:</strong> Session or up to 30 days
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ These cookies cannot be disabled as they are necessary for
                  the platform to work.
                </p>
              </div>

              {/* Performance Cookies */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Performance & Analytics Cookies
                </h3>
                <p className="text-gray-700 mb-2">
                  <strong>Purpose:</strong> Help us understand how visitors use
                  our website
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Examples:</strong> Page views, time on site, click
                  tracking
                </p>
                <p className="text-gray-700">
                  <strong>Duration:</strong> Up to 2 years
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✓ These cookies can be disabled through your browser settings.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="bg-purple-50 border-l-4 border-[#A25F97] p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Functional Cookies
                </h3>
                <p className="text-gray-700 mb-2">
                  <strong>Purpose:</strong> Remember your preferences and
                  personalize your experience
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Examples:</strong> Language preferences, theme
                  settings, saved searches
                </p>
                <p className="text-gray-700">
                  <strong>Duration:</strong> Up to 1 year
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✓ These cookies can be disabled through your browser settings.
                </p>
              </div>
            </div>
          </section>

          {/* Specific Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              4. Specific Cookies We Use
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-[#90AC19]/10">
                    <th className="text-gray-800">Cookie Name</th>
                    <th className="text-gray-800">Purpose</th>
                    <th className="text-gray-800">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-sm">auth-token</td>
                    <td>User authentication</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">session-id</td>
                    <td>Session management</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">user-preferences</td>
                    <td>Save user settings</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">analytics-id</td>
                    <td>Website analytics</td>
                    <td>2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              5. Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the following third-party services that may set cookies:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Google Analytics
                </h3>
                <p className="text-gray-700 text-sm">
                  Helps us understand website traffic and user behavior.
                </p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#90AC19] hover:underline text-sm"
                >
                  View Google&apos;s Privacy Policy →
                </a>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Paystack</h3>
                <p className="text-gray-700 text-sm">
                  Processes payments securely and may set cookies for fraud
                  prevention.
                </p>
                <a
                  href="https://paystack.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#90AC19] hover:underline text-sm"
                >
                  View Paystack&apos;s Privacy Policy →
                </a>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              6. Managing Cookies
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Browser Settings
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Most browsers allow you to control cookies through their
                  settings. You can:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Block all cookies</li>
                  <li>Allow only first-party cookies</li>
                  <li>Delete cookies after each session</li>
                  <li>Make exceptions for trusted websites</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Important:</strong> Disabling essential cookies may
                  prevent you from using certain features of our website,
                  including logging in and making bookings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Browser-Specific Instructions
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#90AC19] hover:underline"
                  >
                    → Google Chrome Cookie Settings
                  </a>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#90AC19] hover:underline"
                  >
                    → Mozilla Firefox Cookie Settings
                  </a>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#90AC19] hover:underline"
                  >
                    → Safari Cookie Settings
                  </a>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#90AC19] hover:underline"
                  >
                    → Microsoft Edge Cookie Settings
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              7. Do Not Track Signals
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Some browsers have a &quot;Do Not Track&quot; feature that lets
              you tell websites you do not want to be tracked. We currently do
              not respond to Do Not Track signals, but you can control cookies
              through your browser settings as described above.
            </p>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              8. Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect
              changes in technology, legislation, or our business operations. We
              will post any changes on this page and update the &quot;Last
              Updated&quot; date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-[#90AC19] mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact
              us:
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
