import {
  Movie,
  TVSeries,
  PaginatedResponse,
  MovieDetail,
  TVDetail,
  TVSeasonDetail,
  WatchProvidersResponse,
  VideosResponse,
} from "@/types/tmdb";

import { UnifiedGenre } from "@/lib/genres";

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
  trending: (type: "movie" | "tv" | "all" = "movie", window: "day" | "week" = "day", page = 1) =>
    fetchTMDB<PaginatedResponse<Movie | TVSeries>>(`/trending/${type}/${window}?page=${page}`),

  discover: <T extends "movie" | "tv">(
    type: T,
    params: {
      year?: number;
      genreId?: number;
      page?: number;
      sortBy?: string;
    } = {}
  ): Promise<PaginatedResponse<T extends "movie" ? Movie : TVSeries>> => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page || 1));
    searchParams.set("sort_by", params.sortBy || "popularity.desc");

    if (params.genreId) {
      searchParams.set("with_genres", String(params.genreId));
    }

    if (params.year) {
      if (type === "movie") {
        searchParams.set("primary_release_year", String(params.year));
      } else {
        searchParams.set("first_air_date_year", String(params.year));
      }
    }

    return fetchTMDB<PaginatedResponse<T extends "movie" ? Movie : TVSeries>>(
      `/discover/${type}?${searchParams.toString()}`
    );
  },

  discoverCombined: async (
    params: {
      year?: number | null;
      genreConfig?: UnifiedGenre | null;
      page?: number;
    } = {}
  ): Promise<{
    results: (Movie | TVSeries)[];
    page: number;
    hasMore: boolean;
    totalPages: number;
    totalResults: number;
  }> => {
    const page = params.page || 1;
    const hasGenre = !!params.genreConfig;
    const fetchMovie = !hasGenre || params.genreConfig?.movieGenreId !== undefined;
    const fetchTv = !hasGenre || params.genreConfig?.tvGenreId !== undefined;

    const [movieRes, tvRes] = await Promise.all([
      fetchMovie
        ? tmdb.discover("movie", {
          year: params.year ?? undefined,
          genreId: params.genreConfig?.movieGenreId,
          page,
        })
        : Promise.resolve({ page, results: [] as Movie[], total_pages: 0, total_results: 0 }),
      fetchTv
        ? tmdb.discover("tv", {
          year: params.year ?? undefined,
          genreId: params.genreConfig?.tvGenreId,
          page,
        })
        : Promise.resolve({ page, results: [] as TVSeries[], total_pages: 0, total_results: 0 }),
    ]);

    const movies: Movie[] = (movieRes.results || []).map((m) => ({
      ...m,
      media_type: "movie" as const,
    }));
    const tvSeries: TVSeries[] = (tvRes.results || []).map((t) => ({
      ...t,
      media_type: "tv" as const,
    }));

    const combined: (Movie | TVSeries)[] = [...movies, ...tvSeries].sort(
      (a, b) => ((b as any).popularity ?? 0) - ((a as any).popularity ?? 0)
    );

    const hasMore =
      (fetchMovie && movieRes.page < movieRes.total_pages) ||
      (fetchTv && tvRes.page < tvRes.total_pages);

    return {
      results: combined,
      page,
      hasMore,
      totalPages: Math.max(movieRes.total_pages, tvRes.total_pages),
      totalResults: (movieRes.total_results || 0) + (tvRes.total_results || 0),
    };
  },

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

  watchProviders: async (type: "movie" | "tv", id: number): Promise<WatchProvidersResponse> => {
    const res = await fetch(`/api/tmdb/watch-providers?type=${type}&id=${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch watch providers: ${res.statusText}`);
    }
    return res.json();
  },

  videos: async (type: "movie" | "tv", id: number): Promise<VideosResponse> => {
    const res = await fetch(`/api/tmdb/videos?type=${type}&id=${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch videos: ${res.statusText}`);
    }
    return res.json();
  },

  imgUrl: (path: string | null | undefined, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500") =>
    path
      ? `${IMG_BASE}/${size}${path}`
      : "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22750%22%20viewBox%3D%220%200%20500%20750%22%3E%3Crect%20fill%3D%22%2312121A%22%20width%3D%22500%22%20height%3D%22750%22%2F%3E%3Ctext%20fill%3D%22%235A5A72%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22250%22%20y%3D%22375%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E",
};
