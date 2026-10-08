"use client";

import { SERVERS } from "@/lib/player";
import { Server as ServerIcon, Zap, Sparkles } from "lucide-react";

interface ServerSelectorProps {
  currentIndex: number;
  onSelectServer: (index: number) => void;
  className?: string;
}

export function ServerSelector({
  currentIndex,
  onSelectServer,
  className = "",
}: ServerSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-2">
        <div className="flex items-center gap-2 font-medium text-white">
          <ServerIcon size={14} className="text-accent" />
          <span>Switch Server / Source</span>
        </div>
        <div className="flex items-center gap-3 text-text-3">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium">All Servers Online</span>
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">If playback freezes or fails, switch server</span>
        </div>
      </div>

      {/* Server Pills Grid / Horizontal Scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
        {SERVERS.map((server, idx) => {
          const isActive = currentIndex === idx;

          return (
            <button
              key={server.id}
              onClick={() => onSelectServer(idx)}
              className={`group relative flex flex-col p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-accent/15 border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/50"
                  : "bg-surface hover:bg-surface-2 border-border hover:border-white/20"
              }`}
            >
              {/* Top row: Status pulse + Name */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isActive ? "bg-accent" : "bg-emerald-400"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isActive ? "bg-accent" : "bg-emerald-500"
                      }`}
                    ></span>
                  </span>
                  <span
                    className={`text-xs font-semibold truncate ${
                      isActive ? "text-accent" : "text-white group-hover:text-white"
                    }`}
                  >
                    {server.shortName}
                  </span>
                </div>

                {server.isRecommended && (
                  <span className="flex items-center gap-0.5 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                    <Sparkles size={10} />
                    Top
                  </span>
                )}
              </div>

              {/* Bottom row: Quality tag + Ping */}
              <div className="flex items-center justify-between text-[11px] text-text-2 mt-auto">
                <span
                  className={`px-1.5 py-0.5 rounded font-medium text-[10px] ${
                    server.quality === "4K"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : server.quality === "1080p"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-text-2 border border-white/10"
                  }`}
                >
                  {server.quality}
                </span>

                <span className="text-[10px] text-text-3 group-hover:text-text-2 transition-colors flex items-center gap-1">
                  <Zap size={9} className="text-emerald-400" />
                  {server.ping}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
