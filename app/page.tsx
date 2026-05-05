"use client";

import { HeroBanner } from "@/components/home/HeroBanner";
import { ContentRow } from "@/components/home/ContentRow";
import { useTrending, usePopular, useTopRated } from "@/hooks/useTMDB";

export default function Home() {
  const { data: trendingMovies, isLoading: loadingTrendingM } = useTrending("movie", "week");
  const { data: popularMovies, isLoading: loadingPopularM } = usePopular("movie");
  const { data: popularSeries, isLoading: loadingPopularS } = usePopular("tv");
  const { data: topRatedMovies, isLoading: loadingTopRatedM } = useTopRated("movie");

  return (
    <>
      <HeroBanner />
      
      <div className="flex flex-col gap-4 py-8 relative z-30 -mt-24 md:-mt-32">
        <ContentRow
          title="Trending This Week"
          items={trendingMovies?.results || []}
          isLoading={loadingTrendingM}
          type="movie"
          href="/movies"
        />
        <ContentRow
          title="Popular Movies"
          items={popularMovies?.results || []}
          isLoading={loadingPopularM}
          type="movie"
          href="/movies"
        />
        <ContentRow
          title="Popular Series"
          items={popularSeries?.results || []}
          isLoading={loadingPopularS}
          type="tv"
          href="/series"
        />
        <ContentRow
          title="Top Rated Movies"
          items={topRatedMovies?.results || []}
          isLoading={loadingTopRatedM}
          type="movie"
          href="/movies"
        />
      </div>
    </>
  );
}
