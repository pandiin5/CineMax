import {
  Movie,
  TVSeries,
  PaginatedResponse,
  MovieDetail,
  TVDetail,
  TVSeasonDetail,
} from "@/types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p";

async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${TMDB_BASE}${endpoint}${separator}api_key=${TMDB_KEY}`;
  
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch TMDB: ${res.statusText}`);
  }
  return res.json();
}

export const tmdb = {
  trending: (type: "movie" | "tv", window: "day" | "week" = "day") =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/trending/${type}/${window}`),

  popular: (type: "movie" | "tv", page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/${type}/popular?page=${page}`),

  topRated: (type: "movie" | "tv", page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/${type}/top_rated?page=${page}`),

  detail: (type: "movie" | "tv", id: number) =>
    fetchTMDB<MovieDetail | TVDetail>(`/${type}/${id}?append_to_response=credits,similar,videos`),

  search: (query: string, page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`),

  byGenre: (type: "movie" | "tv", genreId: number, page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/discover/${type}?with_genres=${genreId}&page=${page}`),

  seasons: (seriesId: number, seasonNumber: number) =>
    fetchTMDB<TVSeasonDetail>(`/tv/${seriesId}/season/${seasonNumber}`),

  imgUrl: (path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500") =>
    path ? `${IMG_BASE}/${size}${path}` : "/placeholder.png", // We will need a placeholder
};
