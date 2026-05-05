export const embedUrls = {
  movie: (id: number) => [
    `https://vidlink.pro/movie/${id}`,
    `https://vidsrc.rip/embed/movie/${id}`,
    `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    `https://vidsrc.me/embed/movie?tmdb=${id}`,
    `https://embed.su/embed/movie/${id}`,
  ],
  series: (id: number, season: number, episode: number) => [
    `https://vidlink.pro/tv/${id}/${season}/${episode}`,
    `https://vidsrc.rip/embed/tv/${id}/${season}/${episode}`,
    `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
    `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  ],
};
