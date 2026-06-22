"use client";

import Dock from "@/components/Navbar";
import BigClock from "@/components/BigClock";
import Timer from "@/components/Timer";
import Stopwatch from "@/components/Stopwatch";
import TaskManager from "@/components/TaskManager";
import QuotePopup from "@/components/QuotePopup";
import StatsModal from "@/components/StatsModal";
import NotesManager from "@/components/NotesManager";
import PlansManager from "@/components/PlansManager";
import MiniCalendar from "@/components/MiniCalendar";
import Countdown from "@/components/Countdown";
import Timetable from "@/components/Timetable";
import HealthRings from "@/components/HealthRings";
import HealthModal from "@/components/HealthModal";
import DraggableClock from "@/components/DraggableClock";
import DraggableWidget from "@/components/DraggableWidget";
import SettingsModal from "@/components/SettingsModal";
import RightToolbar from "@/components/RightToolbar";
import DeadlineAlerts from "@/components/DeadlineAlerts";
import StartupUpdateChecker from "@/components/StartupUpdateChecker";
import FriendRequestPopup from "@/components/FriendRequestPopup";
import GlobalBroadcastPopup from "@/components/GlobalBroadcastPopup";
import VideoBackground from "@/components/VideoBackground";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CalendarDays, Settings } from "lucide-react";
import { useDashboardStore, hasUnsavedChanges } from "@/store/dashboardStore";
import { fetchQuote } from "@/utils/quoteEngine";

