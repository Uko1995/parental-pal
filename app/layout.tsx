import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import ConditionalLayout from "../components/ConditionalLayout";
import AnalyticsProvider from "../components/AnalyticsProvider";
import { baseMetadata } from "../lib/metadata";

const manRope = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${manRope.className}  antialiased`}>
        <SessionProvider>
          <AnalyticsProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </AnalyticsProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#363636f",
              },
              success: {
                iconTheme: {
                  primary: "#90AC19",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f87171",
                  secondary: "#fff",
                },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
