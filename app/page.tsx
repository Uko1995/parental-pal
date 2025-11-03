"use client";

import Hero from "../components/Hero";
import MiniBlog from "../components/MiniBlog";
import Statistics from "../components/Statistics";
import Testimonials from "../components/Testimonials";
import Vision from "../components/Vision";
import Contact from "../components/Contact";
import MiniServices from "../components/MiniServices";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateJsonLdScript,
} from "../lib/metadata";

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
      <Vision />
      <MiniServices />
      <MiniBlog />
      <Statistics />
      <Testimonials />
      <Contact />
    </>
  );
}
