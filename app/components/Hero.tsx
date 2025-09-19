import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen -mt-16 mb-10 overflow-hidden bg-[url('/gemini.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="relative z-10 flex flex-col items-start justify-center h-screen px-4 text-left ms-10">
        <h1 className="text-2xl font-bold">Welcome to</h1>
        <h1 className="text-8xl font-extrabold tracking-wide text-[#b4d32a]">
          ParentalPal
        </h1>
        <p className="mt-4 text-lg text-[#171717]">
          Your one-stop solution for all childcare needs.
        </p>
        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href={"/services"} passHref>
            <button className="bg-[#90AC19] tracking-wide  cursor-pointer hover:bg-[#7A9216] text-white px-8 py-3.5 rounded-lg font-bold transition-colors duration-300 shadow-lg">
              Services
            </button>
          </Link>
          <Link href={"/about"} passHref>
            <button className="border-2 cursor-pointer border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              Learn more
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
