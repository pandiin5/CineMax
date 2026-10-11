"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useVideos } from "@/hooks/useTMDB";
import { Skeleton } from "@/components/ui/Skeleton";
import { Film, Play, VideoOff } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { VideoItem } from "@/types/tmdb";

interface TrailerPlayerProps {
  type: "movie" | "tv";
  id: number;
  title: string;
  backdropPath?: string | null;
  className?: string;
}

export function TrailerPlayer({
  type,
  id,
  title,
  backdropPath,
  className = "",
}: TrailerPlayerProps) {
  const { data, isLoading, isError } = useVideos(type, id);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pick the best official YouTube trailer
  const trailer = useMemo(() => {
    if (!data?.results || data.results.length === 0) return null;

    const youtubeVideos = data.results.filter(
      (v: VideoItem) => v.site?.toLowerCase() === "youtube" && Boolean(v.key)
    );

    if (youtubeVideos.length === 0) return null;

    // 1. Official Trailer
    const officialTrailer = youtubeVideos.find(
      (v: VideoItem) => v.type === "Trailer" && v.official === true
    );
    if (officialTrailer) return officialTrailer;

    // 2. Any Trailer
    const anyTrailer = youtubeVideos.find((v: VideoItem) => v.type === "Trailer");
    if (anyTrailer) return anyTrailer;

    // 3. Official Teaser
    const officialTeaser = youtubeVideos.find(
      (v: VideoItem) => v.type === "Teaser" && v.official === true
    );
    if (officialTeaser) return officialTeaser;

    // 4. Any Teaser
    const anyTeaser = youtubeVideos.find((v: VideoItem) => v.type === "Teaser");
    if (anyTeaser) return anyTeaser;

    // 5. Fallback to first YouTube video
    return youtubeVideos[0];
  }, [data]);

  if (isLoading) {
    return (
      <div className={`aspect-video w-full rounded-xl overflow-hidden ${className}`}>
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    );
  }

  // If there's no trailer, show the backdrop image instead
  if (!trailer || isError) {
    return (
      <div
        className={`relative aspect-video w-full rounded-xl overflow-hidden ring-1 ring-border bg-surface shadow-2xl ${className}`}
      >
        {backdropPath ? (
          <Image
            src={tmdb.imgUrl(backdropPath, "original")}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-3 bg-surface-2">
            <Film size={48} className="mb-2 opacity-50" />
            <p className="text-sm">No preview available</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex flex-col justify-end p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 backdrop-blur-md text-[11px] font-medium text-white border border-white/20">
              <VideoOff size={12} className="text-accent" />
              <span>No Official Trailer Available</span>
            </span>
          </div>
          <h3 className="text-xl md:text-3xl font-display text-white">{title}</h3>
          <p className="text-xs md:text-sm text-text-2 mt-1 max-w-xl">
            Official trailer is not provided by TMDB. Switch to Watch Full Title mode or browse legal providers below.
          </p>
        </div>
      </div>
    );
  }

  // Responsive 16:9 YouTube embed player
  return (
    <div
      className={`group relative aspect-video w-full rounded-xl overflow-hidden ring-1 ring-border bg-black shadow-2xl ${className}`}
    >
      {!isPlaying ? (
        /* Poster Preview with Play Button */
        <div className="relative w-full h-full">
          {backdropPath ? (
            <Image
              src={tmdb.imgUrl(backdropPath, "original")}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-surface-2" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 flex flex-col justify-between p-4 md:p-6">
            {/* Top row badge */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-xs font-semibold text-white border border-white/20 shadow-md">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>{trailer.type || "Trailer"}</span>
                {trailer.official && (
                  <span className="text-[10px] text-accent font-bold uppercase ml-1">
                    Official
                  </span>
                )}
              </span>

              <span className="text-xs text-text-2 bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm hidden sm:inline">
                YouTube &bull; 1080p
              </span>
            </div>

            {/* Center Big Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                aria-label="Play Trailer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent hover:bg-accent-2 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-accent/40 cursor-pointer group-hover:scale-105"
              >
                <Play size={28} fill="white" className="ml-1" />
              </button>
            </div>

            {/* Bottom Title Info */}
            <div className="pointer-events-none">
              <h3 className="text-lg md:text-2xl font-bold text-white truncate drop-shadow-md">
                {trailer.name || `${title} Official Trailer`}
              </h3>
              <p className="text-xs text-text-2 mt-0.5">Click to play trailer</p>
            </div>
          </div>
        </div>
      ) : (
        /* Embedded 16:9 YouTube Player */
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={`${title} - ${trailer.name}`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
