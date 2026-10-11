export interface Server {
  id: string;
  name: string;
  shortName: string;
  quality: "4K" | "1080p" | "HD" | "Auto";
  tag: string;
  speed: "Ultra Fast" | "Fast" | "Stable";
  ping: string;
  isRecommended?: boolean;
  getUrl: (params: { type: "movie" | "tv"; id: number; season?: number; episode?: number }) => string;
}

export const SERVERS: Server[] = [
  {
    id: "vidlink",
    name: "Server 1 - VidLink (Ultra HD)",
    shortName: "VidLink (4K)",
    quality: "4K",
    tag: "4K Ultra HD & Multi-Subs",
    speed: "Ultra Fast",
    ping: "18ms",
    isRecommended: true,
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}`,
  },
  {
    id: "vidsrc-to",
    name: "Server 2 - VidSrc TO (1080p)",
    shortName: "VidSrc TO",
    quality: "1080p",
    tag: "Full HD 1080p",
    speed: "Ultra Fast",
    ping: "24ms",
    isRecommended: true,
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "vidsrc-me",
    name: "Server 3 - VidSrc Pro",
    shortName: "VidSrc Pro",
    quality: "1080p",
    tag: "High Speed CDN",
    speed: "Fast",
    ping: "28ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: "multiembed",
    name: "Server 4 - MultiEmbed",
    shortName: "MultiEmbed",
    quality: "1080p",
    tag: "Multi-Audio & Dubs",
    speed: "Fast",
    ping: "32ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "autoembed",
    name: "Server 5 - AutoEmbed",
    shortName: "AutoEmbed",
    quality: "HD",
    tag: "Buffer-Free Stream",
    speed: "Fast",
    ping: "38ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
  },
  {
    id: "2embed",
    name: "Server 6 - 2Embed",
    shortName: "2Embed",
    quality: "1080p",
    tag: "Backup 1080p Mirror",
    speed: "Stable",
    ping: "45ms",
    getUrl: ({ type, id, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
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
