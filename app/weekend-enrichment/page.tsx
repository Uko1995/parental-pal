"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";
import {
  CheckCircleIcon,
  SparklesIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimateOnScroll({
  children,
  variants,
}: {
  children: ReactNode;
  variants: Variants;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export default function WeekendEnrichmentPage() {
  const tracks = [
    {
      title: "Fine Art",
      desc: "Painting, drawing, sculpture basics, and creative expression that builds confidence.",
      highlights: [
        "Art foundations & guided projects",
        "Texture, color, and storytelling",
        "Show-and-tell and gallery moments",
      ],
      color: "#90AC19",
    },
    {
      title: "STEM",
      desc: "Hands-on experiments and playful problem-solving that turns curiosity into skills.",
      highlights: [
        "Simple experiments (safe materials)",
        "Math thinking through games",
        "Build, test, and learn together",
      ],
      color: "#E8931A",
    },
    {
      title: "Performing Arts",
      desc: "Dance, drama, and music activities that support communication and emotional intelligence.",
      highlights: [
        "Stage confidence & performance basics",
        "Movement, rhythm, and teamwork",
        "Positive expression and creativity",
      ],
      color: "#A25F97",
    },
  ] as const;

  const testimonials = [
    {
      quote:
        "My child looks forward to Saturdays. The activities are structured but still fun, and you can see confidence grow week by week.",
      name: "Parent, Lagos",
    },
    {
      quote:
        "Finally, a program that feels premium and safe. The kids are learning while enjoying themselves.",
      name: "Parent, Abuja",
    },
    {
      quote:
        "The Fine Art sessions helped my kid develop patience and focus. We loved the gallery moment at the end.",
      name: "Parent, Port Harcourt",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/greenBG.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">
              <SparklesIcon className="w-4 h-4" />
              Weekend Enrichment for curious kids
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              A premium, joyful way for children to learn every weekend.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed">
              Structured activities across Art, STEM, and Performing Arts—designed to build confidence, creativity, and real-world skills.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/weekend-enrichment/enroll"
                className="rounded-xl bg-[#90AC19] hover:bg-[#7A9216] text-white px-6 py-3 font-bold text-center transition-colors"
              >
                Register Now
              </Link>
              <Link
                href="/services#weekend-enrichment"
                className="rounded-xl bg-white/10 border border-white/30 hover:bg-white/15 text-white px-6 py-3 font-bold text-center transition-colors"
              >
                Learn more
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emotional hook */}
      <section className="bg-linear-to-b flex flex-col lg:flex-row items-center gap-5 justify-center from-white to-[#90AC19]/5 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variants={slideInLeft}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Your child deserves more than cartoons, noise, and boredom every
                weekend…
              </h2>
              <p className="mt-6 text-lg text-gray-700">
                Every Saturday can be a powerful opportunity for:
              </p>
              <ul className="mt-4 space-y-2 text-left">
                {[
                  "Building real-life skills",
                  "Growing confidence",
                  "Exploring creativity",
                  "Developing cognitive abilities",
                  "Learning through fun, movement, art, and technology",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <CheckCircleIcon className="h-6 w-6 shrink-0 text-[#90AC19]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-lg text-gray-700">
                A wholesome, premium, fun-filled learning experience that makes
                parents proud and keeps children excited every Saturday.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
        <div className="w-full flex justify-center lg:justify-start lg:pl-6">
          <Image
            src="/pic2.webp"
            alt="ParentalPal Weekend Enrichment"
            width={1000}
            height={1000}
            className="object-contain w-full lg:w-3/5 rounded-xl"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
      </section>

      {/* Program overview */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Three Tracks. One Amazing Weekend.
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Choose what matches your child’s energy and curiosity. Each track includes structured activities and playful learning.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {tracks.map((track, idx) => (
              <AnimateOnScroll
                key={track.title}
                variants={idx % 2 === 0 ? slideInLeft : slideInRight}
              >
                <div className="bg-white rounded-2xl p-7 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="text-[#90AC19] text-sm font-semibold tracking-wide">
                    Track {idx + 1}
                  </div>
                  <h3 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900">
                    {track.title}
                  </h3>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    {track.desc}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {track.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#90AC19]/10 text-[#90AC19]">
                          <CheckCircleIcon className="h-4 w-4" />
                        </span>
                        <span className="text-sm text-gray-700">{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href="/weekend-enrichment/enroll"
                      className="inline-flex items-center justify-center w-full rounded-xl bg-[#90AC19] hover:bg-[#7A9216] text-white px-5 py-3 font-bold transition-colors"
                    >
                      Enroll
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Who This Is For
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Parents who want their children to learn through engaging, safe, and premium experiences.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "Kids who love creative activities",
              "Kids who enjoy solving problems",
              "Kids who like performing and team play",
            ].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <StarIcon className="w-5 h-5 text-[#E8931A]" />
                  <p className="font-semibold text-gray-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Parents Love Weekend Enrichment
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Hear from families who saw confidence and curiosity grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <AnimateOnScroll key={t.name} variants={scaleIn}>
                <div className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
                  <div className="flex items-center gap-2 text-[#E8931A]">
                    <StarIcon className="w-5 h-5" />
                    <StarIcon className="w-5 h-5" />
                    <StarIcon className="w-5 h-5" />
                  </div>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="mt-6 text-sm font-semibold text-gray-900">
                    {t.name}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Quick answers to help you feel confident about enrolling.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                q: "What time is the program?",
                a: "Sessions run on Saturdays. Choose the track that best fits your child’s interests.",
              },
              {
                q: "Is the program safe for kids?",
                a: "Yes. We use structured activities and a supervised learning approach focused on safety and engagement.",
              },
              {
                q: "Can I switch tracks later?",
                a: "You can request adjustments before a new term begins. If availability allows, we’ll help you switch.",
              },
              {
                q: "How do I enroll?",
                a: "Register on the enrollment page, choose your children and track, then complete the payment/confirmation steps.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group bg-white rounded-2xl p-6 border border-gray-100"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-bold text-gray-900">{item.q}</span>
                  <QuestionMarkCircleIcon className="w-5 h-5 text-[#90AC19]" />
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment steps */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Enroll in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Fill out the form",
                body: "Add parent and child details, pick your track, and select the Saturday sessions.",
              },
              {
                step: "2",
                title: "Confirm your choices",
                body: "Review the total and make sure everything looks right before proceeding.",
              },
              {
                step: "3",
                title: "Complete payment",
                body: "Finish checkout and we’ll confirm your child’s enrollment.",
              },
            ].map((s) => (
              <AnimateOnScroll key={s.step} variants={fadeInUp}>
                <div className="rounded-2xl p-7 border border-gray-100 shadow-sm">
                  <div className="text-[#90AC19] font-extrabold text-4xl">
                    {s.step}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/weekend-enrichment/enroll"
              className="inline-flex items-center justify-center rounded-xl bg-[#90AC19] hover:bg-[#7A9216] text-white px-7 py-3 font-bold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Bonus / reassurance */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <AnimateOnScroll variants={slideInLeft}>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                A Weekend That Feels Like Growth
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Your child gets hands-on learning, guided activities, and a supportive environment where they can build confidence naturally.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Structured, supervised sessions",
                  "Engaging activities across tracks",
                  "Confidence-building learning outcomes",
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-[#90AC19] shrink-0" />
                    <p className="text-gray-700 font-medium">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variants={slideInRight}>
            <div className="rounded-2xl bg-white border border-gray-100 p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-6 h-6 text-[#E8931A]" />
                <h3 className="text-xl font-bold text-gray-900">Location & Contact</h3>
              </div>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Register to get the exact weekend session location details for your chosen track.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-[#90AC19]" />
                  <span className="text-gray-800 font-semibold">
                    +234 806 539 4795
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Prefer email? Contact us from the services page.
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 px-5 py-3 font-bold transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}

