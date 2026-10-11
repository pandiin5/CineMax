"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { ServerSelector } from "@/components/player/ServerSelector";
import { TrailerPlayer } from "@/components/player/TrailerPlayer";
import { SERVERS } from "@/lib/player";
import { Play, Video, Sparkles, Film } from "lucide-react";

interface DualModePlayerProps {
  type: "movie" | "tv";
  id: number;
  title: string;
  backdropPath?: string | null;
  season?: number;
  episode?: number;
  className?: string;
}

export function DualModePlayer({
  type,
  id,
  title,
  backdropPath,
  season = 1,
  episode = 1,
  className = "",
}: DualModePlayerProps) {
  const [activeTab, setActiveTab] = useState<"stream" | "trailer">("stream");
  const [sourceIndex, setSourceIndex] = useState(0);

  const currentServer = SERVERS[sourceIndex] || SERVERS[0];
  const streamUrl = currentServer.getUrl({ type, id, season, episode });

  const handleSourceError = () => {
    if (sourceIndex < SERVERS.length - 1) {
      setSourceIndex(sourceIndex + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Player Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border p-1.5 rounded-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("stream")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "stream"
                ? "bg-accent text-white shadow-lg shadow-accent/25"
                : "text-text-2 hover:text-white hover:bg-surface-2"
            }`}
          >
            <Play size={15} fill={activeTab === "stream" ? "white" : "none"} />
            <span>Watch Full {type === "movie" ? "Movie" : "Series"}</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white">
              <Sparkles size={10} className="text-yellow-400" />
              HD / 4K
            </span>
          </button>

          <button
            onClick={() => setActiveTab("trailer")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "trailer"
                ? "bg-accent text-white shadow-lg shadow-accent/25"
                : "text-text-2 hover:text-white hover:bg-surface-2"
            }`}
          >
            <Video size={15} />
            <span>Official Trailer</span>
          </button>
        </div>

        {/* Server Quality Indicator badge */}
        {activeTab === "stream" && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-3 px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-medium">{currentServer.shortName}</span>
            <span>&bull;</span>
            <span className="text-text-2">{currentServer.quality} Ultra HD</span>
          </div>
        )}
      </div>

      {/* Active Player View */}
      {activeTab === "stream" ? (
        <div className="space-y-4">
          <VideoPlayer
            src={streamUrl}
            title={title}
            serverIndex={sourceIndex}
            onServerChange={setSourceIndex}
            onSourceError={handleSourceError}
          />

          <ServerSelector
            currentIndex={sourceIndex}
            onSelectServer={setSourceIndex}
            className="pt-1"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <TrailerPlayer
            type={type}
            id={id}
            title={title}
            backdropPath={backdropPath}
          />
        </div>
      )}
    </div>
  );
}
