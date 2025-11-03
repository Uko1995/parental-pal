import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parentalpal.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/services",
          "/booking",
          "/contact",
          "/blog",
          "/tutors",
          "/faq",
          "/privacy",
          "/terms",
          "/cookie-policy",
        ],
        disallow: ["/dashboard/*", "/api/*", "/profile/*", "/auth/*"],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/about",
          "/services",
          "/booking",
          "/contact",
          "/blog",
          "/tutors",
          "/faq",
        ],
        disallow: ["/dashboard/*", "/api/*", "/profile/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
