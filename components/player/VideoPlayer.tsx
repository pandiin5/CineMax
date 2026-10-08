"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertCircle, Maximize2, Minimize2, RefreshCw, Server as ServerIcon, Zap } from "lucide-react";
import { SERVERS } from "@/lib/player";

interface VideoPlayerProps {
  src: string;
  title: string;
  serverIndex?: number;
  onServerChange?: (index: number) => void;
  onSourceError?: () => void;
}

export function VideoPlayer({
  src,
  title,
  serverIndex = 0,
  onServerChange,
  onSourceError,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentServer = SERVERS[serverIndex] || SERVERS[0];

  const checkFullscreen = useCallback(() => {
    const isDocFullscreen = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    setIsFullscreen(isDocFullscreen);
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("msfullscreenchange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("msfullscreenchange", checkFullscreen);
    };
  }, [checkFullscreen]);

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setShowServerMenu(false);
  }, [src]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      const isDocFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isDocFullscreen) {
        const elem = containerRef.current;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setShowServerMenu(false);
    }, 3500);
  };

  const handleNextServer = () => {
    if (onServerChange) {
      const nextIdx = (serverIndex + 1) % SERVERS.length;
      onServerChange(nextIdx);
    } else if (onSourceError) {
      onSourceError();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setShowControls(false);
        setShowServerMenu(false);
      }}
      className={`group relative w-full bg-black overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none flex items-center justify-center"
          : "aspect-video rounded-xl ring-1 ring-border"
      }`}
    >
      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-surface">
          <Skeleton className="w-full h-full rounded-none absolute inset-0" />
          <div className="relative z-20 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white font-medium text-sm flex items-center gap-2">
              <span>Connecting to {currentServer.name}...</span>
              <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                {currentServer.quality}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Overlay with One-Click Server Switch */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-2 z-20 text-text-2 p-6 text-center gap-4">
          <AlertCircle size={44} className="text-accent" />
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {currentServer.name} is currently unavailable
            </h3>
            <p className="text-xs text-text-2 max-w-md">
              Free embed servers occasionally update or rotate. Please switch to another server below:
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
            {SERVERS.map((server, idx) => (
              <button
                key={server.id}
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  onServerChange ? onServerChange(idx) : handleNextServer();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  serverIndex === idx
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-white hover:bg-surface-2 border-border hover:border-accent"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{server.shortName}</span>
                <span className="text-[10px] text-accent-2 font-bold ml-1">{server.quality}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNextServer}
            className="mt-2 bg-accent hover:bg-accent-2 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-accent/20"
          >
            <RefreshCw size={16} />
            Try Next Server
          </button>
        </div>
      ) : (
        <>
          <iframe
            key={src}
            src={src}
            title={title}
            className={`w-full h-full border-0 transition-opacity duration-500 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            allowFullScreen
            allow="autoplay; fullscreen *; picture-in-picture; xr-spatial-tracking; clipboard-write; encrypted-media; gyroscope; accelerometer"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />

          {/* Top Bar Floating Controls */}
          <div
            className={`absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
              showControls || isFullscreen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {/* Server Quick Badge / Selector Dropdown */}
            <div className="relative pointer-events-auto">
              <button
                onClick={() => setShowServerMenu(!showServerMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-medium shadow-lg hover:border-accent"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <ServerIcon size={14} className="text-accent" />
                <span>{currentServer.shortName}</span>
                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold text-[10px]">
                  {currentServer.quality}
                </span>
                <Zap size={12} className="text-emerald-400 ml-1" />
                <span className="text-[10px] text-text-2">{currentServer.ping}</span>
              </button>

              {/* Server Quick Menu in Overlay */}
              {showServerMenu && onServerChange && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl p-2 shadow-2xl z-40 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-text-2 uppercase tracking-wider">
                    Select Server (HD / 4K)
                  </div>
                  {SERVERS.map((server, idx) => (
                    <button
                      key={server.id}
                      onClick={() => {
                        onServerChange(idx);
                        setShowServerMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        serverIndex === idx
                          ? "bg-accent text-white font-semibold"
                          : "text-text-1 hover:bg-surface hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="truncate">{server.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-bold ml-2">
                        {server.quality}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top Right Controls: Fullscreen Button */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen (F)"}
                className="p-2.5 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-105 shadow-lg hover:border-accent cursor-pointer"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
