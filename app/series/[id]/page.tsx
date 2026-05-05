"use client";

import { use, useRef, useState, useEffect } from "react";
import { useDetail, useSeasons } from "@/hooks/useTMDB";
import { DetailHero } from "@/components/detail/DetailHero";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { embedUrls } from "@/lib/player";
import { ContentRow } from "@/components/home/ContentRow";
import { Skeleton } from "@/components/ui/Skeleton";
import Image from "next/image";
import { tmdb } from "@/lib/tmdb";
import { TVDetail } from "@/types/tmdb";
import { Play } from "lucide-react";

export default function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = parseInt(unwrappedParams.id, 10);
  const { data, isLoading } = useDetail("tv", id);
  const playerRef = useRef<HTMLDivElement>(null);

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [sourceIndex, setSourceIndex] = useState(0);

  // Restore last watched from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`cinemax_progress_tv_${id}`);
    if (savedState) {
      try {
        const { s, e } = JSON.parse(savedState);
        setSelectedSeason(s);
        setSelectedEpisode(e);
      } catch (e) {}
    }
  }, [id]);

  const { data: seasonData, isLoading: seasonLoading } = useSeasons(id, selectedSeason);

  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleEpisodeSelect = (episode: number) => {
    setSelectedEpisode(episode);
    setSourceIndex(0);
    localStorage.setItem(`cinemax_progress_tv_${id}`, JSON.stringify({ s: selectedSeason, e: episode }));
    scrollToPlayer();
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = parseInt(e.target.value, 10);
    setSelectedSeason(s);
    setSelectedEpisode(1);
    setSourceIndex(0);
  };

  if (isLoading || !data) {
    return <div className="min-h-screen bg-bg flex items-center justify-center pt-20"><Skeleton className="w-full h-[80vh]" /></div>;
  }

  const series = data as TVDetail;
  const validSeasons = series.seasons?.filter(s => s.season_number > 0) || [];

  const sources = embedUrls.series(id, selectedSeason, selectedEpisode);

  const handleSourceError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex(sourceIndex + 1);
    }
  };

  return (
    <div className="bg-bg min-h-screen pb-20">
      <DetailHero item={series} type="tv" onPlayClick={scrollToPlayer} />

      <div className="container mx-auto px-4 md:px-8 mt-12 space-y-16">
        {/* Player Section */}
        <div ref={playerRef} className="max-w-5xl mx-auto scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Watch Now</h2>
              <p className="text-text-2 text-sm">Season {selectedSeason} &bull; Episode {selectedEpisode}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedSeason}
                onChange={handleSeasonChange}
                className="bg-surface border border-border text-white text-sm rounded-md px-3 py-2 outline-none focus:border-accent"
              >
                {validSeasons.map((s) => (
                  <option key={s.id} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 hidden md:flex">
                <span className="text-sm text-text-2">Server:</span>
                <select
                  value={sourceIndex}
                  onChange={(e) => setSourceIndex(parseInt(e.target.value, 10))}
                  className="bg-surface border border-border text-white text-sm rounded-md px-3 py-2 outline-none focus:border-accent"
                >
                  {sources.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Server {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <VideoPlayer
            src={sources[sourceIndex]}
            title={`${series.name} S${selectedSeason} E${selectedEpisode}`}
            onSourceError={sourceIndex < sources.length - 1 ? handleSourceError : undefined}
          />
        </div>

        {/* Episodes List */}
        <section className="max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">Episodes</h3>
          {seasonLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasonData?.episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handleEpisodeSelect(ep.episode_number)}
                  className={`flex items-center gap-4 p-3 rounded-lg border text-left transition-colors group ${
                    selectedEpisode === ep.episode_number
                      ? "bg-accent/10 border-accent"
                      : "bg-surface border-border hover:bg-surface-2 hover:border-text-3"
                  }`}
                >
                  <div className="relative w-24 h-16 shrink-0 bg-surface-2 rounded overflow-hidden">
                    {ep.still_path ? (
                      <Image
                        src={tmdb.imgUrl(ep.still_path, "w342")}
                        alt={ep.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-3 text-xs">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={20} fill="white" className="text-white" />
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-sm font-medium truncate ${selectedEpisode === ep.episode_number ? "text-accent" : "text-white"}`}>
                      {ep.episode_number}. {ep.name}
                    </p>
                    <p className="text-xs text-text-2 mt-1 truncate">{ep.overview || "No description."}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Cast Section */}
        {series.credits?.cast && series.credits.cast.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Top Cast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
              {series.credits.cast.slice(0, 10).map((actor) => (
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

        {/* Similar Series */}
        {series.similar?.results && series.similar.results.length > 0 && (
          <ContentRow
            title="Similar Series"
            items={series.similar.results}
            isLoading={false}
            type="tv"
          />
        )}
      </div>
    </div>
  );
}
