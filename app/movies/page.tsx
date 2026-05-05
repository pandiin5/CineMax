import { BrowsePage } from "@/components/layout/BrowsePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies — CINEMAX",
  description: "Browse popular movies.",
};

export default function MoviesPage() {
  return <BrowsePage type="movie" title="Popular Movies" />;
}
