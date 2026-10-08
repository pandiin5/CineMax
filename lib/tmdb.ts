import {
  Movie,
  TVSeries,
  PaginatedResponse,
  MovieDetail,
  TVDetail,
  TVSeasonDetail,
} from "@/types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "844dba0bfd8f3a4f3799f6130ef9e335";
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

  byKeyword: (type: "movie" | "tv", keywordId: number, page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/discover/${type}?with_keywords=${keywordId}&page=${page}`),

  genres: (type: "movie" | "tv") =>
    fetchTMDB<{ genres: { id: number; name: string }[] }>(`/genre/${type}/list`),

  kdrama: (type: "movie" | "tv", page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/discover/${type}?with_original_language=ko&page=${page}`),

  seasons: (seriesId: number, seasonNumber: number) =>
    fetchTMDB<TVSeasonDetail>(`/tv/${seriesId}/season/${seasonNumber}`),

  imgUrl: (path: string | null | undefined, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500") =>
    path
      ? `${IMG_BASE}/${size}${path}`
      : "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22750%22%20viewBox%3D%220%200%20500%20750%22%3E%3Crect%20fill%3D%22%2312121A%22%20width%3D%22500%22%20height%3D%22750%22%2F%3E%3Ctext%20fill%3D%22%235A5A72%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22250%22%20y%3D%22375%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E",
};

