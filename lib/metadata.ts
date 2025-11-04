import { Metadata } from "next";

// Site-wide SEO configuration
export const siteConfig = {
  name: "ParentalPal",
  title: "PARENTALPAL - Childcare Solutions Platform",
  description:
    "Connect with qualified tutors, holiday camps, playgroups, homeschooling resources, and children's events. Professional childcare booking platform in Nigeria.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://parentalpal.org",
  ogImage: `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://parentalpal.org"
  }/public/parentalpalLOGO.webp`,
  keywords: [
    "childcare",
    "tutoring",
    "holiday camps",
    "playgroups",
    "homeschooling",
    "children's events",
    "educational services",
    "Nigeria childcare",
    "professional tutors",
    "kids activities",
    "parenting",
    "child education",
    "after school programs",
    "enrichment programs",
    "kiddies parties",
  ],
  creator: "ParentalPal",
  authors: [{ name: "ParentalPal Team" }],
  publisher: "ParentalPal",
  category: "Education & Childcare",
  email: "admin@parentalpal.org",
  phone: "+234 806 539 4795",
  address: "Nigeria",
  social: {
    x: "https://x.com/parentalpal",
    facebook: "https://facebook.com/parentalpal",
    instagram: "https://instagram.com/parentalpal",
    linkedin: "https://linkedin.com/company/parentalpal",
  },
};

// Base metadata for all pages
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: siteConfig.category,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Childcare Solutions`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.x,
    creator: siteConfig.social.x,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  verification: {
    google: process.env.NEXT_GOOGLE_VERIFICATION,
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    // bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: "/icon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Generate metadata for specific pages
interface GenerateMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
}

export function generateMetadata(options: GenerateMetadataOptions): Metadata {
  const {
    title,
    description,
    path = "",
    image,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    keywords,
    noIndex = false,
  } = options;

  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description,
    keywords: keywords || siteConfig.keywords,
    authors: authors ? authors.map((name) => ({ name })) : siteConfig.authors,
    openGraph: {
      type,
      locale: "en_NG",
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.x,
      creator: siteConfig.social.x,
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: url,
    },
  };
}

// Structured data generators (JSON-LD)
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
      addressLocality: siteConfig.address,
    },
    sameAs: [
      siteConfig.social.x,
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
    ],
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": siteConfig.url,
    name: siteConfig.name,
    image: siteConfig.ogImage,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
      addressLocality: siteConfig.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      // Add your actual coordinates
      latitude: "6.5244",
      longitude: "3.3792",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    priceRange: "₦₦₦",
  };
}

export function generateServiceSchema(
  serviceName: string,
  description: string,
  price: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "NGN",
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(
  title: string,
  description: string,
  image: string,
  datePublished: string,
  dateModified: string,
  authorName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
  };
}

// Helper to generate JSON-LD script string for injection
// Usage: Add this to your page component's return statement
// Example: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateJsonLdScript(data) }} />
export function generateJsonLdScript(data: object): string {
  return JSON.stringify(data);
}
