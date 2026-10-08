export interface Server {
  id: string;
  name: string;
  shortName: string;
  quality: "4K" | "1080p" | "HD" | "Auto";
  tag: string;
  speed: "Ultra Fast" | "Fast" | "Stable";
  ping: string; // e.g. "24ms", "38ms"
  isRecommended?: boolean;
  getUrl: (params: { type: "movie" | "tv"; id: number; season?: number; episode?: number }) => string;
}

export const SERVERS: Server[] = [
  {
    id: "embedsu",
    name: "Server 1 - EmbedSU",
    shortName: "EmbedSU",
    quality: "4K",
    tag: "4K Ultra HD",
    speed: "Ultra Fast",
    ping: "21ms",
    isRecommended: true,
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "vidsrc-me",
    name: "Server 2 - VidSrc Pro",
    shortName: "VidSrc Pro",
    quality: "1080p",
    tag: "Full HD 1080p",
    speed: "Ultra Fast",
    ping: "28ms",
    isRecommended: true,
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: "multiembed",
    name: "Server 3 - MultiEmbed",
    shortName: "MultiEmbed",
    quality: "1080p",
    tag: "Multi-Audio & Subs",
    speed: "Fast",
    ping: "35ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "vidsrc-cc",
    name: "Server 4 - VidSrc CC",
    shortName: "VidSrc CC",
    quality: "1080p",
    tag: "Auto Subtitles",
    speed: "Fast",
    ping: "42ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "autoembed",
    name: "Server 5 - AutoEmbed",
    shortName: "AutoEmbed",
    quality: "HD",
    tag: "Buffer-Free",
    speed: "Fast",
    ping: "48ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
  },
  {
    id: "vidsrc-vip",
    name: "Server 6 - VidSrc VIP",
    shortName: "VidSrc VIP",
    quality: "1080p",
    tag: "VIP High Speed",
    speed: "Fast",
    ping: "39ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.vip/embed/movie/${id}`
        : `https://vidsrc.vip/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "smashystream",
    name: "Server 7 - SmashyStream",
    shortName: "SmashyStream",
    quality: "HD",
    tag: "Direct Stream",
    speed: "Stable",
    ping: "54ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://player.smashy.stream/movie/${id}`
        : `https://player.smashy.stream/tv/${id}?s=${season}&e=${episode}`,
  },
  {
    id: "vidsrc-rip",
    name: "Server 8 - VidSrc Rip",
    shortName: "VidSrc Rip",
    quality: "HD",
    tag: "Backup Mirror",
    speed: "Stable",
    ping: "60ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.rip/embed/movie/${id}`
        : `https://vidsrc.rip/embed/tv/${id}/${season}/${episode}`,
  },
];

// Helper for getting list of URLs for movie or series
export const getPlayerUrls = (
  type: "movie" | "tv",
  id: number,
  season = 1,
  episode = 1
) => {
  return SERVERS.map((server) => server.getUrl({ type, id, season, episode }));
};

// Backward-compatible embedUrls object
export const embedUrls = {
  movie: (id: number) => getPlayerUrls("movie", id),
  series: (id: number, season: number, episode: number) =>
    getPlayerUrls("tv", id, season, episode),
};
