'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Upload, Trash2, Image as ImageIcon, Settings as SettingsIcon, MonitorPlay, Clock, Users, Plus, Eye, EyeOff, Download, UploadCloud, Activity, MessageSquare, Timer as TimerIcon, Hourglass, Film, User, BadgeCheck, Send, Briefcase, Calendar, CheckSquare, Flame, ChevronUp, ChevronDown, Database, Bell, RefreshCw, AlertTriangle, CheckCircle, BarChart2, Map, StickyNote, CalendarDays, Layout, Globe, Star, Bug } from 'lucide-react';
import ConnectTab from './ConnectTab';
import ScrollableWithArrows from './ScrollableWithArrows';

const DEFAULT_WALLPAPERS = [
  'itachi-uchiha.png', 'kakashi.mp4', 'kakashi2.mp4', 'kakashi3.png',
  'kakashiChild.jpg', 'naruto.webp', 'RockLee.mp4', 'squa7.jpg', 'demonslayer1.mp4'
];

export default function SettingsModal() {
  const { settingsActiveTab, setSettingsActiveTab, isSettingsOpen, toggleSettings, is24HourClock, toggle24HourClock, currentBgSrc, hiddenWallpapers, toggleWallpaperVisibility, showHealth, showQuote, showTimer, showCountdowns, showVideoControls, showClock, showTasks, showCalendar, showTodayWork, showStats, showPlans, showNotes, showTimetable, showDock, showDeadlineAlerts, showBgSwitcher, showSettingsBtn, showStopwatch, toggleVisibility, isSlideshowEnabled, setIsSlideshowEnabled, slideshowIntervalMins, setSlideshowIntervalMins, lockedWidgets, toggleWidgetLock, resetAllOffsets, clearOldData, clearAllData, lockedWallpaper, setLockedWallpaper, deadlineAlertDays, setDeadlineAlertDays, hideConfig, setHideConfig, setHideAll, mobileHideConfig, setMobileHideConfig, setMobileHideAll, rightWidgetsOffset, setRightWidgetsOffset, alarmSound, setAlarmSound, alarmDurationSecs, setAlarmDurationSecs, alarmVolume, setAlarmVolume, enableAlarmSound, setEnableAlarmSound, enableAlarmVibration, setEnableAlarmVibration, toggleHide, panicShortcutKey, setPanicShortcutKey, focusShortcutKey, setFocusShortcutKey, togglePanicHide, panicWallpaperSwitch, setPanicWallpaperSwitch, timetableGrid, panicButtonMode, setPanicButtonMode, customDesktopWallpapers, setCustomDesktopWallpapers, activeDesktopCustomIndex, setActiveDesktopCustomIndex, customMobileWallpapers, setCustomMobileWallpapers, activeMobileCustomIndex, setActiveMobileCustomIndex } = useDashboardStore();
  
  const [focusPlatform, setFocusPlatform] = useState<'desktop' | 'mobile'>('desktop');

  // ----- DESKTOP SITE OVERRIDE LOGIC -----
  useEffect(() => {
    if (!isSettingsOpen || window.innerWidth > 768) return;

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    let originalContent = '';

    if (viewportMeta) {
      originalContent = viewportMeta.getAttribute('content') || '';
      // Force a minimum width to trigger desktop breakpoints and scale it to fit mobile screens
      viewportMeta.setAttribute('content', 'width=1024');
    }

    return () => {
      // Revert to original viewport when modal closes
      if (viewportMeta && originalContent) {
        viewportMeta.setAttribute('content', originalContent);
      }
    };
  }, [isSettingsOpen]);
  // ---------------------------------------

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
    // Alt removed from custom combinations to prevent Alt+F4 and Windows OS conflicts
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
        fetchMySubmissions(); // refresh statuses
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

  const [wallpapers, setWallpapers] = useState<{ type: string, src: string, filename: string }[]>([]);
  const [friendStats, setFriendStats] = useState<{ username: string, stats: any } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Drag to scroll logic for SettingsModal
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

  const [profiles, setProfiles] = useState<{ id: number, name: string }[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const activeProfileId = typeof window !== 'undefined' ? localStorage.getItem('dashboard-active-profile') || '1' : '1';

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

            // Intelligently merge arrays to prevent data loss (deduplicate by id)
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

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleSettings}
      />

      <div className="relative w-full max-w-4xl h-[90vh] md:h-[70vh] flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden text-white animate-in zoom-in-95 duration-200">

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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black/20">
          <h2 className="text-lg md:text-2xl font-bold tracking-wide flex items-center gap-2 md:gap-3">
            <SettingsIcon className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
            Dashboard Settings
          </h2>
          <button
            onClick={toggleSettings}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/10 flex flex-col relative group shrink-0">
            {canSidebarScrollUp && (
              <div className="absolute top-2 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              className="flex-1 p-2 md:p-4 max-md:py-2 md:pb-12 md:pt-10 flex flex-row md:flex-col gap-1.5 md:gap-2 overflow-x-auto md:overflow-y-auto arrow-scrollbar no-scrollbar"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >

              <button
                onClick={() => setSettingsActiveTab('preferences')}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'preferences' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <MonitorPlay className="w-4 h-4 md:w-5 md:h-5" />
                Preferences
              </button>
              <button
                onClick={() => setSettingsActiveTab('wallpaper')}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'wallpaper' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                Wallpapers
              </button>
              <button
                onClick={() => setSettingsActiveTab('sound')}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'sound' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                Sound Settings
              </button>

              <button
                onClick={() => setSettingsActiveTab('focus')}
                className={`hidden md:flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'focus' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                Focus / Panic Mode
              </button>
              <button
                onClick={() => setSettingsActiveTab('data')}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'data' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <Database className="w-4 h-4 md:w-5 md:h-5" />
                Data & Backup
              </button>
              <button
                onClick={() => setSettingsActiveTab('connect')}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'connect' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <Globe className={`w-4 h-4 md:w-5 md:h-5 ${settingsActiveTab === 'connect' ? 'text-blue-400 animate-pulse' : ''}`} />
                Connect & News
              </button>

              <button
                onClick={() => setSettingsActiveTab('feedback')}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-xs md:text-sm font-medium ${settingsActiveTab === 'feedback' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <Bug className="w-4 h-4 md:w-5 md:h-5" />
                Feedback & Bugs
              </button>
              <button
                onClick={() => setSettingsActiveTab('about')}
                className={`relative overflow-hidden shrink-0 group flex md:flex-col items-center justify-center gap-2 md:px-4 md:py-6 px-3 py-2 rounded-xl md:rounded-2xl transition-all md:w-full ${settingsActiveTab === 'about' ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg' : 'bg-black/20 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/5'}`}
              >
                <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none glass-sweep-anim" style={{ left: '-100%' }} />
                <img
                  src="/branding/author.jpeg"
                  alt="Developer"
                  className="w-6 h-6 md:w-14 md:h-14 rounded-full object-cover shadow-lg border md:border-2 border-white/20 relative z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<svg class="w-6 h-6 md:w-8 md:h-8 relative z-10" ... />');
                  }}
                />
                <div className="flex flex-col items-center text-center relative z-10">
                  <span className="text-xs md:text-sm font-semibold tracking-wide leading-tight whitespace-nowrap">Support & Connect</span>
                  <span className="hidden md:block text-[10px] text-blue-300 font-medium uppercase mt-1 tracking-wider">Gonaboyina Anand kumar</span>
                </div>
              </button>
            </div>

            {/* Sidebar Scroll Down Button */}
            {canSidebarScrollDown && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(sidebarScrollRef, 'down')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronDown size={18} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="relative flex-1 overflow-hidden flex flex-col group/content">
            {/* Content Scroll Up Button */}
            {canContentScrollUp && (
              <div className="absolute top-4 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover/content:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(settingsScrollRef, 'up')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 md:p-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
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
              className="flex-1 overflow-y-auto p-4 pt-6 pb-12 md:p-6 md:pb-16 md:pt-12 arrow-scrollbar"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >

              {settingsActiveTab === 'connect' && <ConnectTab friendStats={friendStats} setFriendStats={setFriendStats} />}

              {settingsActiveTab === 'preferences' && (
                <div className="flex flex-col gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold">General Preferences</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Customize how your dashboard looks and feels.</p>
                  </div>

                  <div className="flex flex-col gap-2 md:gap-2">
                    {/* Toggle 24-hour clock */}
                    <div className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-white/5 rounded-lg shrink-0">
                          <Clock className="text-blue-300 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-base">24-Hour Clock Format</h4>
                          <p className="text-[10px] md:text-xs text-white/50">Use military time (e.g., 14:00 instead of 2:00 PM)</p>
                        </div>
                      </div>
                      <button
                        onClick={toggle24HourClock}
                        className={`relative inline-flex h-5 w-10 md:h-6 md:w-12 items-center rounded-full transition-colors shrink-0 ${is24HourClock ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${is24HourClock ? 'translate-x-6 md:translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Deadline Alerts */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 md:p-3 rounded-xl bg-black/20 border border-white/5 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-white/5 rounded-lg shrink-0">
                          <Bell className="text-yellow-400 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-base">Deadline Alerts</h4>
                          <p className="text-[10px] md:text-xs text-white/50">Show a popup on the main screen when deadlines approach.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto mt-1 sm:mt-0">
                        <span className="text-white/60 text-[10px] md:text-xs">Alert me</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={deadlineAlertDays}
                          onChange={(e) => setDeadlineAlertDays(parseInt(e.target.value) || 0)}
                          className="w-12 md:w-14 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-center text-white outline-none focus:border-yellow-400 font-medium text-xs md:text-sm"
                        />
                        <span className="text-white/60 text-[10px] md:text-xs">days before</span>
                      </div>
                    </div>

                    {/* Right Toolbar Position */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 md:p-3 rounded-xl bg-black/20 border border-white/5 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-white/5 rounded-lg shrink-0">
                          <Layout className="text-cyan-400 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-base">Right Toolbar Position</h4>
                          <p className="text-[10px] md:text-xs text-white/50">Adjust the vertical height of the right-side widgets.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-black/40 border border-white/10 rounded-lg p-1 self-end sm:self-auto mt-1 sm:mt-0">
                        <button
                          onClick={() => setRightWidgetsOffset(Math.max(0, rightWidgetsOffset - 10))}
                          className="p-1 md:p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 md:w-4 md:h-4" />
                        </button>
                        <span className="font-bold text-xs md:text-sm w-8 md:w-10 text-center text-cyan-300">{rightWidgetsOffset}</span>
                        <button
                          onClick={() => setRightWidgetsOffset(rightWidgetsOffset + 10)}
                          className="p-1 md:p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                        >
                          <ChevronUp className="w-4 h-4 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Widget Layout & Positioning */}
                    <div className="flex flex-col p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 mt-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
                        <h4 className="font-medium text-sm md:text-lg">Widget Layout & Positioning</h4>
                        <button
                          onClick={() => {
                            if (currentBgSrc) resetAllOffsets(currentBgSrc);
                          }}
                          className="px-3 py-1.5 md:px-4 md:py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg md:rounded-xl transition-colors border border-red-500/30 font-medium text-[10px] md:text-sm"
                        >
                          Reset Default Positions
                        </button>
                      </div>
                      <p className="text-xs md:text-sm text-white/50 mb-3 md:mb-4">Lock the drag position of specific elements on your dashboard.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                        {/* Lock Clock */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Clock className="text-blue-300 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Clock</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('clock')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('clock') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('clock') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Tasks */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <CheckSquare className="text-green-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Tasks</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('tasks')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('tasks') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('tasks') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Quote */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <MessageSquare className="text-yellow-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Quote</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('quote')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('quote') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('quote') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Countdowns */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Hourglass className="text-purple-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Countdowns</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('countdowns')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('countdowns') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('countdowns') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Calendar */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Calendar className="text-pink-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Calendar</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('calendar')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('calendar') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('calendar') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Timer */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <TimerIcon className="text-orange-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Timer</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('timer')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('timer') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('timer') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Toolbar */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Layout className="text-indigo-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Lock Toolbar</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('toolbar')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('toolbar') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('toolbar') ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Widget Visibility */}
                    <div className="flex flex-col p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 mt-2 md:mt-4">
                      <h4 className="font-medium text-sm md:text-lg mb-3 md:mb-4">Widget Visibility</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                        {/* Health Rings */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Activity className="text-red-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Health Rings</span>
                          </div>
                          <button onClick={() => toggleVisibility('showHealth')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showHealth ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showHealth ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Quote */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <MessageSquare className="text-purple-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Daily Quote</span>
                          </div>
                          <button onClick={() => toggleVisibility('showQuote')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showQuote ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showQuote ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <TimerIcon className="text-yellow-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Session Timer</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTimer')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showTimer ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showTimer ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Stopwatch */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Clock className="text-blue-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Stopwatch</span>
                          </div>
                          <button onClick={() => toggleVisibility('showStopwatch')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showStopwatch ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showStopwatch ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Countdowns */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Hourglass className="text-blue-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Countdowns</span>
                          </div>
                          <button onClick={() => toggleVisibility('showCountdowns')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showCountdowns ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showCountdowns ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Video Controls */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Film className="text-green-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Video Controls</span>
                          </div>
                          <button onClick={() => toggleVisibility('showVideoControls')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showVideoControls ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showVideoControls ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Clock */}
                        <div className="flex flex-col justify-center p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 md:gap-3">
                              <Clock className="text-cyan-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                              <span className="text-xs md:text-sm font-medium">Clock</span>
                            </div>
                            <button onClick={() => toggleVisibility('showClock')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showClock ? 'bg-blue-500' : 'bg-white/20'}`}>
                              <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showClock ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <p className="text-[9px] md:text-[10px] text-white/40 mt-1.5 leading-tight italic">
                            * Permanently hidden on mobile view to save space
                          </p>
                        </div>

                        {/* Today's Focus */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Flame className="text-orange-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Today's Focus</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTodayWork')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showTodayWork ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showTodayWork ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Tasks */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <CheckSquare className="text-orange-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Tasks</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTasks')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showTasks ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showTasks ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Calendar */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Calendar className="text-pink-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Calendar</span>
                          </div>
                          <button onClick={() => toggleVisibility('showCalendar')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showCalendar ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showCalendar ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Stats Modal */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <BarChart2 className="text-emerald-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Stats Modal</span>
                          </div>
                          <button onClick={() => toggleVisibility('showStats')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showStats ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showStats ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Roadmap & Plans */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Map className="text-indigo-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Roadmap</span>
                          </div>
                          <button onClick={() => toggleVisibility('showPlans')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showPlans ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showPlans ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Quick Notes */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <StickyNote className="text-yellow-300 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Quick Notes</span>
                          </div>
                          <button onClick={() => toggleVisibility('showNotes')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showNotes ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showNotes ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Timetable */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <CalendarDays className="text-purple-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Timetable</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTimetable')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showTimetable ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showTimetable ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Bottom Dock */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Layout className="text-cyan-300 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Bottom Dock</span>
                          </div>
                          <button onClick={() => toggleVisibility('showDock')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showDock ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showDock ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Deadline Alerts Tgl */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <Bell className="text-red-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Alerts Tgl</span>
                          </div>
                          <button onClick={() => toggleVisibility('showDeadlineAlerts')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showDeadlineAlerts ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showDeadlineAlerts ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Background Switcher */}
                        <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <ImageIcon className="text-green-300 w-4 h-4 md:w-[18px] md:h-[18px]" />
                            <span className="text-xs md:text-sm font-medium">Bg Switcher</span>
                          </div>
                          <button onClick={() => toggleVisibility('showBgSwitcher')} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors ${showBgSwitcher ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${showBgSwitcher ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'sound' && (
                <div className="flex flex-col gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                      <Bell className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
                      Sound Settings
                    </h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Manage notification sounds, playback timers, and settings.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-6 md:gap-8">

                    {/* Auto Stop Timer */}
                    <div className="flex flex-col gap-3 md:gap-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm md:text-base font-semibold text-white/80">Auto Stop Timer</label>
                        <span className="text-[10px] md:text-xs bg-white/10 px-2 py-1 rounded text-white/60">{alarmDurationSecs} Seconds</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-white/40 -mt-2">How long should the sound ring before automatically turning off?</p>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={alarmDurationSecs || 60}
                        onChange={(e) => setAlarmDurationSecs(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 mt-1">
                        <span>5s</span>
                        <span>1m</span>
                        <span>2m</span>
                      </div>
                    </div>

                    {/* Enable Sound Toggle */}
                    <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-medium text-white/80">Enable Alarm Sound</span>
                        <p className="text-[10px] md:text-xs text-white/40">Play alarm sound when the timer finishes</p>
                      </div>
                      <button
                        onClick={() => setEnableAlarmSound(!enableAlarmSound)}
                        className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${enableAlarmSound ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${enableAlarmSound ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Enable Vibration Toggle */}
                    <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-medium text-white/80">Enable Device Vibration</span>
                        <p className="text-[10px] md:text-xs text-white/40">Vibrate your device when the timer finishes</p>
                      </div>
                      <button
                        onClick={() => setEnableAlarmVibration(!enableAlarmVibration)}
                        className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${enableAlarmVibration ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${enableAlarmVibration ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Alarm Selection */}
                    <div className="flex flex-col gap-3 md:gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm md:text-base font-semibold text-white/80">Select Alarm Sound</label>
                      </div>

                      <div className="grid gap-2">
                        {/* Default Alarm */}
                        <div
                          className={`flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all cursor-pointer ${alarmSound === '/ringtones/alarm.mp3' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                          onClick={() => setAlarmSound('/ringtones/alarm.mp3')}
                        >
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 flex items-center justify-center ${alarmSound === '/ringtones/alarm.mp3' ? 'border-blue-400' : 'border-white/30'}`}>
                              {alarmSound === '/ringtones/alarm.mp3' && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-400" />}
                            </div>
                            <span className="text-xs md:text-sm font-medium">Default Alarm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'feedback' && (
                <div className="flex flex-col gap-4 md:gap-6 h-full overflow-y-auto arrow-scrollbar pb-6 md:pb-10">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                      <Bug className="text-orange-400 w-5 h-5 md:w-6 md:h-6" />
                      Feedback & Bug Reports
                    </h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Help us improve the dashboard! Submit feature requests or report issues directly to the developer.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs md:text-sm font-semibold text-white/80">Type</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFeedbackType('feature')}
                          className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm transition-colors border ${feedbackType === 'feature' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          💡 Feature
                        </button>
                        <button
                          onClick={() => setFeedbackType('bug')}
                          className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm transition-colors border ${feedbackType === 'bug' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          🐛 Bug
                        </button>
                        <button
                          onClick={() => setFeedbackType('other')}
                          className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm transition-colors border ${feedbackType === 'other' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          💬 General
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs md:text-sm font-semibold text-white/80">Message</label>
                      <textarea
                        rows={4}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm outline-none focus:border-orange-500/50 transition-all placeholder:text-white/40 resize-none md:min-h-[120px]"
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Describe your idea or the issue you encountered..."
                      />
                    </div>

                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback || feedbackSuccess}
                      className={`self-end px-4 py-1.5 md:px-6 md:py-2 font-bold rounded-lg text-xs md:text-sm transition-colors shadow-lg flex items-center gap-1.5 md:gap-2 ${feedbackSuccess ? 'bg-green-500 text-white' : 'bg-orange-500/80 hover:bg-orange-500 text-white'}`}
                    >
                      {isSubmittingFeedback ? <RefreshCw className="animate-spin w-3.5 h-3.5 md:w-4 md:h-4" /> : feedbackSuccess ? <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      {feedbackSuccess ? 'Sent!' : 'Submit Feedback'}
                    </button>
                  </div>

                  {/* My Submissions Status */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs md:text-sm font-semibold text-white/80">My Submission Status</label>
                      <button onClick={fetchMySubmissions} className="text-[10px] md:text-xs text-white/40 hover:text-white/70 transition-colors">Refresh</button>
                    </div>
                    {mySubmissions.length === 0 ? (
                      <p className="text-white/30 text-[10px] md:text-xs italic text-center py-2 md:py-3 bg-black/20 rounded-lg">No submissions yet — submit above to track status!</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {mySubmissions.map((item: any) => {
                          const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
                            pending: { label: 'Under Review', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', dot: 'bg-yellow-400' },
                            reviewed: { label: 'Reviewed', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', dot: 'bg-blue-400' },
                            added_to_roadmap: { label: '✓ On Roadmap!', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', dot: 'bg-emerald-400' },
                          };
                          const s = statusConfig[item.status] || { label: item.status, color: 'text-white/40 border-white/10 bg-white/5', dot: 'bg-white/20' };
                          return (
                            <div key={item.id} className="bg-black/30 border border-white/10 p-2.5 md:p-3 rounded-xl flex items-start justify-between gap-2.5 md:gap-3">
                              <div className="flex flex-col gap-1">
                                <p className="text-white/70 text-[11px] md:text-xs leading-relaxed">{item.message}</p>
                                {item.createdAt && (
                                  <span className="text-[9px] md:text-[10px] text-white/40">
                                    {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border shrink-0 flex items-center gap-1 md:gap-1.5 ${s.color}`}>
                                <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${s.dot}`}></span>
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
                <div className="flex flex-col gap-6 md:gap-8 h-full overflow-y-auto arrow-scrollbar pb-6 md:pb-10">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                      <ImageIcon className="text-purple-400 w-5 h-5 md:w-6 md:h-6" />
                      Custom Wallpapers
                    </h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Provide external image URLs to use as custom wallpapers. Max 4 per device type.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Desktop Custom Wallpapers */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                      <h4 className="font-medium text-sm md:text-base text-blue-300 border-b border-white/10 pb-2">Desktop Wallpapers</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {customDesktopWallpapers.map((url, i) => {
                          const isVideo = url.match(/\.(mp4|webm)$/i);
                          return (
                            <div key={`desktop-wp-${i}`} className={`relative group aspect-video rounded-xl border overflow-hidden transition-all ${activeDesktopCustomIndex === i ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/40'}`}>
                              <div 
                                className="absolute inset-0 cursor-pointer bg-black/40"
                                onClick={() => setActiveDesktopCustomIndex(i)}
                                title="Click to set as active wallpaper"
                              >
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay playsInline />
                                ) : (
                                  <img src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Custom wallpaper" />
                                )}
                              </div>
                              
                              <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                                <div className="flex justify-end w-full">
                                  {activeDesktopCustomIndex === i && <div className="bg-purple-500/90 rounded-full p-1 shadow-lg backdrop-blur-md"><BadgeCheck className="text-white w-4 h-4" /></div>}
                                </div>
                                <div className="flex justify-between items-end w-full">
                                  <div className="text-[9px] px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white/90 max-w-[70%] truncate shadow-lg">
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
                                    className="p-1.5 bg-black/70 backdrop-blur-md border border-white/10 text-white/80 hover:text-red-400 hover:bg-red-500/30 rounded-lg transition-colors pointer-events-auto shadow-lg"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
                          className="flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-xs text-white/60 hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Desktop URL
                        </button>
                      )}
                    </div>

                    {/* Mobile Custom Wallpapers */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                      <h4 className="font-medium text-sm md:text-base text-pink-300 border-b border-white/10 pb-2">Mobile Wallpapers</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {customMobileWallpapers.map((url, i) => {
                          const isVideo = url.match(/\.(mp4|webm)$/i);
                          return (
                            <div key={`mobile-wp-${i}`} className={`relative group aspect-[9/16] rounded-xl border overflow-hidden transition-all ${activeMobileCustomIndex === i ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/40'}`}>
                              <div 
                                className="absolute inset-0 cursor-pointer bg-black/40"
                                onClick={() => setActiveMobileCustomIndex(i)}
                                title="Click to set as active wallpaper"
                              >
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay playsInline />
                                ) : (
                                  <img src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Custom wallpaper" />
                                )}
                              </div>
                              
                              <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                                <div className="flex justify-end w-full">
                                  {activeMobileCustomIndex === i && <div className="bg-purple-500/90 rounded-full p-1 shadow-lg backdrop-blur-md"><BadgeCheck className="text-white w-4 h-4" /></div>}
                                </div>
                                <div className="flex justify-between items-end w-full">
                                  <div className="text-[9px] px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white/90 max-w-[70%] truncate shadow-lg">
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
                                    className="p-1.5 bg-black/70 backdrop-blur-md border border-white/10 text-white/80 hover:text-red-400 hover:bg-red-500/30 rounded-lg transition-colors pointer-events-auto shadow-lg"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
                          className="flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-xs text-white/60 hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Mobile URL
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Reset selection */}
                  {(activeDesktopCustomIndex !== null || activeMobileCustomIndex !== null) && (
                    <div className="flex justify-center mt-2">
                       <button 
                         onClick={() => {
                           setActiveDesktopCustomIndex(null);
                           setActiveMobileCustomIndex(null);
                         }}
                         className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/30"
                       >
                         Clear Active Selections (Revert to Default)
                       </button>
                    </div>
                  )}
                </div>
              )}

              {settingsActiveTab === 'focus' && (
                <div className="flex flex-col gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2"><EyeOff className="text-red-400 w-5 h-5 md:w-6 md:h-6" /> Focus & Panic Mode</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Configure your screen visibility and customize shortcuts.</p>
                  </div>

                  {/* Screen Visibility & Shortcuts */}
                  <div className="flex flex-col p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 mt-1 md:mt-2 gap-3 md:gap-4">
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <h4 className="font-medium text-sm md:text-lg">Screen Visibility Shortcuts</h4>
                    </div>

                    {/* Panic Button Action Toggle */}
                    <div className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-medium leading-tight">Panic Button Action</span>
                        <p className="text-[9px] md:text-xs text-white/50 mt-0.5 leading-tight">Choose what happens when you click the eye icon in the toolbar.</p>
                      </div>
                      <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 shrink-0">
                        <button
                          onClick={() => setPanicButtonMode('redirect')}
                          className={`px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${panicButtonMode === 'redirect' ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Redirect
                        </button>
                        <button
                          onClick={() => setPanicButtonMode('hide')}
                          className={`px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${panicButtonMode === 'hide' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Hide UI
                        </button>
                      </div>
                    </div>

                    {/* Mobile Panic Button Explanation */}
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col gap-1.5">
                      <p className="text-[10px] text-red-300 leading-relaxed">
                        <strong className="text-red-400">Mobile Panic Button:</strong> Tap the <strong className="text-white">Eye Icon</strong> in the right-side floating toolbar to trigger Panic Mode!
                      </p>
                      <ul className="text-[10px] text-red-300/80 list-disc pl-4 space-y-1">
                        <li><strong className="text-white/80">Redirect:</strong> Instantly throws you into Flipkart or Telegram to hide that you were being productive!</li>
                        <li><strong className="text-white/80">Hide UI:</strong> Instantly hides all visible widgets and leaves you with just the wallpaper (and photo switch if enabled).</li>
                      </ul>
                    </div>

                    {/* Panic Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 bg-white/5 p-2.5 md:p-3 rounded-xl">
                      <div>
                        <p className="text-xs md:text-sm font-bold text-red-400">Panic Mode (Hide Everything)</p>
                        <p className="text-[10px] md:text-xs text-white/50 mt-0.5">Instantly hide all widgets from your screen.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <input
                            type="text"
                            value={formatShortcutText(panicShortcutKey)}
                            onKeyDown={(e) => handleShortcutCapture(e, setPanicShortcutKey)}
                            readOnly
                            placeholder="Press keys..."
                            className="w-32 md:w-48 h-7 md:h-9 px-2 bg-black/40 border border-white/10 rounded-lg text-center text-white outline-none focus:border-red-400 focus:bg-white/10 cursor-pointer font-bold uppercase text-[10px] md:text-xs"
                            title="Click to record new shortcut"
                          />
                          <button
                            onClick={() => togglePanicHide()}
                            className="px-2 py-1.5 md:px-3 md:py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition-colors border border-red-500/30 text-[10px] md:text-xs font-bold uppercase tracking-wide"
                          >
                            Trigger
                          </button>
                        </div>
                        <span className="text-[9px] md:text-[10px] text-white/40 italic mt-0.5">Click input and press any key combo (e.g. Ctrl+Alt+Z)</span>
                      </div>
                    </div>

                    {/* Panic Wallpaper Switch */}
                    <div className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2.5 md:gap-3">
                        <ImageIcon className="text-red-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
                        <div>
                          <span className="text-xs md:text-sm font-medium block leading-tight">Switch to Photo Wallpaper on Panic</span>
                          <p className="text-[9px] md:text-xs text-white/50 mt-0.5 leading-tight">If a video wallpaper is playing, switch to a photo instantly.</p>
                        </div>
                      </div>
                      <button onClick={() => setPanicWallpaperSwitch(!panicWallpaperSwitch)} className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors shrink-0 ${panicWallpaperSwitch ? 'bg-red-500' : 'bg-white/20'}`}>
                        <span className={`inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${panicWallpaperSwitch ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Focus Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 bg-white/5 p-2.5 md:p-3 rounded-xl">
                      <div>
                        <p className="text-xs md:text-sm font-bold text-blue-400">Focus Mode (Hide Selected)</p>
                        <p className="text-[10px] md:text-xs text-white/50 mt-0.5">Hide only the widgets enabled in 'Widget Visibility'.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <input
                            type="text"
                            value={formatShortcutText(focusShortcutKey)}
                            onKeyDown={(e) => handleShortcutCapture(e, setFocusShortcutKey)}
                            readOnly
                            placeholder="Press keys..."
                            className="w-32 md:w-48 h-7 md:h-9 px-2 bg-black/40 border border-white/10 rounded-lg text-center text-white outline-none focus:border-blue-400 focus:bg-white/10 cursor-pointer font-bold uppercase text-[10px] md:text-xs"
                            title="Click to record new shortcut"
                          />
                          <button
                            onClick={() => toggleHide()}
                            className="px-2 py-1.5 md:px-3 md:py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg transition-colors border border-blue-500/30 text-[10px] md:text-xs font-bold uppercase tracking-wide"
                          >
                            Trigger
                          </button>
                        </div>
                        <span className="text-[9px] md:text-[10px] text-white/40 italic mt-0.5">Click input and press any key combo (e.g. Ctrl+H)</span>
                      </div>
                    </div>
                  </div>

                  {/* Focus Mode Configuration */}
                  <div className="flex flex-col p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 mt-1 md:mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between mb-3 md:mb-4 gap-2.5 md:gap-4">
                      <div>
                        <h4 className="font-medium text-sm md:text-lg text-red-400">Focus Mode Specific Selection</h4>
                        <p className="text-[10px] md:text-sm text-white/50 mt-0.5 md:mt-1">Select which elements should be hidden when you activate Focus Mode.</p>
                        
                        {/* Platform Switcher */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 mt-2 w-fit">
                          <button
                            onClick={() => setFocusPlatform('desktop')}
                            className={`px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${focusPlatform === 'desktop' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/80'}`}
                          >
                            Desktop Config
                          </button>
                          <button
                            onClick={() => setFocusPlatform('mobile')}
                            className={`px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${focusPlatform === 'mobile' ? 'bg-orange-500/20 text-orange-400' : 'text-white/40 hover:text-white/80'}`}
                          >
                            Mobile Config
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => focusPlatform === 'desktop' ? setHideAll(false) : setMobileHideAll(false)}
                          className="px-2 py-1 md:px-3 md:py-1.5 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-colors border border-white/10 font-medium text-[10px] md:text-sm"
                        >
                          Keep All Visible
                        </button>
                        <button
                          onClick={() => focusPlatform === 'desktop' ? setHideAll(true) : setMobileHideAll(true)}
                          className="px-2 py-1 md:px-3 md:py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg md:rounded-xl transition-colors border border-red-500/30 font-medium text-[10px] md:text-sm"
                        >
                          Hide All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                      {Object.entries({
                        quote: 'Daily Quote',
                        stats: 'Stats Modal',
                        plans: 'Roadmap & Plans',
                        countdowns: 'Target Countdowns',
                        tasks: 'Tasks',
                        notes: 'Quick Notes',
                        calendar: 'Calendar',
                        timetable: 'Timetable',
                        health: 'Health Rings',
                        timer: 'Session Timer',
                        dock: 'Bottom Dock',
                        clock: 'Big Clock',
                        deadlineAlerts: 'Deadline Alerts',
                        bgSwitcher: 'Bg Switcher',
                        stopwatch: 'Stopwatch',
                        settingsBtn: 'Settings Btn',
                        videoControls: 'Video Controls'
                      }).map(([key, label]) => {
                        const isHidden = focusPlatform === 'desktop' ? hideConfig[key] : mobileHideConfig[key];
                        return (
                          <div key={key} className="flex items-center justify-between p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-[10px] md:text-sm text-white/80 line-clamp-1">{label}</span>
                            <button 
                              onClick={() => focusPlatform === 'desktop' ? setHideConfig(key, !hideConfig[key]) : setMobileHideConfig(key, !mobileHideConfig[key])} 
                              className={`relative inline-flex h-4 w-7 md:h-5 md:w-9 items-center rounded-full transition-colors shrink-0 ${isHidden ? 'bg-red-500' : 'bg-blue-500/50'}`} 
                              title={isHidden ? 'Will be hidden in Focus Mode' : 'Will stay visible in Focus Mode'}
                            >
                              <span className={`inline-block h-2.5 w-2.5 md:h-3 md:w-3 transform rounded-full bg-white transition-transform ${isHidden ? 'translate-x-3.5 md:translate-x-5' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'data' && (
                <div className="flex flex-col gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold">Data & Backup</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Export, import, or backup your dashboard data locally.</p>
                  </div>

                  <div className="p-3 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl md:rounded-2xl">
                    <div className="flex items-start gap-2.5 md:gap-3">
                      <div className="mt-0.5">
                        <Activity className="text-blue-400 w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm md:text-base text-blue-300">Important Recommendation</h4>
                        <p className="text-[11px] md:text-sm text-white/80 mt-1 leading-relaxed">
                          Please remember to backup your data regularly.
                          <br /><br />
                          If you want to import or share plans with friends or coworkers, it's highly recommended to <strong>create and switch to a separate User Profile</strong> before importing. This prevents accidentally overwriting your main default user data!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:gap-4">
                    {/* Backup & Restore */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 gap-3 md:gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 bg-white/5 rounded-xl shrink-0">
                          <UploadCloud className="text-green-400 w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-lg">Backup & Restore</h4>
                          <p className="text-[10px] md:text-sm text-white/50 mt-0.5">Export or import your dashboard data locally.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleExportData}
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl text-[11px] md:text-sm font-medium transition-colors border border-white/10 flex items-center gap-1.5 md:gap-2"
                        >
                          <Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> Export
                        </button>

                        <label className="flex-1 sm:flex-none justify-center cursor-pointer px-3 py-1.5 md:px-4 md:py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg md:rounded-xl text-[11px] md:text-sm font-medium transition-colors border border-blue-500/30 flex items-center gap-1.5 md:gap-2">
                          <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" /> Import
                          <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                        </label>
                      </div>
                    </div>

                    {/* Clear Old Data */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 gap-3 md:gap-5">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <div className="p-2.5 md:p-3 bg-white/5 rounded-xl shrink-0">
                          <Trash2 className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <div>
                            <h4 className="font-medium text-sm md:text-lg leading-tight">Clear Old Data</h4>
                            <p className="text-[10px] md:text-sm text-white/50 mt-0.5 md:mt-1">Delete health and history logs older than the selected timeframe.</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 md:gap-2 mt-1">
                            {[15, 30, 60, 90, 120].map(days => (
                              <button
                                key={days}
                                onClick={() => setDeleteDays(days)}
                                className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold transition-all border ${deleteDays === days
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 scale-105'
                                  : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'
                                  }`}
                              >
                                {days} Days
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete all history logs older than ${deleteDays} days? This action cannot be undone.`)) {
                            await clearOldData(deleteDays);
                            alert(`Logs older than ${deleteDays} days cleared successfully.`);
                          }
                        }}
                        className="w-full md:w-auto px-4 py-2 md:px-5 md:py-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all border border-yellow-500/30 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap shrink-0 hover:scale-105 mt-2 md:mt-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /> Delete Logs
                      </button>
                    </div>

                    {/* Danger Zone: Delete All Data */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/30 gap-3 md:gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 bg-red-500/20 rounded-xl shrink-0">
                          <Trash2 className="text-red-400 w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-lg text-red-300">Factory Reset Profile</h4>
                          <p className="text-[10px] md:text-sm text-white/60 mt-0.5">Permanently delete ALL tasks, notes, health, and history for this profile.</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const userTyped = prompt('Type "delete all" to confirm resetting all data for this profile:');
                          if (userTyped?.toLowerCase() === 'delete all') {
                            await clearAllData();
                          } else if (userTyped !== null) {
                            alert('Confirmation failed. Data was not deleted.');
                          }
                        }}
                        className="w-full sm:w-auto justify-center px-3 py-1.5 md:px-4 md:py-2 bg-red-500/20 hover:bg-red-500/80 text-red-300 hover:text-white rounded-lg md:rounded-xl text-[11px] md:text-sm font-medium transition-colors border border-red-500/50 flex items-center gap-1.5 md:gap-2 whitespace-nowrap mt-1 sm:mt-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Reset All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'about' && (
                <div className="flex flex-col gap-4 md:gap-0">
                  <div className="md:mb-6">
                    <h3 className="text-lg md:text-xl font-semibold">About Developer</h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Creator and maintainer of the Productivity Dashboard.</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-3 bg-black/20 border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-2 relative overflow-hidden">
                    {/* Decorative Gradient Blob */}
                    <div className="absolute -top-20 -right-20 w-48 h-48 md:w-64 md:h-64 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />

                    <div className="w-20 h-20 md:w-28 md:h-28 shrink-0 relative rounded-full overflow-hidden border-2 md:border-4 border-white/10 shadow-xl md:shadow-2xl">
                      <img
                        src="/branding/author.jpeg"
                        alt="Gonaboyina Anand kumar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-2xl md:text-4xl font-bold">AK</div>';
                        }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left z-10 w-full">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-white">Gonaboyina Anand kumar</h2>
                        <BadgeCheck className="text-blue-400 shrink-0 w-4 h-4 md:w-5 md:h-5" />
                      </div>

                      <p className="text-blue-300 font-medium tracking-wide uppercase text-[9px] md:text-[11px] mb-2">Full Stack MERN Developer</p>

                      <p className="text-[10px] md:text-[12px] text-white/60 mb-3 md:mb-4 leading-relaxed max-w-sm px-2 md:px-0">
                        Have any suggestions, feature requests, or found a bug? Feel free to send them to me directly on LinkedIn or on Telegram!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2 w-full mb-2">
                        <a
                          href="https://www.linkedin.com/in/anand-kumar-gonaboyina-b63946378"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 md:gap-3 bg-white/5 hover:bg-white/10 border border-[#0077b5]/30 rounded-xl md:rounded-2xl p-2 transition-all hover:scale-105"
                        >
                          <div className="p-1.5 md:p-2 bg-[#0077b5]/20 rounded-lg md:rounded-xl shrink-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0077b5] w-3.5 h-3.5 md:w-[18px] md:h-[18px]">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                              <rect x="2" y="9" width="4" height="12"></rect>
                              <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                          </div>
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <span className="text-[9px] md:text-[11px] text-white/50 w-full text-left">LinkedIn</span>
                            <span className="font-semibold text-[10px] md:text-xs w-full text-left leading-tight">Message me here</span>
                          </div>
                        </a>

                        <a
                          href="https://t.me/gAnandKumar"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 md:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-2 md:p-3 transition-all hover:scale-105"
                        >
                          <div className="p-1.5 md:p-2 bg-[#0088cc]/20 rounded-lg md:rounded-xl shrink-0">
                            <Send className="text-[#0088cc] w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[9px] md:text-[11px] text-white/50 w-full text-left">Telegram</span>
                            <span className="font-semibold text-[10px] md:text-xs w-full text-left">@gAnandKumar</span>
                          </div>
                        </a>

                        <a
                          href="https://t.me/FstackWebDevRise"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 md:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-2 md:p-3 transition-all hover:scale-105"
                        >
                          <div className="p-1.5 md:p-2 bg-[#0088cc]/20 rounded-lg md:rounded-xl shrink-0">
                            <Users className="text-[#0088cc] w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[9px] md:text-[11px] text-white/50 w-full text-left leading-tight">Dev Channel</span>
                            <span className="font-semibold text-[10px] md:text-xs w-full text-left leading-tight">FstackWebDevRise</span>
                          </div>
                        </a>

                        <a
                          href="https://my-portfolio-git-main-anandgonaboyinas-projects.vercel.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 md:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-2 md:p-3 transition-all hover:scale-105"
                        >
                          <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg md:rounded-xl shrink-0">
                            <Briefcase className="text-purple-400 w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <span className="text-[9px] md:text-[11px] text-white/50 w-full text-left">Portfolio</span>
                            <span className="font-semibold text-[10px] md:text-xs w-full text-left leading-tight">View other projects</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col p-4 md:p-1 bg-black/20 border border-white/5 rounded-2xl md:rounded-3xl text-center items-center justify-center relative overflow-hidden md:mt-6">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-pink-500/10 blur-2xl md:blur-3xl rounded-full" />
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2 md:mt-4">Support the Project ❤️</h3>
                    <p className="text-[10px] md:text-sm text-white/60 max-w-md mx-auto mb-4 md:mb-6 leading-relaxed px-2">
                      Built with love, but inspired by the pain of endless distractions and messy workspaces. It took many late nights to bring this vision to life. If this dashboard helps you reclaim your focus, consider supporting its continued development. A small tip goes a long way—and please leave a message, I'd love to hear how it's helping you!
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <button onClick={() => setDonationAmount(50)} className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all border ${donationAmount === 50 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹50 (Coffee)</button>
                      <button onClick={() => setDonationAmount(100)} className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all border ${donationAmount === 100 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹100 (Lunch)</button>
                      <button onClick={() => setDonationAmount(200)} className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all border ${donationAmount === 200 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹200 (Book)</button>
                      <button onClick={() => setDonationAmount(500)} className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all border ${donationAmount === 500 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹500 (Sponsor)</button>
                      <button onClick={() => setDonationAmount(null)} className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all border ${donationAmount === null ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>Any Amount</button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 bg-white/5 p-3 md:p-2 rounded-xl md:rounded-2xl mb-1 border border-white/10 md:mb-4">
                      <div className="bg-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl hover:scale-105 transition-transform">
                        <QRCodeSVG
                          value={`upi://pay?pa=${upiId}&pn=Anand%20Kumar&cu=INR${donationAmount ? `&am=${donationAmount}` : ''}`}
                          size={110}
                          className="md:w-[130px] md:h-[130px]"
                          level="H"
                          includeMargin={false}
                        />
                      </div>

                      <div className="flex flex-col text-center sm:text-left gap-2 md:gap-3 sm:min-w-[200px] md:min-w-[240px]">
                        <div>
                          <p className="text-[10px] md:text-xs text-white/70 uppercase tracking-widest font-semibold mb-0.5 md:mb-1 whitespace-nowrap">Scan to Pay (Any UPI App)</p>
                          <p className="font-bold text-base md:text-lg text-white">{donationAmount ? `₹${donationAmount}` : 'Any Amount'}</p>
                        </div>
                        <div className="h-px w-full bg-white/10 my-0.5 md:my-1" />
                        <div>
                          <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest font-semibold mb-0.5 md:mb-1">UPI ID</p>
                          <p className="text-xs md:text-sm text-blue-300 font-mono select-all whitespace-nowrap">{upiId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credits & Supporters Section Moved Here */}
                  <div className="flex flex-col gap-4 md:gap-6 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                      <BadgeCheck className="text-pink-400 w-5 h-5 md:w-6 md:h-6" />
                      Credits & Supporters
                    </h3>
                    <p className="text-white/50 text-xs md:text-sm mt-1">Thanks for always supporting me</p>
                  </div>

                  {/* Personal Note Section */}
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col gap-2.5 md:gap-3">
                    <p className="text-xs md:text-sm text-pink-300 font-medium leading-relaxed">
                      I originally started building this out of the pure frustration and regret of wasting so many days unproductively. I just needed something to finally help me stay on track.
                    </p>
                    <div className="h-px w-full bg-pink-500/20 my-0.5 md:my-1" />
                    <p className="text-[11px] md:text-sm text-pink-200/80 leading-relaxed italic">
                      "But honestly, this dashboard wouldn't be what it is today without the help of my friends. A big thank you to everyone who believed in this project, tested it for me, and gave me straight-up honest feedback. Thanks for always having my back."
                    </p>
                  </div>

                  {/* Supporters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Sathish Kumar */}
                    <div className="bg-black/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col items-center text-center gap-3 md:gap-4 hover:bg-white/5 transition-colors shadow-lg">
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden border-2 md:border-4 border-white/10 shadow-xl">
                        <img
                          src="/sathish.jpeg"
                          alt="Sathish Kumar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <h4 className="text-lg md:text-xl font-bold text-white leading-tight">Sathish Kumar</h4>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white/60 font-semibold tracking-wider uppercase mt-1">
                          <span className="text-blue-300">EEE</span> • NIT Patna
                        </p>
                        <a
                          href="https://www.linkedin.com/in/kanuri-sathish-kumar-289756330/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 md:gap-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-blue-300 border border-[#0077b5]/40 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 transition-all hover:scale-105 w-fit mt-2 md:mt-3 shadow-lg shadow-blue-500/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                          <span className="text-[9px] md:text-[11px] font-bold tracking-wider uppercase">Connect</span>
                        </a>
                      </div>
                      <div className="h-px w-full bg-white/5 my-1 md:my-2" />
                      <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                        Sathish spent countless hours testing the dashboard to identify bugs and usability issues. By putting himself in the shoes of an everyday user, he provided invaluable suggestions that inspired many of the automated features you see today.
                      </p>
                    </div>

                    {/* Jyothir Ganesh */}
                    <div className="bg-black/20 border border-white/5 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col items-center text-center gap-3 md:gap-4 hover:bg-white/5 transition-colors shadow-lg">
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden border-2 md:border-4 border-white/10 shadow-xl">
                        <img
                          src="/jyothir.png"
                          alt="Jyothir Ganesh"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <h4 className="text-lg md:text-xl font-bold text-white leading-tight">Jyothir Ganesh</h4>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white/60 font-semibold tracking-wider uppercase mt-1">
                          <span className="text-blue-300">ECE</span> • Vishnu Institute
                        </p>
                        <a
                          href="https://www.linkedin.com/in/jyothirganesh-kanuboyina/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 md:gap-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-blue-300 border border-[#0077b5]/40 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 transition-all hover:scale-105 w-fit mt-2 md:mt-3 shadow-lg shadow-blue-500/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                          <span className="text-[9px] md:text-[11px] font-bold tracking-wider uppercase">Connect</span>
                        </a>
                      </div>
                      <div className="h-px w-full bg-white/5 my-1 md:my-2" />
                      <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                        More than just a close friend since our school days, Jyothir has always been my strongest pillar of support. He never hesitates to speak the truth and give me grounded, factual advice exactly when I need it most.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* Content Scroll Down Button */}
            {canContentScrollDown && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover/content:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => scrollBy(settingsScrollRef, 'down')}
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 md:p-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronDown className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
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
        const allDeadlines = friendStats.stats?.deadlines || [];
        const timetableGridData = friendStats.stats?.timetableGrid || {};
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const hasTimetable = weekDays.some(day => Object.values(timetableGridData[day] || {}).some(subj => subj));

        return (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-300 pointer-events-auto">
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => setFriendStats(null)}
            />
            <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/5 shrink-0">
                <div>
                  <h4 className="font-bold text-lg md:text-2xl flex items-center gap-2 md:gap-3 text-white">
                    <BarChart2 className="text-blue-400 w-5 h-5 md:w-7 md:h-7" /> {friendStats.username}
                  </h4>
                  <div className="flex items-center flex-wrap gap-2 md:gap-3 mt-1 md:mt-2 text-[10px] md:text-xs font-medium">
                    {friendStats.stats?.createdAt && (
                      <span className="bg-white/10 text-white/70 px-2 py-1 md:px-2.5 md:py-1 rounded-md">
                        Joined {new Date(friendStats.stats.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {friendStats.stats?.lastLogin && (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 md:px-2.5 md:py-1 rounded-md border border-emerald-500/20">
                        Last Active: {new Date(friendStats.stats.lastLogin).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setFriendStats(null)} className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white self-start sm:self-auto">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="relative flex-1 overflow-hidden flex flex-col">
                <ScrollableWithArrows className="p-4 md:p-6 flex flex-col gap-6 md:gap-8">

                  {/* Work History */}
                  <div>
                    <h5 className="text-xs md:text-sm font-bold text-white/50 uppercase tracking-widest mb-2 md:mb-3">Work History</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-500/5 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                        <span className="text-2xl md:text-4xl font-black text-blue-400 mb-1 md:mb-2 drop-shadow-md relative z-10">{todayMins}</span>
                        <span className="text-[10px] md:text-xs font-bold text-blue-400/50 uppercase tracking-widest relative z-10">Today</span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-purple-500/5 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                        <span className="text-2xl md:text-4xl font-black text-purple-400 mb-1 drop-shadow-md relative z-10">{sevenDaysMins}</span>
                        <span className="text-[10px] md:text-xs text-white/50 mb-1.5 md:mb-2 relative z-10">Avg: {sevenDaysAvg}/day</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-purple-400/50 uppercase tracking-widest relative z-10">7 Days</span>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        <span className="text-2xl md:text-4xl font-black text-emerald-400 mb-1 drop-shadow-md relative z-10">{monthMins}</span>
                        <span className="text-[10px] md:text-xs text-white/50 mb-1.5 md:mb-2 relative z-10">Avg: {monthAvg}/day</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest relative z-10">30 Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Tasks */}
                    <div>
                      <h5 className="text-xs md:text-sm font-bold text-white/50 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                        Tasks <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full text-[9px] md:text-[10px]">{allTasks.length}</span>
                      </h5>
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 flex flex-col gap-2">
                        {allTasks.length === 0 ? (
                          <p className="text-white/40 text-[10px] md:text-xs italic text-center py-4">No tasks found.</p>
                        ) : (
                          allTasks.map((t: any) => (
                            <div key={t.id} className="flex flex-col gap-1.5 md:gap-2 text-xs md:text-sm text-white/80 bg-white/5 p-2.5 md:p-3 rounded-lg border border-white/5 break-words whitespace-pre-wrap leading-relaxed">
                              <div className="flex items-start justify-between gap-2">
                                <span className={t.completed ? 'line-through text-white/40' : ''}>{t.title || t.text}</span>
                                {t.completed && (
                                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded uppercase font-bold shrink-0">Done</span>
                                )}
                              </div>
                              {(t.duration > 0 || t.timeSpent > 0) && (
                                <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-white/40 font-medium">
                                  <span className="bg-white/10 px-1.5 py-0.5 rounded">
                                    Time: {formatMins(t.timeSpent || 0)} / {formatMins(t.duration || 0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Timetable Overview */}
                    <div>
                      <h5 className="text-xs md:text-sm font-bold text-white/50 uppercase tracking-widest mb-2 md:mb-3">Timetable (Weekdays)</h5>
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 flex flex-col gap-2">
                        {!hasTimetable ? (
                          <p className="text-white/40 text-[10px] md:text-xs italic text-center py-4">No timetable set.</p>
                        ) : (
                          weekDays.map(day => {
                            const dayData = timetableGridData[day] || {};
                            const activeTimes = Object.entries(dayData).filter(([_, subj]) => subj);
                            if (activeTimes.length === 0) return null;
                            return (
                              <div key={day} className="flex flex-col gap-1 text-[10px] md:text-xs border-b border-white/5 pb-2 md:pb-2 last:border-0 last:pb-0">
                                <span className="text-blue-400 font-bold">{day}</span>
                                <div className="flex flex-wrap gap-1">
                                  {activeTimes.map(([time, subject]) => (
                                    <span key={time} className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">
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

                  <p className="text-center text-white/40 text-[9px] md:text-[10px] italic mt-auto pt-3 md:pt-4 border-t border-white/10 shrink-0">Only public focus statistics are shared between friends.</p>
                </ScrollableWithArrows>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}