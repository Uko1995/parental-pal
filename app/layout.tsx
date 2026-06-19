import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import ConditionalLayout from "../components/ConditionalLayout";
import AnalyticsProvider from "../components/AnalyticsProvider";
import ToastRouteCleanup from "../components/ToastRouteCleanup";
import { baseMetadata } from "../lib/metadata";
import Image from "next/image";

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="antialiased font-sans">
        {/* Facebook Pixel */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <Image
            height="1"
            width="1"
            style={{ display: "none" }}
            alt="facebook pixel"
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1012526337754326"}&ev=PageView&noscript=1`}
          />
        </noscript>

        <SessionProvider>
          <AnalyticsProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </AnalyticsProvider>
          <ToastRouteCleanup />
          <Toaster
            position="top-center"
            containerStyle={{ top: 72 }}
            toastOptions={{
              duration: 2500,
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-text)",
                border: "1px solid var(--toast-border)",
                maxWidth: "min(100vw - 16px, 420px)",
              },
              success: {
                iconTheme: {
                  primary: "#90AC19",
                  secondary: "var(--toast-bg)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f87171",
                  secondary: "var(--toast-bg)",
                },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
