"use client";

import { use, useRef, useState } from "react";
import { useDetail } from "@/hooks/useTMDB";
import { DetailHero } from "@/components/detail/DetailHero";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { embedUrls } from "@/lib/player";
import { ContentRow } from "@/components/home/ContentRow";
import { Skeleton } from "@/components/ui/Skeleton";
import Image from "next/image";
import { tmdb } from "@/lib/tmdb";
import { MovieDetail } from "@/types/tmdb";

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = parseInt(unwrappedParams.id, 10);
  const { data, isLoading } = useDetail("movie", id);
  const playerRef = useRef<HTMLDivElement>(null);

  const sources = embedUrls.movie(id);
  const [sourceIndex, setSourceIndex] = useState(0);

  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSourceError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex(sourceIndex + 1);
    }
  };

  if (isLoading || !data) {
    return <div className="min-h-screen bg-bg flex items-center justify-center pt-20"><Skeleton className="w-full h-[80vh]" /></div>;
  }

  const movie = data as MovieDetail;

  return (
    <div className="bg-bg min-h-screen pb-20">
      <DetailHero item={movie} type="movie" onPlayClick={scrollToPlayer} />

      <div className="container mx-auto px-4 md:px-8 mt-12 space-y-16">
        {/* Player Section */}
        <div ref={playerRef} className="max-w-5xl mx-auto scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Watch Now</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-2">Server:</span>
              <select
                value={sourceIndex}
                onChange={(e) => setSourceIndex(parseInt(e.target.value, 10))}
                className="bg-surface border border-border text-white text-sm rounded-md px-3 py-1 outline-none focus:border-accent"
              >
                {sources.map((_, idx) => (
                  <option key={idx} value={idx}>
                    Server {idx + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <VideoPlayer
            src={sources[sourceIndex]}
            title={movie.title}
            onSourceError={sourceIndex < sources.length - 1 ? handleSourceError : undefined}
          />
        </div>

        {/* Cast Section */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Top Cast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
              {movie.credits.cast.slice(0, 10).map((actor) => (
                <div key={actor.id} className="min-w-[120px] md:min-w-[140px] snap-start flex flex-col items-center text-center">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden relative mb-3 ring-2 ring-border bg-surface-2 shrink-0">
                    {actor.profile_path ? (
                      <Image
                        src={tmdb.imgUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-3 text-xs">No Image</div>
                    )}
                  </div>
                  <h4 className="text-white text-sm font-medium mb-1">{actor.name}</h4>
                  <p className="text-text-2 text-xs">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {movie.similar?.results && movie.similar.results.length > 0 && (
          <ContentRow
            title="Similar Movies"
            items={movie.similar.results}
            isLoading={false}
            type="movie"
          />
        )}
      </div>
    </div>
  );
}
