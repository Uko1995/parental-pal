import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import FeedbackPageContent from "./FeedbackPageContent";

export const metadata: Metadata = generateMetadata({
  title: "Parent Feedback and Interest - ParentalPal",
  description:
    "Share your family's childcare needs and interest in ParentalPal services. Help us plan better support for your community.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return <FeedbackPageContent />;
}
