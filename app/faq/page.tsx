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
        <Link href="/services" className="text-[#90AC19] underline hover:opacity-80">
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
        <Link href="/contact" className="text-[#90AC19] underline hover:opacity-80">
          Contact
        </Link>{" "}
        page or by emailing us directly. We&apos;re here to help!
      </>
    ),
  },
];

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-6 h-6 shrink-0 transition-transform duration-300 ${
        open ? "rotate-180 text-[#A25F97]" : "rotate-0 text-base-content/70"
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
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
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="bg-base-100 rounded-lg shadow border border-base-300"
            >
              <button
                type="button"
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold transition-colors ${
                  isOpen ? "text-[#A25F97]" : "text-base-content"
                }`}
                onClick={() => handleToggle(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
              >
                <span className="text-lg">{faq.question}</span>
                <ChevronDown open={isOpen} />
              </button>
              <div
                id={`faq-answer-${idx}`}
                className={`overflow-hidden transition-all duration-300 px-5 ${
                  isOpen ? "max-h-96 pb-4" : "max-h-0 py-0"
                }`}
                aria-hidden={!isOpen}
              >
                <div className="text-base text-base-content/80 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
