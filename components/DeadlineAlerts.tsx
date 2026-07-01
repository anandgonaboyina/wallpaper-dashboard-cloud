'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function DeadlineAlerts() {
  const { deadlines, deadlineAlertDays, dismissedDeadlineAlerts, dismissDeadlineAlert, isDeadlinesCollapsed, setIsDeadlinesCollapsed, theme } = useDashboardStore();
  const [activeAlerts, setActiveAlerts] = useState<typeof deadlines>([]);
  const [isStackExpanded, setIsStackExpanded] = useState(false);
  
  const startY = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts = deadlines.filter((d) => {
      const deadlineDate = new Date(d.date);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isToday = diffDays === 0;
      const alertKey = `${d.id}-${isToday ? 'today' : 'preview'}`;

      if (dismissedDeadlineAlerts.includes(alertKey)) return false;

      return diffDays === 0 || (diffDays > 0 && diffDays <= deadlineAlertDays);
    });

    alerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setActiveAlerts(alerts);
  }, [deadlines, deadlineAlertDays, dismissedDeadlineAlerts]);

  if (!mounted || activeAlerts.length === 0) return null;

  if (isDeadlinesCollapsed) {
    return (
      <div 
        className={`hidden md:flex fixed top-3 left-3 z-[100000] flex-row gap-1.5 cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 transition-transform p-1.5 rounded-full border backdrop-blur-md shadow-lg ${theme === 'light' ? 'bg-white/60 border-red-500/30 shadow-red-500/10' : 'bg-black/40 border-red-500/20'}`}
        onClick={() => setIsDeadlinesCollapsed(false)}
        title="Show Deadline Alerts"
      >
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-red-900/50" />
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-red-900/50" style={{ animationDelay: '150ms' }} />
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-red-900/50" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  const handleDragStart = (clientY: number) => {
    startY.current = clientY;
  };

  const handleDragEnd = (clientY: number) => {
    if (startY.current !== null) {
      const deltaY = startY.current - clientY;
      if (deltaY > 30) {
        setIsDeadlinesCollapsed(true);
      }
      startY.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    handleDragStart(e.clientY);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    handleDragEnd(e.clientY);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 top-16 md:top-16 z-[10000] flex flex-col gap-1.5 pointer-events-auto items-center cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => startY.current = null}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}
      onTouchCancel={() => startY.current = null}
    >
      <div className="relative flex flex-col items-center w-[290px]" style={{ height: isStackExpanded || activeAlerts.length === 1 ? 'auto' : '65px' }}>
        {activeAlerts.map((alert, index) => {
          const deadlineDate = new Date(alert.date);
          deadlineDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadlineDate.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
          const daysText = diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow!' : `In ${diffDays} days`;

          const isStacked = !isStackExpanded && activeAlerts.length > 1;
          const isTop = index === 0;
          
          if (isStacked && index > 2) return null;

          let transform = 'none';
          let opacity = '1';
          let zIndex = 100 - index;
          
          if (isStacked) {
            if (index === 1) {
              transform = 'translateY(8px) scale(0.96)';
              opacity = '0.8';
            } else if (index === 2) {
              transform = 'translateY(16px) scale(0.92)';
              opacity = '0.5';
            }
          }

          return (
            <div
              key={alert.id}
              onClick={() => {
                if (isStacked) setIsStackExpanded(true);
              }}
              className={`w-full ${isStacked ? 'absolute top-0' : 'relative mb-2'} ${isStacked && !isTop ? 'cursor-pointer' : ''} pointer-events-auto ${theme === 'light' ? 'bg-white/80 border-slate-200 text-slate-800' : 'bg-[#0f0f13]/95 border-white/10 text-white'} backdrop-blur-xl border rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden flex transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}
              style={{
                transform,
                opacity,
                zIndex
              }}
            >
              <div className="w-[3px] bg-gradient-to-b from-yellow-400 to-orange-500 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

              <div className="py-1.5 px-2 flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center gap-1.5">
                  <div className={`flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-1 py-[2px] rounded text-yellow-400 shadow-inner`}>
                    <CalendarClock className="w-2.5 h-2.5 drop-shadow-md" />
                    <span className="text-[8px] font-bold uppercase tracking-wider leading-none">{daysText}</span>
                  </div>
                  
                  {/* Dismiss Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissDeadlineAlert(`${alert.id}-${diffDays === 0 ? 'today' : 'preview'}`);
                      }}
                      className={`p-1 hover:bg-black/10 ${theme === 'light' ? 'text-slate-400 hover:text-slate-800' : 'text-white/40 hover:text-white'} rounded shrink-0 transition-colors active:scale-90 flex items-center justify-center`}
                      title="Dismiss alert"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>

                <p className={`${theme === 'light' ? 'text-slate-800' : 'text-white/90'} text-[10px] leading-tight font-medium line-clamp-2 break-words`}>
                  {alert.text}
                </p>

                <div className="mt-px flex items-center justify-between">
                  <span className={`${theme === 'light' ? 'text-slate-500' : 'text-white/40'} text-[8px] font-semibold tracking-wide uppercase leading-none`}>
                    Due: {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  {isTop && isStacked && activeAlerts.length > 1 && (
                     <button className={`${theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-white/40 hover:text-white'} text-[9px] font-semibold flex items-center gap-0.5`}>
                       +{activeAlerts.length - 1} <ChevronDown className="w-3 h-3" />
                     </button>
                  )}
                  {isTop && !isStacked && activeAlerts.length > 1 && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); setIsStackExpanded(false); }} 
                        className={`${theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-white/40 hover:text-white'} text-[9px] font-semibold flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-black/10 transition-colors`}
                     >
                       Collapse <ChevronUp className="w-3 h-3" />
                     </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div 
        className="text-[9px] text-white/40 flex items-center gap-1 font-medium bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 pointer-events-auto cursor-pointer mt-1 hover:text-white transition-colors" 
        onClick={() => setIsDeadlinesCollapsed(true)}
      >
        <ChevronUp className="w-3 h-3" /> Swipe up to collapse
      </div>
    </div>
  );
}
