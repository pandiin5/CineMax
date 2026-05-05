"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/hooks/useTMDB";
import { MediaCard } from "@/components/cards/MediaCard";
import { Search as SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

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
  const debouncedQuery = useDebounce(query, 500);
  const { data, isLoading, isFetching } = useSearch(debouncedQuery);

  const results = data?.results.filter((item) => "title" in item || "name" in item) || [];

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

      {query.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-text-3">
          <SearchIcon size={64} className="mb-4 opacity-50" />
          <p className="text-xl">What are you looking for?</p>
        </div>
      ) : isLoading || isFetching ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {results.map((item) => (
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
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-text-3">
          <p className="text-xl">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
