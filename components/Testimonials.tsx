"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Mother of 2",
      rating: 5,
      image: "/teacher1.jpg",
      text: "PARENTALPAL connected us with an amazing tutor for our daughter's math struggles. Within just two months, her confidence and grades improved dramatically. The screening process gave us complete peace of mind.",
      service: "Academic Tutoring",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Single Father",
      rating: 5,
      image: "/teacher2.jpg",
      text: "As a working single dad, finding reliable childcare was my biggest challenge. The caregivers from PARENTALPAL are not just babysitters - they're educators who genuinely care about my son's development.",
      service: "Childcare Services",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Homeschooling Mom",
      rating: 4,
      image: "/teacher3.jpg",
      text: "The homeschooling program resources and support network have been invaluable. My children are thriving academically and socially. The curriculum guidance saved me countless hours of research.",
      service: "Home Schooling Program",
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Father of 3",
      rating: 5,
      image: "/man1.jpg",
      text: "We hosted our daughter's 8th birthday party using their event planning service. Every detail was perfect, and the kids had an absolute blast. Stress-free party planning at its finest!",
      service: "Event Planning",
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Working Mother",
      rating: 5,
      image: "/man2.jpg",
      text: "The holiday camp program was exactly what we needed during summer break. Educational activities, outdoor fun, and new friendships - my twins came home excited every single day.",
      service: "Holiday Camps",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-[#E8931A]" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="py-20 px-4 bg-linear-to-br from-gray-50 via-white to-[#FFEACF]/20">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            What Parents Say
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Real families sharing their experiences with our childcare and
            educational services. Join thousands of satisfied parents who trust
            us with their children&apos;s future.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-3xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white shadow-xl rounded-full p-4 hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 border border-gray-100"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-6 h-6 text-[#90AC19]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white shadow-xl rounded-full p-4 hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 border border-gray-100"
            aria-label="Next testimonial"
          >
            <svg
              className="w-6 h-6 text-[#90AC19]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full shrink-0 bg-linear-to-br from-white via-white to-[#FFEACF]/20 relative overflow-hidden"
                >
                  <div className="relative p-12 lg:p-10">
                    <div className="max-w-4xl mx-auto text-center">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <svg
                          className="w-16 h-16 text-[#90AC19]/20 mx-auto"
                          fill="currentColor"
                          viewBox="0 0 32 32"
                        >
                          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                        </svg>
                      </div>

                      {/* Service Badge */}
                      <div className="mb-4">
                        <span className="inline-block bg-linear-to-r from-[#90AC19] to-[#7A9216] text-white text-sm font-semibold px-6 py-3 rounded-full shadow-lg">
                          {testimonial.service}
                        </span>
                      </div>

                      {/* Testimonial Text */}
                      <blockquote className="text-2xl lg:text-lg text-gray-800 mb-5 leading-relaxed font-medium">
                        {testimonial.text}
                      </blockquote>

                      {/* Rating */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex space-x-1">
                          {renderStars(testimonial.rating)}
                        </div>
                        <span className="ml-3 text-lg font-semibold text-gray-600">
                          {testimonial.rating}/5
                        </span>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-[#90AC19]/20 to-[#E8931A]/20 p-1">
                            <div className="w-full h-full rounded-full overflow-hidden">
                              <Image
                                src={testimonial.image}
                                alt={testimonial.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#90AC19] rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="text-left ml-6">
                          <div className="font-bold text-gray-900 text-xl mb-1">
                            {testimonial.name}
                          </div>
                          <div className="text-[#90AC19] font-medium text-lg">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-10 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 h-3 bg-[#90AC19] rounded-full shadow-lg"
                    : "w-3 h-3 bg-gray-300 hover:bg-[#90AC19]/50 rounded-full"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-linear-to-r from-[#90AC19] to-[#7A9216] rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to join our community?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied families who trust us with their
              children&apos;s future. Your success story could be next!
            </p>
            <Link href="/services" passHref>
              <button className="bg-white text-[#90AC19] hover:bg-gray-50 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Get Started Today
                <svg
                  className="w-5 h-5 ml-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
