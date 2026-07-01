'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function DraggableWidget({ id, children }: { id: string, children: React.ReactNode }) {
  const { 
    widgetOffsets, 
    updateWidgetOffset, 
    lockedWidgets, 
    widgetZIndices, 
    bringToFront,
    customDesktopWallpapers, 
    activeDesktopCustomIndex, 
    customMobileWallpapers, 
    activeMobileCustomIndex 
  } = useDashboardStore();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });
  const latestPos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [activeBgSrc, setActiveBgSrc] = useState<string>('');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = () => setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    let bgSrc = isMobile ? "/wallpapers/defaultWallpaper2.jpeg" : "/wallpapers/naruto.webp";
    if (isMobile && activeMobileCustomIndex !== null && customMobileWallpapers[activeMobileCustomIndex]) {
      bgSrc = customMobileWallpapers[activeMobileCustomIndex];
    } else if (!isMobile && activeDesktopCustomIndex !== null && customDesktopWallpapers[activeDesktopCustomIndex]) {
      bgSrc = customDesktopWallpapers[activeDesktopCustomIndex];
    }
    setActiveBgSrc(bgSrc);
  }, [isMobile, activeMobileCustomIndex, customMobileWallpapers, activeDesktopCustomIndex, customDesktopWallpapers]);

  // Sync with store when background changes
  useEffect(() => {
    if (activeBgSrc && widgetOffsets[activeBgSrc]?.[id]) {
      setPosition(widgetOffsets[activeBgSrc][id]);
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [activeBgSrc, widgetOffsets, id]);

  const isLocked = lockedWidgets.includes(id) || (isMobile && id === 'countdowns');

  const handlePointerDown = (e: React.PointerEvent) => {
    bringToFront(id);
    if (isLocked) return;
    
    // Only allow dragging on the wrapper itself, not on interactive children
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('.cursor-pointer') || 
      target.tagName.toLowerCase() === 'input' ||
      target.tagName.toLowerCase() === 'textarea' ||
      target.closest('.overflow-y-auto') // Don't drag when clicking scroll areas
    ) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...position };
    latestPos.current = { ...position }; // Ensure latestPos matches current position if they just click without moving
    target.setPointerCapture(e.pointerId);
    console.log(`[DraggableWidget] Started dragging widget: ${id}`);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    const newPos = {
      x: startOffset.current.x + dx,
      y: startOffset.current.y + dy
    };
    setPosition(newPos);
    latestPos.current = newPos;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Save to store
    // Save to store using the guaranteed latest position
    if (activeBgSrc) {
      updateWidgetOffset(activeBgSrc, id, latestPos.current.x, latestPos.current.y);
    }
  };

  return (
    <div
      id={id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate(${isMobile && id === 'countdowns' ? 0 : position.x}px, ${isMobile && id === 'countdowns' ? 0 : position.y}px)`,
        zIndex: widgetZIndices?.[id] || 50,
        cursor: isLocked ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: 'none',
        userSelect: isDragging ? 'none' : 'auto'
      }}
      className={`w-fit h-fit pointer-events-auto outline-none focus:outline-none transition-transform duration-75 ${isLocked ? '' : 'hover:outline hover:outline-1 hover:outline-white/10 rounded-3xl'}`}
    >
      {children}
    </div>
  );
}
