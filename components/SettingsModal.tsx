'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Upload, Trash2, Image as ImageIcon, Settings as SettingsIcon, MonitorPlay, Clock, Users, Plus, Eye, EyeOff, Download, UploadCloud, Activity, MessageSquare, Timer as TimerIcon, Hourglass, Film, User, BadgeCheck, Send, Briefcase, Calendar, CheckSquare, Flame, ChevronUp, ChevronDown, Database, Bell, RefreshCw, AlertTriangle, CheckCircle, BarChart2, Map, StickyNote, CalendarDays, Layout, Globe, Star, Bug } from 'lucide-react';
import ConnectTab from './ConnectTab';

const DEFAULT_WALLPAPERS = [
  'itachi-uchiha.png', 'kakashi.mp4', 'kakashi2.mp4', 'kakashi3.png',
  'kakashiChild.jpg', 'naruto.webp', 'RockLee.mp4', 'squa7.jpg', 'demonslayer1.mp4'
];

export default function SettingsModal() {
  const { settingsActiveTab, setSettingsActiveTab, isSettingsOpen, toggleSettings, is24HourClock, toggle24HourClock, currentBgSrc, hiddenWallpapers, toggleWallpaperVisibility, showHealth, showQuote, showTimer, showCountdowns, showVideoControls, showClock, showTasks, showCalendar, showTodayWork, showStats, showPlans, showNotes, showTimetable, showDock, showDeadlineAlerts, showBgSwitcher, showSettingsBtn, showStopwatch, toggleVisibility, isSlideshowEnabled, setIsSlideshowEnabled, slideshowIntervalMins, setSlideshowIntervalMins, lockedWidgets, toggleWidgetLock, resetAllOffsets, clearOldData, clearAllData, lockedWallpaper, setLockedWallpaper, deadlineAlertDays, setDeadlineAlertDays, hideConfig, setHideConfig, setHideAll, rightWidgetsOffset, setRightWidgetsOffset, alarmSound, setAlarmSound, alarmDurationSecs, setAlarmDurationSecs, alarmVolume, setAlarmVolume, toggleHide, panicShortcutKey, setPanicShortcutKey, focusShortcutKey, setFocusShortcutKey, togglePanicHide, panicWallpaperSwitch, setPanicWallpaperSwitch } = useDashboardStore();

  const handleShortcutCapture = (e: React.KeyboardEvent<HTMLInputElement>, setter: (val: string) => void) => {
    e.preventDefault();
    const key = e.key.toLowerCase();
    if (key === 'control' || key === 'shift' || key === 'alt' || key === 'meta') return;
    if (key === 'escape') {
      e.currentTarget.blur();
      return;
    }
    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
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
  const [donationAmount, setDonationAmount] = useState<number | null>(50);

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
    } catch (_) {}
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [alarms, setAlarms] = useState<string[]>([]);
  const [isUploadingAlarm, setIsUploadingAlarm] = useState(false);
  const alarmInputRef = useRef<HTMLInputElement>(null);

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





  const fetchAlarms = async () => {
    try {
      const res = await fetch('/api/alarms');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlarms(data);
      }
    } catch (err) {
      console.error('Failed to fetch alarms', err);
    }
  };

  const handleAlarmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAlarm(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/alarms', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAlarmSound(`/custom-alarms/${data.filename}`);
        await fetchAlarms();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsUploadingAlarm(false);
      if (alarmInputRef.current) alarmInputRef.current.value = '';
    }
  };

  const handleDeleteAlarm = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const res = await fetch('/api/alarms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        if (alarmSound === `/custom-alarms/${filename}`) {
          setAlarmSound('/ringtones/alarm.mp3');
        }
        await fetchAlarms();
      }
    } catch (err) {
      alert('Failed to delete alarm');
    }
  };

  useEffect(() => {
    if (isSettingsOpen) {
      fetchAlarms();
    }
  }, [isSettingsOpen]);



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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pb-20 sm:p-6 sm:pb-24 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleSettings}
      />

      <div className="relative w-full max-w-4xl h-[85vh] max-h-[850px] flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden text-white animate-in zoom-in-95 duration-200">

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
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-3">
            <SettingsIcon className="text-blue-400" />
            Dashboard Settings
          </h2>
          <button
            onClick={toggleSettings}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <X size={24} />
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
              className="flex-1 p-4 max-md:py-3 md:pb-12 md:pt-10 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto arrow-scrollbar no-scrollbar"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >

            <button
              onClick={() => setSettingsActiveTab('preferences')}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium ${settingsActiveTab === 'preferences' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <MonitorPlay size={20} />
              Preferences
            </button>
            <button
              onClick={() => setSettingsActiveTab('sound')}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium ${settingsActiveTab === 'sound' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <Bell size={20} />
              Sound Settings
            </button>

            <button
              onClick={() => setSettingsActiveTab('focus')}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium ${settingsActiveTab === 'focus' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <EyeOff size={20} />
              Focus / Panic Mode
            </button>
            <button
              onClick={() => setSettingsActiveTab('data')}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium ${settingsActiveTab === 'data' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <Database size={20} />
              Data & Backup
            </button>
            <button
              onClick={() => setSettingsActiveTab('connect')}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium ${settingsActiveTab === 'connect' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <Globe size={20} className={settingsActiveTab === 'connect' ? 'text-blue-400 animate-pulse' : ''} />
              Connect & News
            </button>

            <button
              onClick={() => setSettingsActiveTab('feedback')}
              className={`flex shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium ${settingsActiveTab === 'feedback' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <Bug size={20} />
              Feedback & Bugs
            </button>
            <button
              onClick={() => setSettingsActiveTab('credits')}
              className={`relative overflow-hidden shrink-0 group flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all font-medium md:mt-auto md:w-full ${settingsActiveTab === 'credits' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-black/20 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/5'}`}
            >
              <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none glass-sweep-anim" style={{ left: '-100%' }} />
              <BadgeCheck size={20} className={`relative z-10 ${settingsActiveTab === 'credits' ? 'text-pink-400' : ''}`} />
              <div className="flex flex-col items-start text-left relative z-10 overflow-hidden">
                <span className="text-sm font-semibold tracking-wide leading-tight whitespace-nowrap">Credits & Supporters</span>
              </div>
            </button>
            <button
              onClick={() => setSettingsActiveTab('about')}
              className={`relative overflow-hidden shrink-0 group flex md:flex-col items-center justify-center gap-2 md:px-4 md:py-6 px-3 py-2 rounded-2xl transition-all font-medium md:w-full ${settingsActiveTab === 'about' ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg' : 'bg-black/20 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/5'}`}
            >
              <div className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none glass-sweep-anim" style={{ left: '-100%' }} />
              <img
                src="/branding/author.jpeg"
                alt="Developer"
                className="w-8 h-8 md:w-14 md:h-14 rounded-full object-cover shadow-lg border-2 border-white/20 relative z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<svg class="w-8 h-8 relative z-10" ... />'); // Fallback to User icon
                }}
              />
              <div className="flex flex-col items-center text-center relative z-10">
                <span className="text-sm font-semibold tracking-wide leading-tight whitespace-nowrap">Support & Connect</span>
                <span className="text-[10px] text-blue-300 font-medium uppercase mt-1 tracking-wider">Gonaboyina Anand kumar</span>
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
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronUp size={24} strokeWidth={3} />
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
              className="flex-1 overflow-y-auto p-6 pb-16 pt-12 arrow-scrollbar"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >



              {settingsActiveTab === 'connect' && <ConnectTab />}



              {settingsActiveTab === 'preferences' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">General Preferences</h3>
                    <p className="text-white/50 text-sm mt-1">Customize how your dashboard looks and feels.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Toggle 24-hour clock */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg shrink-0">
                          <Clock size={20} className="text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-medium text-base">24-Hour Clock Format</h4>
                          <p className="text-xs text-white/50">Use military time (e.g., 14:00 instead of 2:00 PM)</p>
                        </div>
                      </div>
                      <button
                        onClick={toggle24HourClock}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors shrink-0 ${is24HourClock ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is24HourClock ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Deadline Alerts */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg shrink-0">
                          <Bell size={20} className="text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-base">Deadline Alerts</h4>
                          <p className="text-xs text-white/50">Show a popup on the main screen when deadlines approach.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white/60 text-xs">Alert me</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={deadlineAlertDays}
                          onChange={(e) => setDeadlineAlertDays(parseInt(e.target.value) || 0)}
                          className="w-14 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-center text-white outline-none focus:border-yellow-400 font-medium text-sm"
                        />
                        <span className="text-white/60 text-xs">days before</span>
                      </div>
                    </div>

                    {/* Right Toolbar Position */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg shrink-0">
                          <Layout size={20} className="text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-base">Right Toolbar Position</h4>
                          <p className="text-xs text-white/50">Adjust the vertical height of the right-side widgets.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-black/40 border border-white/10 rounded-lg p-1">
                        <button
                          onClick={() => setRightWidgetsOffset(Math.max(0, rightWidgetsOffset - 10))}
                          className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <span className="font-bold text-sm w-10 text-center text-cyan-300">{rightWidgetsOffset}</span>
                        <button
                          onClick={() => setRightWidgetsOffset(rightWidgetsOffset + 10)}
                          className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                        >
                          <ChevronUp size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Widget Layout & Positioning */}
                    <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-2">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg">Widget Layout & Positioning</h4>
                        <button
                          onClick={() => {
                            if (currentBgSrc) resetAllOffsets(currentBgSrc);
                          }}
                          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-colors border border-red-500/30 font-medium text-sm"
                        >
                          Reset Default Positions
                        </button>
                      </div>
                      <p className="text-sm text-white/50 mb-4">Lock the drag position of specific elements on your dashboard.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Lock Clock */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-blue-300" />
                            <span className="text-sm font-medium">Lock Clock</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('clock')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('clock') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('clock') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Tasks */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <CheckSquare size={18} className="text-green-400" />
                            <span className="text-sm font-medium">Lock Tasks</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('tasks')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('tasks') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('tasks') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Quote */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <MessageSquare size={18} className="text-yellow-400" />
                            <span className="text-sm font-medium">Lock Quote</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('quote')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('quote') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('quote') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Countdowns */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Hourglass size={18} className="text-purple-400" />
                            <span className="text-sm font-medium">Lock Target Countdowns</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('countdowns')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('countdowns') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('countdowns') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Calendar */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-pink-400" />
                            <span className="text-sm font-medium">Lock Calendar</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('calendar')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('calendar') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('calendar') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Timer */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <TimerIcon size={18} className="text-orange-400" />
                            <span className="text-sm font-medium">Lock Timer</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('timer')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('timer') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('timer') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Toolbar */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Layout size={18} className="text-indigo-400" />
                            <span className="text-sm font-medium">Lock Right Toolbar</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('toolbar')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('toolbar') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('toolbar') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Widget Visibility */}
                    <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-4">
                      <h4 className="font-medium text-lg mb-4">Widget Visibility</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Health Rings */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Activity size={18} className="text-red-400" />
                            <span className="text-sm font-medium">Health Rings</span>
                          </div>
                          <button onClick={() => toggleVisibility('showHealth')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showHealth ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showHealth ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Quote */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <MessageSquare size={18} className="text-purple-400" />
                            <span className="text-sm font-medium">Daily Quote</span>
                          </div>
                          <button onClick={() => toggleVisibility('showQuote')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showQuote ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showQuote ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <TimerIcon size={18} className="text-yellow-400" />
                            <span className="text-sm font-medium">Session Timer</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTimer')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTimer ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTimer ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Stopwatch */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-blue-400" />
                            <span className="text-sm font-medium">Stopwatch</span>
                          </div>
                          <button onClick={() => toggleVisibility('showStopwatch')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showStopwatch ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showStopwatch ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Countdowns */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Hourglass size={18} className="text-blue-400" />
                            <span className="text-sm font-medium">Target Countdowns</span>
                          </div>
                          <button onClick={() => toggleVisibility('showCountdowns')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCountdowns ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showCountdowns ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Video Controls */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Film size={18} className="text-green-400" />
                            <span className="text-sm font-medium">Video Controls</span>
                          </div>
                          <button onClick={() => toggleVisibility('showVideoControls')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showVideoControls ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showVideoControls ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Clock */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-cyan-400" />
                            <span className="text-sm font-medium">Clock</span>
                          </div>
                          <button onClick={() => toggleVisibility('showClock')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showClock ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showClock ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Today's Focus */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Flame size={18} className="text-orange-400" />
                            <span className="text-sm font-medium">Today's Focus</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTodayWork')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTodayWork ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTodayWork ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Tasks */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <CheckSquare size={18} className="text-orange-400" />
                            <span className="text-sm font-medium">Tasks</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTasks')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTasks ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTasks ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Calendar */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-pink-400" />
                            <span className="text-sm font-medium">Calendar</span>
                          </div>
                          <button onClick={() => toggleVisibility('showCalendar')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCalendar ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showCalendar ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        {/* Stats Modal */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <BarChart2 size={18} className="text-emerald-400" />
                            <span className="text-sm font-medium">Stats Modal</span>
                          </div>
                          <button onClick={() => toggleVisibility('showStats')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showStats ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showStats ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Roadmap & Plans */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Map size={18} className="text-indigo-400" />
                            <span className="text-sm font-medium">Roadmap & Plans</span>
                          </div>
                          <button onClick={() => toggleVisibility('showPlans')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showPlans ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPlans ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Quick Notes */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <StickyNote size={18} className="text-yellow-300" />
                            <span className="text-sm font-medium">Quick Notes</span>
                          </div>
                          <button onClick={() => toggleVisibility('showNotes')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showNotes ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showNotes ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Timetable */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <CalendarDays size={18} className="text-purple-400" />
                            <span className="text-sm font-medium">Timetable</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTimetable')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTimetable ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTimetable ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Bottom Dock */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Layout size={18} className="text-cyan-300" />
                            <span className="text-sm font-medium">Bottom Dock</span>
                          </div>
                          <button onClick={() => toggleVisibility('showDock')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showDock ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDock ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Deadline Alerts */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Bell size={18} className="text-red-400" />
                            <span className="text-sm font-medium">Deadline Alerts</span>
                          </div>
                          <button onClick={() => toggleVisibility('showDeadlineAlerts')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showDeadlineAlerts ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDeadlineAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Background Switcher */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <ImageIcon size={18} className="text-green-300" />
                            <span className="text-sm font-medium">Background Switcher</span>
                          </div>
                          <button onClick={() => toggleVisibility('showBgSwitcher')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showBgSwitcher ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showBgSwitcher ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>


                      </div>
                    </div>


                  </div>
                </div>
              )}

              {settingsActiveTab === 'sound' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Bell size={20} className="text-blue-400" />
                      Sound Settings
                    </h3>
                    <p className="text-white/50 text-sm mt-1">Manage notification sounds, playback timers, and settings.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-8">

                    {/* Auto Stop Timer */}
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-white/80">Auto Stop Timer</label>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/60">{alarmDurationSecs} Seconds</span>
                      </div>
                      <p className="text-xs text-white/40 -mt-2">How long should the sound ring before automatically turning off?</p>
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

                    {/* Alarm Selection */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white/80">Select Alarm Sound</label>

                        <div>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            ref={alarmInputRef}
                            onChange={handleAlarmUpload}
                          />
                          <button
                            onClick={() => alarmInputRef.current?.click()}
                            disabled={isUploadingAlarm}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {isUploadingAlarm ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                            Upload Custom Alarm
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {/* Default Alarm */}
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${alarmSound === '/ringtones/alarm.mp3' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                          onClick={() => setAlarmSound('/ringtones/alarm.mp3')}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${alarmSound === '/ringtones/alarm.mp3' ? 'border-blue-400' : 'border-white/30'}`}>
                              {alarmSound === '/ringtones/alarm.mp3' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                            </div>
                            <span className="text-sm font-medium">Default Alarm</span>
                          </div>
                        </div>

                        {/* Custom Alarms */}
                        {alarms.map((alarm) => {
                          const fullPath = `/custom-alarms/${alarm}`;
                          const isActive = alarmSound === fullPath;
                          return (
                            <div
                              key={alarm}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-blue-500/20 border-blue-500/50' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                              onClick={() => setAlarmSound(fullPath)}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-blue-400' : 'border-white/30'}`}>
                                  {isActive && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                                </div>
                                <span className="text-sm font-medium truncate">{alarm}</span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteAlarm(alarm, e)}
                                className="p-1.5 shrink-0 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                                title="Delete Alarm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'feedback' && (
                <div className="flex flex-col gap-6 h-full overflow-y-auto arrow-scrollbar pb-10">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Bug size={20} className="text-orange-400" />
                      Feedback & Bug Reports
                    </h3>
                    <p className="text-white/50 text-sm mt-1">Help us improve the dashboard! Submit feature requests or report issues directly to the developer.</p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-white/80">Type</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFeedbackType('feature')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors border ${feedbackType === 'feature' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          💡 Feature
                        </button>
                        <button
                          onClick={() => setFeedbackType('bug')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors border ${feedbackType === 'bug' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          🐛 Bug
                        </button>
                        <button
                          onClick={() => setFeedbackType('other')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors border ${feedbackType === 'other' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          💬 General
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-white/80">Message</label>
                      <textarea 
                        rows={5}
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Describe your idea or the issue you encountered..." 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition-all placeholder:text-white/40 resize-none"
                      />
                    </div>
                    
                    <button 
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback || feedbackSuccess}
                      className={`self-end px-6 py-2 font-bold rounded-lg text-sm transition-colors shadow-lg flex items-center gap-2 ${feedbackSuccess ? 'bg-green-500 text-white' : 'bg-orange-500/80 hover:bg-orange-500 text-white'}`}
                    >
                      {isSubmittingFeedback ? <RefreshCw size={16} className="animate-spin" /> : feedbackSuccess ? <CheckCircle size={16} /> : <Send size={16} />} 
                      {feedbackSuccess ? 'Sent!' : 'Submit Feedback'}
                    </button>
                  </div>

                  {/* My Submissions Status */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/80">My Submission Status</label>
                      <button onClick={fetchMySubmissions} className="text-xs text-white/40 hover:text-white/70 transition-colors">Refresh</button>
                    </div>
                    {mySubmissions.length === 0 ? (
                      <p className="text-white/30 text-xs italic text-center py-3 bg-black/20 rounded-lg">No submissions yet — submit above to track status!</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {mySubmissions.map((item: any) => {
                          const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
                            pending:          { label: 'Under Review', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', dot: 'bg-yellow-400' },
                            reviewed:         { label: 'Reviewed',     color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',       dot: 'bg-blue-400' },
                            added_to_roadmap: { label: '✓ On Roadmap!',color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', dot: 'bg-emerald-400' },
                          };
                          const s = statusConfig[item.status] || { label: item.status, color: 'text-white/40 border-white/10 bg-white/5', dot: 'bg-white/20' };
                          return (
                            <div key={item.id} className="bg-black/30 border border-white/10 p-3 rounded-xl flex items-start justify-between gap-3">
                              <div className="flex flex-col gap-1">
                                <p className="text-white/70 text-xs leading-relaxed">{item.message}</p>
                                {item.createdAt && (
                                  <span className="text-[10px] text-white/40">
                                    {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 flex items-center gap-1.5 ${s.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
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

              {settingsActiveTab === 'focus' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2"><EyeOff className="text-red-400" /> Focus & Panic Mode</h3>
                    <p className="text-white/50 text-sm mt-1">Configure your screen visibility and customize shortcuts.</p>
                  </div>

                  {/* Screen Visibility & Shortcuts */}
                  <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-2 gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-lg">Screen Visibility Shortcuts</h4>
                    </div>
                    
                    {/* Panic Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-red-400">Panic Mode (Hide Everything)</p>
                        <p className="text-xs text-white/50">Instantly hide all widgets from your screen.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formatShortcutText(panicShortcutKey)}
                            onKeyDown={(e) => handleShortcutCapture(e, setPanicShortcutKey)}
                            readOnly
                            placeholder="Press keys..."
                            className="w-48 h-9 px-2 bg-black/40 border border-white/10 rounded-lg text-center text-white outline-none focus:border-red-400 focus:bg-white/10 cursor-pointer font-bold uppercase text-xs"
                            title="Click to record new shortcut"
                          />
                          <button
                            onClick={() => togglePanicHide()}
                            className="ml-2 px-3 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition-colors border border-red-500/30 text-xs font-bold uppercase tracking-wide"
                          >
                            Trigger
                          </button>
                        </div>
                        <span className="text-[10px] text-white/40 italic">Click input and press any key combo (e.g. Ctrl+Alt+Z)</span>
                      </div>
                    </div>

                    {/* Panic Wallpaper Switch */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <ImageIcon size={18} className="text-red-400" />
                        <div>
                          <span className="text-sm font-medium">Switch to Photo Wallpaper on Panic</span>
                          <p className="text-xs text-white/50">If a video wallpaper is playing, switch to a photo instantly.</p>
                        </div>
                      </div>
                      <button onClick={() => setPanicWallpaperSwitch(!panicWallpaperSwitch)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${panicWallpaperSwitch ? 'bg-red-500' : 'bg-white/20'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${panicWallpaperSwitch ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Focus Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-blue-400">Focus Mode (Hide Selected)</p>
                        <p className="text-xs text-white/50">Hide only the widgets enabled in 'Widget Visibility'.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formatShortcutText(focusShortcutKey)}
                            onKeyDown={(e) => handleShortcutCapture(e, setFocusShortcutKey)}
                            readOnly
                            placeholder="Press keys..."
                            className="w-48 h-9 px-2 bg-black/40 border border-white/10 rounded-lg text-center text-white outline-none focus:border-blue-400 focus:bg-white/10 cursor-pointer font-bold uppercase text-xs"
                            title="Click to record new shortcut"
                          />
                          <button
                            onClick={() => toggleHide()}
                            className="ml-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg transition-colors border border-blue-500/30 text-xs font-bold uppercase tracking-wide"
                          >
                            Trigger
                          </button>
                        </div>
                        <span className="text-[10px] text-white/40 italic">Click input and press any key combo (e.g. Ctrl+H)</span>
                      </div>
                    </div>
                  </div>

                  {/* Focus Mode Configuration */}
                  <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                      <div>
                        <h4 className="font-medium text-lg text-red-400">Focus Mode Specific Selection</h4>
                        <p className="text-sm text-white/50 mt-1">Select which elements should be hidden when you activate Focus Mode.</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setHideAll(false)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 font-medium text-sm"
                        >
                          Keep All Visible
                        </button>
                        <button
                          onClick={() => setHideAll(true)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-colors border border-red-500/30 font-medium text-sm"
                        >
                          Hide All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                        bgSwitcher: 'Background Switcher',
                        stopwatch: 'Stopwatch',
                        settingsBtn: 'Settings Button',
                        videoControls: 'Video Controls'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-sm text-white/80">{label}</span>
                          <button onClick={() => setHideConfig(key, !hideConfig[key])} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hideConfig[key] ? 'bg-red-500' : 'bg-blue-500/50'}`} title={hideConfig[key] ? 'Will be hidden in Focus Mode' : 'Will stay visible in Focus Mode'}>
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hideConfig[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}



              {settingsActiveTab === 'data' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">Data & Backup</h3>
                    <p className="text-white/50 text-sm mt-1">Export, import, or backup your dashboard data locally.</p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Activity size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-300">Important Recommendation</h4>
                        <p className="text-sm text-white/80 mt-1 leading-relaxed">
                          Please remember to backup your data regularly.
                          <br /><br />
                          If you want to import or share plans with friends or coworkers, it's highly recommended to <strong>create and switch to a separate User Profile</strong> before importing. This prevents accidentally overwriting your main default user data!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Backup & Restore */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl">
                          <UploadCloud size={24} className="text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">Backup & Restore</h4>
                          <p className="text-sm text-white/50">Export or import your dashboard data locally.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleExportData}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
                        >
                          <Download size={16} /> Export
                        </button>

                        <label className="cursor-pointer px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl text-sm font-medium transition-colors border border-blue-500/30 flex items-center gap-2">
                          <Upload size={16} /> Import
                          <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                        </label>
                      </div>
                    </div>

                    {/* Clear Old Data */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 gap-5">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-white/5 rounded-xl shrink-0">
                          <Trash2 size={24} className="text-yellow-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div>
                            <h4 className="font-medium text-lg leading-tight">Clear Old Data</h4>
                            <p className="text-sm text-white/50 mt-1">Delete health and history logs older than the selected timeframe.</p>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-1">
                            {[15, 30, 60, 90, 120].map(days => (
                              <button
                                key={days}
                                onClick={() => setDeleteDays(days)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${deleteDays === days
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
                        className="w-full md:w-auto px-5 py-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-xl text-sm font-bold transition-all border border-yellow-500/30 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 hover:scale-105"
                      >
                        <Trash2 size={18} /> Delete Logs
                      </button>
                    </div>

                    {/* Danger Zone: Delete All Data */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                          <Trash2 size={24} className="text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg text-red-300">Factory Reset Profile</h4>
                          <p className="text-sm text-white/60">Permanently delete ALL tasks, notes, health, and history for this profile.</p>
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
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/80 text-red-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-red-500/50 flex items-center gap-2 whitespace-nowrap"
                      >
                        <Trash2 size={16} /> Reset All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'about' && (
                <div className="flex flex-col">
                  <div>
                    <h3 className="text-xl font-semibold">About Developer</h3>
                    <p className="text-white/50 text-sm mt-1">Creator and maintainer of the Productivity Dashboard.</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3 bg-black/20 border border-white/10 rounded-3xl p-2 relative overflow-hidden">
                    {/* Decorative Gradient Blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />

                    <div className="w-28 h-28 shrink-0 relative rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                      <img
                        src="/branding/author.jpeg"
                        alt="Gonaboyina Anand kumar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-4xl font-bold">AK</div>';
                        }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left z-10 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Gonaboyina Anand kumar</h2>
                        <BadgeCheck className="text-blue-400 shrink-0" size={20} />
                      </div>

                      <p className="text-blue-300 font-medium tracking-wide uppercase text-[11px] mb-2">Full Stack MERN Developer</p>

                      <p className="text-[12px] text-white/60 mb-4 leading-relaxed max-w-sm">
                        Have any suggestions, feature requests, or found a bug? Feel free to send them to me directly on LinkedIn or on Telegram!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mb-2">
                        <a
                          href="https://www.linkedin.com/in/anand-kumar-gonaboyina-b63946378"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-[#0077b5]/30 rounded-2xl p-2 transition-all hover:scale-105"
                        >
                          <div className="p-2 bg-[#0077b5]/20 rounded-xl shrink-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0077b5]">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                              <rect x="2" y="9" width="4" height="12"></rect>
                              <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                          </div>
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <span className="text-[11px] text-white/50 w-full text-left">LinkedIn</span>
                            <span className="font-semibold text-xs w-full text-left leading-tight">Message me here</span>
                          </div>
                        </a>

                        <a
                          href="https://t.me/gAnandKumar"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105"
                        >
                          <div className="p-2 bg-[#0088cc]/20 rounded-xl shrink-0">
                            <Send size={18} className="text-[#0088cc]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[11px] text-white/50 w-full text-left">Telegram</span>
                            <span className="font-semibold text-xs w-full text-left">@gAnandKumar</span>
                          </div>
                        </a>

                        <a
                          href="https://t.me/FstackWebDevRise"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105"
                        >
                          <div className="p-2 bg-[#0088cc]/20 rounded-xl shrink-0">
                            <Users size={18} className="text-[#0088cc]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[11px] text-white/50 w-full text-left leading-tight">Dev Channel</span>
                            <span className="font-semibold text-xs w-full text-left leading-tight">FstackWebDevRise</span>
                          </div>
                        </a>

                        <a
                          href="https://my-portfolio-git-main-anandgonaboyinas-projects.vercel.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105"
                        >
                          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl shrink-0">
                            <Briefcase size={18} className="text-purple-400" />
                          </div>
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <span className="text-[11px] text-white/50 w-full text-left">Portfolio</span>
                            <span className="font-semibold text-xs w-full text-left leading-tight">View other projects</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col p-1 bg-black/20 border border-white/5 rounded-3xl text-center items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full" />
                    <h3 className="text-xl font-bold mb-2">Support the Project ❤️</h3>
                    <p className="text-sm text-white/60 max-w-md mx-auto mb-6 leading-relaxed">
                      Built with love, but inspired by the pain of endless distractions and messy workspaces. It took many late nights to bring this vision to life. If this dashboard helps you reclaim your focus, consider supporting its continued development. A small tip goes a long way—and please leave a message, I'd love to hear how it's helping you!
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      <button onClick={() => setDonationAmount(50)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${donationAmount === 50 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹50 (Coffee)</button>
                      <button onClick={() => setDonationAmount(100)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${donationAmount === 100 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹100 (Lunch)</button>
                      <button onClick={() => setDonationAmount(200)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${donationAmount === 200 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹200 (Book)</button>
                      <button onClick={() => setDonationAmount(500)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${donationAmount === 500 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>₹500 (Sponsor)</button>
                      <button onClick={() => setDonationAmount(null)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${donationAmount === null ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 scale-105 shadow-lg shadow-pink-500/20' : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'}`}>Any Amount</button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/5 p-2 rounded-2xl mb-1 border border-white/10">
                      <div className="bg-white p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform">
                        <QRCodeSVG
                          value={`upi://pay?pa=${upiId}&pn=Anand%20Kumar&cu=INR${donationAmount ? `&am=${donationAmount}` : ''}`}
                          size={130}
                          level="H"
                          includeMargin={false}
                        />
                      </div>

                      <div className="flex flex-col text-left gap-3 min-w-[240px]">
                        <div>
                          <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1 whitespace-nowrap">Scan to Pay (Any UPI App)</p>
                          <p className="font-bold text-lg text-white">{donationAmount ? `₹${donationAmount}` : 'Any Amount'}</p>
                        </div>
                        <div className="h-px w-full bg-white/10 my-1" />
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">UPI ID</p>
                          <p className="text-sm text-blue-300 font-mono select-all whitespace-nowrap">{upiId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsActiveTab === 'credits' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <BadgeCheck className="text-pink-400" size={24} />
                      Credits & Supporters
                    </h3>
                    <p className="text-white/50 text-sm mt-1">Thanks for always supporting me</p>
                  </div>

                  {/* Personal Note Section */}
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-5 flex flex-col gap-3">
                    <p className="text-sm text-pink-300 font-medium leading-relaxed">
                      I originally started building this out of the pure frustration and regret of wasting so many days unproductively. I just needed something to finally help me stay on track.
                    </p>
                    <div className="h-px w-full bg-pink-500/20 my-1" />
                    <p className="text-sm text-pink-200/80 leading-relaxed italic">
                      "But honestly, this dashboard wouldn't be what it is today without the help of my friends. A big thank you to everyone who believed in this project, tested it for me, and gave me straight-up honest feedback. Thanks for always having my back."
                    </p>
                  </div>

                  {/* Supporters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sathish Kumar */}
                    <div className="bg-black/20 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-colors shadow-lg">
                      <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
                        <img
                          src="/sathish.jpeg"
                          alt="Sathish Kumar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <h4 className="text-xl font-bold text-white leading-tight">Sathish Kumar</h4>
                        <p className="text-[10px] sm:text-xs text-white/60 font-semibold tracking-wider uppercase mt-1">
                          <span className="text-blue-300">EEE</span> • NIT Patna
                        </p>
                        <a
                          href="https://www.linkedin.com/in/kanuri-sathish-kumar-289756330/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-blue-300 border border-[#0077b5]/40 rounded-xl px-4 py-2 transition-all hover:scale-105 w-fit mt-3 shadow-lg shadow-blue-500/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                          <span className="text-[11px] font-bold tracking-wider uppercase">Connect</span>
                        </a>
                      </div>
                      <div className="h-px w-full bg-white/5 my-2" />
                      <p className="text-sm text-white/60 leading-relaxed">
                        Sathish spent countless hours testing the dashboard to identify bugs and usability issues. By putting himself in the shoes of an everyday user, he provided invaluable suggestions that inspired many of the automated features you see today.
                      </p>
                    </div>

                    {/* Jyothir Ganesh */}
                    <div className="bg-black/20 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-colors shadow-lg">
                      <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
                        <img
                          src="/jyothir.png"
                          alt="Jyothir Ganesh"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <h4 className="text-xl font-bold text-white leading-tight">Jyothir Ganesh</h4>
                        <p className="text-[10px] sm:text-xs text-white/60 font-semibold tracking-wider uppercase mt-1">
                          <span className="text-blue-300">ECE</span> • Vishnu Institute
                        </p>
                        <a
                          href="https://www.linkedin.com/in/jyothirganesh-kanuboyina/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/40 text-blue-300 border border-[#0077b5]/40 rounded-xl px-4 py-2 transition-all hover:scale-105 w-fit mt-3 shadow-lg shadow-blue-500/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                          <span className="text-[11px] font-bold tracking-wider uppercase">Connect</span>
                        </a>
                      </div>
                      <div className="h-px w-full bg-white/5 my-2" />
                      <p className="text-sm text-white/60 leading-relaxed">
                        More than just a close friend since our school days, Jyothir has always been my strongest pillar of support. He never hesitates to speak the truth and give me grounded, factual advice exactly when I need it most.
                      </p>
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
                  className="bg-blue-500/80 hover:bg-blue-400 text-white p-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
                >
                  <ChevronDown size={24} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
