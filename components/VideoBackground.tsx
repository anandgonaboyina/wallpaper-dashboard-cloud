"use client";
import { useDashboardStore } from "@/store/dashboardStore";

export default function VideoBackground() {
  const isPanicHidden = useDashboardStore((state) => state.isPanicHidden);

  return (
    <img
      src="/wallpapers/naruto.webp"
      alt="Wallpaper"
      className="fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000"
    />
  );
}
