"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Film, Tv, Clock } from "lucide-react";
import { useTodayReleases, useUpcomingThisWeek } from "@/hooks/useTMDB";
import { MediaCard } from "@/components/cards/MediaCard";
import { MovieCardSkeleton } from "@/components/ui/Skeleton";
import { getReleaseStatus, formatDateISO } from "@/lib/dates";
import { Movie, TVSeries } from "@/types/tmdb";

type MainTab = "all" | "movie" | "tv" | "upcoming";
type UpcomingSubFilter = "all" | "movie" | "tv";

export function TodayReleasesRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("all");
  const [upcomingSubFilter, setUpcomingSubFilter] = useState<UpcomingSubFilter>("all");

  const { data: todayData, isLoading: todayLoading } = useTodayReleases();
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingThisWeek(0, 30);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const todayStr = useMemo(() => formatDateISO(new Date()), []);

  // Filter Upcoming data to future / upcoming items
  const { upcomingMovies, upcomingSeries, upcomingAll } = useMemo(() => {
    if (!upcomingData) {
      return { upcomingMovies: [], upcomingSeries: [], upcomingAll: [] };
    }

    const isUpcoming = (dateStr?: string | null) => {
      if (!dateStr) return false;
      const status = getReleaseStatus(dateStr);
      return status ? !status.isOut || status.isToday : dateStr >= todayStr;
    };

    const movies = (upcomingData.movies || []).filter((m) => isUpcoming(m.release_date));
    const series = (upcomingData.series || []).filter((t) => isUpcoming(t.first_air_date));

    // Combined unique upcoming items
    const seen = new Set<string>();
    const all: (Movie | TVSeries)[] = [];

    [...movies, ...series].forEach((item) => {
      const key = `${(item as any).media_type || ("title" in item ? "movie" : "tv")}_${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(item);
      }
    });

    // Sort by release date ascending (soonest first)
    all.sort((a, b) => {
      const dateA = "release_date" in a ? a.release_date : (a as any).first_air_date || "";
      const dateB = "release_date" in b ? b.release_date : (b as any).first_air_date || "";
      return dateA.localeCompare(dateB);
    });

    return { upcomingMovies: movies, upcomingSeries: series, upcomingAll: all };
  }, [upcomingData, todayStr]);

  const items: (Movie | TVSeries)[] = useMemo(() => {
    if (activeTab === "upcoming") {
      if (upcomingSubFilter === "movie") return upcomingMovies;
      if (upcomingSubFilter === "tv") return upcomingSeries;
      return upcomingAll;
    }

    if (!todayData) return [];
    if (activeTab === "movie") return todayData.movies;
    if (activeTab === "tv") return todayData.series;
    return todayData.results;
  }, [activeTab, upcomingSubFilter, todayData, upcomingMovies, upcomingSeries, upcomingAll]);

  const isLoading = activeTab === "upcoming" ? upcomingLoading : todayLoading;

  const movieCount = todayData?.movies.length || 0;
  const tvCount = todayData?.series.length || 0;
  const upcomingCount = upcomingAll.length;

  return (
    <section className="py-6 relative group">
      <div className="container mx-auto px-4 md:px-8 mb-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {activeTab === "upcoming" ? "Upcoming Releases" : "Today's New Releases"}
              </h2>

              {activeTab === "upcoming" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-500 text-black shadow-lg shadow-amber-500/20">
                  <Clock size={12} />
                  Coming Soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-red-600/90 text-white shadow-lg shadow-red-600/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  New Today
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-text-2 mt-1">
              {activeTab === "upcoming"
                ? "Upcoming movies and TV series releasing soon — see countdowns and release dates."
                : "Fresh movies released today and series airing new episodes right now."}
            </p>
          </div>

          {/* Media Type Tabs & Upcoming Tab */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-surface border border-border p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === "all" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                All ({movieCount + tvCount})
              </button>
              <button
                onClick={() => setActiveTab("movie")}
                className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                  activeTab === "movie" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                <Film size={12} />
                Movies ({movieCount})
              </button>
              <button
                onClick={() => setActiveTab("tv")}
                className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                  activeTab === "tv" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                <Tv size={12} />
                Series ({tvCount})
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-amber-500 text-black font-semibold shadow-md"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Clock size={12} />
                Upcoming ({upcomingCount})
              </button>
            </div>

            {/* Sub-filters for Upcoming */}
            {activeTab === "upcoming" && (
              <div className="flex items-center bg-surface border border-border p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setUpcomingSubFilter("all")}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    upcomingSubFilter === "all"
                      ? "bg-surface-2 text-white font-medium"
                      : "text-text-2 hover:text-white"
                  }`}
                >
                  All ({upcomingCount})
                </button>
                <button
                  onClick={() => setUpcomingSubFilter("movie")}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    upcomingSubFilter === "movie"
                      ? "bg-surface-2 text-white font-medium"
                      : "text-text-2 hover:text-white"
                  }`}
                >
                  Movies ({upcomingMovies.length})
                </button>
                <button
                  onClick={() => setUpcomingSubFilter("tv")}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    upcomingSubFilter === "tv"
                      ? "bg-surface-2 text-white font-medium"
                      : "text-text-2 hover:text-white"
                  }`}
                >
                  Series ({upcomingSeries.length})
                </button>
              </div>
            )}
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
          ) : items.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center text-text-3">
              <Sparkles size={32} className="mb-2 text-text-3 opacity-60" />
              <p className="text-sm text-text-2">
                {activeTab === "upcoming"
                  ? "No upcoming releases found."
                  : "No new releases found for today."}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const itemType =
                (item as any).media_type || ("title" in item ? "movie" : "tv");
              const isMovie = itemType === "movie";
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
                    customBadge={
                      activeTab === "upcoming"
                        ? undefined
                        : isMovie
                        ? "Released Today"
                        : "Airing Today"
                    }
                    customBadgeVariant={
                      activeTab === "upcoming"
                        ? undefined
                        : isMovie
                        ? "today"
                        : "airing"
                    }
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
