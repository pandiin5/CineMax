export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
}

export interface TVSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  character: string;
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string;
  credits?: {
    cast: CastMember[];
  };
  similar?: PaginatedResponse<Movie>;
  videos?: {
    results: Video[];
  };
}

export interface TVDetail extends TVSeries {
  genres: Genre[];
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  tagline: string;
  seasons: TVSeason[];
  credits?: {
    cast: CastMember[];
  };
  similar?: PaginatedResponse<TVSeries>;
  videos?: {
    results: Video[];
  };
}

export interface TVSeason {
  id: number;
  air_date: string;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TVEpisode {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TVSeasonDetail extends TVSeason {
  episodes: TVEpisode[];
}
