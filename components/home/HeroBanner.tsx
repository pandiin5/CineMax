"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus } from "lucide-react";
import { useTrending } from "@/hooks/useTMDB";
import { tmdb } from "@/lib/tmdb";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export function HeroBanner() {
  const { data, isLoading } = useTrending("movie", "day");
  const [currentIndex, setCurrentIndex] = useState(0);

  const movies = data?.results.slice(0, 5) || [];

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000); // 8 seconds
    return () => clearInterval(interval);
  }, [movies.length]);

  if (isLoading) {
    return <Skeleton className="w-full h-[70vh] md:h-[85vh] rounded-none" />;
  }

  if (movies.length === 0) return null;

  const activeMovie = movies[currentIndex];
  // Using original for highest quality backdrop
  const backdropUrl = tmdb.imgUrl(activeMovie.backdrop_path, "original");

  const title = "title" in activeMovie ? activeMovie.title : activeMovie.name;
  const originalTitle = "original_title" in activeMovie ? activeMovie.original_title : activeMovie.original_name;

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-bg via-bg/50 to-transparent" />
          <Image
            src={backdropUrl}
            alt={title || originalTitle || ""}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 container mx-auto px-4 md:px-8 flex flex-col justify-end pb-24 md:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${activeMovie.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="accent">Trending</Badge>
              <StarRating rating={activeMovie.vote_average} />
            </div>
            <h1 className="text-5xl md:text-7xl font-display text-white mb-4 drop-shadow-lg">
              {title || originalTitle}
            </h1>
            <p className="text-text-2 text-sm md:text-base line-clamp-3 mb-8 drop-shadow-md max-w-lg">
              {activeMovie.overview}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={`/movies/${activeMovie.id}`}
                className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-colors"
              >
                <Play size={20} fill="white" />
                Watch Now
              </Link>
              <button className="bg-surface-2/80 hover:bg-surface-2 text-white px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-colors backdrop-blur-sm border border-border">
                <Plus size={20} />
                Watchlist
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
