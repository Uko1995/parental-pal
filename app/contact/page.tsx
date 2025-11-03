import { Metadata } from "next";
import Contact from "@/components/Contact";
import { generateMetadata } from "../../lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Contact Us - Get in Touch with ParentalPal",
  description:
    "Have questions about our childcare services? Contact ParentalPal today. We're here to help you find the perfect tutor, camp, or enrichment program for your child.",
  path: "/contact",
});

export default function Page() {
  return <Contact />;
}
