"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import { useRef, useState } from "react";
import SaveSlotModal from "@/components/SaveSlotModal";
import {
  PaintBrushIcon,
  CpuChipIcon,
  MusicalNoteIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PhoneIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  LightBulbIcon,
  GiftIcon,
  QuestionMarkCircleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerParent: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

function AnimateOnScroll({
  children,
  variants = fadeInUp,
}: {
  children: React.ReactNode;
  variants?: Variants;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
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

const tracks = [
  {
    title: "Fine Art",
    time: "10am – 1pm",
    icon: PaintBrushIcon,
    color: "from-amber-500 to-orange-600",
    programs: [
      {
        name: "Budding Artist Course",
        ages: "5–15",
        price: "₦65,000/month",
        points: [
          "Drawing",
          "Painting",
          "Craft",
          "3D Construction",
          "End-of-term Exhibition",
        ],
      },
      {
        name: "Arts & Crafts for Toddlers",
        ages: "2–5",
        price: "₦55,000/month",
        points: [
          "Painting",
          "Craft",
          "Drawing",
          "Child-friendly DIY",
          "Mini showcase for parents",
        ],
      },
    ],
  },
  {
    title: "STEM",
    time: "1pm – 2pm",
    icon: CpuChipIcon,
    color: "from-blue-500 to-indigo-600",
    programs: [
      {
        name: "Intermediate Tech Class",
        ages: "7–15",
        price: "₦60,000/month",
        points: [
          "Coding",
          "Web Development",
          "Robotics foundations",
          "Tech games",
          "3D construction",
        ],
        note: "Laptop required",
      },
      {
        name: "Chess, Puzzles & Scratch",
        ages: "4–6",
        price: "₦40,000/month",
        points: [
          "Thinking, reasoning, memory",
          "Problem-solving through logic-based games",
        ],
      },
    ],
  },
  {
    title: "Performing Arts",
    time: "2pm – 4pm",
    icon: MusicalNoteIcon,
    color: "from-violet-500 to-purple-600",
    programs: [
      {
        name: "Dance & Drama",
        ages: "7–15",
        price: "₦50,000/month",
        points: [
          "Drama",
          "Stage confidence",
          "Expression",
          "Performance etiquette",
          "End-of-term production showcase",
        ],
      },
      {
        name: "Ballet & Contemporary Dance",
        ages: "2–6",
        price: "₦40,000/month",
        points: [
          "Confidence",
          "Body coordination",
          "Rhythm",
          "Flexibility",
          "Posture",
        ],
      },
    ],
  },
];

const benefits = [
  {
    title: "Creative Skill Development",
    desc: "Real artistic techniques; imagination and expression.",
    Icon: PaintBrushIcon,
  },
  {
    title: "Tech Skills for the Future",
    desc: "Coding, web dev, STEM foundations.",
    Icon: CpuChipIcon,
  },
  {
    title: "Stronger Cognitive Abilities",
    desc: "Chess, puzzles, STEAM; thinking, logic, memory.",
    Icon: LightBulbIcon,
  },
  {
    title: "Confidence & Social Development",
    desc: "Drama and dance; communication, charisma, emotional intelligence.",
    Icon: UserGroupIcon,
  },
  {
    title: "Screen-Free Weekend Productivity",
    desc: "Structured, fun learning—not gadgets.",
    Icon: AcademicCapIcon,
  },
  {
    title: "Professional Instructors",
    desc: "Trained educators, artists, tech specialists.",
    Icon: ShieldCheckIcon,
  },
  {
    title: "Safe & Supportive Environment",
    desc: "ParentalPal Hub secure, child-friendly, purpose-built.",
    Icon: ShieldCheckIcon,
  },
];

const comparison = [
  { feature: "Structured curriculum", us: true, them: false },
  { feature: "Qualified instructors", us: true, them: false },
  {
    feature: "Multi-skill exposure (Art + STEM + Performing Arts)",
    us: true,
    them: false,
  },
  { feature: "End-of-term exhibition", us: true, them: false },
  { feature: "Safe learning environment", us: true, them: false },
  { feature: "Parent feedback system", us: true, them: false },
];

const testimonials = [
  {
    quote: "My daughter became more confident on stage!",
    text: "She used to be shy, but the dance and drama classes changed everything. She can now speak and perform boldly.",
    author: "Mrs. Chioma",
    rating: 5,
  },
  {
    quote: "I love how structured it is.",
    text: "The STEM class is worth every naira. My son now codes simple games!",
    author: "Mr. Fatai",
    rating: 5,
  },
  {
    quote: "The environment is safe, colourful, and engaging.",
    text: "My toddlers enjoy the art class so much. They look forward to Saturdays.",
    author: "Mrs. Bisi",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Is it safe?",
    a: "Yes. ParentalPal Hub is secure, child-friendly, and supervised by trained staff.",
  },
  {
    q: "Will my child enjoy it?",
    a: "Absolutely. Every class is hands-on, fun, and interactive.",
  },
  {
    q: "Is it worth the price?",
    a: "Yes. Structured, skill-building program with professional instructors and real results.",
  },
  {
    q: "Can I choose only one class?",
    a: "Yes. You can enroll your child in any single track.",
  },
  {
    q: "What if my child is shy?",
    a: "Our facilitators are trained to help children open up comfortably and gradually.",
  },
];

// bg-linear-to-br from-[#90AC19]/20 via-[#bde022]/10 to-[#E8931A]/20
export default function WeekendEnrichmentPage() {
  const [saveSlotOpen, setSaveSlotOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[url('/pic1.webp')] bg-cover bg-center   py-20 md:py-28">
        <div className="absolute inset-0 bg-black/60" />
        {/* <div className="absolute right-0 top-0 h-full w-1/2 max-w-xl bg-linear-to-l from-white/40 to-transparent" /> */}
        <div className="relative z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl md:text-5xl">
              Give Your Child a Creative, Smart & Confidence-Boosting Weekend
              Experience
            </h1>
            <p className="mt-4 text-lg font-bold text-gray-100 sm:text-xl">
              Fine Art · STEM · Performing Arts
            </p>
            <p className="mt-2 text-lg font-bold text-[#90AC19]">
              For Ages 2–15 · Starts 7th February · Saturdays Only
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-base text-gray-600">
              <span className="inline-flex items-center font-bold text-gray-100 gap-1.5">
                <PaintBrushIcon className="h-5 w-5 text-amber-600" /> Creativity
              </span>
              <span className="inline-flex items-center font-bold text-gray-100 gap-1.5">
                <CpuChipIcon className="h-5 w-5 text-blue-600" /> Tech Skills
              </span>
              <span className="inline-flex items-center font-bold text-gray-100 gap-1.5">
                <UserGroupIcon className="h-5 w-5 text-violet-600" /> Confidence
              </span>
              <span className="inline-flex items-center font-bold text-gray-100 gap-1.5">
                <LightBulbIcon className="h-5 w-5 text-[#90AC19]" /> Critical
                Thinking
              </span>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/weekend-enrichment/enroll"
                className="inline-flex items-center rounded-lg bg-[#90AC19] px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#7A9216] hover:shadow-xl"
              >
                Get Started
              </Link>
              <button
                type="button"
                onClick={() => setSaveSlotOpen(true)}
                className="inline-flex items-center rounded-lg border-2 border-gray-800 bg-gray-800 px-6 py-3.5 text-base font-bold text-white transition hover:bg-gray-700"
              >
                Save My Child&apos;s Slot
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emotional hook */}
      <section className="bg-linear-to-b flex flex-col lg:flex-row items-center gap-5 justify-center from-white to-[#90AC19]/5 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
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
                That is exactly what the ParentalPal Weekend Enrichment Session
                is designed for: a wholesome, premium, fun-filled learning
                experience that makes parents proud and keeps children excited
                every Saturday.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
        <Image
          src="/pic2.webp"
          alt="ParentalPal Weekend Enrichment"
          width={1000}
          height={1000}
          className="object-contain w-full lg:w-3/5 rounded-xl"
          sizes="(max-width: 1024px) 70vw, 30vw"
        />
      </section>

      {/* Program overview — 3 tracks */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
              3 Enrichment Tracks — One Powerful Weekend Experience
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
              Your child benefits from a structured, hands-on Saturday designed
              by certified instructors and education specialists.
            </p>
          </AnimateOnScroll>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerParent}
            className="mt-12 grid gap-8 md:grid-cols-3"
          >
            {tracks.map((track) => (
              <motion.div
                key={track.title}
                variants={fadeInUp}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition hover:shadow-xl"
              >
                <div
                  className={`bg-linear-to-r ${track.color} px-6 py-4 text-white`}
                >
                  <track.icon className="h-8 w-8" />
                  <h3 className="mt-2 text-xl font-bold">{track.title}</h3>
                  <p className="text-sm opacity-90">{track.time}</p>
                </div>
                <div className="space-y-6 p-6">
                  {track.programs.map((prog) => (
                    <div key={prog.name}>
                      <h4 className="font-semibold text-gray-900">
                        {prog.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Ages {prog.ages} · {prog.price}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {prog.points.map((p) => (
                          <li key={p} className="flex items-start gap-2">
                            <CheckIcon className="h-4 w-4 shrink-0 mt-0.5 text-[#90AC19]" />
                            {p}
                          </li>
                        ))}
                      </ul>
                      {prog.note && (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          {prog.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-[#90AC19]/5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <AnimateOnScroll>
              <div className="relative h-64 overflow-hidden rounded-2xl md:h-80">
                <Image
                  src="/kid.webp"
                  alt="Children at Weekend Enrichment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Who This Program Is Perfect For
              </h2>
              <p className="mt-4 text-gray-700">
                Parents who want their child to:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Spend weekends meaningfully",
                  "Become more confident, expressive, and creative",
                  "Develop strong cognitive and problem-solving skills",
                  "Reduce screen time",
                  "Improve communication and social skills",
                  "Build talent early",
                  "Enjoy a safe, fun, enriching environment",
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
              <p className="mt-6 text-gray-600">
                Designed for toddlers, primary school children, and teens (ages
                2–15).
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Program benefits */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
              Why Families Choose Weekend Enrichment
            </h2>
          </AnimateOnScroll>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerParent}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {benefits.map((b, i) => {
              const Icon = b.Icon;
              const benefitBgColors = [
                "bg-[#90AC19]/10 border-[#90AC19]/20",
                "bg-[#E8931A]/10 border-[#E8931A]/20",
                "bg-blue-100/80 border-blue-200",
                "bg-violet-100/80 border-violet-200",
                "bg-amber-100/80 border-amber-200",
                "bg-emerald-100/80 border-emerald-200",
                "bg-rose-100/80 border-rose-200",
              ];
              const iconBgColors = [
                "bg-[#90AC19]/20 text-[#90AC19]",
                "bg-[#E8931A]/20 text-[#E8931A]",
                "bg-blue-200/80 text-blue-700",
                "bg-violet-200/80 text-violet-700",
                "bg-amber-200/80 text-amber-700",
                "bg-emerald-200/80 text-emerald-700",
                "bg-rose-200/80 text-rose-700",
              ];
              const cardStyle = benefitBgColors[i % benefitBgColors.length];
              const iconStyle = iconBgColors[i % iconBgColors.length];
              return (
                <AnimateOnScroll key={b.title}>
                  <div
                    className={`flex gap-4 rounded-xl border p-6 transition hover:shadow-md ${cardStyle}`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {i + 1}. {b.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{b.desc}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-gray-200 bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
              Why Choose ParentalPal Over Regular Weekend Classes?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div className="mt-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Feature
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#90AC19]">
                      ParentalPal Weekend Enrichment
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                      Regular Classes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparison.map((row) => (
                    <tr key={row.feature} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.us ? (
                          <CheckIcon className="mx-auto h-6 w-6 text-[#90AC19]" />
                        ) : (
                          <XMarkIcon className="mx-auto h-6 w-6 text-gray-300" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.them ? (
                          <CheckIcon className="mx-auto h-6 w-6 text-gray-400" />
                        ) : (
                          <XMarkIcon className="mx-auto h-6 w-6 text-red-300" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
          <p className="mt-8 text-center text-lg text-gray-700">
            ParentalPal is designed to help your child grow, express, create,
            and thrive.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
              What Parents Are Saying
            </h2>
          </AnimateOnScroll>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <AnimateOnScroll key={t.author}>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 shadow-sm">
                  <div className="flex gap-1 text-[#E8931A]">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <StarSolidIcon key={i} className="h-5 w-5" />
                    ))}
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900">
                    &ldquo;{t.quote}&rdquo;
                  </h3>
                  <p className="mt-2 text-gray-600">{t.text}</p>
                  <p className="mt-4 text-sm font-medium text-gray-500">
                    — {t.author}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-[#90AC19]/5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
              <QuestionMarkCircleIcon className="h-8 w-8 text-[#90AC19]" />
              Common Questions
            </h2>
          </AnimateOnScroll>
          <ul className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <AnimateOnScroll key={faq.q}>
                <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900">{faq.q}</h4>
                  <p className="mt-2 text-gray-600">{faq.a}</p>
                </li>
              </AnimateOnScroll>
            ))}
          </ul>
        </div>
      </section>

      {/* Enrollment steps */}
      <section className="bg-white py-16 md:py-24 flex sm:flex-col md:flex-row items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="flex items-start justify-start gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
              How to Register
            </h2>
          </AnimateOnScroll>
          <ol className="mx-auto mt-10 max-w-md space-y-4 text-left">
            {[
              "Click the button below",
              "Fill in your details",
              "Our team contacts you for confirmation",
              "Your child starts this Saturday",
            ].map((step, i) => (
              <AnimateOnScroll key={step}>
                <li className="flex items-center justify-start gap-3 text-lg text-gray-700">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#90AC19] text-white font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              </AnimateOnScroll>
            ))}
          </ol>
          <div className="mt-10 flex justify-start">
            <Link
              href="/weekend-enrichment/enroll"
              className="inline-flex items-center rounded-lg bg-[#90AC19] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#7A9216]"
            >
              Get Started
            </Link>
          </div>
        </div>
        <Image
          src="/pic3.jpg"
          alt="ParentalPal Weekend Enrichment"
          width={1000}
          height={1000}
          className="object-contain w-1/2 rounded-xl hidden sm:block"
          sizes="(max-width: 600px) 100vw, 50vw"
          priority
        />
      </section>

      {/* Bonus */}
      <section className="relative overflow-hidden bg-[url('/pic4.jpg')] bg-cover bg-center py-16">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-50 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-left">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 text-lg font-bold rounded-full bg-[#90AC19]/20 px-4 py-2  text-[#90AC19]">
              <GiftIcon className="h-5 w-5" />
              FREE: Welcome Pack for Every Child
            </div>
          </AnimateOnScroll>
          <ul className="mt-6 space-y-2 text-gray-100 text-base font-bold">
            {[
              "Creativity Starter Kit",
              "Progress Tracker",
              "End-of-term exhibition participation",
              "Certificate of Participation",
            ].map((item) => (
              <li key={item} className="flex items-center justify-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#90AC19]" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base text-gray-100">
            Limited to early registrants.
          </p>
        </div>
      </section>

      {/* Reassurance */}
      <section className="bg-gray-50 py-16 flex sm:flex-col md:flex-row items-center justify-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#90AC19]/20">
              <ShieldCheckIcon className="h-8 w-8 text-[#90AC19]" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Your child is in safe hands
            </h2>
            <p className="mt-4 text-gray-800">At ParentalPal, we maintain:</p>
            <ul className="mt-4 space-y-2 text-gray-700 text-left">
              {[
                "Safe learning spaces",
                "Verified instructors",
                "Clean, child-friendly environment",
                "Continuous parent feedback",
                "Structured curriculum",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-start gap-2"
                >
                  <CheckCircleIcon className="h-5 w-5 text-[#90AC19]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-medium text-gray-900">
              Your child&apos;s growth, confidence, and creativity are our top
              priority.
            </p>
          </AnimateOnScroll>
        </div>
        {/* Location & contact */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              Location & Details
            </h2>
          </AnimateOnScroll>
          <div className="mt-10 flex flex-col justify-center gap-x-12 gap-y-6 text-gray-700">
            <span className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-[#90AC19]" />
              ParentalPal Hub, 12 Fola Jinadu Crescent, Gbagada Phase 1
            </span>
            <span className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-[#90AC19]" />
              Saturdays · Starts 7th February · Ages 2–15
            </span>
            <a
              href="tel:08065394795"
              className="flex items-center gap-2 font-medium text-[#90AC19] hover:underline"
            >
              <PhoneIcon className="h-5 w-5" />
              Call / WhatsApp: 08065394795
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#90AC19] py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Give your child a fun, creative, and educational Saturday every week
          </h2>
          <p className="mt-2 text-white/90">
            Slots are limited (due to facilitator–child ratio).
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/weekend-enrichment/enroll"
              className="inline-flex items-center rounded-lg bg-white px-6 py-3.5 font-bold text-[#90AC19] shadow-lg transition hover:bg-gray-100"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setSaveSlotOpen(true)}
              className="inline-flex items-center rounded-lg border-2 border-white px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              Save a Slot for My Child
            </button>
          </div>
        </div>
      </section>

      <SaveSlotModal
        open={saveSlotOpen}
        onClose={() => setSaveSlotOpen(false)}
      />
    </div>
  );
}
