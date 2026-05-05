export const embedUrls = {
  movie: (id: number) => [
    `https://vidsrc.cc/v2/embed/movie/${id}`,
    `https://vidsrc.me/embed/movie?tmdb=${id}`,
    `https://vidsrc.to/embed/movie/${id}`,
    `https://www.2embed.cc/embed/${id}`,
    `https://embed.su/embed/movie/${id}`,
  ],
  series: (id: number, season: number, episode: number) => [
    `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
    `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
    `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  ],
};
