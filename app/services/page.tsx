import { Metadata } from "next";
import Services from "./Services";
import { generateMetadata as genMeta } from "../../lib/metadata";

export const metadata: Metadata = genMeta({
  title: "Our Services - Tutoring, Childcare & Holiday Camps",
  description:
    "Explore our childcare and learning services: professional tutoring, daily childcare, holiday camps, Kiddies Hub (creche, preschool, grade school & afterschool), and kiddies enrichment. Book trusted services today.",
  path: "/services",
  keywords: [
    "tutoring services",
    "childcare services",
    "holiday camps Nigeria",
    "Alive in me Camp",
    "Kiddies Hub",
    "creche Lagos",
    "preschool Gbagada",
    "afterschool care",
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
