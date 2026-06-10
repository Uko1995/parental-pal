"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  GraduationCap,
  Sparkle,
  WhatsappLogo,
  Clock,
  Users,
  CheckCircle,
  CaretDown,
  MusicNotes,
  Code,
  Pizza,
  Trophy,
  Star,
  RocketLaunch,
  Heart,
  Sun,
} from "@phosphor-icons/react";
import {
  CAMP_SEASONS,
  getCampBookingUrl,
  SUMMER_CAMP_RATES,
} from "@/lib/camp-seasons";

const season = CAMP_SEASONS["holidays-that-rock-2026"];
const bookingUrl = getCampBookingUrl("holidays-that-rock-2026");
const whatsappUrl = `https://wa.me/2347038024541?text=${encodeURIComponent(
  "Hello! I have a question about Holidays That Rock 2026.",
)}`;

const BRAND = {
  primary: "#90AC19",
  secondary: "#E8931A",
  accent: "#A25F97",
  cream: "#FFEACF",
} as const;

const marqueeItems = [
  "Ages 0 to 14 welcome",
  "Lekki and Gbagada campuses",
  "Coding, robotics and web dev",
  "Arts, sports and entrepreneurship",
  "Pizza excursion",
  "Trade fair August 28 to 29",
  "10% off 3 or more weeks",
  "Extended care until 5 PM included",
];

const highlights = [
  {
    title: "Pizza excursion",
    desc: "A fun outing the kids talk about all summer.",
    icon: Pizza,
    color: BRAND.secondary,
  },
  {
    title: "Trade fair",
    desc: "Showcase projects and celebrate wins with parents.",
    icon: Trophy,
    color: BRAND.primary,
  },
  {
    title: "Certificates and awards",
    desc: "Every child leaves proud of what they built.",
    icon: Star,
    color: BRAND.accent,
  },
  {
    title: "Indoor and outdoor learning",
    desc: "Structured days with movement, play and discovery.",
    icon: Sun,
    color: BRAND.secondary,
  },
];

const faqs = [
  {
    q: "What ages can attend?",
    a: "Children aged 0 to 14 are welcome. Programmes are tailored for ages 0 to 5 and 6 to 14.",
  },
  {
    q: "What are the camp hours?",
    a: "Core hours are 9:00 AM to 3:00 PM. Extended care until 5:00 PM is included at no extra charge.",
  },
  {
    q: "Is boarding available?",
    a: "Weekday boarding is available at Gbagada only, for children aged 6 to 14. Lekki is day camp only.",
  },
  {
    q: "How does pricing work?",
    a: "Gbagada: ₦40,000/week (ages 0 to 5) or ₦65,000/week (ages 6 to 14). Lekki: ₦100,000/week (all ages). Boarding add-on at Gbagada is ₦65,000/week. A 10% discount applies when you book 3 or more weeks.",
  },
  {
    q: "Are meals included?",
    a: "Meals are provided for boarding campers. Day campers should bring lunch unless otherwise advised.",
  },
  {
    q: "When is registration deadline?",
    a: "Registration closes July 10, 2026. Spaces are limited.",
  },
];

const youngProgram = [
  "Phonics and literacy",
  "Music and rhythm",
  "Arts and crafts",
  "Board games",
  "Basic STEM exploration",
  "Sensory play",
  "Outdoor play",
  "Social interaction",
];

