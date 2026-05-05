import { useState, useEffect } from "react";
import { Movie, TVSeries } from "@/types/tmdb";

export type WatchlistItem = (Movie | TVSeries) & {
  addedAt: number;
  mediaType: "movie" | "tv";
};

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cinemax_watchlist");
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveWatchlist = (newList: WatchlistItem[]) => {
    setWatchlist(newList);
    localStorage.setItem("cinemax_watchlist", JSON.stringify(newList));
  };

  const addToWatchlist = (item: Movie | TVSeries, type: "movie" | "tv") => {
    if (watchlist.some((w) => w.id === item.id)) return;
    saveWatchlist([...watchlist, { ...item, mediaType: type, addedAt: Date.now() }]);
  };

  const removeFromWatchlist = (id: number) => {
    saveWatchlist(watchlist.filter((w) => w.id !== id));
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some((w) => w.id === id);
  };

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
