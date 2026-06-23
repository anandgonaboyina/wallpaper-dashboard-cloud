'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Upload, Trash2, Image as ImageIcon, Settings as SettingsIcon, MonitorPlay, Clock, Users, Plus, Eye, EyeOff, Download, UploadCloud, Activity, MessageSquare, Timer as TimerIcon, Hourglass, Film, User, BadgeCheck, Send, Briefcase, Calendar, CheckSquare, Flame, ChevronUp, ChevronDown, ChevronLeft, Database, Bell, RefreshCw, AlertTriangle, CheckCircle, BarChart2, Map, StickyNote, CalendarDays, Layout, Globe, Star, Bug } from 'lucide-react';
import ConnectTab from './ConnectTab';
import ScrollableWithArrows from './ScrollableWithArrows';

const DEFAULT_WALLPAPERS = [
  'itachi-uchiha.png', 'kakashi.mp4', 'kakashi2.mp4', 'kakashi3.png',
  'kakashiChild.jpg', 'naruto.webp', 'RockLee.mp4', 'squa7.jpg', 'demonslayer1.mp4'
];

export default function SettingsModal() {
  const { settingsActiveTab, setSettingsActiveTab, isSettingsOpen, toggleSettings, is24HourClock, toggle24HourClock, currentBgSrc, hiddenWallpapers, toggleWallpaperVisibility, showHealth, showQuote, showTimer, showCountdowns, showVideoControls, showClock, showTasks, showCalendar, showTodayWork, showStats, showPlans, showNotes, showTimetable, showDock, showDeadlineAlerts, showBgSwitcher, showSettingsBtn, showStopwatch, toggleVisibility, isSlideshowEnabled, setIsSlideshowEnabled, slideshowIntervalMins, setSlideshowIntervalMins, lockedWidgets, toggleWidgetLock, resetAllOffsets, clearOldData, clearAllData, lockedWallpaper, setLockedWallpaper, deadlineAlertDays, setDeadlineAlertDays, hideConfig, setHideConfig, setHideAll, mobileHideConfig, setMobileHideConfig, setMobileHideAll, rightWidgetsOffset, setRightWidgetsOffset, alarmSound, setAlarmSound, alarmDurationSecs, setAlarmDurationSecs, alarmVolume, setAlarmVolume, enableAlarmSound, setEnableAlarmSound, enableAlarmVibration, setEnableAlarmVibration, toggleHide, panicShortcutKey, setPanicShortcutKey, focusShortcutKey, setFocusShortcutKey, togglePanicHide, panicWallpaperSwitch, setPanicWallpaperSwitch, timetableGrid, panicButtonMode, setPanicButtonMode, customDesktopWallpapers, setCustomDesktopWallpapers, activeDesktopCustomIndex, setActiveDesktopCustomIndex, customMobileWallpapers, setCustomMobileWallpapers, activeMobileCustomIndex, setActiveMobileCustomIndex } = useDashboardStore();

  const [focusPlatform, setFocusPlatform] = useState<'desktop' | 'mobile'>('desktop');

  // Mobile specific drill-down state
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  const handleShortcutCapture = (e: React.KeyboardEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const key = e.key.toLowerCase();
    if (e.altKey && (key === 'f4' || e.code === 'F4' || e.keyCode === 115)) return; // NEVER capture Alt+F4
    e.preventDefault();
    if (key === 'control' || key === 'shift' || key === 'alt' || key === 'meta') return;
    if (key === 'escape') {
      e.currentTarget.blur();
      return;
    }
    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    parts.push(key === ' ' ? 'space' : key);
    setter(parts.join('+'));
    e.currentTarget.blur();
  };

  const formatShortcutText = (shortcut: string) => {
    if (!shortcut) return '';
    let val = shortcut;
    if (!val.includes('+') && val.length === 1) val = 'ctrl+' + val;
    return val.toUpperCase().replace(/\+/g, ' + ');
  };

  const [deleteDays, setDeleteDays] = useState<number>(60);
  const upiId = 'gonaboyinaanandkumar@ybl';
  const [donationAmount, setDonationAmount] = useState<number | null>(100);

  const [feedbackType, setFeedbackType] = useState('feature');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  const fetchMySubmissions = async () => {
    try {
      const token = localStorage.getItem('dashboard_token') || localStorage.getItem('dashboard_sync_token');
      if (!token) return;
      const res = await fetch('/api/roadmap', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMySubmissions(data.mySubmissions || []);
    } catch (_) { }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) return alert("Please enter a message first.");

    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` },
        body: JSON.stringify({ type: feedbackType, message: feedbackMessage })
      });

      if (res.ok) {
        setFeedbackSuccess(true);
        setFeedbackMessage('');
        setTimeout(() => setFeedbackSuccess(false), 3000);
        fetchMySubmissions();
      } else {
        alert("Failed to submit feedback. You must be logged in.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const [friendStats, setFriendStats] = useState<{ username: string, stats: any } | null>(null);

  const settingsScrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      ref.current.scrollBy({ top: direction === 'up' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const [canSidebarScrollUp, setCanSidebarScrollUp] = useState(false);
  const [canSidebarScrollDown, setCanSidebarScrollDown] = useState(false);
  const [canContentScrollUp, setCanContentScrollUp] = useState(false);
  const [canContentScrollDown, setCanContentScrollDown] = useState(false);

  const checkScroll = (ref: React.RefObject<HTMLDivElement | null>, setUp: (v: boolean) => void, setDown: (v: boolean) => void) => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      setUp(scrollTop > 0);
      setDown(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  };

  useEffect(() => {
    if (isSettingsOpen) {
      setTimeout(() => {
        checkScroll(sidebarScrollRef, setCanSidebarScrollUp, setCanSidebarScrollDown);
        checkScroll(settingsScrollRef, setCanContentScrollUp, setCanContentScrollDown);
      }, 100);
    }
  }, [isSettingsOpen, settingsActiveTab]);

  useEffect(() => {
    if (settingsActiveTab === 'feedback') {
      fetchMySubmissions();
    }
  }, [settingsActiveTab]);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const activeDragRef = useRef<HTMLElement | null>(null);
  const dragMode = useRef<'content' | 'scrollbar'>('content');

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (e.button !== 0 || target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.closest('button')) return;

    isDragging.current = true;
    activeDragRef.current = currentTarget;
    if (activeDragRef.current) {
      startY.current = e.pageY;
      startScrollTop.current = activeDragRef.current.scrollTop;

      const scrollbarWidth = currentTarget.offsetWidth - currentTarget.clientWidth;
      if (scrollbarWidth > 0 && e.clientX >= currentTarget.getBoundingClientRect().right - scrollbarWidth) {
        dragMode.current = 'scrollbar';
      } else {
        dragMode.current = 'content';
        activeDragRef.current.style.cursor = 'grabbing';
        activeDragRef.current.style.userSelect = 'none';
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !activeDragRef.current) return;
    e.preventDefault();

    const y = e.pageY;
    const walk = y - startY.current;

    if (dragMode.current === 'scrollbar') {
      const ratio = activeDragRef.current.scrollHeight / activeDragRef.current.clientHeight;
      activeDragRef.current.scrollTop = startScrollTop.current + (walk * ratio);
    } else {
      activeDragRef.current.scrollTop = startScrollTop.current - (walk * 1.5);
    }
  };

  const handlePointerUpOrLeave = () => {
    isDragging.current = false;
    if (activeDragRef.current) {
      activeDragRef.current.style.cursor = '';
      activeDragRef.current.style.userSelect = '';
      activeDragRef.current = null;
    }
  };

  const handleExportData = () => {
    try {
      const token = localStorage.getItem('dashboard_sync_token');
      if (!token) {
        alert('You must be logged in to export data. Please login via the Connect tab.');
        return;
      }
      const exportUrl = `/api/export?token=${token}`;
      window.open(exportUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to export data.');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('dashboard_sync_token');
      if (!token) {
        alert('You must be logged in to import data. Please login via the Connect tab.');
        e.target.value = '';
        return;
      }

      const text = await file.text();
      const parsed = JSON.parse(text);

      if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) {
        alert('Invalid backup file. Missing required dashboard data structure.');
        e.target.value = '';
        return;
      }

      const isMerge = confirm('Do you want to MERGE this backup with your current data?\n\nClick OK to MERGE (Combine old and new data without losing existing settings).\nClick Cancel to OVERWRITE entirely (Wipe existing data and replace it with the backup).');

      let finalData = parsed;

      if (isMerge) {
        const currentState = useDashboardStore.getState();
        finalData = {
          version: parsed.version || 2,
          state: {
            ...currentState,
            ...parsed.state,
            tasks: [...(currentState.tasks || []), ...(parsed.state.tasks || [])].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i),
            countdowns: [...(currentState.countdowns || []), ...(parsed.state.countdowns || [])].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i),
            deadlines: [...(currentState.deadlines || []), ...(parsed.state.deadlines || [])].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i),
            notes: [...(currentState.notes || []), ...(parsed.state.notes || [])].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i),
            stopwatchSessions: [...(currentState.stopwatchSessions || []), ...(parsed.state.stopwatchSessions || [])],
            plans: [...(currentState.plans || []), ...(parsed.state.plans || [])].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i),
          }
        };
      }

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: finalData })
      });

      if (res.ok) {
        alert('Import successful! Reloading...');
        window.location.reload();
      } else {
        alert('Import failed. Server rejected the data.');
      }
    } catch (err) {
      console.error(err);
      alert('Invalid JSON file format.');
    }
    e.target.value = '';
  };

  const handleTabClick = (tab: string) => {
    setSettingsActiveTab(tab as any);
    setIsMobileDetailView(true);
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          toggleSettings();
          setIsMobileDetailView(false); // Reset to menu on close
        }}
      />

      {/* h-[80vh] enforces max height space with top/bottom margin intrinsically handled by the parent flex centering */}
      <div className="relative w-full max-w-4xl h-[80vh] md:h-[80vh] flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden text-white animate-in zoom-in-95 duration-200">

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes continuous-glass-sweep {
            0% { left: -100%; }
            100% { left: 200%; }
          }
          .glass-sweep-anim {
            animation: continuous-glass-sweep 3s infinite cubic-bezier(0.4, 0, 0.2, 1);
          }
        ` }} />
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            {isMobileDetailView && (
              <button
                onClick={() => setIsMobileDetailView(false)}
                className="md:hidden p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white/80 border border-white/10 bg-white/5 mr-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <SettingsIcon className={`${isMobileDetailView ? 'hidden md:block' : 'block'} text-blue-400 w-5 h-5 md:w-6 md:h-6`} />
            <h2 className="text-base md:text-2xl font-bold tracking-wide leading-tight">
              {isMobileDetailView ? (
                <span className="md:hidden capitalize">{(settingsActiveTab != "about") ? settingsActiveTab + " Settings" : "About Developer"} </span>
              ) : null}
              <span className={isMobileDetailView ? 'hidden md:inline' : 'inline'}>Dashboard Settings</span>
            </h2>
          </div>
          <button
            onClick={() => {
              toggleSettings();
              setIsMobileDetailView(false);
            }}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden w-full">
          {/* Sidebar Tabs - Hidden on mobile if in detail view */}
          <div className={`${isMobileDetailView ? 'hidden md:flex' : 'flex h-full'} flex-col w-full md:w-64 bg-black/20 border-r-0 md:border-r border-white/10 relative group shrink-0`}>
            {canSidebarScrollUp && (
              <div className="hidden md:flex absolute top-2 left-0 right-0 justify-center z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(sidebarScrollRef, 'up')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronUp size={18} strokeWidth={3} />
                </button>
              </div>
            )}

            <div
              ref={sidebarScrollRef}
              onScroll={() => checkScroll(sidebarScrollRef, setCanSidebarScrollUp, setCanSidebarScrollDown)}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              onPointerCancel={handlePointerUpOrLeave}
              className="flex-1 p-3 md:p-4 max-md:py-3 md:pb-12 md:pt-10 flex flex-col gap-2 overflow-y-auto arrow-scrollbar no-scrollbar"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >
              <button
                onClick={() => handleTabClick('preferences')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'preferences' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <MonitorPlay className="w-5 h-5" /> Preferences
              </button>
              <button
                onClick={() => handleTabClick('wallpaper')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'wallpaper' && !isMobileDetailView ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <ImageIcon className="w-5 h-5" /> Wallpapers
              </button>
              <button
                onClick={() => handleTabClick('sound')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'sound' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <Bell className="w-5 h-5" /> Sound Settings
              </button>

              <button
                onClick={() => handleTabClick('focus')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'focus' && !isMobileDetailView ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <EyeOff className="w-5 h-5" /> Focus / Panic Mode
              </button>
              <button
                onClick={() => handleTabClick('data')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'data' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <Database className="w-5 h-5" /> Data & Backup
              </button>
              <button
                onClick={() => handleTabClick('connect')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'connect' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <Globe className={`w-5 h-5 ${settingsActiveTab === 'connect' ? 'text-blue-400 animate-pulse' : ''}`} /> Connect & News
              </button>

              <button
                onClick={() => handleTabClick('feedback')}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${settingsActiveTab === 'feedback' && !isMobileDetailView ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent bg-black/40 md:bg-transparent'}`}
              >
                <Bug className="w-5 h-5" /> Feedback & Bugs
              </button>
              <button
                onClick={() => handleTabClick('about')}
                className={`relative overflow-hidden group flex flex-row md:flex-col w-full min-h-[76px] md:min-h-[120px] items-center justify-center gap-3 md:gap-2 px-3 py-2 md:py-5 rounded-xl transition-all ${settingsActiveTab === 'about' && !isMobileDetailView ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg' : 'bg-black/40 md:bg-black/20 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 border border-white/5 md:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md'}`}
              >
                <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none glass-sweep-anim" style={{ left: '-100%' }} />
                <img
                  src="/branding/author.jpeg"
                  alt="Developer"
                  className="w-16 h-16 md:w-14 md:h-14 rounded-full object-cover shadow-lg border-2 border-white/20 relative z-10 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<svg class="w-8 h-8 relative z-10" ... />');
                  }}
                />
                <div className="flex flex-col items-start md:items-center text-left md:text-center relative z-10 min-w-0">
                  <span className="text-[11px] md:text-[12px] font-semibold tracking-wide leading-tight text-white block">Support Developer & Connect</span>
                  <span className="text-[9px] md:text-[10px] text-blue-300 font-medium uppercase mt-0.5 md:mt-1 tracking-wider block truncate w-full">Gonaboyina Anand kumar</span>
                </div>
              </button>

            </div>

            {/* Sidebar Scroll Down Button */}
            {canSidebarScrollDown && (
              <div className="hidden md:flex absolute bottom-2 left-0 right-0 justify-center z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(sidebarScrollRef, 'down')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronDown size={18} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Content Area - Hidden on mobile if in Menu view */}
          <div className={`relative flex-1 overflow-hidden flex-col group/content ${isMobileDetailView ? 'flex' : 'hidden md:flex'}`}>
            {/* Content Scroll Up Button */}
            {canContentScrollUp && (
              <div className="absolute top-2 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover/content:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(settingsScrollRef, 'up')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronUp className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            )}

            <div
              ref={settingsScrollRef}
              onScroll={() => checkScroll(settingsScrollRef, setCanContentScrollUp, setCanContentScrollDown)}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              onPointerCancel={handlePointerUpOrLeave}
              className="flex-1 overflow-y-auto overflow-x-hidden p-2 pt-4 pb-8 md:p-6 md:pb-16 md:pt-12 arrow-scrollbar"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >

              {settingsActiveTab === 'connect' && (
                // <div className="max-w-full overflow-x-hidden [&_*]:max-w-full">
                <ConnectTab friendStats={friendStats} setFriendStats={setFriendStats} />
                // </div>
              )}

              {settingsActiveTab === 'preferences' && (
                <div className="flex flex-col gap-3 md:gap-6">
                  <div>
                    <h3 className="hidden md:block text-xl font-semibold">General Preferences</h3>
                    <p className="text-white/50 text-[10px] md:text-sm md:mt-1 px-1">Customize how your dashboard looks and feels.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 md:gap-2">
                    {/* Toggle 24-hour clock */}
                    <div className="flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1 md:p-2 bg-white/5 rounded-md md:rounded-lg shrink-0">
                          <Clock className="text-blue-300 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <h4 className="font-medium text-xs md:text-base whitespace-nowrap">24-Hour Clock Format</h4>
                          <p className="text-[9px] md:text-xs text-white/50 leading-tight">Military time (14:00 instead of 2:00 PM)</p>
                        </div>
                      </div>
                      <button
                        onClick={toggle24HourClock}
                        className={`relative inline-flex h-4 w-8 md:h-6 md:w-12 items-center rounded-full transition-colors shrink-0 ${is24HourClock ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${is24HourClock ? 'translate-x-4 md:translate-x-7' : 'translate-x-0.5 md:translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Deadline Alerts */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl bg-black/20 border border-white/5 gap-1.5 sm:gap-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1 md:p-2 bg-white/5 rounded-md md:rounded-lg shrink-0">
                          <Bell className="text-yellow-400 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <h4 className="font-medium text-xs md:text-base whitespace-nowrap">Deadline Alerts</h4>
                          <p className="text-[9px] md:text-xs text-white/50 leading-tight">Show a popup as deadlines approach.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto pl-7 sm:pl-0">
                        <span className="text-white/60 text-[9px] md:text-xs whitespace-nowrap">Alert me</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={deadlineAlertDays}
                          onChange={(e) => setDeadlineAlertDays(parseInt(e.target.value) || 0)}
                          className="w-10 md:w-14 bg-black/40 border border-white/10 rounded-md px-1 py-0.5 text-center text-white outline-none focus:border-yellow-400 font-medium text-[10px] md:text-sm"
                        />
                        <span className="text-white/60 text-[9px] md:text-xs whitespace-nowrap">days before</span>
                      </div>
                    </div>

                    {/* Right Toolbar Position */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl bg-black/20 border border-white/5 gap-1.5 sm:gap-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1 md:p-2 bg-white/5 rounded-md md:rounded-lg shrink-0">
                          <Layout className="text-cyan-400 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <h4 className="font-medium text-xs md:text-base whitespace-nowrap">Right Toolbar Position</h4>
                          <p className="text-[9px] md:text-xs text-white/50 leading-tight">Adjust the height of right-side widgets.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-black/40 border border-white/10 rounded-md p-1 self-end sm:self-auto">
                        <button
                          onClick={() => setRightWidgetsOffset(Math.max(0, rightWidgetsOffset - 10))}
                          className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <span className="font-bold text-[10px] md:text-sm w-6 md:w-10 text-center text-cyan-300">{rightWidgetsOffset}</span>
                        <button
                          onClick={() => setRightWidgetsOffset(rightWidgetsOffset + 10)}
                          className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Widget Layout & Positioning */}
                    <div className="flex flex-col p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-black/20 border border-white/5 mt-1 md:mt-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 md:mb-4 gap-2">
                        <h4 className="font-medium text-xs md:text-lg">Widget Drag Locking</h4>
                        <button
                          onClick={() => {
                            if (currentBgSrc) resetAllOffsets(currentBgSrc);
                          }}
                          className="px-2 py-1 md:px-4 md:py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-md md:rounded-xl transition-colors border border-red-500/30 font-medium text-[9px] md:text-sm whitespace-nowrap"
                        >
                          Reset Default Positions
                        </button>
                      </div>
                      <p className="text-[9px] md:text-sm text-white/50 mb-2 md:mb-4">Lock elements so they cannot be dragged.</p>

                      <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                        {/* Lock Items */}
                        {[
                          { key: 'clock', icon: Clock, label: 'Clock', color: 'text-blue-300' },
                          { key: 'tasks', icon: CheckSquare, label: 'Tasks', color: 'text-green-400' },
                          { key: 'quote', icon: MessageSquare, label: 'Quote', color: 'text-yellow-400' },
                          { key: 'countdowns', icon: Hourglass, label: 'Countdowns', color: 'text-purple-400' },
                          { key: 'calendar', icon: Calendar, label: 'Calendar', color: 'text-pink-400' },
                          { key: 'timer', icon: TimerIcon, label: 'Timer', color: 'text-orange-400' },
                          { key: 'toolbar', icon: Layout, label: 'Toolbar', color: 'text-indigo-400' },
                        ].map(({ key, icon: Icon, label, color }) => (
                          <div key={key} className="flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl bg-white/5">
                            <div className="flex items-center gap-1.5 md:gap-3 min-w-0 pr-1">
                              <Icon className={`${color} w-3.5 h-3.5 md:w-[18px] md:h-[18px] shrink-0`} />
                              <span className="text-[9px] md:text-sm font-medium truncate">{label}</span>
                            </div>
                            <button onClick={() => toggleWidgetLock(key as any)} className={`relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${lockedWidgets.includes(key as any) ? 'bg-blue-500' : 'bg-white/20'}`}>
                              <span className={`inline-block h-2.5 w-2.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes(key as any) ? 'translate-x-3.5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Widget Visibility */}
                    <div className="flex flex-col p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-black/20 border border-white/5 mt-1 md:mt-4">
                      <h4 className="font-medium text-xs md:text-lg mb-2 md:mb-4">Widget Visibility</h4>

                      <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                        {/* Visibility Items */}
                        {[
                          { key: 'showHealth', icon: Activity, label: 'Health', color: 'text-red-400', state: showHealth },
                          { key: 'showQuote', icon: MessageSquare, label: 'Quote', color: 'text-purple-400', state: showQuote },
                          { key: 'showTimer', icon: TimerIcon, label: 'Timer', color: 'text-yellow-400', state: showTimer },
                          { key: 'showStopwatch', icon: Clock, label: 'Stopwatch', color: 'text-blue-400', state: showStopwatch },
                          { key: 'showCountdowns', icon: Hourglass, label: 'Countdowns', color: 'text-blue-400', state: showCountdowns },
                          { key: 'showVideoControls', icon: Film, label: 'Video Ctrl', color: 'text-green-400', state: showVideoControls },
                          { key: 'showTodayWork', icon: Flame, label: 'Today Focus', color: 'text-orange-400', state: showTodayWork },
                          { key: 'showTasks', icon: CheckSquare, label: 'Tasks', color: 'text-orange-400', state: showTasks },
                          { key: 'showCalendar', icon: Calendar, label: 'Calendar', color: 'text-pink-400', state: showCalendar },
                          { key: 'showStats', icon: BarChart2, label: 'Stats Modal', color: 'text-emerald-400', state: showStats },
                          { key: 'showPlans', icon: Map, label: 'Roadmap', color: 'text-indigo-400', state: showPlans },
                          { key: 'showNotes', icon: StickyNote, label: 'Quick Notes', color: 'text-yellow-300', state: showNotes },
                          { key: 'showTimetable', icon: CalendarDays, label: 'Timetable', color: 'text-purple-400', state: showTimetable },
                          { key: 'showDock', icon: Layout, label: 'Bottom Dock', color: 'text-cyan-300', state: showDock },
                          { key: 'showDeadlineAlerts', icon: Bell, label: 'Alerts', color: 'text-red-400', state: showDeadlineAlerts },
                          { key: 'showBgSwitcher', icon: ImageIcon, label: 'Bg Switcher', color: 'text-green-300', state: showBgSwitcher },
                        ].map(({ key, icon: Icon, label, color, state }) => (
                          <div key={key} className="flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl bg-white/5">
                            <div className="flex items-center gap-1.5 md:gap-3 min-w-0 pr-1">
                              <Icon className={`${color} w-3.5 h-3.5 md:w-[18px] md:h-[18px] shrink-0`} />
                              <span className="text-[9px] md:text-sm font-medium truncate">{label}</span>
                            </div>
                            <button onClick={() => toggleVisibility(key as any)} className={`relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${state ? 'bg-blue-500' : 'bg-white/20'}`}>
                              <span className={`inline-block h-2.5 w-2.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${state ? 'translate-x-3.5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                            </button>
                          </div>
                        ))}

                        {/* Clock Info Box (Takes full width if needed, or fits in grid) */}
                        <div className="flex flex-col justify-center p-2 md:p-3 rounded-md md:rounded-xl bg-white/5 col-span-2 sm:col-span-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 md:gap-3">
                              <Clock className="text-cyan-400 w-3.5 h-3.5 md:w-[18px] md:h-[18px] shrink-0" />
                              <span className="text-[9px] md:text-sm font-medium">Big Clock</span>
                            </div>
                            <button onClick={() => toggleVisibility('showClock')} className={`relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${showClock ? 'bg-blue-500' : 'bg-white/20'}`}>
                              <span className={`inline-block h-2.5 w-2.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showClock ? 'translate-x-3.5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                            </button>
                          </div>
                          <p className="text-[8px] md:text-[10px] text-white/40 mt-1 leading-tight italic">
                            * Permanently hidden on mobile space to save area.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'sound' && (
                <div className="flex flex-col gap-3 md:gap-6">
                  <div>
                    <h3 className="hidden md:flex text-xl font-semibold items-center gap-2">
                      <Bell className="text-blue-400 w-6 h-6" /> Sound Settings
                    </h3>
                    <p className="text-white/50 text-[10px] md:text-sm md:mt-1 px-1">Manage notification sounds and timers.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-6 flex flex-col gap-4 md:gap-8">

                    {/* Auto Stop Timer */}
                    <div className="flex flex-col gap-2 md:gap-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs md:text-base font-semibold text-white/80">Auto Stop Timer</label>
                        <span className="text-[9px] md:text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/60">{alarmDurationSecs} Secs</span>
                      </div>
                      <p className="text-[8px] md:text-xs text-white/40 leading-tight">How long should the sound ring?</p>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={alarmDurationSecs || 60}
                        onChange={(e) => setAlarmDurationSecs(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 mt-1"
                      />
                      <div className="flex justify-between text-[8px] md:text-[10px] text-white/40">
                        <span>5s</span>
                        <span>1m</span>
                        <span>2m</span>
                      </div>
                    </div>

                    {/* Enable Sound Toggle */}
                    <div className="flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl bg-white/5">
                      <div className="flex flex-col pr-2 min-w-0">
                        <span className="text-[10px] md:text-sm font-medium text-white/80 whitespace-nowrap">Enable Alarm Sound</span>
                        <p className="text-[8px] md:text-xs text-white/40 leading-tight truncate">Play alarm sound when finished</p>
                      </div>
                      <button
                        onClick={() => setEnableAlarmSound(!enableAlarmSound)}
                        className={`relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${enableAlarmSound ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-2.5 w-2.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${enableAlarmSound ? 'translate-x-3.5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Enable Vibration Toggle */}
                    <div className="flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl bg-white/5">
                      <div className="flex flex-col pr-2 min-w-0">
                        <span className="text-[10px] md:text-sm font-medium text-white/80 whitespace-nowrap">Enable Device Vibrate</span>
                        <p className="text-[8px] md:text-xs text-white/40 leading-tight truncate">Vibrate device when finished</p>
                      </div>
                      <button
                        onClick={() => setEnableAlarmVibration(!enableAlarmVibration)}
                        className={`relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${enableAlarmVibration ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-2.5 w-2.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${enableAlarmVibration ? 'translate-x-3.5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Alarm Selection */}
                    <div className="flex flex-col gap-2 md:gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs md:text-base font-semibold text-white/80">Select Alarm Sound</label>
                      </div>

                      <div className="grid gap-1.5 md:gap-2">
                        {/* Default Alarm */}
                        <div
                          className={`flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl border transition-all cursor-pointer ${alarmSound === '/ringtones/alarm.mp3' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                          onClick={() => setAlarmSound('/ringtones/alarm.mp3')}
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border flex items-center justify-center ${alarmSound === '/ringtones/alarm.mp3' ? 'border-blue-400' : 'border-white/30'}`}>
                              {alarmSound === '/ringtones/alarm.mp3' && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-400" />}
                            </div>
                            <span className="text-[10px] md:text-sm font-medium">Default Alarm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'feedback' && (
                <div className="flex flex-col gap-3 md:gap-6 h-full pb-4">
                  <div>
                    <h3 className="hidden md:flex text-xl font-semibold items-center gap-2">
                      <Bug className="text-orange-400 w-6 h-6" /> Feedback & Bugs
                    </h3>
                    <p className="text-white/50 text-[10px] md:text-sm md:mt-1 px-1">Submit feature requests or report issues.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-6 flex flex-col gap-2.5 md:gap-4">
                    <div className="flex flex-col gap-1.5 md:gap-2">
                      <label className="text-[10px] md:text-sm font-semibold text-white/80">Type</label>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        <button
                          onClick={() => setFeedbackType('feature')}
                          className={`flex-1 py-1 md:py-2 px-1 md:px-3 rounded text-[9px] md:text-sm transition-colors border ${feedbackType === 'feature' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          💡 Feature
                        </button>
                        <button
                          onClick={() => setFeedbackType('bug')}
                          className={`flex-1 py-1 md:py-2 px-1 md:px-3 rounded text-[9px] md:text-sm transition-colors border ${feedbackType === 'bug' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          🐛 Bug
                        </button>
                        <button
                          onClick={() => setFeedbackType('other')}
                          className={`flex-1 py-1 md:py-2 px-1 md:px-3 rounded text-[9px] md:text-sm transition-colors border ${feedbackType === 'other' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          💬 General
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 md:gap-2">
                      <label className="text-[10px] md:text-sm font-semibold text-white/80">Message</label>
                      <textarea
                        rows={4}
                        className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 md:px-4 md:py-3 text-[10px] md:text-sm outline-none focus:border-orange-500/50 transition-all placeholder:text-white/40 resize-none min-h-[80px] md:min-h-[120px]"
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Describe your idea or issue..."
                      />
                    </div>

                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback || feedbackSuccess}
                      className={`self-end px-3 py-1 md:px-6 md:py-2 font-bold rounded flex items-center gap-1 md:gap-2 text-[10px] md:text-sm transition-colors shadow-lg ${feedbackSuccess ? 'bg-green-500 text-white' : 'bg-orange-500/80 hover:bg-orange-500 text-white'}`}
                    >
                      {isSubmittingFeedback ? <RefreshCw className="animate-spin w-3 h-3 md:w-4 md:h-4" /> : feedbackSuccess ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Send className="w-3 h-3 md:w-4 md:h-4" />}
                      {feedbackSuccess ? 'Sent!' : 'Submit'}
                    </button>
                  </div>

                  {/* Submissions Status */}
                  <div className="flex flex-col gap-1.5 md:gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] md:text-sm font-semibold text-white/80">Submission Status</label>
                      <button onClick={fetchMySubmissions} className="text-[9px] md:text-xs text-white/40 hover:text-white/70">Refresh</button>
                    </div>
                    {mySubmissions.length === 0 ? (
                      <p className="text-white/30 text-[9px] md:text-xs italic text-center py-2 bg-black/20 rounded-md">No submissions yet.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5 md:gap-2">
                        {mySubmissions.map((item: any) => {
                          const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
                            pending: { label: 'Reviewing', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', dot: 'bg-yellow-400' },
                            reviewed: { label: 'Reviewed', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', dot: 'bg-blue-400' },
                            added_to_roadmap: { label: '✓ Roadmap!', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', dot: 'bg-emerald-400' },
                          };
                          const s = statusConfig[item.status] || { label: item.status, color: 'text-white/40 border-white/10 bg-white/5', dot: 'bg-white/20' };
                          return (
                            <div key={item.id} className="bg-black/30 border border-white/10 p-2 md:p-3 rounded-md flex items-start justify-between gap-2">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="text-white/70 text-[9px] md:text-xs leading-relaxed truncate">{item.message}</p>
                                {item.createdAt && (
                                  <span className="text-[8px] md:text-[10px] text-white/40">
                                    {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 flex items-center gap-1 ${s.color}`}>
                                <span className={`w-1 h-1 rounded-full ${s.dot}`}></span>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {settingsActiveTab === 'wallpaper' && (
                <div className="flex flex-col gap-4 md:gap-8 h-full pb-4">
                  <div>
                    <h3 className="hidden md:flex text-xl font-semibold items-center gap-2">
                      <ImageIcon className="text-purple-400 w-6 h-6" /> Custom Wallpapers
                    </h3>
                    <p className="text-white/50 text-[10px] md:text-sm md:mt-1 px-1">Provide external image URLs. Max 4 per device type.</p>
                  </div>

                  <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6">
                    {/* Desktop Wallpapers */}
                    <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-5 flex flex-col gap-2.5 md:gap-4">
                      <h4 className="font-medium text-[10px] md:text-base text-blue-300 border-b border-white/10 pb-1.5">Desktop Wallpapers</h4>

                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {customDesktopWallpapers.map((url, i) => {
                          const isVideo = url.match(/\.(mp4|webm)$/i);
                          return (
                            <div key={`desktop-wp-${i}`} className={`relative group aspect-video rounded-md md:rounded-xl border overflow-hidden transition-all ${activeDesktopCustomIndex === i ? 'border-purple-500 ring-1 md:ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/40'}`}>
                              <div
                                className="absolute inset-0 cursor-pointer bg-black/40"
                                onClick={() => setActiveDesktopCustomIndex(i)}
                              >
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay playsInline />
                                ) : (
                                  <img src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Custom wp" />
                                )}
                              </div>
                              <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none">
                                <div className="flex justify-end w-full">
                                  {activeDesktopCustomIndex === i && <div className="bg-purple-500/90 rounded-full p-0.5 md:p-1"><BadgeCheck className="text-white w-3 h-3 md:w-4 md:h-4" /></div>}
                                </div>
                                <div className="flex justify-between items-end w-full">
                                  <div className="text-[8px] md:text-[9px] px-1 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white/90 max-w-[70%] truncate">
                                    {url.split('/').pop() || 'image'}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newUrls = [...customDesktopWallpapers];
                                      newUrls.splice(i, 1);
                                      setCustomDesktopWallpapers(newUrls);
                                      if (activeDesktopCustomIndex === i) setActiveDesktopCustomIndex(null);
                                      else if (activeDesktopCustomIndex !== null && activeDesktopCustomIndex > i) setActiveDesktopCustomIndex(activeDesktopCustomIndex - 1);
                                    }}
                                    className="p-1 bg-black/70 border border-white/10 text-white/80 hover:text-red-400 rounded pointer-events-auto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {customDesktopWallpapers.length < 4 && (
                        <button
                          onClick={() => {
                            const url = prompt("Enter a direct image URL (https://...):");
                            if (url && url.trim().startsWith('http')) {
                              setCustomDesktopWallpapers([...customDesktopWallpapers, url.trim()]);
                              if (activeDesktopCustomIndex === null) setActiveDesktopCustomIndex(customDesktopWallpapers.length);
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 mt-1 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded text-[9px] md:text-xs text-white/60 hover:text-white"
                        >
                          <Plus className="w-3 h-3" /> Add URL
                        </button>
                      )}
                    </div>

                    {/* Mobile Wallpapers */}
                    <div className="bg-white/5 border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-5 flex flex-col gap-2.5 md:gap-4">
                      <h4 className="font-medium text-[10px] md:text-base text-pink-300 border-b border-white/10 pb-1.5">Mobile Wallpapers</h4>

                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {customMobileWallpapers.map((url, i) => {
                          const isVideo = url.match(/\.(mp4|webm)$/i);
                          return (
                            <div key={`mobile-wp-${i}`} className={`relative group aspect-[9/16] rounded-md md:rounded-xl border overflow-hidden transition-all ${activeMobileCustomIndex === i ? 'border-purple-500 ring-1 md:ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/40'}`}>
                              <div
                                className="absolute inset-0 cursor-pointer bg-black/40"
                                onClick={() => setActiveMobileCustomIndex(i)}
                              >
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay playsInline />
                                ) : (
                                  <img src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Custom wp" />
                                )}
                              </div>
                              <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none">
                                <div className="flex justify-end w-full">
                                  {activeMobileCustomIndex === i && <div className="bg-purple-500/90 rounded-full p-0.5 md:p-1"><BadgeCheck className="text-white w-3 h-3 md:w-4 md:h-4" /></div>}
                                </div>
                                <div className="flex justify-between items-end w-full">
                                  <div className="text-[8px] md:text-[9px] px-1 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white/90 max-w-[70%] truncate">
                                    {url.split('/').pop() || 'image'}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newUrls = [...customMobileWallpapers];
                                      newUrls.splice(i, 1);
                                      setCustomMobileWallpapers(newUrls);
                                      if (activeMobileCustomIndex === i) setActiveMobileCustomIndex(null);
                                      else if (activeMobileCustomIndex !== null && activeMobileCustomIndex > i) setActiveMobileCustomIndex(activeMobileCustomIndex - 1);
                                    }}
                                    className="p-1 bg-black/70 border border-white/10 text-white/80 hover:text-red-400 rounded pointer-events-auto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {customMobileWallpapers.length < 4 && (
                        <button
                          onClick={() => {
                            const url = prompt("Enter a direct image URL (https://...):");
                            if (url && url.trim().startsWith('http')) {
                              setCustomMobileWallpapers([...customMobileWallpapers, url.trim()]);
                              if (activeMobileCustomIndex === null) setActiveMobileCustomIndex(customMobileWallpapers.length);
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 mt-1 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded text-[9px] md:text-xs text-white/60 hover:text-white"
                        >
                          <Plus className="w-3 h-3" /> Add URL
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reset selection */}
                  {(activeDesktopCustomIndex !== null || activeMobileCustomIndex !== null) && (
                    <div className="flex justify-center mt-1 md:mt-2">
                      <button
                        onClick={() => {
                          setActiveDesktopCustomIndex(null);
                          setActiveMobileCustomIndex(null);
                        }}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white rounded text-[10px] md:text-xs font-bold transition-all border border-red-500/30"
                      >
                        Clear Active Selections
                      </button>
                    </div>
                  )}
                </div>
              )}

              {settingsActiveTab === 'focus' && (
                <div className="flex flex-col gap-3 md:gap-6">
                  <div>
                    <h3 className="hidden md:flex text-xl font-semibold items-center gap-2"><EyeOff className="text-red-400 w-6 h-6" /> Focus & Panic Mode</h3>
                    <p className="text-white/50 text-[10px] md:text-sm md:mt-1 px-1">Configure screen visibility and shortcuts.</p>
                  </div>

                  <div className="flex flex-col p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-black/20 border border-white/5 gap-2 md:gap-4">
                    <h4 className="font-medium text-[11px] md:text-lg">Visibility Shortcuts</h4>

                    {/* Panic Button Action Toggle */}
                    <div className="flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl bg-white/5">
                      <div className="flex flex-col pr-1 min-w-0">
                        <span className="text-[10px] md:text-sm font-medium leading-tight whitespace-nowrap">Panic Action</span>
                        <p className="text-[8px] md:text-xs text-white/50 mt-0.5 leading-tight truncate">Action on clicking eye icon.</p>
                      </div>
                      <div className="flex bg-black/40 p-0.5 rounded border border-white/10 shrink-0">
                        <button
                          onClick={() => setPanicButtonMode('redirect')}
                          className={`px-2 py-1 md:px-4 md:py-1.5 text-[8px] md:text-xs font-bold rounded-sm transition-all ${panicButtonMode === 'redirect' ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Redirect
                        </button>
                        <button
                          onClick={() => setPanicButtonMode('hide')}
                          className={`px-2 py-1 md:px-4 md:py-1.5 text-[8px] md:text-xs font-bold rounded-sm transition-all ${panicButtonMode === 'hide' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Hide UI
                        </button>
                      </div>
                    </div>

                    <div className="p-2 md:p-3 rounded-md md:rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col gap-1">
                      <p className="text-[8px] md:text-[10px] text-red-300 leading-relaxed">
                        <strong className="text-red-400">Mobile Panic:</strong> Tap the <strong className="text-white">Eye Icon</strong> right side to trigger!
                      </p>
                    </div>

                    {/* Panic Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white/5 p-2 md:p-3 rounded-md md:rounded-xl">
                      <div>
                        <p className="text-[10px] md:text-sm font-bold text-red-400">Panic Mode</p>
                        <p className="text-[8px] md:text-xs text-white/50 mt-0.5">Hide all widgets instantly.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={formatShortcutText(panicShortcutKey)}
                            onKeyDown={(e) => handleShortcutCapture(e, setPanicShortcutKey)}
                            readOnly
                            placeholder="Keys..."
                            className="w-24 md:w-48 h-6 md:h-9 px-1.5 bg-black/40 border border-white/10 rounded text-center text-white outline-none focus:border-red-400 font-bold uppercase text-[9px] md:text-xs"
                          />
                          <button
                            onClick={() => togglePanicHide()}
                            className="px-2 py-1 md:px-3 md:py-2 bg-red-500/20 text-red-300 rounded border border-red-500/30 text-[9px] md:text-xs font-bold uppercase"
                          >
                            Trigger
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Panic Wallpaper Switch */}
                    <div className="flex items-center justify-between p-2 md:p-3 rounded-md md:rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <ImageIcon className="text-red-400 w-3.5 h-3.5 md:w-[18px] md:h-[18px] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] md:text-sm font-medium block leading-tight truncate">Switch Wallpaper on Panic</span>
                        </div>
                      </div>
                      <button onClick={() => setPanicWallpaperSwitch(!panicWallpaperSwitch)} className={`relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${panicWallpaperSwitch ? 'bg-red-500' : 'bg-white/20'}`}>
                        <span className={`inline-block h-2.5 w-2.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${panicWallpaperSwitch ? 'translate-x-3.5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Focus Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white/5 p-2 md:p-3 rounded-md md:rounded-xl">
                      <div>
                        <p className="text-[10px] md:text-sm font-bold text-blue-400">Focus Mode</p>
                        <p className="text-[8px] md:text-xs text-white/50 mt-0.5">Hide selected widgets below.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={formatShortcutText(focusShortcutKey)}
                            onKeyDown={(e) => handleShortcutCapture(e, setFocusShortcutKey)}
                            readOnly
                            placeholder="Keys..."
                            className="w-24 md:w-48 h-6 md:h-9 px-1.5 bg-black/40 border border-white/10 rounded text-center text-white outline-none focus:border-blue-400 font-bold uppercase text-[9px] md:text-xs"
                          />
                          <button
                            onClick={() => toggleHide()}
                            className="px-2 py-1 md:px-3 md:py-2 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 text-[9px] md:text-xs font-bold uppercase"
                          >
                            Trigger
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Focus Mode Configuration */}
                  <div className="flex flex-col p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-black/20 border border-white/5">
                    <div className="flex flex-col sm:flex-row justify-between mb-2 md:mb-4 gap-2">
                      <div>
                        <h4 className="font-medium text-[11px] md:text-lg text-red-400 leading-tight">Focus Specific Setup</h4>
                        <div className="flex bg-black/40 p-0.5 rounded border border-white/10 mt-1.5 w-fit">
                          <button
                            onClick={() => setFocusPlatform('desktop')}
                            className={`px-2 py-1 md:px-4 md:py-1.5 text-[8px] md:text-xs font-bold rounded-sm ${focusPlatform === 'desktop' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40'}`}
                          >
                            Desktop
                          </button>
                          <button
                            onClick={() => setFocusPlatform('mobile')}
                            className={`px-2 py-1 md:px-4 md:py-1.5 text-[8px] md:text-xs font-bold rounded-sm ${focusPlatform === 'mobile' ? 'bg-orange-500/20 text-orange-400' : 'text-white/40'}`}
                          >
                            Mobile
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => focusPlatform === 'desktop' ? setHideAll(false) : setMobileHideAll(false)}
                          className="px-2 py-1 md:px-3 md:py-1.5 bg-white/10 rounded text-[8px] md:text-sm"
                        >
                          Keep All
                        </button>
                        <button
                          onClick={() => focusPlatform === 'desktop' ? setHideAll(true) : setMobileHideAll(true)}
                          className="px-2 py-1 md:px-3 md:py-1.5 bg-red-500/20 text-red-300 rounded border border-red-500/30 text-[8px] md:text-sm"
                        >
                          Hide All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 md:gap-3">
                      {Object.entries({
                        quote: 'Daily Quote', stats: 'Stats Modal', plans: 'Roadmap & Plans',
                        countdowns: 'Countdowns', tasks: 'Tasks', notes: 'Quick Notes',
                        calendar: 'Calendar', timetable: 'Timetable', health: 'Health Rings',
                        timer: 'Session Timer', dock: 'Bottom Dock', clock: 'Big Clock',
                        deadlineAlerts: 'Alerts', bgSwitcher: 'Bg Switcher', stopwatch: 'Stopwatch',
                        settingsBtn: 'Settings Btn', videoControls: 'Video Ctrl'
                      }).map(([key, label]) => {
                        const isHidden = focusPlatform === 'desktop' ? hideConfig[key] : mobileHideConfig[key];
                        return (
                          <div key={key} className="flex items-center justify-between p-1.5 md:p-2.5 rounded bg-white/5 border border-white/5">
                            <span className="text-[8px] md:text-sm text-white/80 line-clamp-1 pr-1">{label}</span>
                            <button
                              onClick={() => focusPlatform === 'desktop' ? setHideConfig(key, !hideConfig[key]) : setMobileHideConfig(key, !mobileHideConfig[key])}
                              className={`relative inline-flex h-3 w-6 md:h-5 md:w-9 items-center rounded-full transition-colors shrink-0 ${isHidden ? 'bg-red-500' : 'bg-blue-500/50'}`}
                            >
                              <span className={`inline-block h-2 w-2 md:h-3 md:w-3 transform rounded-full bg-white transition-transform ${isHidden ? 'translate-x-3.5 md:translate-x-5' : 'translate-x-0.5 md:translate-x-1'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'data' && (
                <div className="flex flex-col gap-3 md:gap-6">
                  <div>
                    <h3 className="hidden md:block text-xl font-semibold">Data & Backup</h3>
                    <p className="text-white/50 text-[10px] md:text-sm md:mt-1 px-1">Export, import, or backup data.</p>
                  </div>

                  <div className="p-2.5 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg md:rounded-2xl">
                    <div className="flex items-start gap-2 md:gap-3">
                      <Activity className="text-blue-400 w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-[10px] md:text-base text-blue-300">Important Recommendation</h4>
                        <p className="text-[9px] md:text-sm text-white/80 mt-1 leading-relaxed">
                          Backup data regularly. <strong>Switch to a separate User Profile</strong> before importing friend's plans to avoid overwrites!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 md:gap-4">
                    {/* Backup & Restore */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-black/20 border border-white/5 gap-2 md:gap-4">
                      <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <UploadCloud className="text-green-400 w-4 h-4 md:w-6 md:h-6 shrink-0" />
                        <div className="min-w-0 pr-1">
                          <h4 className="font-medium text-[10px] md:text-lg whitespace-nowrap">Backup & Restore</h4>
                          <p className="text-[8px] md:text-sm text-white/50 leading-tight">Export/Import local JSON.</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 w-full sm:w-auto">
                        <button
                          onClick={handleExportData}
                          className="flex-1 sm:flex-none justify-center px-2 py-1 md:px-4 md:py-2 bg-white/10 rounded text-[9px] md:text-sm font-medium border border-white/10 flex items-center gap-1 md:gap-2"
                        >
                          <Download className="w-3 h-3 md:w-4 md:h-4" /> Export
                        </button>
                        <label className="flex-1 sm:flex-none justify-center cursor-pointer px-2 py-1 md:px-4 md:py-2 bg-blue-500/20 text-blue-300 rounded text-[9px] md:text-sm font-medium border border-blue-500/30 flex items-center gap-1 md:gap-2">
                          <Upload className="w-3 h-3 md:w-4 md:h-4" /> Import
                          <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                        </label>
                      </div>
                    </div>

                    {/* Clear Old Data */}
                    <div className="flex flex-col p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-black/20 border border-white/5 gap-2">
                      <div className="flex items-center gap-2 md:gap-4 min-w-0 mb-1">
                        <Trash2 className="text-yellow-400 w-4 h-4 md:w-6 md:h-6 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-[10px] md:text-lg">Clear Old Data</h4>
                          <p className="text-[8px] md:text-sm text-white/50">Delete health logs older than selected.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 md:gap-2 justify-start sm:pl-6 md:pl-10">
                        {[15, 30, 60, 90, 120].map(days => (
                          <button
                            key={days}
                            onClick={() => setDeleteDays(days)}
                            className={`px-1.5 py-0.5 md:px-3 md:py-1.5 rounded text-[8px] md:text-xs font-semibold border ${deleteDays === days
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                              : 'bg-black/40 text-white/50 border-white/5'
                              }`}
                          >
                            {days}d
                          </button>
                        ))}
                        <button
                          onClick={async () => {
                            if (confirm(`Delete logs older than ${deleteDays} days?`)) {
                              await clearOldData(deleteDays);
                              alert(`Logs cleared.`);
                            }
                          }}
                          className="px-2 py-1 md:px-4 md:py-1.5 bg-yellow-500/20 text-yellow-300 rounded text-[9px] md:text-sm font-bold border border-yellow-500/30 ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone: Delete All Data */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-red-500/10 border border-red-500/30 gap-2">
                      <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <Trash2 className="text-red-400 w-4 h-4 md:w-6 md:h-6 shrink-0" />
                        <div className="min-w-0 pr-1">
                          <h4 className="font-medium text-[10px] md:text-lg text-red-300 whitespace-nowrap">Factory Reset Profile</h4>
                          <p className="text-[8px] md:text-sm text-white/60 leading-tight">Delete ALL tasks, notes, history.</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const userTyped = prompt('Type "delete all" to confirm:');
                          if (userTyped?.toLowerCase() === 'delete all') await clearAllData();
                        }}
                        className="w-full sm:w-auto justify-center px-2 py-1 md:px-4 md:py-2 bg-red-500/20 text-red-300 rounded text-[9px] md:text-sm font-bold border border-red-500/50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> Reset All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'about' && (
                <div className="flex flex-col gap-2 md:gap-0 pb-4">


                  <div className="flex flex-col gap-2 md:gap-4 bg-black/20 border border-white/10 rounded-lg md:rounded-3xl p-2 md:p-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 md:w-64 md:h-64 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />

                    {/* Top Row: Image, Name, Badge, and Title on both Mobile & Desktop */}
                    <div className="flex flex-row items-center gap-2 md:gap-4 w-full z-10">
                      <div className="w-18 h-18 md:w-24 md:h-24 shrink-0 relative rounded-full overflow-hidden border-2 md:border-4 border-white/10 shadow-xl">
                        <img
                          src="/branding/author.jpeg"
                          alt="Gonaboyina Anand kumar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>

                      <div className="flex flex-col flex-1 items-start text-left min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1 w-full">
                          <h2 className="text-sm md:text-2xl font-bold tracking-tight text-white truncate">Gonaboyina Anand kumar</h2>
                          <BadgeCheck className="text-blue-400 shrink-0 w-3.5 h-3.5 md:w-6 md:h-6" />
                        </div>
                        <p className="text-blue-300 font-medium tracking-wide uppercase text-[8px] md:text-[13px]">Full Stack MERN Developer</p>
                      </div>
                    </div>

                    {/* Bottom Content Row: Aligns perfectly to the left on both Mobile & Desktop */}
                    <div className="flex flex-col items-start text-left z-10 w-full">
                      <p className="text-[9px] md:text-[13px] text-white/60 mb-2 md:mb-4 leading-relaxed max-w-xl">
                        Suggestions or bugs? Message me on LinkedIn or Telegram!
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full mb-1">
                        <a href="https://www.linkedin.com/in/anand-kumar-gonaboyina-b63946378" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 md:gap-3 bg-white/5 border border-[#0077b5]/30 rounded-md p-1.5 md:p-2.5 hover:bg-white/10 transition-colors">
                          <div className="p-1 md:p-2 bg-[#0077b5]/20 rounded shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0077b5] w-3 h-3 md:w-[18px] md:h-[18px]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                          </div>
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <span className="text-[7px] md:text-[11px] text-white/50 w-full text-left">LinkedIn</span>
                            <span className="font-semibold text-[8px] md:text-sm w-full text-left truncate">Message me</span>
                          </div>
                        </a>

                        <a href="https://t.me/gAnandKumar" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 md:gap-3 bg-white/5 border border-white/10 rounded-md p-1.5 md:p-2.5 hover:bg-white/10 transition-colors">
                          <div className="p-1 md:p-2 bg-[#0088cc]/20 rounded shrink-0">
                            <Send className="text-[#0088cc] w-3 h-3 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[7px] md:text-[11px] text-white/50 w-full text-left">Telegram</span>
                            <span className="font-semibold text-[8px] md:text-sm w-full text-left truncate">@gAnandKumar</span>
                          </div>
                        </a>

                        <a href="https://my-portfolio-silk-phi-78.vercel.app/" target="_blank" rel="noreferrer" className="col-span-2 justify-self-center w-1/2 min-w-[140px] md:min-w-[240px] flex items-center gap-1.5 md:gap-3 bg-white/5 border border-white/10 rounded-md p-1.5 md:p-2.5 hover:bg-white/10 transition-colors">
                          <div className="p-1 md:p-2 bg-[#0088cc]/20 rounded shrink-0">
                            <Briefcase className="text-[#0088cc] w-3 h-3 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[7px] md:text-[11px] text-white/50 w-full text-left">Portfolio</span>
                            <span className="font-semibold text-[8px] md:text-sm w-full text-left truncate">View other projects</span>
                          </div>
                        </a>
                      </div>

                    </div>
                  </div>


                  {/* Donation Section */}
                  <div className="flex flex-col p-3 md:p-2 bg-black/20 border border-white/5 rounded-lg md:rounded-3xl text-center items-center justify-center relative overflow-hidden md:mt-6 mt-2">
                    <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 md:mt-2">Support the Project ❤️</h3>
                    <p className="text-[9px] md:text-sm text-white/60 max-w-md mx-auto mb-2.5 md:mb-6 leading-relaxed px-1">
                      Built with love, but inspired by the pain of endless distractions and messy workspaces. It took many late nights to bring this vision to life. If this dashboard helps you reclaim your focus, consider supporting its continued development. A small tip goes a long way—and please leave a message, I'd love to hear how it's helping you!
                    </p>

                    <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 mb-3 md:mb-6">
                      {[
                        { amt: 50, label: 'Coffee' }, { amt: 100, label: 'Lunch' },
                        { amt: 200, label: 'Book' }, { amt: 500, label: 'Sponsor' },
                        { amt: null, label: 'Any' }
                      ].map(d => (
                        <button
                          key={d.label}
                          onClick={() => setDonationAmount(d.amt)}
                          className={`px-2 py-1 md:px-4 md:py-2 rounded text-[8px] md:text-xs font-bold border ${donationAmount === d.amt ? 'bg-pink-500/20 text-pink-300 border-pink-500/50' : 'bg-black/40 text-white/50 border-white/5'}`}
                        >
                          {d.amt ? `₹${d.amt}` : 'Any'} {d.amt && `(${d.label})`}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-row items-center gap-3 md:gap-8 bg-white/5 p-2 md:p-3 rounded-lg md:rounded-2xl border border-white/10 w-full sm:w-auto">
                      <div className="bg-white p-1.5 md:p-3 rounded shadow-xl shrink-0">
                        <QRCodeSVG
                          value={`upi://pay?pa=${upiId}&pn=Anand%20Kumar&cu=INR${donationAmount ? `&am=${donationAmount}` : ''}`}
                          size={70}
                          className="md:w-[130px] md:h-[130px]"
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="flex flex-col text-left gap-1 md:gap-3 min-w-0 pr-2">
                        <div>
                          <p className="text-[8px] md:text-xs text-white/70 uppercase font-semibold mb-0.5 whitespace-nowrap">Scan to Pay</p>
                          <p className="font-bold text-xs md:text-lg text-white">{donationAmount ? `₹${donationAmount}` : 'Any Amount'}</p>
                        </div>
                        <div className="h-px w-full bg-white/10 my-0.5" />
                        <div className="min-w-0">
                          <p className="text-[8px] md:text-xs text-white/50 uppercase font-semibold mb-0.5">UPI ID</p>
                          <p className="text-[9px] md:text-sm text-blue-300 font-mono truncate">{upiId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credits & Supporters Section */}
                  <div className="flex flex-col gap-3 md:gap-6 mt-4 md:mt-12 pt-3 md:pt-8 border-t border-white/10">
                    <h3 className="text-xs md:text-xl font-semibold flex items-center gap-1.5 md:gap-2">
                      <BadgeCheck className="text-pink-400 w-4 h-4 md:w-6 md:h-6" /> Credits & Supporters
                    </h3>

                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2.5 md:p-5 flex flex-col gap-1.5">
                      <p className="text-[9px] md:text-sm text-pink-300 font-medium leading-relaxed">
                        I originally started building this out of pure frustration. I needed something to help me stay on track.
                      </p>
                      <p className="text-[8px] md:text-sm text-pink-200/80 leading-relaxed italic">
                        "A big thank you to everyone who believed in this project and tested it. Thanks for always having my back."
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                      {/* Sathish Kumar */}
                      <div className="bg-black/20 border border-white/5 rounded-lg p-3 md:p-8 flex items-center text-left md:flex-col md:text-center gap-3">
                        <div className="w-12 h-12 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden border-2 border-white/10">
                          <img src="/sathish.jpeg" alt="Sathish" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="flex flex-col md:items-center min-w-0 flex-1">
                          <h4 className="text-sm md:text-xl font-bold text-white truncate">Sathish Kumar</h4>
                          <p className="text-[8px] md:text-xs text-white/60 font-semibold uppercase mt-0.5 truncate"><span className="text-blue-300">EEE</span> • NIT Patna</p>
                          <p className=" text-[10px] md:text-sm text-white/60 mt-2 leading-relaxed">

                            Tested countless hours to identify bugs and provided invaluable UX suggestions.
                          </p>
                        </div>
                      </div>

                      {/* Jyothir Ganesh */}
                      <div className="bg-black/20 border border-white/5 rounded-lg p-3 md:p-8 flex items-center text-left md:flex-col md:text-center gap-3">
                        <div className="w-12 h-12 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden border-2 border-white/10">
                          <img src="/jyothir.png" alt="Jyothir" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="flex flex-col md:items-center min-w-0 flex-1">
                          <h4 className="text-sm md:text-xl font-bold text-white truncate">Jyothir Ganesh</h4>
                          <p className="text-[8px] md:text-xs text-white/60 font-semibold uppercase mt-0.5 truncate"><span className="text-blue-300">ECE</span> • Vishnu Inst.</p>
                          <p className=" text-[10px] md:text-sm text-white/60 mt-2 leading-relaxed">
                            My strongest pillar of support. Always provides grounded, factual advice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Content Scroll Down Button */}
            {canContentScrollDown && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover/content:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(settingsScrollRef, 'down')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronDown className="w-4 h-4 md:w-6 md:h-6" strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {friendStats && (() => {
        const calculateHistory = (days: number) => {
          if (!friendStats?.stats?.history) return 0;
          let total = 0;
          const today = new Date();
          for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            total += friendStats.stats.history[dateStr] || 0;
          }
          return total;
        };

        const formatMins = (totalMins: number) => {
          if (totalMins < 60) return `${totalMins}m`;
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
        };

        const raw1 = calculateHistory(1);
        const raw7 = calculateHistory(7);
        const raw30 = calculateHistory(30);

        const todayMins = formatMins(raw1);
        const sevenDaysMins = formatMins(raw7);
        const monthMins = formatMins(raw30);

        const sevenDaysAvg = formatMins(Math.round(raw7 / 7));
        const monthAvg = formatMins(Math.round(raw30 / 30));

        const allTasks = friendStats.stats?.tasks || [];
        const timetableGridData = friendStats.stats?.timetableGrid || {};
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const hasTimetable = weekDays.some(day => Object.values(timetableGridData[day] || {}).some(subj => subj));

        return (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-300 pointer-events-auto">
            <div className="absolute inset-0 bg-transparent" onClick={() => setFriendStats(null)} />
            <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 w-full max-w-4xl h-[80vh] md:h-[80vh] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-3 md:p-6 border-b border-white/10 bg-white/5 shrink-0">
                <div>
                  <h4 className="font-bold text-base md:text-2xl flex items-center gap-2 text-white">
                    <BarChart2 className="text-blue-400 w-4 h-4 md:w-7 md:h-7" /> {friendStats.username}
                  </h4>
                  <div className="flex items-center flex-wrap gap-1.5 md:gap-3 mt-1 text-[8px] md:text-xs font-medium">
                    {friendStats.stats?.createdAt && (
                      <span className="bg-white/10 text-white/70 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded">Joined {new Date(friendStats.stats.createdAt).toLocaleDateString()}</span>
                    )}
                    {friendStats.stats?.lastLogin && (
                      <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded border border-emerald-500/20">Last Active: {new Date(friendStats.stats.lastLogin).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setFriendStats(null)} className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white self-start sm:self-auto">
                  <X className="w-4 h-4 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="relative flex-1 overflow-hidden flex flex-col w-full">
                <ScrollableWithArrows className="p-3 md:p-6 flex flex-col gap-4 md:gap-8 overflow-x-hidden w-full [&_*]:max-w-full">

                  {/* Work History */}
                  <div>
                    <h5 className="text-[10px] md:text-sm font-bold text-white/50 uppercase tracking-widest mb-1.5 md:mb-3">Work History</h5>
                    <div className="grid grid-cols-3 gap-1.5 md:gap-4">
                      <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/20 rounded-lg p-2 flex flex-col items-center text-center">
                        <span className="text-sm md:text-4xl font-black text-blue-400 mb-0.5">{todayMins}</span>
                        <span className="text-[7px] md:text-xs font-bold text-blue-400/50 uppercase tracking-widest">Today</span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/20 rounded-lg p-2 flex flex-col items-center text-center">
                        <span className="text-sm md:text-4xl font-black text-purple-400 mb-0.5">{sevenDaysMins}</span>
                        <span className="text-[7px] md:text-[10px] font-bold text-purple-400/50 uppercase tracking-widest">7 Days</span>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 rounded-lg p-2 flex flex-col items-center text-center">
                        <span className="text-sm md:text-4xl font-black text-emerald-400 mb-0.5">{monthMins}</span>
                        <span className="text-[7px] md:text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest">30 Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 min-w-0">
                    {/* Tasks */}
                    <div className="min-w-0">
                      <h5 className="text-[10px] md:text-sm font-bold text-white/50 uppercase tracking-widest mb-1.5 md:mb-3 flex items-center gap-2">
                        Tasks <span className="bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full text-[8px] md:text-[10px]">{allTasks.length}</span>
                      </h5>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-2 md:p-4 flex flex-col gap-1.5">
                        {allTasks.length === 0 ? (
                          <p className="text-white/40 text-[9px] md:text-xs italic text-center py-2">No tasks found.</p>
                        ) : (
                          allTasks.map((t: any) => (
                            <div key={t.id} className="flex flex-col gap-1 text-[9px] md:text-sm text-white/80 bg-white/5 p-1.5 md:p-3 rounded border border-white/5 break-words">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className={t.completed ? 'line-through text-white/40' : ''}>{t.title || t.text}</span>
                                {t.completed && <span className="bg-emerald-500/20 text-emerald-400 text-[7px] md:text-[10px] px-1 py-0.5 rounded uppercase font-bold shrink-0">Done</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Timetable Overview */}
                    <div className="min-w-0">
                      <h5 className="text-[10px] md:text-sm font-bold text-white/50 uppercase tracking-widest mb-1.5 md:mb-3">Timetable (Weekdays)</h5>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-2 md:p-4 flex flex-col gap-1.5">
                        {!hasTimetable ? (
                          <p className="text-white/40 text-[9px] md:text-xs italic text-center py-2">No timetable set.</p>
                        ) : (
                          weekDays.map(day => {
                            const dayData = timetableGridData[day] || {};
                            const activeTimes = Object.entries(dayData).filter(([_, subj]) => subj);
                            if (activeTimes.length === 0) return null;
                            return (
                              <div key={day} className="flex flex-col gap-0.5 text-[8px] md:text-xs border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                <span className="text-blue-400 font-bold">{day}</span>
                                <div className="flex flex-wrap gap-0.5">
                                  {activeTimes.map(([time, subject]) => (
                                    <span key={time} className="bg-white/10 px-1 py-0.5 rounded text-white/80">
                                      <span className="text-white/40 mr-1">{time}</span>{subject as string}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-white/40 text-[8px] md:text-[10px] italic mt-auto pt-2 border-t border-white/10 shrink-0">Only public statistics are shared.</p>
                </ScrollableWithArrows>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}