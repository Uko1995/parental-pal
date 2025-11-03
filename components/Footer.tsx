import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "Childcare Services", href: "/services" },
      { name: "Home Schooling", href: "/services" },
      { name: "Academic Tutoring", href: "/services" },
      { name: "Space Rentals", href: "/services" },
      { name: "Kiddies Parties", href: "/services" },
      { name: "Kiddies Enrichment Sessions", href: "/services" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Tutors", href: "/tutors" },

      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
    ],
    resources: [{ name: "FAQ", href: "/faq" }],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "terms" },
      { name: "Cookie Policy", href: "/cookie-policy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold text-[#90AC19] mb-4 block"
            >
              PARENTALPAL
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Your trusted partner for comprehensive childcare solutions.
              Connecting families with quality care, education, and community
              resources.
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com/company/parentalpal"
                target="_blank"
                rel="noreferrer noopener"
                className="text-gray-400 hover:text-blue-700 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/parentalpal"
                target="_blank"
                rel="noreferrer noopener"
                className="text-gray-400 hover:text-pink-600 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm8.5 1.5A4.25 4.25 0 0 1 20.5 7.75v8.5a4.25 4.25 0 0 1-4.25 4.25h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5h8.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm5.25-.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" />
                </svg>
              </a>
              <a
                href="https://x.com/parentalpal"
                target="_blank"
                rel="noreferrer noopener"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26L22 21.75h-5.938l-4.657-6.092L6.03 21.75H2.722l7.73-8.839L2 2.25h6.062l4.217 5.676L18.244 2.25zM17.22 19.845h1.833L7.005 4.05H5.04l12.18 15.795z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/parentalpal"
                target="_blank"
                rel="noreferrer noopener"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v2h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#90AC19]">
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, _id) => (
                <li key={_id}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#90AC19]">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#90AC19]">
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-gray-400 text-sm">
              © {currentYear} PARENTALPAL. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
