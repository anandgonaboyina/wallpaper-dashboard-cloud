"use client";
import { useState, useEffect } from 'react';
import { useDashboardStore } from "@/store/dashboardStore";

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
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine active source
  let bgSrc = "/wallpapers/naruto.webp"; // Default fallback
  
  if (isMobile && activeMobileCustomIndex !== null && customMobileWallpapers[activeMobileCustomIndex]) {
    bgSrc = customMobileWallpapers[activeMobileCustomIndex];
  } else if (!isMobile && activeDesktopCustomIndex !== null && customDesktopWallpapers[activeDesktopCustomIndex]) {
    bgSrc = customDesktopWallpapers[activeDesktopCustomIndex];
  }

  const isVideo = bgSrc.toLowerCase().endsWith('.mp4') || bgSrc.toLowerCase().endsWith('.webm');

  return (
    <>
      {isVideo ? (
        <video
          key={bgSrc}
          src={bgSrc}
          autoPlay
          muted
          loop
          playsInline
          className={`fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000 ${isPanicHidden ? 'opacity-0' : 'opacity-100'}`}
        />
      ) : (
        <img
          key={bgSrc}
          src={bgSrc}
          alt="Wallpaper"
          className={`fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000 ${isPanicHidden ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </>
  );
}
