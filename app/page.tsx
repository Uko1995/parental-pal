"use client";

import Hero from "../components/Hero";
import { useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateJsonLdScript,
} from "../lib/metadata";

// Lazy load below-the-fold components
const Vision = lazy(() => import("../components/Vision"));
const MiniServices = lazy(() => import("../components/MiniServices"));
const MiniBlog = lazy(() => import("../components/MiniBlog"));
const Statistics = lazy(() => import("../components/Statistics"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const Contact = lazy(() => import("../components/Contact"));

function PageContent() {
  const searchParams = useSearchParams();
  const signout = searchParams.get("signout");

  useEffect(() => {
    if (signout === "success") {
      toast.success("You have been successfully signed out. Come back soon!");
      // Clean up the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("signout");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [signout]);

  return null;
}

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <PageContent />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJsonLdScript(generateOrganizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJsonLdScript(generateLocalBusinessSchema()),
        }}
      />
      <Hero />
      <Suspense fallback={<div className="h-96" />}>
        <Vision />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <MiniServices />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <MiniBlog />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Statistics />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Contact />
      </Suspense>
    </>
  );
}
