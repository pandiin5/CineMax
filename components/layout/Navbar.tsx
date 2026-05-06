"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { name: "Movies", href: "/movies" },
  { name: "Series", href: "/series" },
  { name: "Anime", href: "/anime" },
  { name: "K-Drama", href: "/kdrama" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-bg/80 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-3xl font-display tracking-wide text-accent flex-shrink-0">
          CINEMAX
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive ? "text-white" : "text-text-2"
                } relative`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-text-2 hover:text-white transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/watchlist" className="hidden md:flex items-center gap-2 text-text-2 hover:text-white transition-colors">
            <Heart size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
