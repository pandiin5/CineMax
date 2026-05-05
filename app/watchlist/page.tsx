"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { MediaCard } from "@/components/cards/MediaCard";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function WatchlistPage() {
  const { watchlist, isLoaded } = useWatchlist();

  if (!isLoaded) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="container mx-auto px-4 md:px-8 pt-32 pb-12 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-accent" fill="currentColor" size={32} />
        <h1 className="text-3xl md:text-5xl font-display text-white">Your Watchlist</h1>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-text-3 max-w-md mx-auto">
          <Heart size={64} className="mb-6 opacity-20" />
          <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
          <p className="mb-8">Save shows and movies to keep track of what you want to watch.</p>
          <Button asChild>
            <Link href="/movies">Browse Movies</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {watchlist.sort((a, b) => b.addedAt - a.addedAt).map((item) => (
            <div key={item.id} className="relative group">
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
                type={item.mediaType}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
