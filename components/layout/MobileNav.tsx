"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Search, Heart } from "lucide-react";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "Series", href: "/series", icon: Tv },
  { name: "Anime", href: "/anime", icon: Tv },
  { name: "Search", href: "/search", icon: Search },
  { name: "Watchlist", href: "/watchlist", icon: Heart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface-2/90 backdrop-blur-lg border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1 min-w-[60px] ${
                isActive ? "text-accent" : "text-text-2 hover:text-white"
              } transition-colors`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
