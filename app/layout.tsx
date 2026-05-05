import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "CINEMAX — Free Movie & Series Streaming",
  description: "Browse, search, and watch movies and series directly in the browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${dmSans.variable} ${bebasNeue.variable} antialiased bg-bg text-text-1 flex flex-col min-h-screen`}
      >
        <QueryProvider>
          <Navbar />
          <main className="flex-grow pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </QueryProvider>
      </body>
    </html>
  );
}
