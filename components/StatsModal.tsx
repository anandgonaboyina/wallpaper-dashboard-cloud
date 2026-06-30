'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Flame, Calendar, Clock, BookOpen, GraduationCap, MessageCircle, ChevronDown, CalendarDays, Trophy, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocalDateString } from '@/utils/date';
import ScrollableWithArrows from './ScrollableWithArrows';
import Timetable from './Timetable';

export default function StatsModal() {
  const { history: myHistory, healthData: myHealthData, isStatsOpen, toggleStats, viewingFriend, setViewingFriend } = useDashboardStore();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [showFriendTimetable, setShowFriendTimetable] = useState(false);

  const history = viewingFriend ? viewingFriend.stats.history || {} : myHistory;
  const healthData = viewingFriend ? viewingFriend.stats.healthData || {} : myHealthData;

  useEffect(() => {
    // When modal opens, auto-expand the current month
    if (isStatsOpen) {
      const d = new Date();
      const currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setExpandedMonths({ [currentMonthKey]: true });
    }
  }, [isStatsOpen]);

  // ----- DESKTOP SITE OVERRIDE LOGIC -----

  const handleClose = () => {
    const wasViewingFriend = !!viewingFriend;
    const shouldReturn = wasViewingFriend || (typeof window !== 'undefined' && sessionStorage.getItem('returnToConnect') === 'true');
    if (viewingFriend) {
      setViewingFriend(null);
    }
    
    if (shouldReturn) {
      if (typeof window !== 'undefined') sessionStorage.removeItem('returnToConnect');
      // Ensure Settings Modal is open and on the connect tab
      useDashboardStore.getState().setSettingsActiveTab('connect');
      if (!useDashboardStore.getState().isSettingsOpen) {
        useDashboardStore.getState().toggleSettings();
      }
    }
    toggleStats();
  };

  if (!isStatsOpen) return null;

  // Sort dates descending (newest first)
  const dates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = getLocalDateString();
  const todayMins = history[today] || 0;
  const totalMins = Object.values(history).reduce((acc: number, curr: any) => acc + (curr as number), 0);

  // Helper to calculate total mins for last X days
  const calculateHistoryRange = (days: number) => {
    let total = 0;
    const todayObj = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      total += history[dateStr] || 0;
    }
    return total;
  };

  const sevenDaysTotal = calculateHistoryRange(7);
  const thirtyDaysTotal = calculateHistoryRange(30);
  const sevenDaysAvg = Math.round(sevenDaysTotal / 7);
  const thirtyDaysAvg = Math.round(thirtyDaysTotal / 30);

  // Group by month
  const monthlyData = dates.reduce((acc, date) => {
    const d = new Date(date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthName, total: 0, academic: 0, reading: 0, english: 0, days: [] };
    }

    acc[monthKey].total += history[date] || 0;
    const hData = healthData[date];
    if (hData) {
      acc[monthKey].academic += hData.academic || 0;
      acc[monthKey].reading += hData.reading || 0;
      acc[monthKey].english += hData.english || 0;
    }
    acc[monthKey].days.push(date);
    return acc;
  }, {} as Record<string, { name: string, total: number, academic: number, reading: number, english: number, days: string[] }>);

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => b.localeCompare(a));

  const toggleMonthExpand = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-h-[80vh] max-w-5xl rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600" />

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

        {/* Header */}
        <div className="flex-none p-3 sm:p-5 flex justify-between items-center border-b border-white/10 bg-black/20 relative z-10">
          <h2 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-1.5 sm:gap-2 text-white">
            <Flame className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" /> {viewingFriend ? `${viewingFriend.username}'s Stats` : 'Focus History'}
          </h2>
          <div className="flex items-center gap-2">
            {viewingFriend && (
              <button
                onClick={() => setShowFriendTimetable(true)}
                className="p-1.5 sm:p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg sm:rounded-xl transition-colors border border-blue-500/30 flex items-center gap-1.5"
                title="View Timetable"
              >
                <CalendarDays size={18} />
                <span className="text-xs font-semibold hidden sm:inline">Timetable</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative z-10">

          {/* Sidebar: Overall Stats */}
          <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-white/10 bg-black/10 flex flex-col relative flex-none md:flex-1 shrink-0">
            <ScrollableWithArrows className="p-3 sm:p-4 flex flex-col gap-3">

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3">
                {/* Today */}
                <div className="p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-400/30 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute -right-2 -top-2 w-12 h-12 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors" />
                  <Clock className="mb-1 text-blue-300 w-5 h-5 sm:w-6 sm:h-6" />
                  <p className="text-xl sm:text-2xl font-black text-white">{formatMinutes(todayMins)}</p>
                  <p className="text-[9px] sm:text-[10px] text-blue-200/70 uppercase tracking-widest mt-1 font-bold">Today's Focus</p>
                </div>

                {/* Total */}
                <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute -left-2 -bottom-2 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-colors" />
                  <Calendar className="mb-1 text-emerald-300 w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xl sm:text-2xl font-black text-white">{formatMinutes(totalMins as number)}</span>
                  <p className="text-[9px] sm:text-[10px] text-emerald-200/70 uppercase tracking-widest mt-1 font-bold">All Time</p>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 border-b border-white/10 pb-1.5">Quick Summary</h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-md border border-white/5">
                    <span className="text-white/70 font-medium">Days Logged</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">{dates.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-md border border-white/5">
                    <span className="text-white/70 font-medium">Daily Avg</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">
                      {dates.length ? formatMinutes(Math.floor(totalMins / dates.length)) : '0m'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-md border border-white/5">
                    <span className="text-white/70 font-medium">7-Day Avg</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      {formatMinutes(sevenDaysAvg)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-1.5 rounded-md border border-white/5">
                    <span className="text-white/70 font-medium">30-Day Avg</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      {formatMinutes(thirtyDaysAvg)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Link Button */}
              <button 
                onClick={() => {
                  if (viewingFriend) setViewingFriend(null);
                  if (typeof window !== 'undefined') sessionStorage.removeItem('returnToConnect');
                  toggleStats();
                  useDashboardStore.getState().setConnectInitialTab('leaderboard');
                  useDashboardStore.getState().setSettingsActiveTab('connect');
                  if (!useDashboardStore.getState().isSettingsOpen) {
                    useDashboardStore.getState().toggleSettings();
                  }
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('open-leaderboard'));
                  }
                }}
                className="w-full mt-2 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/10 hover:border-white/30 transition-all flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">Global Leaderboard</h3>
                    <p className="text-[9px] sm:text-[10px] text-white/50">Compare your focus time</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </ScrollableWithArrows>
          </div>

          {/* Main Content: History */}
          <div className="flex-1 bg-transparent relative flex flex-col md:w-[65%]">
            <ScrollableWithArrows className="p-2 sm:p-4">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-widest text-white/70 uppercase mb-2 sticky top-0 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 z-10 text-center">
                Monthly Breakdown
              </h3>

              <div className="flex flex-col gap-2.5 sm:gap-3">
                {sortedMonths.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 sm:h-48 opacity-50 bg-black/20 rounded-xl border border-white/10">
                    <Calendar size={32} className="mb-2 text-white/40" />
                    <p className="text-xs sm:text-sm font-medium text-white/70 text-center">No focus sessions recorded yet.</p>
                  </div>
                ) : (
                  sortedMonths.map(monthKey => {
                    const data = monthlyData[monthKey];
                    const isMonthExpanded = expandedMonths[monthKey];

                    return (
                      <div key={monthKey} className="flex flex-col rounded-xl bg-white/5 border border-white/20 overflow-hidden shadow-lg">

                        {/* Month Header */}
                        <div
                          className="flex justify-between items-center p-2.5 sm:p-3 cursor-pointer hover:bg-white/10 transition-colors group relative bg-black/20"
                          onClick={() => toggleMonthExpand(monthKey)}
                        >
                          <div className="flex items-center gap-2 relative z-10">
                            <div className="p-1.5 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors border border-orange-400/30">
                              <CalendarDays className="text-orange-300 w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">{data.name}</h4>
                              <p className="text-[9px] sm:text-[10px] text-white/50 mt-0.5">{data.days.length} days active</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 relative z-10">
                            <div className="text-right">
                              <span className="block text-sm sm:text-base font-black text-orange-300">{formatMinutes(data.total)}</span>
                            </div>
                            <div className={`p-1 rounded-md bg-white/10 transition-transform ${isMonthExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown size={14} className="text-white/70" />
                            </div>
                          </div>
                        </div>

                        {/* Monthly Health Totals */}
                        {isMonthExpanded && (
                          <div className="grid grid-cols-3 gap-1 px-2 pb-2 bg-black/40 border-t border-white/10 pt-2">
                            <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-purple-500/10 border border-purple-400/20 text-center">
                              <GraduationCap className="text-purple-300 w-3 h-3" />
                              <span className="text-[8px] sm:text-[9px] text-purple-200/70 uppercase tracking-widest font-bold">Acad</span>
                              <span className="text-[10px] sm:text-xs font-bold text-purple-200 leading-none">{formatMinutes(data.academic)}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-pink-500/10 border border-pink-400/20 text-center">
                              <BookOpen className="text-pink-300 w-3 h-3" />
                              <span className="text-[8px] sm:text-[9px] text-pink-200/70 uppercase tracking-widest font-bold">Read</span>
                              <span className="text-[10px] sm:text-xs font-bold text-pink-200 leading-none">{formatMinutes(data.reading)}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/20 text-center">
                              <MessageCircle className="text-yellow-300 w-3 h-3" />
                              <span className="text-[8px] sm:text-[9px] text-yellow-200/70 uppercase tracking-widest font-bold">Vocab</span>
                              <span className="text-[10px] sm:text-xs font-bold text-yellow-200 leading-none">{data.english}w</span>
                            </div>
                          </div>
                        )}

                        {/* Days inside Month */}
                        {isMonthExpanded && (
                          <div className="flex flex-col p-1.5 sm:p-2 bg-black/20 gap-1 border-t border-white/5">
                            {data.days.map((date: string) => {
                              const hData = healthData[date];
                              return (
                                <div key={date} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 gap-1.5 sm:gap-2">

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-1 h-1 rounded-full bg-orange-400" />
                                    <span className="font-semibold text-white/90 text-[10px] sm:text-xs">
                                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                    {hData ? (
                                      <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-0.5 text-[9px] text-purple-200 bg-purple-500/20 px-1 py-0.5 rounded border border-purple-400/30">
                                          <GraduationCap size={10} /> <span className="font-bold">{formatMinutes(hData.academic || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 text-[9px] text-pink-200 bg-pink-500/20 px-1 py-0.5 rounded border border-pink-400/30">
                                          <BookOpen size={10} /> <span className="font-bold">{formatMinutes(hData.reading || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 text-[9px] text-yellow-200 bg-yellow-500/20 px-1 py-0.5 rounded border border-yellow-400/30">
                                          <MessageCircle size={10} /> <span className="font-bold">{hData.english || 0}</span>
                                        </div>
                                      </div>
                                    ) : <div className="flex-1" />}

                                    <span className="font-bold text-orange-200 bg-orange-500/20 px-1.5 py-0.5 rounded border border-orange-400/30 text-[10px] sm:text-xs shrink-0">
                                      {formatMinutes(history[date] as number)}
                                    </span>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollableWithArrows>
          </div>
        </div>
      </div>

      {showFriendTimetable && viewingFriend && (
        <div 
          className="fixed inset-0 z-[10005] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-4"
          onClick={() => setShowFriendTimetable(false)}
        >
          <div 
            className="w-full max-w-4xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFriendTimetable(false)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors text-white"
            >
              <X size={24} />
            </button>
            <Timetable />
          </div>
        </div>
      )}
    </div>
  );
}