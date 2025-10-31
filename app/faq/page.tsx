"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "What services does ParentalPal offer?",
    answer: (
      <>
        ParentalPal connects parents with trusted tutors, childcare providers,
        holiday camps, playgroups, homeschooling resources, and children&apos;s
        events. We offer comprehensive booking forms, real-time pricing, and
        secure payment scheduling.
      </>
    ),
  },
  {
    question: "How do I book a service?",
    answer: (
      <>
        Simply visit the{" "}
        <Link href="/services" className="text-[#90AC19] underline">
          Services
        </Link>{" "}
        page, select your desired service, and fill out the booking form. You
        can view and manage your bookings from your profile dashboard.
      </>
    ),
  },
  {
    question: "What payment methods are accepted?",
    answer: (
      <>
        We accept secure online payments in NGN, USD, and EUR. Payment schedules
        and pricing are displayed in real-time during booking.
      </>
    ),
  },
  {
    question: "Is my data safe?",
    answer: (
      <>
        Yes, your data is securely stored in our database and backed up to
        Google Sheets. We use industry-standard security practices to protect
        your information.
      </>
    ),
  },
  {
    question: "How do I contact support?",
    answer: (
      <>
        You can reach our support team via the{" "}
        <Link href="/about" className="text-[#90AC19] underline">
          About
        </Link>{" "}
        page or by emailing us directly. We&apos;re here to help!
      </>
    ),
  },
];

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-6 h-6 transition-transform duration-300 ${
        open ? "rotate-180" : "rotate-0"
      } text-[#A25F97]`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#90AC19] mb-6">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={faq.question}
            className="bg-base-100 rounded-lg shadow border border-[#A25F97]/20"
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
              onClick={() => handleToggle(idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-answer-${idx}`}
              style={{
                fontWeight: 600,
                color: openIndex === idx ? "#A25F97" : "#171717",
              }}
            >
              <span className="text-lg text-left">{faq.question}</span>
              <ChevronDown open={openIndex === idx} />
            </button>
            <div
              id={`faq-answer-${idx}`}
              className={`overflow-hidden transition-all duration-300 px-5 ${
                openIndex === idx ? "max-h-40 py-2" : "max-h-0 py-0"
              }`}
              aria-hidden={openIndex !== idx}
            >
              <p className="text-base text-gray-700">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
