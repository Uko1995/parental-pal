import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen -mt-16 mb-10 overflow-hidden bg-[url('/gemini.jpg')] bg-cover bg-center bg-no-repeat flex flex-col md:justify-end">
      <div className="relative z-10 flex flex-col items-start justify-end md:justify-center h-full min-h-[60vh] px-4 sm:px-6 lg:px-8 text-left ml-4 mb-8 sm:ml-10 pb-10 sm:pb-0">
        <h1 className="text-xl  sm:text-2xl font-bold">Welcome to</h1>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-wide text-[#b4d32a]">
          ParentalPal
        </h1>
        <p className="mt-4 text-base font-semibold sm:text-lg text-[#171717] max-w-md">
          Your one-stop solution for all childcare needs.
        </p>
        {/* CTA Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Link href={"/services"} passHref>
            <button className="bg-[#90AC19] tracking-wide cursor-pointer hover:bg-[#7A9216] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold transition-colors duration-300 shadow-lg text-lg sm:text-lg w-full sm:w-auto">
              Services
            </button>
          </Link>
          <Link href={"/about"} passHref>
            <button className="border-2 cursor-pointer border-black text-black hover:bg-black hover:text-white px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors duration-300 text-lg sm:text-lg w-full sm:w-auto">
              Learn more
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
