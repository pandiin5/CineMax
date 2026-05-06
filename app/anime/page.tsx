"use client";

import { useState } from "react";
import { MediaCard } from "@/components/cards/MediaCard";
import { useByGenre } from "@/hooks/useTMDB";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export default function AnimePage() {
  const [page, setPage] = useState(1);
  // Genre 16 is Animation in TMDB. We'll use TV since most anime are series
  const { data, isLoading } = useByGenre("tv", 16, page);

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));

  return (
    <div className="container mx-auto px-4 md:px-8 pt-24 pb-12 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-5xl font-display text-white">Anime Series</h1>
      </div>

      {isLoading && page === 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data?.results.map((item) => (
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
                type="tv"
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="secondary"
              onClick={handlePrevPage}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-white">Page {page}</span>
            <Button
              variant="secondary"
              onClick={handleNextPage}
              disabled={!data || page >= data.total_pages || isLoading}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
