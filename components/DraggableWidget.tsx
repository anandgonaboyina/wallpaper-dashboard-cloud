'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function DraggableWidget({ id, children }: { id: string, children: React.ReactNode }) {
  const { currentBgSrc, widgetOffsets, updateWidgetOffset, lockedWidgets, widgetZIndices, bringToFront } = useDashboardStore();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });
  const latestPos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync with store when background changes
  useEffect(() => {
    if (currentBgSrc && widgetOffsets[currentBgSrc]?.[id]) {
      setPosition(widgetOffsets[currentBgSrc][id]);
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [currentBgSrc, widgetOffsets, id]);

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
    if (currentBgSrc) {
      updateWidgetOffset(currentBgSrc, id, latestPos.current.x, latestPos.current.y);
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
