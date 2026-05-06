"use client";

import { useState, useEffect } from "react";
import { useSearch, useGenres, useTrending } from "@/hooks/useTMDB";
import { MediaCard } from "@/components/cards/MediaCard";
import { Search as SearchIcon, Film, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  
  const { data: searchData, isLoading: isSearchLoading, isFetching: isSearchFetching } = useSearch(debouncedQuery);
  const { data: trendingData, isLoading: isTrendingLoading } = useTrending("movie", "day");
  const { data: movieGenresData } = useGenres("movie");
  const { data: tvGenresData } = useGenres("tv");

  // Combine and deduplicate genres
  const allGenres = Array.from(
    new Map(
      [...(movieGenresData?.genres || []), ...(tvGenresData?.genres || [])].map((g) => [g.id, g])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const getGenreName = (genreIds?: number[]) => {
    if (!genreIds || genreIds.length === 0) return undefined;
    const genre = allGenres.find((g) => g.id === genreIds[0]);
    return genre?.name;
  };

  const results = searchData?.results.filter((item) => "title" in item || "name" in item) || [];
  const recommended = trendingData?.results || [];

  const displayResults = query.length > 0 ? results : recommended;
  const isDisplayLoading = query.length > 0 ? (isSearchLoading || isSearchFetching) : isTrendingLoading;
  
  // Filter by selected genre if no query
  const filteredDisplayResults = selectedGenre && query.length === 0
    ? displayResults.filter(item => item.genre_ids?.includes(selectedGenre))
    : displayResults;

  return (
    <div className="container mx-auto px-4 md:px-8 pt-32 pb-12 min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto w-full mb-12">
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

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {query.length === 0 && allGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedGenre === genre.id
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-2 hover:bg-surface hover:text-white border border-border"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {query.length === 0 && (
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-accent" size={24} />
          <h2 className="text-2xl font-display font-medium text-white">Recommended for you</h2>
        </div>
      )}

      {isDisplayLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      ) : filteredDisplayResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredDisplayResults.map((item) => (
            <MediaCard
              key={item.id}
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
              genre={getGenreName(item.genre_ids)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-text-3">
          <Film size={64} className="mb-4 opacity-50" />
          <p className="text-xl">
            {query.length > 0 ? `No results found for "${query}"` : "No recommendations found."}
          </p>
        </div>
      )}
    </div>
  );
}
