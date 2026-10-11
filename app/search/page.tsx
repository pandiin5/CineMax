"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MediaCard } from "@/components/cards/MediaCard";
import { Search as SearchIcon, Film, TrendingUp, Filter, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { tmdb } from "@/lib/tmdb";
import { Movie, TVSeries } from "@/types/tmdb";
import { UNIFIED_GENRES, findUnifiedGenre, getGenreNameFromIds } from "@/lib/genres";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Generate list of years from current year back to 1980
const CURRENT_YEAR = new Date().getFullYear();
const YEARS: number[] = [];
for (let y = CURRENT_YEAR; y >= 1980; y--) {
  YEARS.push(y);
}

function deduplicateMediaItems(existing: (Movie | TVSeries)[], incoming: (Movie | TVSeries)[]): (Movie | TVSeries)[] {
  const seen = new Set(existing.map((item) => `${"title" in item ? "movie" : "tv"}-${item.id}`));
  const uniqueIncoming = incoming.filter(
    (item) => !seen.has(`${"title" in item ? "movie" : "tv"}-${item.id}`)
  );
  return [...existing, ...uniqueIncoming];
}

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query params
  const yearParam = searchParams.get("year");
  const genreParam = searchParams.get("genre");
  const selectedYear = yearParam ? parseInt(yearParam, 10) : null;
  const selectedGenreId = genreParam ? parseInt(genreParam, 10) : null;

  // Local state for search bar query
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  // Results & pagination state
  const [items, setItems] = useState<(Movie | TVSeries)[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Find unified genre config
  const selectedGenreConfig = useMemo(
    () => findUnifiedGenre(selectedGenreId),
    [selectedGenreId]
  );

  // Update URL search parameters
  const updateFilters = useCallback(
    (newYear: number | null, newGenre: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newYear) {
        params.set("year", newYear.toString());
      } else {
        params.delete("year");
      }

      if (newGenre) {
        params.set("genre", newGenre.toString());
      } else {
        params.delete("genre");
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleYearClick = (year: number | null) => {
    // If clicking "All years" (null) or clicking currently active year, clear year filter
    const nextYear = year === null || selectedYear === year ? null : year;
    updateFilters(nextYear, selectedGenreId);
  };

  const handleGenreClick = (genreId: number) => {
    // Clicking active genre again clears it
    const isCurrentlySelected =
      selectedGenreId === genreId ||
      selectedGenreConfig?.id === genreId ||
      selectedGenreConfig?.movieGenreId === genreId ||
      selectedGenreConfig?.tvGenreId === genreId;

    const nextGenre = isCurrentlySelected ? null : genreId;
    updateFilters(selectedYear, nextGenre);
  };

  // Main data fetching effect (resets to page 1 on filter/query changes)
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setPage(1);

    async function fetchData() {
      try {
        if (debouncedQuery.trim().length > 0) {
          // Title search by name
          const searchRes = await tmdb.search(debouncedQuery, 1);
          if (!isCurrent) return;

          let results = (searchRes.results || []).filter(
            (item) => "title" in item || "name" in item
          );

          // Apply active year filter to search results
          if (selectedYear) {
            results = results.filter((item) => {
              const releaseYear = "release_date" in item
                ? item.release_date?.substring(0, 4)
                : (item as any).first_air_date?.substring(0, 4);
              return releaseYear === String(selectedYear);
            });
          }

          // Apply active genre filter to search results
          if (selectedGenreConfig) {
            results = results.filter((item) => {
              const genreIds = item.genre_ids || [];
              return (
                (selectedGenreConfig.movieGenreId && genreIds.includes(selectedGenreConfig.movieGenreId)) ||
                (selectedGenreConfig.tvGenreId && genreIds.includes(selectedGenreConfig.tvGenreId))
              );
            });
          }

          setItems(results);
          setHasMore(searchRes.page < searchRes.total_pages);
        } else if (selectedYear !== null || selectedGenreConfig) {
          // Year or Genre filter active -> Fetch from TMDB discover endpoints
          const discoverRes = await tmdb.discoverCombined({
            year: selectedYear,
            genreConfig: selectedGenreConfig,
            page: 1,
          });
          if (!isCurrent) return;

          setItems(discoverRes.results);
          setHasMore(discoverRes.hasMore);
        } else {
          // Default: Recommended for you (trending movies & series)
          const trendingRes = await tmdb.trending("all", "day", 1);
          if (!isCurrent) return;

          const results = (trendingRes.results || []).filter(
            (item) => "title" in item || "name" in item
          );
          setItems(results);
          setHasMore(trendingRes.page < trendingRes.total_pages);
        }
      } catch (error) {
        console.error("Failed to fetch search/discover items:", error);
        if (isCurrent) {
          setItems([]);
          setHasMore(false);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery, selectedYear, selectedGenreConfig]);

  // Load more pagination handler
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      if (debouncedQuery.trim().length > 0) {
        const searchRes = await tmdb.search(debouncedQuery, nextPage);
        let newResults = (searchRes.results || []).filter(
          (item) => "title" in item || "name" in item
        );

        if (selectedYear) {
          newResults = newResults.filter((item) => {
            const releaseYear = "release_date" in item
              ? item.release_date?.substring(0, 4)
              : (item as any).first_air_date?.substring(0, 4);
            return releaseYear === String(selectedYear);
          });
        }

        if (selectedGenreConfig) {
          newResults = newResults.filter((item) => {
            const genreIds = item.genre_ids || [];
            return (
              (selectedGenreConfig.movieGenreId && genreIds.includes(selectedGenreConfig.movieGenreId)) ||
              (selectedGenreConfig.tvGenreId && genreIds.includes(selectedGenreConfig.tvGenreId))
            );
          });
        }

        setItems((prev) => deduplicateMediaItems(prev, newResults));
        setHasMore(searchRes.page < searchRes.total_pages);
      } else if (selectedYear !== null || selectedGenreConfig) {
        const discoverRes = await tmdb.discoverCombined({
          year: selectedYear,
          genreConfig: selectedGenreConfig,
          page: nextPage,
        });

        setItems((prev) => deduplicateMediaItems(prev, discoverRes.results));
        setHasMore(discoverRes.hasMore);
      } else {
        const trendingRes = await tmdb.trending("all", "day", nextPage);
        const newResults = (trendingRes.results || []).filter(
          (item) => "title" in item || "name" in item
        );

        setItems((prev) => deduplicateMediaItems(prev, newResults));
        setHasMore(trendingRes.page < trendingRes.total_pages);
      }
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pt-32 pb-12 min-h-screen flex flex-col">
      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto w-full mb-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-text-2" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-surface border-2 border-border rounded-xl text-lg text-white placeholder-text-3 focus:outline-none focus:border-accent transition-colors"
            placeholder="Search for movies, tv series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Row 1: Year Filter Chips (Horizontally Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        <button
          type="button"
          onClick={() => handleYearClick(null)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedYear === null
              ? "bg-accent text-white"
              : "bg-surface-2 text-text-2 hover:bg-surface hover:text-white border border-border"
          }`}
        >
          All years
        </button>
        {YEARS.map((yr) => (
          <button
            key={yr}
            type="button"
            onClick={() => handleYearClick(yr)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedYear === yr
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-2 hover:bg-surface hover:text-white border border-border"
            }`}
          >
            {yr}
          </button>
        ))}
      </div>

      {/* Row 2: Genre Filter Chips (Horizontally Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {UNIFIED_GENRES.map((genre) => {
          const isSelected =
            selectedGenreId === genre.id ||
            selectedGenreConfig?.id === genre.id ||
            selectedGenreConfig?.movieGenreId === genre.movieGenreId;

          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleGenreClick(genre.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-text-2 hover:bg-surface hover:text-white border border-border"
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      {debouncedQuery.trim().length > 0 ? (
        <div className="flex items-center gap-2 mb-6">
          <Film className="text-accent" size={24} />
          <h2 className="text-2xl font-display font-medium text-white">
            Results for &ldquo;{debouncedQuery}&rdquo;
          </h2>
        </div>
      ) : selectedYear !== null || selectedGenreConfig ? (
        <div className="flex items-center gap-2 mb-6">
          <Filter className="text-accent" size={24} />
          <h2 className="text-2xl font-display font-medium text-white">
            {selectedGenreConfig && selectedYear
              ? `${selectedGenreConfig.name} Titles (${selectedYear})`
              : selectedGenreConfig
              ? `${selectedGenreConfig.name} Movies & Series`
              : `Released in ${selectedYear}`}
          </h2>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-accent" size={24} />
          <h2 className="text-2xl font-display font-medium text-white">Recommended for you</h2>
        </div>
      )}

      {/* Media Cards Grid or Loading Skeleton or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
              <MediaCard
                key={`${"title" in item ? "movie" : "tv"}-${item.id}`}
                id={item.id}
                title={"title" in item ? item.title : (item as any).name}
                posterPath={item.poster_path}
                rating={item.vote_average}
                year={
                  "release_date" in item
                    ? item.release_date?.substring(0, 4)
                    : (item as any).first_air_date?.substring(0, 4)
                }
                type={"title" in item ? "movie" : "tv"}
                genre={getGenreNameFromIds(item.genre_ids)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 rounded-full hover:bg-accent hover:text-white transition-all flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <span>Load More</span>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-text-3 py-16">
          <Film size={64} className="mb-4 opacity-50" />
          <p className="text-xl text-white font-medium">No results found</p>
          <p className="text-sm text-text-2 mt-2 text-center max-w-md">
            {debouncedQuery.trim().length > 0
              ? `We couldn't find any matches for "${debouncedQuery}". Try another search term or clear filters.`
              : "No movies or TV series found matching your selected filter combination."}
          </p>
          {(selectedYear !== null || selectedGenreId !== null || debouncedQuery.trim().length > 0) && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-6 rounded-full"
              onClick={() => {
                setQuery("");
                updateFilters(null, null);
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-8 pt-32 pb-12 min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto w-full mb-10">
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
