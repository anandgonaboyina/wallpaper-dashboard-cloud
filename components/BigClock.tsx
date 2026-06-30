'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDashboardStore } from '@/store/dashboardStore';
import { getLocalDateString } from '@/utils/date';
import { Timer, Clock, Flame } from 'lucide-react';

export default function BigClock() {
  const [time, setTime] = useState<Date | null>(null);
  const history = useDashboardStore((state) => state.history);
  const toggleHide = useDashboardStore((state) => state.toggleHide);
  const currentBgType = useDashboardStore((state) => state.currentBgType);
  const isTimetableOpen = useDashboardStore((state) => state.isTimetableOpen);
  const is24HourClock = useDashboardStore((state) => state.is24HourClock);
  const toggle24HourClock = useDashboardStore((state) => state.toggle24HourClock);
  const showClock = useDashboardStore((state) => state.showClock);
  const showTodayWork = useDashboardStore((state) => state.showTodayWork);

  const timerEndAt = useDashboardStore((state) => state.timerEndAt);
  const timerPausedLeft = useDashboardStore((state) => state.timerPausedLeft);
  const stopwatchStartTime = useDashboardStore((state) => state.stopwatchStartTime);

  const [isMobile, setIsMobile] = useState(false);

  const [activeTimerSecs, setActiveTimerSecs] = useState<number | null>(null);
  const [activeStopwatchSecs, setActiveStopwatchSecs] = useState<number | null>(null);

  const baseHideConfig = useDashboardStore((state) => state.hideConfig);
  const mobileHideConfig = useDashboardStore((state) => state.mobileHideConfig);
  const isHidden = useDashboardStore((state) => state.isHidden);
  const hideConfig = isMobile ? mobileHideConfig : baseHideConfig;

  // Detect mobile viewport size
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Global swipe/drag detector for the top notch (Desktop & Mobile)
  useEffect(() => {
    let startY = 0;

    const handleStart = (clientY: number) => {
      // Only track if swipe starts within the top 80px (where the notch is)
      if (clientY > 80) return;
      startY = clientY;
    };

    const handleEnd = (clientY: number) => {
      if (startY === 0) return; // Ignore if it didn't start at the top

      const diffY = clientY - startY;

      if (diffY > 30) {
        useDashboardStore.getState().setIsMobileCountdownsVisible(true); // Swiped down -> show
      } else if (diffY < -30) {
        useDashboardStore.getState().setIsMobileCountdownsVisible(false); // Swiped up -> hide
      }

      startY = 0; // Reset
    };

    const handleTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientY);
    const handleTouchEnd = (e: TouchEvent) => handleEnd(e.changedTouches[0].clientY);

    const handleMouseDown = (e: MouseEvent) => handleStart(e.clientY);
    const handleMouseUp = (e: MouseEvent) => handleEnd(e.clientY);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    // Initial set
    setTime(new Date());

    // Update every second for the clock, and faster for active pills
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const activeInterval = setInterval(() => {
      if (timerEndAt) {
        setActiveTimerSecs(Math.max(0, Math.floor((timerEndAt - Date.now()) / 1000)));
      } else if (timerPausedLeft !== null) {
        setActiveTimerSecs(timerPausedLeft);
      } else {
        setActiveTimerSecs(null);
      }

      if (stopwatchStartTime) {
        setActiveStopwatchSecs(Math.floor((Date.now() - stopwatchStartTime) / 1000));
      } else {
        setActiveStopwatchSecs(null);
      }
    }, 250);

    return () => {
      clearInterval(interval);
      clearInterval(activeInterval);
    };
  }, [timerEndAt, timerPausedLeft, stopwatchStartTime]);

  const formatPillTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!time) {
    return (
      <div className={`flex flex-col justify-center pointer-events-none opacity-0 items-center`}>
        <div className="text-[5rem] md:text-[12rem] font-bold leading-none tracking-tighter">00:00</div>
      </div>
    );
  }

  // Format the time
  const rawHours = time.getHours();
  const displayHours = is24HourClock ? rawHours : (rawHours % 12 || 12);
  const hours = displayHours.toString().padStart(2, '0');

  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const ampm = rawHours >= 12 ? 'PM' : 'AM';

  const today = getLocalDateString();
  const todayMins = history[today] || 0;
  const focusHours = Math.floor(todayMins / 60);
  const focusMins = todayMins % 60;

  // Format "Xh Ym" or just "Ym" if no hours
  const focusText = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  // Time left today
  const eod = new Date(time);
  eod.setHours(23, 59, 59, 999);
  const msLeft = eod.getTime() - time.getTime();
  const hrsLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const timeLeftText = hrsLeft > 0 ? `${hrsLeft}h left` : `${minsLeft}m left`;

  const clockVisible = showClock && !isMobile && (!isHidden || !hideConfig.clock);
  const focusPillVisible = showTodayWork && (!isHidden || !hideConfig.todayFocusPill);
  const timerPillVisible = (!isHidden || !hideConfig.timerPill);

  return (
    <div className={`flex flex-col w-fit h-fit justify-center pointer-events-none transition-all duration-700 items-center select-none`}>
      {clockVisible && (
        <>
          <div
            onClick={toggle24HourClock}
            className={`${(isTimetableOpen && !isMobile) ? 'text-[3.5rem] md:text-[5rem]' : 'text-[5.5rem] md:text-[12rem]'} tabular-nums font-bold leading-none tracking-tighter pointer-events-auto cursor-pointer transition-all duration-700 text-transparent bg-clip-text bg-gradient-to-b from-white/90 via-white/50 to-white/10 [-webkit-text-stroke:1px_rgba(255,255,255,0.5)] md:[-webkit-text-stroke:1.5px_rgba(255,255,255,0.5)] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] md:drop-shadow-[0_30px_40px_rgba(0,0,0,0.8)] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] md:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:from-white hover:to-white/40`}
            title="Toggle 12/24 Hour Format"
          >
            {hours}:{minutes}
          </div>
          <div className={`${(isTimetableOpen && !isMobile) ? 'text-lg md:text-2xl' : 'text-2xl md:text-5xl'} font-semibold tracking-widest uppercase mt-1 md:mt-2 transition-all duration-700 flex items-baseline`}>
            <span className="tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white/90 to-white/30 [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] drop-shadow-[0_15px_20px_rgba(0,0,0,0.7)]">{seconds}</span>
            {!is24HourClock && <span className="text-white/40 ml-1.5 md:ml-2 [-webkit-text-stroke:0px]">{ampm}</span>}
          </div>
        </>
      )}

      {/* Top Floating Pills (Global Focus + Global Timer) */}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 z-[99999] flex items-start justify-center transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] translate-y-0 w-full pointer-events-none mt-2 md:mt-3">
          <div className="flex flex-row items-start  justify-center gap-2 px-2 max-w-full">

            {/* Focus Pill for BOTH Desktop & Mobile */}
            {focusPillVisible && (
              <div
                onClick={toggleHide}
                title="Toggle Hidden Mode (Ctrl+H)"
                className="flex items-center gap-1.5  md:gap-2 text-[11px] md:text-[13px] px-4 py-1.5 shadow-[0_5px_20px_rgba(59,130,246,0.3)] rounded-full bg-black/80 backdrop-blur-xl text-white border border-white/10 cursor-pointer pointer-events-auto shrink-0 transition-transform active:scale-95 hover:bg-black/90"
              >
                <div className="flex items-center justify-center bg-orange-500/20 w-5 h-5 md:w-6 md:h-6 rounded-full border-blue-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                  <Flame className="text-orange-400 w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <span>Today: <span className="text-white/90 font-bold ml-1">{focusText}</span></span>
                  <span className="text-white/30 mx-1.5 md:mx-2">|</span>
                  <span className="text-white/80">{timeLeftText}</span>
                </div>
              </div>
            )}

            {/* ACTIVE TIMER/STOPWATCH PILL FOR BOTH DESKTOP & MOBILE */}
            {timerPillVisible && (activeTimerSecs !== null || activeStopwatchSecs !== null) && (
              <div
                onClick={() => {
                  if (activeTimerSecs !== null) {
                    useDashboardStore.getState().toggleTimer();
                  } else if (activeStopwatchSecs !== null) {
                    useDashboardStore.getState().toggleStopwatch();
                  }
                }}
                className="flex items-center gap-1.5 text-[12px] md:text-sm font-bold tracking-widest bg-black/80 border border-blue-500/40 text-blue-200 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-[0_5px_20px_rgba(59,130,246,0.3)] cursor-pointer pointer-events-auto active:scale-95 transition-transform shrink-0 hover:bg-black/90"
              >
                {activeTimerSecs !== null ? (
                  <Timer className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 animate-pulse" />
                ) : (
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 animate-pulse" />
                )}
                <span className={activeTimerSecs !== null ? "text-blue-300" : "text-green-300"}>
                  {activeTimerSecs !== null ? formatPillTime(activeTimerSecs) : formatPillTime(activeStopwatchSecs!)}
                </span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}