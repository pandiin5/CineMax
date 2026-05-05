import { BrowsePage } from "@/components/layout/BrowsePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Series — CINEMAX",
  description: "Browse popular TV series.",
};

export default function SeriesPage() {
  return <BrowsePage type="tv" title="Popular Series" />;
}
