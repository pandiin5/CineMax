import { create } from "zustand";

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "all" | "movie" | "tv";
  setActiveTab: (tab: "all" | "movie" | "tv") => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  activeTab: "all",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
