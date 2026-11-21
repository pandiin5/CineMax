"use client";

import { useState, useMemo } from "react";
import { useUpcomingThisWeek } from "@/hooks/useTMDB";
import { MediaCard } from "@/components/cards/MediaCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getReleaseStatus } from "@/lib/dates";
import { Calendar, CheckCircle2, Clock, Film, Tv, Sparkles, Filter } from "lucide-react";
import { Movie, TVSeries } from "@/types/tmdb";

type MediaTypeFilter = "all" | "movie" | "tv";
type StatusFilter = "all" | "out" | "upcoming";

export default function UpcomingPage() {
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch extended window (last 7 days to next 21 days)
  const { data, isLoading } = useUpcomingThisWeek(7, 21);

  const rawItems: (Movie | TVSeries)[] = useMemo(() => {
    if (!data) return [];
    if (mediaType === "movie") return data.movies;
    if (mediaType === "tv") return data.series;
    return data.results;
  }, [data, mediaType]);

  const { items, outCount, upcomingCount } = useMemo(() => {
    let out = 0;
    let upcoming = 0;

    const list = rawItems.filter((item) => {
      const title = ("title" in item ? item.title : item.name) || "";
      const releaseDate = "release_date" in item ? item.release_date : (item as any).first_air_date;
      const status = getReleaseStatus(releaseDate);
      const isOut = status ? status.isOut : true;

      if (isOut) {
        out++;
      } else {
        upcoming++;
      }

      // Filter by status
      if (statusFilter === "out" && !isOut) return false;
      if (statusFilter === "upcoming" && isOut) return false;

      // Filter by query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!title.toLowerCase().includes(q)) return false;
      }

      return true;
    });

    return { items: list, outCount: out, upcomingCount: upcoming };
  }, [rawItems, statusFilter, searchQuery]);

  return (
    <div className="container mx-auto px-4 md:px-8 pt-24 pb-16 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-accent/20 text-accent inline-flex items-center justify-center">
                <Calendar size={24} />
              </span>
              <h1 className="text-3xl md:text-5xl font-display text-white">
                Upcoming & Recent Releases
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-2 mt-2 max-w-2xl">
              Track movies and series releasing this week and upcoming months. Quickly check if a title is already out or coming soon.
            </p>
          </div>

          {/* Quick Counter Badges */}
          {!isLoading && (
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                <CheckCircle2 size={14} />
                {outCount} Out Now
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-medium">
                <Clock size={14} />
                {upcomingCount} Coming Soon
              </span>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border p-3 rounded-xl">
          {/* Media Type Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-2 p-1 rounded-lg text-xs md:text-sm font-medium">
              <button
                onClick={() => setMediaType("all")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  mediaType === "all" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                All Releases
              </button>
              <button
                onClick={() => setMediaType("movie")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  mediaType === "movie" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                <Film size={14} />
                Movies
              </button>
              <button
                onClick={() => setMediaType("tv")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  mediaType === "tv" ? "bg-accent text-white" : "text-text-2 hover:text-white"
                }`}
              >
                <Tv size={14} />
                Series
              </button>
            </div>
          </div>

          {/* Status Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-surface-2 p-1 rounded-lg text-xs md:text-sm font-medium">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  statusFilter === "all" ? "bg-surface text-white" : "text-text-2 hover:text-white"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter("out")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
                  statusFilter === "out"
                    ? "bg-emerald-600 text-white font-medium"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <CheckCircle2 size={12} />
                Out Now
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
                  statusFilter === "upcoming"
                    ? "bg-amber-500 text-black font-semibold"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Clock size={12} />
                Coming Soon
              </button>
            </div>

            <input
              type="text"
              placeholder="Search in releases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-2 border border-border text-white text-xs md:text-sm px-3 py-1.5 rounded-lg outline-none focus:border-accent placeholder:text-text-3 w-40 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Grid of Releases */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Clock size={48} className="text-text-3 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-1">No releases found</h3>
          <p className="text-sm text-text-2 mb-4">
            Try adjusting your search query or switching your status filter.
          </p>
          <button
            onClick={() => {
              setMediaType("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {items.map((item) => {
            const itemType = (item as any).media_type || ("title" in item ? "movie" : "tv");
            const releaseDate =
              "release_date" in item ? item.release_date : (item as any).first_air_date;

            return (
              <MediaCard
                key={`${itemType}_${item.id}`}
                id={item.id}
                title={"title" in item ? item.title : item.name}
                posterPath={item.poster_path}
                rating={item.vote_average}
                year={releaseDate ? releaseDate.substring(0, 4) : undefined}
                releaseDate={releaseDate}
                showReleaseStatus={true}
                type={itemType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
