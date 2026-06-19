"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if we're on a dashboard route
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute) {
    // For dashboard routes, don't show NavBar and Footer, just render children
    return <>{children}</>;
  }

  // For non-dashboard routes, show NavBar and Footer
  return (
    <>
      <NavBar />
      <main className="pt-16 bg-base-100 text-base-content min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
