'use client';

import { useState, useEffect, useRef } from 'react';
import { Target, Calendar, ListTodo, Trophy, Pin, Cloud } from 'lucide-react';

const features = [
  { id: 1, title: 'Unified Workspace', desc: 'Eliminate distractions with a clean, centralized hub. Stay deeply focused, organize your day, and crush your daily objectives from anywhere.', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 2, title: 'Smart Timetable', desc: 'Take absolute control of your schedule. Use our precision interactive, draggable timetable to map out every hour of your workflow.', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 3, title: 'Task Management', desc: 'Never miss a deadline again. Stay on top of your workflow with intuitive, interactive drag-and-drop to-do lists.', icon: ListTodo, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 4, title: 'Global Leaderboard', desc: 'Turn productivity into a game! Climb the global ranks and compete alongside other highly driven users mastering their time.', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 5, title: 'Focus Widgets', desc: 'Customize your space. Pin beautiful sticky notes, live weather updates, and your most important goals directly to your screen.', icon: Pin, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 6, title: 'Cloud Sync', desc: 'Your data, everywhere. Seamlessly and securely access your entire dashboard configuration across all your devices in real-time.', icon: Cloud, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

export default function FeatureCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const containerCenter = scrollRef.current.scrollLeft + scrollRef.current.offsetWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(scrollRef.current.children).forEach((child, index) => {
      const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
  };

  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      if (scrollRef.current && scrollRef.current.children.length > 0) {
        let nextIndex = activeIndex + 1;
        if (nextIndex >= features.length) nextIndex = 0;

        const targetElement = scrollRef.current.children[nextIndex] as HTMLElement;
        if (targetElement) {
          const scrollPos = targetElement.offsetLeft - (scrollRef.current.offsetWidth / 2) + (targetElement.offsetWidth / 2);
          scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, isDragging]);

  return (
    <div className="w-full relative flex flex-col items-center select-none touch-pan-y">
      <div className="lg:mb-0 mb-2 lg:absolute lg:-top-6 z-20 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center animate-fade-in">
        <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-blue-200">Core Features</span>
      </div>
      <div
        ref={scrollRef}
        className={`w-full flex overflow-x-auto hide-scrollbar pt-2 pb-4 rounded-2xl border lg:py-8 cursor-grab active:cursor-grabbing px-[5%] sm:px-[15%] lg:px-[22.5%] ${isDragging ? '' : 'snap-x snap-mandatory scroll-smooth'}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const isActive = idx === activeIndex;

          return (
            <div key={feat.id} className="min-w-[90%] sm:min-w-[70%] lg:min-w-[90%] flex-[0_0_90%] sm:flex-[0_0_70%] lg:flex-[0_0_55%] snap-center px-1.5 flex justify-center items-center transition-transform duration-500">
              <div className={`relative w-full p-4 sm:p-6 rounded-3xl border backdrop-blur-2xl flex flex-col gap-2 sm:gap-3 transition-all duration-700 shadow-2xl overflow-hidden group ${isActive ? 'scale-[1.02] sm:scale-110 bg-gradient-to-br from-white/20 to-white/5 border-white/30 opacity-100 z-10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)]' : 'scale-[0.92] sm:scale-[0.88] bg-white/5 border-white/5 opacity-40 z-0'}`}>

                {/* Active Card Enhancements */}
                {isActive && (
                  <>
                    <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-shimmer-sweep" style={{ left: '-100%' }} />
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-80" />
                  </>
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${feat.bg} ${feat.color} shadow-lg ring-1 ring-white/20 ${isActive ? 'shadow-[0_0_20px_rgba(255,255,255,0.15)]' : ''} transition-all duration-500`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <h3 className={`text-base sm:text-xl font-bold tracking-tight transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/70'}`}>
                    {feat.title}
                  </h3>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed text-left relative z-10 transition-colors duration-500 ${isActive ? 'text-white/90' : 'text-white/50'}`}>
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 mt-2 sm:mt-5">
        {features.map((_, idx) => (
          <div key={idx} onClick={() => {
            if (scrollRef.current) {
              const targetElement = scrollRef.current.children[idx] as HTMLElement;
              const scrollPos = targetElement.offsetLeft - (scrollRef.current.offsetWidth / 2) + (targetElement.offsetWidth / 2);
              scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
          }} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/40 ${activeIndex === idx ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}
