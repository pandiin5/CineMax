"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
  onSourceError?: () => void;
}

export function VideoPlayer({ src, title, onSourceError }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-border">
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute text-text-2 animate-pulse font-medium">Loading Player...</div>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-2 z-20 text-text-2 gap-4">
          <AlertCircle size={48} className="text-accent" />
          <p className="font-medium text-white">This source is unavailable.</p>
          {onSourceError && (
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                onSourceError();
              }}
              className="bg-surface border border-border px-4 py-2 rounded hover:bg-white/5 transition-colors"
            >
              Try another server
            </button>
          )}
        </div>
      ) : (
        <iframe
          src={src}
          title={title}
          className={`w-full h-full border-0 transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking; clipboard-write"
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
