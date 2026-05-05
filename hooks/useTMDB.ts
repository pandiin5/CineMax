import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { MovieDetail, TVDetail } from "@/types/tmdb";

export function useTrending(type: "movie" | "tv", window: "day" | "week" = "day") {
  return useQuery({
    queryKey: ["trending", type, window],
    queryFn: () => tmdb.trending(type, window),
  });
}

export function usePopular(type: "movie" | "tv", page = 1) {
  return useQuery({
    queryKey: ["popular", type, page],
    queryFn: () => tmdb.popular(type, page),
  });
}

export function useTopRated(type: "movie" | "tv", page = 1) {
  return useQuery({
    queryKey: ["topRated", type, page],
    queryFn: () => tmdb.topRated(type, page),
  });
}

export function useDetail(type: "movie" | "tv", id: number) {
  return useQuery({
    queryKey: ["detail", type, id],
    queryFn: () => tmdb.detail(type, id) as Promise<MovieDetail | TVDetail>,
  });
}

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: () => tmdb.search(query, page),
    enabled: query.length > 0,
  });
}

export function useByGenre(type: "movie" | "tv", genreId: number, page = 1) {
  return useQuery({
    queryKey: ["genre", type, genreId, page],
    queryFn: () => tmdb.byGenre(type, genreId, page),
  });
}

export function useSeasons(seriesId: number, seasonNumber: number) {
  return useQuery({
    queryKey: ["season", seriesId, seasonNumber],
    queryFn: () => tmdb.seasons(seriesId, seasonNumber),
  });
}
