"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: "900" });

export default function Hero() {
  return (
    <section
      className="relative h-screen -mt-16 mb-10 overflow-hidden bg-[url('/gemini.webp')] bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ contentVisibility: "auto" }}
    >
      {/* Mobile: Content centered, CTAs at bottom */}
      {/* Desktop (md+): Content and CTAs together in the middle */}
      <div className="relative z-10 flex flex-col h-full px-4 sm:px-6 lg:px-8">
        {/* Content wrapper - centered on mobile, centered with CTAs on md+ */}
        <div className="flex-1 flex items-center justify-center md:justify-start">
          <div className="flex flex-col md:ml-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left md:text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl sm:text-2xl text-gray-800 font-extrabold"
              >
                Welcome to
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`relative text-6xl sm:text-8xl md:text-7xl lg:text-8xl md:tracking-wide font-extrabold ${jost.className}`}
                style={{
                  textShadow: `
                  -1px -1px 0 #000,
                  1px -1px 0 #000,
                  -1px 1px 0 #000,
                  1px 1px 0 #000,
                  0 1px 2px rgba(0, 0, 0, 0.6),
                  0 2px 2px rgba(0, 0, 0, 0.4)
                `,
                  color: "#bde022",
                  WebkitTextStroke: "1px ",
                  willChange: "transform, opacity",
                }}
              >
                ParentalPal
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="mt-2 md:mt-4 text-lg font-extrabold sm:text-xl max-w-md mx-auto md:mx-0"
                style={{
                  textShadow: `
                  -1px -1px 0 #bde022,
                  1px -1px 0 #bde022,
                  -1px 1px 0 #bde022,
                  1px 1px 0 #bde022,
                  0 2px 4px rgba(0, 0, 0, 0.6)
                `,
                  color: "#101828",
                  WebkitTextStroke: "0.5px rgba(0, 0, 0, 0.3)",
                  willChange: "opacity",
                }}
              >
                Your one-stop solution for all childcare needs.
              </motion.p>
            </motion.div>

            {/* CTA Buttons - hidden on mobile (shown at bottom), visible on md+ (with content) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-6 hidden md:block"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-0 justify-center md:justify-start">
                <Link href={"/services"} passHref>
                  <button className="bg-[#bde022] tracking-wide cursor-pointer hover:bg-[#7A9216] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold transition-colors duration-200 shadow-lg hover:shadow-xl text-2xl sm:text-lg w-full sm:w-auto active:scale-95">
                    Services
                  </button>
                </Link>
                <Link href={"/about"} passHref>
                  <button className="border-2 cursor-pointer border-gray-900 bg-gray-900 text-white hover:bg-gray-900/80 hover:border-gray-900/80 px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors duration-200 text-2xl sm:text-lg w-full sm:w-auto active:scale-95">
                    Learn more
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Buttons - at bottom on mobile only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="pb-8 md:hidden"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            <Link href={"/services"} passHref>
              <button className="bg-[#90AC19] tracking-wide cursor-pointer hover:bg-[#7A9216] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold transition-colors duration-200 shadow-lg hover:shadow-xl text-2xl sm:text-lg w-full sm:w-auto active:scale-95">
                Services
              </button>
            </Link>
            <Link href={"/about"} passHref>
              <button className="border-2 cursor-pointer border-gray-900 bg-gray-900 text-white hover:bg-gray-900/80 hover:border-gray-900/80 px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors duration-200 text-2xl sm:text-lg w-full sm:w-auto active:scale-95">
                Learn more
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
