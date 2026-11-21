"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "@/components/cards/MediaCard";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { Movie, TVSeries } from "@/types/tmdb";

interface ContentRowProps {
  title: string;
  items: (Movie | TVSeries)[];
  isLoading: boolean;
  type?: "movie" | "tv";
  href?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  showReleaseStatus?: boolean;
}

export function ContentRow({
  title,
  items,
  isLoading,
  type,
  href,
  subtitle,
  badge,
  showReleaseStatus = false,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-6 relative group">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-end justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="text-xs md:text-sm text-text-2 mt-1">{subtitle}</p>}
        </div>

        {href && (
          <Link
            href={href}
            className="text-sm font-medium text-accent hover:text-accent-2 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            See All &rarr;
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Navigation Buttons (Desktop) */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-bg/85 backdrop-blur-sm p-2 h-full hidden md:group-hover:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-2 text-white"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 scrollbar-hide snap-x"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[140px] md:min-w-[200px] snap-start">
                  <MovieCardSkeleton />
                </div>
              ))
            : items.map((item) => {
                const itemType =
                  (item as any).media_type || (type ? type : "title" in item ? "movie" : "tv");
                const releaseDate =
                  "release_date" in item ? item.release_date : (item as any).first_air_date;

                return (
                  <div key={`${itemType}_${item.id}`} className="min-w-[140px] md:min-w-[200px] snap-start">
                    <MediaCard
                      id={item.id}
                      title={"title" in item ? item.title : item.name}
                      posterPath={item.poster_path}
                      rating={item.vote_average}
                      year={releaseDate ? releaseDate.substring(0, 4) : undefined}
                      releaseDate={releaseDate}
                      showReleaseStatus={showReleaseStatus}
                      type={itemType}
                    />
                  </div>
                );
              })}
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-bg/85 backdrop-blur-sm p-2 h-full hidden md:group-hover:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-2 text-white"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </section>
  );
}
