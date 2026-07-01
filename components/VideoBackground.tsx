"use client";
import { useState, useEffect } from 'react';
import { useDashboardStore } from "@/store/dashboardStore";
import { useWallpaperUrl } from "@/hooks/useWallpaperUrl";

export default function VideoBackground() {
  const isPanicHidden = useDashboardStore((state) => state.isPanicHidden);
  const { 
    customDesktopWallpapers, 
    activeDesktopCustomIndex, 
    customMobileWallpapers, 
    activeMobileCustomIndex 
  } = useDashboardStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => window.innerWidth <= 768;

    setIsMobile(checkMobile());
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine active source
  let bgSrc = isMobile ? "/wallpapers/defaultWallpaper2.jpeg" : "/wallpapers/naruto.webp"; // Default fallback
  
  if (isMobile && activeMobileCustomIndex !== null && customMobileWallpapers[activeMobileCustomIndex]) {
    bgSrc = customMobileWallpapers[activeMobileCustomIndex];
  } else if (!isMobile && activeDesktopCustomIndex !== null && customDesktopWallpapers[activeDesktopCustomIndex]) {
    bgSrc = customDesktopWallpapers[activeDesktopCustomIndex];
  }

  const { resolvedUrl, isVideo } = useWallpaperUrl(bgSrc);

  if (!resolvedUrl) return null;

  return (
    <>
      {isVideo ? (
        <video
          key={resolvedUrl}
          src={resolvedUrl}
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000 opacity-100"
        />
      ) : (
        <img
          key={resolvedUrl}
          src={resolvedUrl}
          alt="Wallpaper"
          className="fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000 opacity-100"
        />
      )}
    </>
  );
}
