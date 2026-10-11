export interface UnifiedGenre {
  id: number;
  name: string;
  movieGenreId?: number;
  tvGenreId?: number;
}

export const UNIFIED_GENRES: UnifiedGenre[] = [
  { id: 28, name: "Action", movieGenreId: 28, tvGenreId: 10759 },
  { id: 12, name: "Adventure", movieGenreId: 12, tvGenreId: 10759 },
  { id: 16, name: "Animation", movieGenreId: 16, tvGenreId: 16 },
  { id: 35, name: "Comedy", movieGenreId: 35, tvGenreId: 35 },
  { id: 80, name: "Crime", movieGenreId: 80, tvGenreId: 80 },
  { id: 99, name: "Documentary", movieGenreId: 99, tvGenreId: 99 },
  { id: 18, name: "Drama", movieGenreId: 18, tvGenreId: 18 },
  { id: 10751, name: "Family", movieGenreId: 10751, tvGenreId: 10751 },
  { id: 14, name: "Fantasy", movieGenreId: 14, tvGenreId: 10765 },
  { id: 36, name: "History", movieGenreId: 36 },
  { id: 27, name: "Horror", movieGenreId: 27 },
  { id: 10762, name: "Kids", movieGenreId: 10751, tvGenreId: 10762 },
  { id: 10402, name: "Music", movieGenreId: 10402 },
  { id: 9648, name: "Mystery", movieGenreId: 9648, tvGenreId: 9648 },
  { id: 10764, name: "Reality", tvGenreId: 10764 },
  { id: 10749, name: "Romance", movieGenreId: 10749 },
  { id: 878, name: "Sci-Fi", movieGenreId: 878, tvGenreId: 10765 },
  { id: 53, name: "Thriller", movieGenreId: 53 },
  { id: 10752, name: "War", movieGenreId: 10752, tvGenreId: 10768 },
  { id: 37, name: "Western", movieGenreId: 37, tvGenreId: 37 },
];

export const GENRE_ID_TO_NAME: Record<number, string> = {
  // Movie genres
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",

  // TV genres
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

/**
 * Finds the unified genre configuration matching an ID (whether unified ID, movie ID, or TV ID)
 */
export function findUnifiedGenre(id: number | null | undefined): UnifiedGenre | undefined {
  if (!id) return undefined;
  return (
    UNIFIED_GENRES.find((g) => g.id === id) ||
    UNIFIED_GENRES.find((g) => g.movieGenreId === id) ||
    UNIFIED_GENRES.find((g) => g.tvGenreId === id)
  );
}

/**
 * Returns a readable genre name for a list of TMDB genre IDs
 */
export function getGenreNameFromIds(genreIds?: number[]): string | undefined {
  if (!genreIds || genreIds.length === 0) return undefined;
  for (const id of genreIds) {
    if (GENRE_ID_TO_NAME[id]) {
      return GENRE_ID_TO_NAME[id];
    }
    const unified = findUnifiedGenre(id);
    if (unified) {
      return unified.name;
    }
  }
  return undefined;
}
