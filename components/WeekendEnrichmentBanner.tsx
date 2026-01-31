"use client";

import Link from "next/link";
import {
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WeekendEnrichmentBannerProps {
  /** When true, banner sits in page flow between sections; when false, absolute above hero */
  inline?: boolean;
}

export default function WeekendEnrichmentBanner({
  inline = false,
}: WeekendEnrichmentBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          role="banner"
          className={
            inline
              ? "relative z-10 flex w-full items-center justify-center overflow-hidden bg-cover bg-center px-4 py-5 text-white shadow-md"
              : "absolute left-0 right-0 top-16 z-10 flex items-center justify-center overflow-hidden bg-cover bg-center px-4 py-5 text-white shadow-md"
          }
          style={{
            backgroundImage: "url('/greenBG.webp')",
          }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{
            type: "tween",
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          {/* Marquee: scroll left infinitely */}
          <div className="relative z-10 w-full overflow-hidden pr-12">
            <Link href="/weekend-enrichment" className="block hover:underline">
              <div className="inline-flex w-max items-center py-1 text-lg font-semibold animate-marquee-banner animate-marquee-banner-hover ">
                <span className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <SparklesIcon className="h-5 w-5 text-white/90" />
                  Weekend Enrichment — Saturdays from 7th Feb.
                  <span className="inline-flex items-center gap-1 font-bold">
                    Register now
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </span>
              </div>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/3 z-20 -translate-y-1/2 rounded p-1 text-white/90 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Dismiss banner"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
