"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Heart, Share } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { MovieDetail, TVDetail } from "@/types/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";

interface DetailHeroProps {
  item: MovieDetail | TVDetail;
  type: "movie" | "tv";
  onPlayClick: () => void;
}

export function DetailHero({ item, type, onPlayClick }: DetailHeroProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id);

  const title = "title" in item ? item.title : item.name;
  const originalTitle = "original_title" in item ? item.original_title : item.original_name;
  const releaseYear = ("release_date" in item ? item.release_date : item.first_air_date)?.substring(0, 4);
  const duration = "runtime" in item ? `${item.runtime} min` : `${item.number_of_seasons} Seasons`;

  const handleWatchlistToggle = () => {
    if (saved) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item as any, type);
    }
  };

  return (
    <div className="relative w-full min-h-[80vh] bg-bg flex items-center pt-24 pb-12">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
        <Image
          src={tmdb.imgUrl(item.backdrop_path, "original")}
          alt={title || originalTitle}
          fill
          className="object-cover blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/30" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[280px] md:max-w-[340px] shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50 bg-surface-2"
        >
          <div className="aspect-[2/3] relative">
            <Image
              src={tmdb.imgUrl(item.poster_path, "w500")}
              alt={title || originalTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-grow flex flex-col gap-6 text-center md:text-left"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-display text-white mb-2 leading-tight">
              {title}
            </h1>
            {item.tagline && (
              <p className="text-lg text-text-2 italic font-serif mb-4">"{item.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-text-2 mb-6 uppercase tracking-wider">
              <span>{releaseYear}</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span>{duration}</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <StarRating rating={item.vote_average} className="scale-110 origin-left" />
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {item.genres?.map((g) => (
                <Badge key={g.id} variant="secondary">{g.name}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium text-lg mb-2">Overview</h3>
            <p className="text-text-2 leading-relaxed max-w-3xl">
              {item.overview || "No overview available."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
            <button
              onClick={onPlayClick}
              className="bg-accent hover:bg-accent-2 text-white px-8 py-3.5 rounded-md font-medium flex items-center gap-2 transition-colors shadow-lg shadow-accent/20"
            >
              <Play size={20} fill="currentColor" />
              Watch Now
            </button>
            <button
              onClick={handleWatchlistToggle}
              className={`px-6 py-3.5 rounded-md font-medium flex items-center gap-2 transition-all border ${
                saved
                  ? "bg-white/10 text-accent border-accent"
                  : "bg-surface-2/80 text-white hover:bg-surface border-border"
              }`}
            >
              <Heart size={20} fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved" : "Add to Watchlist"}
            </button>
            <button className="p-3.5 rounded-md bg-surface-2/80 text-white hover:bg-surface border border-border transition-colors">
              <Share size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