const olderProgram = [
  "Dress and hair making",
  "Coding, robotics and web development",
  "Cooking and baking",
  "Acting, dancing and modeling",
  "Sports and self-defense",
  "Entrepreneurial thinking",
  "Team collaboration projects",
  "Confidence and leadership",
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

function AnimateOnScroll({
  children,
  variants = fadeInUp,
  className = "",
}: {
  children: ReactNode;
  variants?: Variants;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Countdown() {
  const deadline = new Date(`${season.registrationDeadline}T23:59:59`);
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Registration closed");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setRemaining(`${days}d ${hours}h ${mins}m left to register`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-secondary text-white font-bold text-sm shadow-lg htr-glow-pulse">
      <Clock className="w-4 h-4" weight="bold" />
      {remaining}
    </span>
  );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const accentStyles = [
    {
      border: "border-brand-primary",
      badge: "bg-brand-primary/15 text-brand-primary",
    },
    {
      border: "border-brand-secondary",
      badge: "bg-brand-secondary/15 text-brand-secondary",
    },
    {
      border: "border-brand-accent",
      badge: "bg-brand-accent/15 text-brand-accent",
    },
  ][index % 3];

  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
        open
          ? `${accentStyles.border} shadow-lg bg-white`
          : "border-gray-100 bg-white/80 hover:border-brand-primary/30 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-gray-900"
      >
        <span className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${accentStyles.badge}`}
          >
            {index + 1}
          </span>
          {q}
        </span>
        <CaretDown
          className={`w-5 h-5 shrink-0 text-brand-accent transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          weight="bold"
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 pl-16 text-gray-600 text-sm leading-relaxed"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 text-center backdrop-blur-md border border-white/20 shadow-xl"
      style={{ background: `${color}22` }}
    >
      <p className="text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
      <p className="text-xs sm:text-sm font-semibold text-white/85 mt-1">
        {label}
      </p>
    </div>
  );
}

export default function HolidaysThatRockContent() {
  return (
    <div className="min-h-screen bg-brand-cream overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] h-screen flex items-center overflow-hidden">
        <Image
          src="/camp.webp"
          alt="Children at Parental Pal holiday camp"
          fill
          priority
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-br from-brand-accent/80 via-black/70 to-brand-primary/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(232,147,26,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(144,172,25,0.4),transparent_45%)]" />

        {/* Floating shapes */}
        <div
          className="absolute top-24 right-[8%] w-24 h-24 rounded-full bg-brand-secondary/40 blur-sm htr-float hidden lg:block"
          aria-hidden
        />
        <div
          className="absolute bottom-32 left-[6%] w-16 h-16 rounded-2xl bg-brand-primary/50 rotate-12 htr-float-delayed hidden lg:block"
          aria-hidden
        />
        <div
          className="absolute top-1/3 left-[15%] w-10 h-10 rounded-full bg-brand-accent/60 htr-float hidden md:block"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            

            <Countdown />

            <h1
              className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05]"
              style={{
                fontFamily:
                  '"Jost", "Arial Black", "Segoe UI", sans-serif',
                textShadow: "0 4px 24px rgba(0,0,0,0.45)",
              }}
            >
              Holidays That{" "}
              <span className="htr-shimmer-text inline-block">Rock</span>
              <span className="text-brand-secondary"> 2026</span>
            </h1>

            <p className="mt-4 text-lg sm:text-2xl font-semibold text-white/95 max-w-2xl leading-relaxed">
              {season.tagline}
            </p>

            <p className="mt-4 text-white/90 font-bold flex flex-wrap items-center gap-2 text-base sm:text-lg">
              <Calendar className="w-5 h-5 text-brand-secondary" weight="fill" />
              {season.dateLabel}
              <span className="hidden sm:inline text-white/50">|</span>
              <MapPin className="w-5 h-5 text-brand-secondary" weight="fill" />
              Lekki and Gbagada
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={bookingUrl}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-primary text-white font-bold text-lg shadow-2xl hover:bg-[#7A9216] hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <RocketLaunch className="w-5 h-5 group-hover:rotate-12 transition-transform" weight="fill" />
                Register now
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/15 border-2 border-white/40 text-white font-bold text-lg backdrop-blur-sm hover:bg-white/25 hover:scale-[1.03] transition-all"
              >
                <WhatsappLogo className="w-5 h-5" weight="fill" />
                WhatsApp us
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl"
          >
            <StatPill label="Ages" value="0 to 14" color={BRAND.primary} />
            <StatPill label="Locations" value="2" color={BRAND.secondary} />
            <StatPill label="Weeks" value="6" color={BRAND.accent} />
            <StatPill label="Multi-week booking discount" value="10% off" color={BRAND.primary} />
          </motion.div>
        </div>
      </section>

      {/* Marquee ticker */}
      <div
        className="bg-brand-primary py-3 overflow-hidden border-y-4 border-brand-secondary"
        style={{ "--marquee-duration": "52s" } as CSSProperties}
      >
        <div className="moving-promo-marquee text-white font-bold text-sm sm:text-base">
          {[0, 1].map((track) => (
            <div key={track} className="flex items-center whitespace-nowrap gap-10 px-5">
              {marqueeItems.map((item) => (
                <span key={`${track}-${item}`} className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-brand-cream" weight="fill" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Emotional hook */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-brand-cream via-white to-brand-cream" />
        {/* <div className="absolute top-0 right-0 w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl" /> */}
        {/* <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" /> */}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                This summer, give your child an experience they will{" "}
                <span className="text-brand-primary">never forget</span>
              </h2>
              <p className="mt-6 text-lg text-gray-700 leading-relaxed">
                Six weeks of creativity, skills, friendships and hands-on
                learning — not another season stuck at home on screens.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variants={stagger} className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map(({ title, desc, icon: Icon, color }) => (
              <motion.div
                key={title}
                variants={scaleIn}
                className="group relative rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ background: color }}
                /> */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{  color: color }}
                >
                  <Icon className={`w-6 h-6`} weight="fill" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </AnimateOnScroll>
        </div>
      </section>

      {/* Photo strip */}
      <section className="py-4 bg-[#F5F5F5]">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2">
          {[
            { src: "/pic1.webp", alt: "Camp activities" },
            { src: "/kid.webp", alt: "Happy campers" },
            { src: "/pic2.webp", alt: "Learning together" },
            { src: "/people.webp", alt: "Group activities" },
            { src: "/Party.webp", alt: "Camp celebration" },
          ].map(({ src, alt }) => (
            <div
              key={src}
              className="relative shrink-0 w-64 sm:w-80 h-48 sm:h-56 rounded-2xl overflow-hidden snap-center ring-2 ring-brand-primary/40 hover:ring-brand-secondary transition-all hover:scale-[1.02]"
            >
              <Image src={src} alt={alt} fill className="object-cover" sizes="320px" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <p className="text-brand-secondary font-bold uppercase tracking-widest text-sm">
              Programmes by age
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
              What your child will{" "}
              <span className="text-brand-accent">learn and love</span>
            </h2>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: "Little explorers (0 to 5)",
                items: youngProgram,
                icon: MusicNotes,
                gradient: "from-brand-primary to-[#6B8212]",
                badge: "Early years",
              },
              {
                title: "Future makers (6 to 14)",
                items: olderProgram,
                icon: Code,
                gradient: "from-brand-accent to-[#7A4572]",
                badge: "Skills track",
              },
            ].map(({ title, items, icon: Icon, gradient, badge }) => (
              <AnimateOnScroll key={title} variants={scaleIn}>
                <div
                  className={`relative rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br ${gradient} p-[2px] hover:scale-[1.01] transition-transform`}
                >
                  <div className="rounded-[22px] bg-white p-8 h-full">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-brand-cream">
                          <Icon className="w-7 h-7 text-brand-primary" weight="fill" />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wide text-brand-secondary">
                            {badge}
                          </span>
                          <h3 className="text-xl font-extrabold text-gray-900">
                            {title}
                          </h3>
                        </div>
                      </div>
                      <GraduationCap
                        className="w-8 h-8 text-brand-accent/40"
                        weight="fill"
                      />
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-gray-700 text-sm font-medium"
                        >
                          <CheckCircle
                            className="w-5 h-5 text-brand-primary shrink-0 mt-0.5"
                            weight="fill"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Locations and pricing */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-brand-primary/5 via-brand-cream to-brand-accent/10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Choose your <span className="text-brand-primary">campus</span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Transparent pricing. Extended care until 5 PM and pick-up or
              drop-off included at no extra charge.
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimateOnScroll variants={scaleIn}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group hover:-translate-y-1 transition-transform">
                <div className="absolute inset-0 bg-linear-to-br from-brand-primary to-[#6B8212]" />
                <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6" weight="fill" />
                    <h3 className="text-2xl font-extrabold">Gbagada</h3>
                  </div>
                  <p className="text-white/85 text-sm mb-6">
                    Mainland campus. All ages 0 to 14. Optional weekday boarding
                    for ages 6 to 14.
                  </p>
                  <ul className="space-y-3">
                    {[
                      `Ages 0 to 5: ₦${SUMMER_CAMP_RATES.gbagadaYoungWeekly.toLocaleString()}/week`,
                      `Ages 6 to 14: ₦${SUMMER_CAMP_RATES.gbagadaOlderWeekly.toLocaleString()}/week`,
                      `Boarding add-on: ₦${SUMMER_CAMP_RATES.boardingWeekly.toLocaleString()}/week`,
                    ].map((line) => (
                      <li
                        key={line}
                        className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3 font-semibold text-sm backdrop-blur-sm"
                      >
                        <CheckCircle className="w-5 h-5 shrink-0" weight="fill" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variants={scaleIn}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group hover:-translate-y-1 transition-transform">
                <div className="absolute inset-0 bg-linear-to-br from-brand-accent to-[#7A4572]" />
                <div className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6" weight="fill" />
                    <h3 className="text-2xl font-extrabold">Lekki</h3>
                  </div>
                  <p className="text-white/85 text-sm mb-6">
                    All ages 0 to 14. Premium day camp only — no boarding.
                  </p>
                  <div className="bg-white/15 rounded-2xl px-6 py-8 backdrop-blur-sm text-center">
                    <p className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                      Flat rate all ages
                    </p>
                    <p className="mt-2 text-4xl font-extrabold">
                      ₦{SUMMER_CAMP_RATES.lekkiWeekly.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-white/85">per week</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll className="mt-10">
            <div className="rounded-2xl bg-brand-secondary/15 border-2 border-brand-secondary/30 p-6 text-center">
              <p className="text-brand-secondary font-extrabold text-lg">
                Book 3 or more weeks and receive 10% off your total
              </p>
              <p className="text-gray-700 text-sm mt-2">
                The more weeks you book, the more your child grows — and the more
                you save.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Showcase and safety */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8">
          <AnimateOnScroll variants={scaleIn}>
            <div className="relative rounded-3xl overflow-hidden min-h-[280px] flex items-end">
              <Image
                src="/Party.webp"
                alt="Camp showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-accent/95 via-brand-accent/60 to-transparent" />
              <div className="relative p-8 text-white">
                <h3 className="text-2xl font-extrabold">Showcase and trade fair</h3>
                <p className="mt-3 text-white/90 text-sm leading-relaxed">
                  {season.showcaseDates} — children present projects they built
                  during camp. Parents celebrate creativity, growth and
                  achievement. Certificates and awards for completed projects.
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variants={scaleIn}>
            <div className="rounded-3xl bg-brand-cream border-2 border-brand-primary/20 p-8 shadow-lg h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                
                <h3 className="text-2xl font-extrabold text-gray-900">
                  Safety first, always
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { text: "Age-appropriate supervision ratios", icon: Users },
                  { text: "Medical personnel on ground", icon: ShieldCheck },
                  { text: "Trained, vetted facilitators", icon: GraduationCap },
                  { text: "Structured activity monitoring", icon: CheckCircle },
                ].map(({ text, icon: Icon }) => (
                  <li
                    key={text}
                    className="flex items-center gap-3 text-gray-800 font-medium"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                      <Icon className="w-5 h-5 text-brand-primary" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-linear-to-b from-white to-brand-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AnimateOnScroll className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Questions? We have answers.
            </h2>
          </AnimateOnScroll>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AnimateOnScroll key={faq.q} variants={fadeInUp}>
                <FaqItem q={faq.q} a={faq.a} index={i} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 md:pb-20">
        <AnimateOnScroll variants={scaleIn}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent" />
            <div className="absolute inset-0 bg-[url('/greenBG.webp')] bg-cover bg-center opacity-20 mix-blend-overlay" />
            <div className="relative p-10 sm:p-14 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                Give your child a holiday that rocks
              </h2>
              <p className="mt-4 text-white/90 max-w-xl mx-auto text-lg">
                Spaces are limited. Register before {season.registrationDeadline}.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={bookingUrl}
                  className="inline-flex px-10 py-4 rounded-2xl bg-white text-brand-primary font-extrabold text-lg shadow-xl hover:scale-105 transition-transform"
                >
                  Register now
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white/15 border-2 border-white/40 font-bold text-lg hover:bg-white/25 transition-colors"
                >
                  <WhatsappLogo className="w-5 h-5" weight="fill" />
                  Ask a question
                </a>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white/95 border-t-2 border-brand-primary/20 backdrop-blur-md md:hidden z-30">
        <Link
          href={bookingUrl}
          className="block w-full text-center py-4 rounded-2xl bg-brand-primary text-white font-extrabold text-lg shadow-lg htr-glow-pulse"
        >
          Register now — limited spaces
        </Link>
      </div>

      {/* Floating WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-8 right-6 z-40 p-4 rounded-full bg-brand-primary text-white shadow-2xl hover:scale-110 transition-transform htr-glow-pulse"
        aria-label="Chat on WhatsApp"
      >
        <WhatsappLogo className="w-7 h-7" weight="fill" />
      </a>
    </div>
  );
}
