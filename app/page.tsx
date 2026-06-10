import { Suspense, lazy } from "react";
import HomeHeroSection from "../components/HomeHeroSection";
import PageContent from "./PageContent";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateJsonLdScript,
} from "../lib/metadata";

const Vision = lazy(() => import("../components/Vision"));
const MiniServices = lazy(() => import("../components/MiniServices"));
const MiniProducts = lazy(() => import("../components/MiniProducts"));
const MiniBlog = lazy(() => import("../components/MiniBlog"));
const Statistics = lazy(() => import("../components/Statistics"));
const Contact = lazy(() => import("../components/Contact"));

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
      <HomeHeroSection />
      <Suspense fallback={<div className="h-96" />}>
        <Vision />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <MiniServices />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <MiniProducts />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <MiniBlog />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Statistics />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Contact />
      </Suspense>
    </>
  );
}
