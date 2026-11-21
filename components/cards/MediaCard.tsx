"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, Sparkles, Film, CheckCircle2 } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { getReleaseStatus, formatReadableDate } from "@/lib/dates";

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  rating?: number;
  year?: string;
  type: "movie" | "tv";
  genre?: string;
  releaseDate?: string;
  showReleaseStatus?: boolean;
  customBadge?: string;
  customBadgeVariant?: "out" | "today" | "upcoming" | "airing";
}

export function MediaCard({
  id,
  title,
  posterPath,
  rating,
  year,
  type,
  genre,
  releaseDate,
  showReleaseStatus = false,
  customBadge,
  customBadgeVariant,
}: MediaCardProps) {
  const releaseStatus = showReleaseStatus && releaseDate ? getReleaseStatus(releaseDate) : null;
  const isOut = releaseStatus ? releaseStatus.isOut : true;

  return (
    <Link href={`/${type === "movie" ? "movies" : "series"}/${id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="relative group rounded-lg overflow-hidden bg-surface cursor-pointer ring-1 ring-border hover:ring-accent transition-all"
      >
        {/* Poster */}
        <div className="aspect-[2/3] relative bg-surface-2">
          {posterPath ? (
            <Image
              src={tmdb.imgUrl(posterPath, "w342")}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-3 text-sm">
              No Image
            </div>
          )}

          {/* Top Badges (Release Status / Custom Badge) */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10 gap-1">
            {customBadge ? (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                  customBadgeVariant === "today"
                    ? "bg-emerald-500/90 text-white"
                    : customBadgeVariant === "airing"
                    ? "bg-sky-500/90 text-white"
                    : customBadgeVariant === "upcoming"
                    ? "bg-amber-500/95 text-black"
                    : "bg-surface-2/90 text-white border border-border"
                }`}
              >
                {customBadgeVariant === "today" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                {customBadgeVariant === "airing" && <Sparkles size={11} />}
                {customBadge}
              </span>
            ) : releaseStatus ? (
              releaseStatus.isToday ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider bg-emerald-500/95 text-white shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Out Today
                </span>
              ) : releaseStatus.isOut ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider bg-emerald-600/90 text-white shadow-md">
                  <CheckCircle2 size={11} />
                  Out Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-500 text-black shadow-md">
                  <Clock size={11} />
                  {releaseStatus.label}
                </span>
              )
            ) : null}

            {type && (
              <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-black/60 text-text-2 backdrop-blur-sm">
                {type === "movie" ? "Movie" : "Series"}
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          flex flex-col justify-end p-3 z-20"
          >
            <div className="flex items-center gap-1 mb-3">
              <StarRating rating={rating} />
              <Badge variant="accent" className="ml-auto scale-90 origin-right">
                {isOut ? "HD" : "Upcoming"}
              </Badge>
            </div>

            {releaseStatus && !isOut ? (
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-black rounded-md py-1.5 flex items-center justify-center gap-2 text-xs md:text-sm font-bold transition-colors shadow-lg shadow-amber-500/20">
                <Film size={14} />
                Coming Soon &bull; Details
              </button>
            ) : (
              <button className="w-full bg-accent hover:bg-accent/90 text-white rounded-md py-1.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                <Play size={14} fill="white" />
                Watch Now
              </button>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3">
          <h3 className="text-white text-sm font-medium truncate" title={title}>
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs mt-1">
            {releaseStatus ? (
              <span
                className={`truncate ${
                  releaseStatus.isToday
                    ? "text-emerald-400 font-semibold"
                    : releaseStatus.isOut
                    ? "text-emerald-400/90 font-medium"
                    : "text-amber-400 font-medium"
                }`}
              >
                {releaseStatus.isToday
                  ? "Today"
                  : releaseStatus.isOut
                  ? `Out (${releaseStatus.formattedDate.split(",")[0]})`
                  : releaseStatus.formattedDate.split(",")[0]}
              </span>
            ) : (
              <span className="text-text-2">{year}</span>
            )}

            {genre && <span className="ml-2 text-accent truncate text-[11px]">{genre}</span>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
