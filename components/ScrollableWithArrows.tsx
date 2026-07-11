'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollableWithArrowsProps {
  children: React.ReactNode;
  className?: string;
  hideArrows?: boolean;
  downArrowOffset?: string;
}

export default function ScrollableWithArrows({ children, className = '', hideArrows = false, downArrowOffset = 'bottom-2' }: ScrollableWithArrowsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  };

  const scrollBy = (direction: 'up' | 'down') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: direction === 'up' ? -150 : 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(checkScroll, 100);
    // Add resize listener in case container changes size
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  // Drag to scroll logic
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const dragMode = useRef<'content' | 'scrollbar'>('content');

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    // Don't interfere with inputs or buttons
    if (e.button !== 0 || target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.closest('button')) return;
    
    isDragging.current = true;
    if (scrollRef.current) {
      startY.current = e.pageY;
      startScrollTop.current = scrollRef.current.scrollTop;
      
      const scrollbarWidth = currentTarget.offsetWidth - currentTarget.clientWidth;
      if (scrollbarWidth > 0 && e.clientX >= currentTarget.getBoundingClientRect().right - scrollbarWidth) {
        dragMode.current = 'scrollbar';
      } else {
        dragMode.current = 'content';
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
      }
      try {
        currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    
    const y = e.pageY;
    const walk = y - startY.current;
    
    if (dragMode.current === 'scrollbar') {
      // Dragging native scrollbar thumb down -> content moves down
      const ratio = scrollRef.current.scrollHeight / scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = startScrollTop.current + (walk * ratio);
    } else {
      // Panning content down -> content moves up
      scrollRef.current.scrollTop = startScrollTop.current - (walk * 1.5);
    }
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
      scrollRef.current.style.userSelect = '';
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col group/scrollable h-full">


      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onPointerCancel={handlePointerUpOrLeave}
        onWheel={(e) => { 
          e.stopPropagation(); 
          e.currentTarget.scrollTop += e.deltaY; 
          checkScroll(); 
        }}
        className={`flex-1 overflow-y-auto hidden-scrollbar ${className}`}
      >
        {children}
      </div>


    </div>
  );
}
