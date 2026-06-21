'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function DraggableClock({ children }: { children: React.ReactNode }) {
  const { currentBgSrc, clockOffsets, updateClockOffset, resetClockOffset, lockedWidgets, isTimetableOpen } = useDashboardStore();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  // Sync with store when background changes
  useEffect(() => {
    if (currentBgSrc && clockOffsets[currentBgSrc]) {
      setPosition(clockOffsets[currentBgSrc]);
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [currentBgSrc, clockOffsets]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (lockedWidgets.includes('clock')) return;

    // Only allow dragging on the wrapper itself, not on interactive children (buttons, toggles)
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.cursor-pointer')) {
      // If they clicked a button inside, let the button handle it
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    setPosition({
      x: startOffset.current.x + dx,
      y: startOffset.current.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Save to store
    if (currentBgSrc) {
      updateClockOffset(currentBgSrc, position.x, position.y);
    }
  };

  const handleDoubleClick = () => {
    if (currentBgSrc) {
      resetClockOffset(currentBgSrc);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div 
      className={`relative inline-block w-fit h-fit p-8 pointer-events-auto outline-none focus:outline-none transition-transform ${!isDragging ? 'duration-300' : 'duration-0'} ${lockedWidgets.includes('clock') ? '' : 'cursor-move'} group`}
      style={{ 
        transform: isTimetableOpen ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      title={lockedWidgets.includes('clock') ? '' : "Drag to move. Double-click to reset position."}
    >
      {!lockedWidgets.includes('clock') && (
        <div className={`absolute inset-0 border-2 border-white/20 bg-white/5 rounded-3xl opacity-0 transition-opacity pointer-events-none ${isDragging ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
      )}
      <div className="relative pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
