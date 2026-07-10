export const embedUrls = {
  movie: (id: number) => [
    `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    `https://vidsrc.me/embed/movie?tmdb=${id}`,
    `https://vidsrc.cc/v2/embed/movie/${id}`,
    `https://autoembed.co/movie/tmdb/${id}`,
    `https://vidsrc.in/embed/movie?tmdb=${id}`,
    `https://vidsrc.rip/embed/movie/${id}`,
    `https://embed.su/embed/movie/${id}`,
  ],
  series: (id: number, season: number, episode: number) => [
    `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
    `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
    `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
    `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
    `https://vidsrc.in/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
    `https://vidsrc.rip/embed/tv/${id}/${season}/${episode}`,
    `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  ],
};

