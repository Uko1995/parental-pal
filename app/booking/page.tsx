import { registerChild } from "./action";
import BookingForm from "./BookingForm";
import { Suspense } from "react";

export default function Page() {
  return (
    <section className="min-h-screen bg-linear-to-br from-[#FFEACF]/50 via-white to-[#FFEACF]/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Enroll Your Child
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Join the PARENTALPAL family and give your child access to
            exceptional learning opportunities.
          </p>
        </div>

        {/* Registration Form */}
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <BookingForm submitAction={registerChild} />
        </Suspense>

        {/* Contact Info */}
        <div className="text-center mt-8 p-6 bg-white/50 rounded-xl border border-gray-100">
          <p className="text-gray-600 mb-2">
            Have questions? We&apos;re here to help!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:info@parentalpal.com"
              className="text-[#90AC19] hover:underline font-medium"
            >
              📧 admin@parentalpal.org
            </a>
            <a
              href="tel:+2348065394795"
              className="text-[#90AC19] hover:underline font-medium"
            >
              📞 +234 806 539 4795
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
