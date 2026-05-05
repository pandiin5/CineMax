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
  type: "movie" | "tv";
  href?: string;
}

export function ContentRow({ title, items, isLoading, type, href }: ContentRowProps) {
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
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-accent hover:text-accent-2 transition-colors">
            See All &rarr;
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Navigation Buttons (Desktop) */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-bg/80 backdrop-blur-sm p-2 h-full hidden md:group-hover:block opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-2"
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
            : items.map((item) => (
                <div key={item.id} className="min-w-[140px] md:min-w-[200px] snap-start">
                  <MediaCard
                    id={item.id}
                    title={"title" in item ? item.title : item.name}
                    posterPath={item.poster_path}
                    rating={item.vote_average}
                    year={
                      "release_date" in item
                        ? item.release_date?.substring(0, 4)
                        : item.first_air_date?.substring(0, 4)
                    }
                    type={type}
                  />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-bg/80 backdrop-blur-sm p-2 h-full hidden md:group-hover:block opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-2"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </section>
  );
}
