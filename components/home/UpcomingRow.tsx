"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useUpcomingThisWeek } from "@/hooks/useTMDB";
import { MediaCard } from "@/components/cards/MediaCard";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { getReleaseStatus } from "@/lib/dates";
import { Movie, TVSeries } from "@/types/tmdb";

type MediaTypeFilter = "all" | "movie" | "tv";
type StatusFilter = "all" | "out" | "upcoming";

export function UpcomingRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data, isLoading } = useUpcomingThisWeek(3, 7);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const allItems: (Movie | TVSeries)[] = useMemo(() => {
    if (!data) return [];
    if (mediaType === "movie") return data.movies;
    if (mediaType === "tv") return data.series;
    return data.results;
  }, [data, mediaType]);

  const { filteredItems, outCount, upcomingCount } = useMemo(() => {
    let out = 0;
    let upcoming = 0;

    const list = allItems.filter((item) => {
      const releaseDate = "release_date" in item ? item.release_date : (item as any).first_air_date;
      const status = getReleaseStatus(releaseDate);

      const isOut = status ? status.isOut : true;
      if (isOut) {
        out++;
      } else {
        upcoming++;
      }

      if (statusFilter === "out") return isOut;
      if (statusFilter === "upcoming") return !isOut;
      return true;
    });

    return { filteredItems: list, outCount: out, upcomingCount: upcoming };
  }, [allItems, statusFilter]);

  return (
    <section className="py-6 relative group">
      <div className="container mx-auto px-4 md:px-8 mb-4 space-y-3">
        {/* Row Title and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Upcoming This Week
              </h2>

              {/* Status pill counts */}
              {!isLoading && (
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                    <CheckCircle2 size={12} />
                    {outCount} Out Now
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-medium">
                    <Clock size={12} />
                    {upcomingCount} Coming Soon
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs md:text-sm text-text-2 mt-1">
              Know instantly if a title is already out or coming soon this week.
            </p>
          </div>

          {/* Filter Pills and See All Link */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Media Type Tabs */}
            <div className="flex items-center bg-surface border border-border p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setMediaType("all")}
                className={`px-3 py-1 rounded transition-colors ${
                  mediaType === "all" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMediaType("movie")}
                className={`px-3 py-1 rounded transition-colors ${
                  mediaType === "movie" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setMediaType("tv")}
                className={`px-3 py-1 rounded transition-colors ${
                  mediaType === "tv" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                Series
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-surface border border-border p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === "all" ? "bg-surface-2 text-white" : "text-text-2 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("out")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  statusFilter === "out"
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <CheckCircle2 size={11} />
                Out Now
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  statusFilter === "upcoming"
                    ? "bg-amber-500 text-black font-semibold"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Clock size={11} />
                Coming Soon
              </button>
            </div>

            <Link
              href="/upcoming"
              className="text-xs md:text-sm font-medium text-accent hover:text-accent-2 transition-colors ml-auto sm:ml-0 inline-flex items-center gap-1"
            >
              See All &rarr;
            </Link>
          </div>
        </div>
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
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[140px] md:min-w-[200px] snap-start">
                <MovieCardSkeleton />
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center text-text-3">
              <Clock size={32} className="mb-2 text-text-3 opacity-60" />
              <p className="text-sm text-text-2">No titles matching this filter for this week.</p>
              <button
                onClick={() => {
                  setMediaType("all");
                  setStatusFilter("all");
                }}
                className="mt-3 text-xs text-accent hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemType =
                (item as any).media_type || ("title" in item ? "movie" : "tv");
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
                    showReleaseStatus={true}
                    type={itemType}
                  />
                </div>
              );
            })
          )}
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
