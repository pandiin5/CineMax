"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  rating: number;
  year: string;
  type: "movie" | "tv";
}

export function MediaCard({ id, title, posterPath, rating, year, type }: MediaCardProps) {
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

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          flex flex-col justify-end p-3"
          >
            <div className="flex items-center gap-1 mb-3">
              <StarRating rating={rating} />
              <Badge variant="accent" className="ml-auto scale-90 origin-right">HD</Badge>
            </div>
            <button className="w-full bg-accent hover:bg-accent/90 text-white rounded-md py-1.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
              <Play size={14} fill="white" />
              Watch Now
            </button>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
          <p className="text-text-2 text-xs mt-1">{year}</p>
        </div>
      </motion.div>
    </Link>
  );
}