export default function Dashboard() {
  const showQuotePopup = useDashboardStore((state) => state.showQuotePopup);
  const isHidden = useDashboardStore((state) => state.isHidden);
  const baseHideConfig = useDashboardStore((state) => state.hideConfig);
  const mobileHideConfig = useDashboardStore((state) => state.mobileHideConfig);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hideConfig = isMobile ? mobileHideConfig : baseHideConfig;

  const toggleHide = useDashboardStore((state) => state.toggleHide);
  const currentBgType = useDashboardStore((state) => state.currentBgType);
  const countdowns = useDashboardStore((state) => state.countdowns);
  const [isCountdownsExpanded, setIsCountdownsExpanded] = useState(false);
  const isMobileCountdownsVisible = useDashboardStore((state) => state.isMobileCountdownsVisible);
  const isTimetableOpen = useDashboardStore((state) => state.isTimetableOpen);
  const setIsTimetableOpen = useDashboardStore((state) => state.setIsTimetableOpen);
  const isCalendarOpen = useDashboardStore((state) => state.isCalendarOpen);

  const showHealth = useDashboardStore((state) => state.showHealth);
  const showQuote = useDashboardStore((state) => state.showQuote);
  const showTimer = useDashboardStore((state) => state.showTimer);
  const showStopwatch = useDashboardStore((state) => state.showStopwatch);
  const showCountdowns = useDashboardStore((state) => state.showCountdowns);
  const showClock = useDashboardStore((state) => state.showClock);
  const showTodayWork = useDashboardStore((state) => state.showTodayWork);
  const showTasks = useDashboardStore((state) => state.showTasks);
  const showCalendar = useDashboardStore((state) => state.showCalendar);
  const showStats = useDashboardStore((state) => state.showStats);
  const showPlans = useDashboardStore((state) => state.showPlans);
  const showNotes = useDashboardStore((state) => state.showNotes);
  const showTimetable = useDashboardStore((state) => state.showTimetable);
  const showDock = useDashboardStore((state) => state.showDock);
  const showDeadlineAlerts = useDashboardStore((state) => state.showDeadlineAlerts);
  const showSettingsBtn = useDashboardStore((state) => state.showSettingsBtn);
  const rightWidgetsOffset = useDashboardStore((state) => state.rightWidgetsOffset);
  const toggleSettings = useDashboardStore((state) => state.toggleSettings);
  const _hasHydrated = useDashboardStore((state) => state._hasHydrated);
  const widgetZIndices = useDashboardStore((state) => state.widgetZIndices) || {};
  const bringToFront = useDashboardStore((state) => state.bringToFront);

  const isPanicHidden = useDashboardStore((state) => state.isPanicHidden);
  const togglePanicHide = useDashboardStore((state) => state.togglePanicHide);
  const panicShortcutKey = useDashboardStore((state) => state.panicShortcutKey);
  const focusShortcutKey = useDashboardStore((state) => state.focusShortcutKey);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.altKey && (e.key?.toLowerCase() === 'f4' || e.code === 'F4' || e.keyCode === 115)) return; // NEVER block Alt+F4

      let fKey = focusShortcutKey;
      if (!fKey.includes('+') && fKey.length === 1) fKey = 'ctrl+' + fKey;
      let pKey = panicShortcutKey;
      if (!pKey.includes('+') && pKey.length === 1) pKey = 'ctrl+' + pKey;

      const checkShortcut = (ev: KeyboardEvent, shortcut: string) => {
        const parts = shortcut.split('+');
        const key = parts.pop();
        const ctrl = parts.includes('ctrl');
        const alt = false; // Alt removed from custom combinations to prevent Alt+F4 and Windows OS conflicts
        const shift = parts.includes('shift');
        return ev.ctrlKey === ctrl && ev.altKey === alt && ev.shiftKey === shift && ev.key?.toLowerCase() === key;
      };

      if (checkShortcut(e, fKey)) {
        e.preventDefault();
        toggleHide();
      }

      if (checkShortcut(e, pKey)) {
        e.preventDefault();
        togglePanicHide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHide, isHidden, hideConfig, togglePanicHide, isPanicHidden, panicShortcutKey, focusShortcutKey]);

  useEffect(() => {
    const initialTimer = setTimeout(async () => {
      const q = await fetchQuote();
      showQuotePopup(q);
    }, 5000);

    const interval = setInterval(async () => {
      const q = await fetchQuote();
      showQuotePopup(q);
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showQuotePopup]);

  useEffect(() => {
    const token = localStorage.getItem('dashboard_sync_token');
    if (!token || token === 'null') {
      window.location.href = '/';
    }
  }, []);

  if (!_hasHydrated) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center text-white font-sans overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-lg w-full h-full justify-evenly animate-in fade-in duration-1000">
          
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 rounded-full overflow-hidden ring-4 ring-white/5 shadow-2xl shadow-blue-500/20">
              <img 
                src="/branding/author.jpeg" 
                alt="Creator Profile" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/icon-192x192.png' }}
              />
            </div>

            {/* Title & Version */}
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              Productive Dashboard
            </h1>
            <div className="text-[10px] md:text-xs font-mono text-blue-400 mb-8 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Cloud Sync Enabled
            </div>

            {/* Why we made it */}
            <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md mx-auto">
              "Built to eliminate distractions and create a single, unified workspace. 
              Everything you need to stay deeply focused, plan your day, and track your goals—now available anywhere."
            </p>
          </div>

          {/* Loading Spinner & Status */}
          <div className="flex flex-col items-center mt-8">
            <div className="relative flex items-center justify-center mb-5">
              <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <div className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40 animate-pulse">
              Authenticating & Syncing Data...
            </div>
          </div>

        </div>
      </div>
    );
  }

  const tasksZ = widgetZIndices.tasks || 50;
  const stopwatchZ = widgetZIndices.stopwatch || 50;
  const timerZ = widgetZIndices.timer || 50;
  const toolbarZ = widgetZIndices.toolbar || 50;
  const bottomRightZ = Math.max(tasksZ, stopwatchZ, timerZ, toolbarZ);

  return (
    <main className="relative overflow-hidden w-full flex-1">
      <VideoBackground />
      {(!isHidden || !hideConfig.deadlineAlerts) && showDeadlineAlerts && <DeadlineAlerts />}
      {!isPanicHidden && (
        <>
          {/* Quote Popup */}
          {(!isHidden || !hideConfig.quote) && showQuote && <QuotePopup />}

          {/* Stats Modal */}
          {(!isHidden || !hideConfig.stats) && showStats && <StatsModal />}

          {/* Health Modal */}
          {(!isHidden || !hideConfig.health) && showHealth && <HealthModal />}

          {/* Quick Notes */}
          {(!isHidden || !hideConfig.notes) && showNotes && <NotesManager />}

          {/* Roadmap & Plans */}
          {(!isHidden || !hideConfig.plans) && showPlans && <PlansManager />}

          {/* Top Leftish: Target Countdowns */}
          {(!isHidden || !hideConfig.countdowns) && showCountdowns && (
            <div
              style={{ zIndex: widgetZIndices.countdowns || 50 }}
              className={`absolute top-[120px] left-1/2 -translate-x-1/2 md:top-32 md:left-auto md:right-[320px] md:translate-x-0 scale-[0.85] md:scale-100 origin-top pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isMobile && !isMobileCountdownsVisible ? '-translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`}
            >
              <DraggableWidget id="countdowns">
                <div className="flex flex-col gap-1 items-center">
                  {countdowns.length > 0 && (
                    <Countdown key={countdowns[0].id} id={countdowns[0].id} />
                  )}

                  {isCountdownsExpanded && countdowns.slice(1).map(c => (
                    <Countdown key={c.id} id={c.id} />
                  ))}

                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCountdownsExpanded(!isCountdownsExpanded);
                    }}
                    className="flex items-center justify-center p-1 text-white/40 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all border border-white/10"
                    title={isCountdownsExpanded ? "Hide extra targets" : "Show all targets"}
                  >
                    {isCountdownsExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </button>
                </div>
              </DraggableWidget>
            </div>
          )}

          {/* Top Right: Mini Calendar */}
          {(!isHidden || !hideConfig.calendar) && showCalendar && isCalendarOpen && (
            <div
              style={{ zIndex: widgetZIndices.calendar || 50 }}
              className="absolute top-48 right-2 md:top-4 md:right-4 scale-[0.8] sm:scale-85 md:scale-100 origin-top-right pointer-events-none"
            >
              <MiniCalendar />
            </div>
          )}

          {/* BigClock */}
          {(!isHidden || !hideConfig.clock) && (showClock || showTodayWork) && (
            <div
              style={{ zIndex: widgetZIndices.clock || 50 }}
              className={`absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isTimetableOpen
                ? 'top-20 left-1/2 -translate-x-1/2 md:top-1/2 md:left-20 md:-translate-y-1/2 md:translate-x-0 scale-[0.7] md:scale-100 origin-top md:origin-center'
                : currentBgType === 'image'
                  ? 'top-20 left-1/2 -translate-x-1/2 translate-y-0 scale-[0.7] md:scale-100 md:top-40 origin-top'
                  : 'top-20 left-1/2 -translate-x-1/2 md:top-40 md:left-10 md:translate-x-0 translate-y-0 scale-[0.7] md:scale-100 origin-top md:origin-top-left'
                }`}>
              <DraggableClock>
                <BigClock />
              </DraggableClock>
            </div>
          )}

          {/* Bottom Center (Above Dock): Timetable */}
          {(!isHidden || !hideConfig.timetable) && showTimetable && (
            <div
              style={{ zIndex: widgetZIndices.timetable || 50 }}
              className="absolute bottom-24 left-[10px] right-[10px] w-[calc(100vw-20px)] md:bottom-40 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto flex flex-col items-center scale-[0.9] md:scale-100 origin-bottom pointer-events-none"
            >
              {/* The Expanded Timetable */}
              <div
                onPointerDown={() => bringToFront('timetable')}
                className={`flex flex-col items-center gap-2 absolute bottom-0 origin-bottom transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] w-full md:w-auto ${isTimetableOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'}`}
              >
                <Timetable />
                <button
                  onClick={() => setIsTimetableOpen(false)}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-3 text-white/60 hover:text-white hover:bg-black/60 transition-colors flex items-center gap-2 shadow-xl"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              {/* The Closed Button */}
              <div
                onPointerDown={() => bringToFront('timetable')}
                className={`absolute bottom-0 origin-bottom transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${!isTimetableOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto delay-300' : 'opacity-0 translate-y-8 scale-50 pointer-events-none'}`}
              >
                <button
                  onClick={() => setIsTimetableOpen(true)}
                  className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-3 py-3 text-white/80 hover:text-white hover:bg-black/40 transition-colors flex items-center gap-2 shadow-xl hover:scale-105"
                >
                  <CalendarDays size={20} className="text-purple-400" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Center: Dock */}
          {(!isHidden || !hideConfig.dock) && showDock && (
            <div className="absolute bottom-2 md:bottom-18 left-1/2 -translate-x-1/2 z-50 scale-[0.85] md:scale-100 origin-bottom">
              <Dock onOpenNotes={() => console.log('Open Notes clicked')} />
            </div>
          )}

          {/* Bottom Left: Health Rings */}
          {(!isHidden || !hideConfig.health) && showHealth && (
            <div className="absolute bottom-28 left-0 md:bottom-12 md:left-12 z-50 scale-[0.65] md:scale-100 origin-bottom-left">
              <HealthRings />
            </div>
          )}

          {/* Bottom Right Container */}
          <div
            style={{ bottom: `${rightWidgetsOffset}px`, zIndex: bottomRightZ }}
            className="absolute right-1 sm:right-2 md:right-2 flex items-end transition-all duration-300 pointer-events-none scale-[0.75] sm:scale-85 md:scale-100 origin-bottom-right"
          >
            {/* TaskManager & Timer Group */}
            <div className="flex flex-col items-end gap-2 pointer-events-none mr-1 md:mr-[10px]">
              {(!isHidden || !hideConfig.tasks) && showTasks && <TaskManager />}
              <div className="flex flex-col md:flex-row items-end md:items-start gap-2 md:gap-3 pointer-events-none">
                {(!isHidden || !hideConfig.stopwatch) && showStopwatch && <Stopwatch />}
                {(!isHidden || !hideConfig.timer) && showTimer && <Timer />}
              </div>
            </div>

            {/* Vertical Icons Toolbar (Side toggle btns scale with container) */}
            <div className="pointer-events-none">
              <RightToolbar />
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      <SettingsModal />

      {/* Auto Update Checker */}
      <StartupUpdateChecker />

      {/* Global Friend Request Notification */}
      <FriendRequestPopup />

      {/* Global Developer Broadcast Notification */}
      <GlobalBroadcastPopup />

    </main>
  );
}