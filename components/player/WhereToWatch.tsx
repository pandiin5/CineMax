"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useWatchProviders } from "@/hooks/useTMDB";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExternalLink, Globe, Tv, AlertCircle, Bookmark, Check } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { MovieDetail, TVDetail, WatchProviderItem } from "@/types/tmdb";

interface WhereToWatchProps {
  type: "movie" | "tv";
  id: number;
  item?: MovieDetail | TVDetail;
  className?: string;
}

const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
];

export function WhereToWatch({ type, id, item, className = "" }: WhereToWatchProps) {
  const { data, isLoading, isError } = useWatchProviders(type, id);
  const [selectedCountry, setSelectedCountry] = useState<string>("PH");
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const isSaved = item ? isInWatchlist(item.id) : false;

  const handleWatchlistToggle = () => {
    if (!item) return;
    if (isSaved) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item as any, type);
    }
  };

  // Extract all available countries from TMDB response
  const availableCountries = useMemo(() => {
    const list = [...COUNTRIES];
    if (data?.results) {
      const resultCodes = Object.keys(data.results);
      for (const code of resultCodes) {
        if (!list.some((c) => c.code === code)) {
          list.push({ code, name: code, flag: "🌐" });
        }
      }
    }
    return list;
  }, [data]);

  const countryData = data?.results?.[selectedCountry];
  const streamProviders = countryData?.flatrate || [];
  const rentProviders = countryData?.rent || [];
  const buyProviders = countryData?.buy || [];
  const watchLink = countryData?.link;

  const hasAnyProviders =
    streamProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0;

  const renderProviderGrid = (providers: WatchProviderItem[], categoryLabel: string) => {
    if (!providers || providers.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider flex items-center gap-2">
          <span>{categoryLabel}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-surface-2 text-text-3 rounded-full">
            {providers.length}
          </span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {providers.map((provider) => (
            <a
              key={provider.provider_id}
              href={watchLink || `https://www.themoviedb.org/${type}/${id}/watch`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 p-2.5 rounded-xl border bg-surface hover:bg-surface-2 border-border hover:border-accent transition-all duration-200 cursor-pointer shadow-md hover:shadow-accent/10"
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border bg-surface-2">
                {provider.logo_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${provider.logo_path}`}
                    alt={provider.provider_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-3">
                    Logo
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-white group-hover:text-accent transition-colors truncate block">
                  {provider.provider_name}
                </span>
                <span className="text-[10px] text-text-3 group-hover:text-text-2 flex items-center gap-1 transition-colors">
                  <span>{categoryLabel}</span>
                  <ExternalLink size={9} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
            <Tv size={16} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Where to Watch</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Legal Sources
              </span>
            </h3>
            <p className="text-xs text-text-3">
              Official streaming, rental, and purchase providers
            </p>
          </div>
        </div>

        {/* Controls: Country selector & Watchlist Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {item && (
            <button
              onClick={handleWatchlistToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isSaved
                  ? "bg-accent text-white border-accent shadow-sm shadow-accent/20"
                  : "bg-surface hover:bg-surface-2 text-text-2 hover:text-white border-border"
              }`}
            >
              {isSaved ? <Check size={13} /> : <Bookmark size={13} />}
              <span>{isSaved ? "In Watchlist" : "Save to Watchlist"}</span>
            </button>
          )}

          {/* Country Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-white">
            <Globe size={13} className="text-accent" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer pr-1"
            >
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code} className="bg-surface text-white">
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3 text-text-2 text-xs">
          <AlertCircle size={16} className="text-accent shrink-0" />
          <span>Unable to load streaming providers at this time. Please try again later.</span>
        </div>
      ) : hasAnyProviders ? (
        <div className="space-y-5">
          {renderProviderGrid(streamProviders, "Stream")}
          {renderProviderGrid(rentProviders, "Rent")}
          {renderProviderGrid(buyProviders, "Buy")}
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 rounded-xl bg-surface border border-border flex flex-col items-center justify-center text-center space-y-2">
          <Tv size={28} className="text-text-3 opacity-60" />
          <p className="text-sm font-semibold text-white">
            Not available to stream in your country yet.
          </p>
          <p className="text-xs text-text-3 max-w-md">
            No official streaming, rental, or purchase options are currently listed for{" "}
            <span className="text-text-2 font-medium">
              {availableCountries.find((c) => c.code === selectedCountry)?.name || selectedCountry}
            </span>
            . Try selecting another region from the dropdown.
          </p>
        </div>
      )}

      {/* Required JustWatch Attribution */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-text-3 border-t border-border/40">
        <span className="flex items-center gap-1.5">
          <span>Streaming data provided by</span>
          <a
            href="https://www.justwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-2 hover:text-accent font-semibold transition-colors underline decoration-text-3"
          >
            JustWatch
          </a>
          <span>.</span>
        </span>

        {watchLink && (
          <a
            href={watchLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-3 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
          >
            <span>View all regions on TMDB</span>
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
