import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Navbar } from "@/components/Navbar";
import { ToastViewport } from "@/components/ToastViewport";
import { Providers } from "@/app/providers";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "FIERO Store",
  description: "Premium editorial e-commerce storefront built with Next.js, Node.js, and MongoDB."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${manrope.variable} ${cormorant.variable} font-sans antialiased`}>
        <Providers>
          <div className="grain flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-28 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            <ToastViewport />
          </div>
        </Providers>
      </body>
    </html>
  );
}
