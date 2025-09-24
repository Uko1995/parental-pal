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
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Parents Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real families sharing their experiences with our childcare and
            educational services
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-300"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-300"
            aria-label="Next testimonial"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 bg-[#FFEACF]/30 p-8 border border-gray-100"
                >
                  <div className="max-w-3xl mx-auto text-center">
                    {/* Rating */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({testimonial.rating}/5)
                      </span>
                    </div>

                    {/* Service Badge */}
                    <div className="mb-6">
                      <span className="inline-block bg-[#90AC19]/10 text-[#90AC19] text-sm font-medium px-4 py-2 rounded-full">
                        {testimonial.service}
                      </span>
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-xl text-gray-700 mb-8 leading-relaxed italic">
                      &quot;{testimonial.text}&quot;
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 text-lg">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide
                    ? "bg-[#90AC19]"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Ready to join our community of satisfied families?
          </p>
          <Link href={"/srvices"} passHref>
            <button className="bg-[#90AC19] cursor-pointer hover:bg-[#7A9216] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
              Get Started Today
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
