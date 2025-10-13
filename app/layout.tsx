import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import ConditionalLayout from "../components/ConditionalLayout";

const manRope = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PARENTALPAL - Childcare Solutions",
  description:
    "Connect with tutors, holiday camps, playgroups, homeschooling resources, and children's events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manRope.className}  antialiased`}>
        <SessionProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
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
