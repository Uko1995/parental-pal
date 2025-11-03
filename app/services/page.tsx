import { Metadata } from "next";
import Services from "./Services";
import { generateMetadata as genMeta } from "../../lib/metadata";

export const metadata: Metadata = genMeta({
  title: "Our Services - Tutoring, Childcare & Holiday Camps",
  description:
    "Explore our comprehensive childcare services: professional tutoring, daily childcare, holiday camps, homeschooling support, and kiddies enrichment programs. Book trusted services today.",
  path: "/services",
  keywords: [
    "tutoring services",
    "childcare services",
    "holiday camps Nigeria",
    "homeschooling",
    "enrichment programs",
    "after school programs",
    "educational services",
    "professional tutors",
    "kids activities",
  ],
});

export default function Page() {
  return <Services />;
}
