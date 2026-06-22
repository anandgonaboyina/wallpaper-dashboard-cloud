'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Flame, Calendar, Clock, BookOpen, GraduationCap, MessageCircle, ChevronDown, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocalDateString } from '@/utils/date';
import ScrollableWithArrows from './ScrollableWithArrows';

export default function StatsModal() {
  const { history, healthData, isStatsOpen, toggleStats } = useDashboardStore();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // When modal opens, auto-expand the current month
    if (isStatsOpen) {
      const d = new Date();
      const currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setExpandedMonths({ [currentMonthKey]: true });
    }
  }, [isStatsOpen]);

  // ----- DESKTOP SITE OVERRIDE LOGIC -----
  useEffect(() => {
    if (!isStatsOpen) return;

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    let originalContent = '';

    // Temporarily force desktop viewport on mobile, causing it to scale out
    if (viewportMeta) {
      originalContent = viewportMeta.getAttribute('content') || '';
      viewportMeta.setAttribute('content', 'width=1024');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=1024';
      document.head.appendChild(meta);
    }

    return () => {
      // Revert exactly to original layout when closed
      if (viewportMeta && originalContent) {
        viewportMeta.setAttribute('content', originalContent);
      } else {
        const addedMeta = document.querySelector('meta[name="viewport"]');
        if (addedMeta && !originalContent) addedMeta.remove();
      }
    };
  }, [isStatsOpen]);
  // ---------------------------------------

  if (!isStatsOpen) return null;

  // Sort dates descending (newest first)
  const dates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = getLocalDateString();
  const todayMins = history[today] || 0;
  const totalMins = Object.values(history).reduce((acc, curr) => acc + curr, 0);

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
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={toggleStats}
    >
      <div
        className="relative w-full h-[70vh] md:h-[80vh] max-w-6xl rounded-[1.8rem] sm:rounded-[2.5rem] md:rounded-[2rem] bg-black/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600" />

        {/* Header */}
        <div className="flex-none p-4 md:px-8 md:py-6 lg:px-10 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5 md:gap-3 drop-shadow-lg">
            <Flame className="text-orange-500 w-7 h-7 md:w-8 md:h-8" /> Focus History
          </h2>
          <button
            onClick={toggleStats}
            className="p-2 md:p-2.5 text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 rounded-full transition-all"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">

          {/* Sidebar: Overall Stats */}
          <div className="w-full md:w-[35%] lg:w-[30%] border-b md:border-b-0 md:border-r border-white/5 bg-black/40 flex flex-col relative flex-none md:flex-1">
            <ScrollableWithArrows className="p-4 sm:p-6 md:p-5 lg:p-6 flex flex-col gap-4 sm:gap-6 md:gap-4 lg:gap-5">

              {/* Stats Row for Mobile / Stacked for Desktop */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-6 md:gap-4 lg:gap-5">
                {/* Today */}
                <div className="p-4 sm:p-8 md:p-5 lg:p-6 rounded-[1.2rem] sm:rounded-[2rem] md:rounded-[1.5rem] bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 bg-blue-500/20 rounded-full blur-xl sm:blur-2xl group-hover:bg-blue-500/30 transition-colors" />
                  <Clock className="mb-2 sm:mb-4 md:mb-2 lg:mb-3 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] w-6 h-6 sm:w-10 sm:h-10 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                  <p className="text-2xl sm:text-5xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">{formatMinutes(todayMins)}</p>
                  <p className="text-[10px] sm:text-sm md:text-[11px] lg:text-xs text-blue-200/60 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-3 md:mt-1.5 lg:mt-2 font-bold">Today's Focus</p>
                </div>

                {/* Total */}
                <div className="p-4 sm:p-8 md:p-5 lg:p-6 rounded-[1.2rem] sm:rounded-[2rem] md:rounded-[1.5rem] bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
                  <div className="absolute -left-4 -bottom-4 w-16 h-16 sm:w-24 sm:h-24 bg-green-500/20 rounded-full blur-xl sm:blur-2xl group-hover:bg-green-500/30 transition-colors" />
                  <Calendar className="mb-2 sm:mb-4 md:mb-2 lg:mb-3 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] w-6 h-6 sm:w-10 sm:h-10 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                  <p className="text-2xl sm:text-5xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">{formatMinutes(totalMins)}</p>
                  <p className="text-[10px] sm:text-sm md:text-[11px] lg:text-xs text-green-200/60 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-3 md:mt-1.5 lg:mt-2 font-bold">All Time</p>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="p-4 sm:p-6 md:p-5 rounded-[1.2rem] sm:rounded-[2rem] md:rounded-[1.5rem] bg-white/5 border border-white/5 shadow-lg">
                <h3 className="text-[10px] sm:text-xs md:text-[10px] lg:text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-3 sm:mb-5 md:mb-3 lg:mb-4">Quick Summary</h3>
                <div className="flex flex-col gap-2.5 sm:gap-4 md:gap-2.5 lg:gap-3 text-sm sm:text-base md:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-medium">Days Logged</span>
                    <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-2 md:py-0.5 lg:px-2.5 lg:py-1 rounded-lg text-xs sm:text-sm md:text-xs">{dates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-medium">Daily Avg (All Time)</span>
                    <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-2 md:py-0.5 lg:px-2.5 lg:py-1 rounded-lg text-xs sm:text-sm md:text-xs">
                      {dates.length ? formatMinutes(Math.floor(totalMins / dates.length)) : '0m'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-medium">Last 7 Days Avg</span>
                    <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-2 md:py-0.5 lg:px-2.5 lg:py-1 rounded-lg text-xs sm:text-sm md:text-xs flex items-center gap-1.5 sm:gap-2">
                      <span>Avg: {formatMinutes(sevenDaysAvg)}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-blue-300">Total: {formatMinutes(sevenDaysTotal)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-medium">Last 30 Days Avg</span>
                    <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-2 md:py-0.5 lg:px-2.5 lg:py-1 rounded-lg text-xs sm:text-sm md:text-xs flex items-center gap-1.5 sm:gap-2">
                      <span>Avg: {formatMinutes(thirtyDaysAvg)}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-emerald-300">Total: {formatMinutes(thirtyDaysTotal)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </ScrollableWithArrows>
          </div>

          {/* Main Content: History */}
          <div className="flex-1 bg-transparent relative flex flex-col md:w-[65%] lg:w-[70%]">
            <ScrollableWithArrows className="p-4 sm:p-6 md:p-5 lg:p-6">
              <h3 className="text-xs sm:text-sm md:text-xs font-bold tracking-[0.2em] text-white/50 uppercase mb-4 sm:mb-6 md:mb-4 sticky top-0 bg-black/85 backdrop-blur-xl p-3 sm:p-4 md:py-2.5 md:px-4 rounded-xl sm:rounded-2xl border border-white/5 z-10 shadow-lg text-center">
                Monthly & Daily Breakdown
              </h3>

              <div className="flex flex-col gap-4 sm:gap-5 md:gap-4">
                {sortedMonths.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 opacity-50">
                    <Calendar size={48} className="mb-4 sm:mb-6 text-white/20" />
                    <p className="text-sm sm:text-lg font-medium text-white/60 text-center px-4">No focus sessions recorded yet. Start a timer!</p>
                  </div>
                ) : (
                  sortedMonths.map(monthKey => {
                    const data = monthlyData[monthKey];
                    const isMonthExpanded = expandedMonths[monthKey];

                    return (
                      <div key={monthKey} className="flex flex-col rounded-2xl sm:rounded-3xl md:rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-xl transition-all duration-300">

                        {/* Month Header */}
                        <div
                          className="flex justify-between items-center p-3.5 sm:p-5 md:p-4 cursor-pointer hover:bg-white/5 transition-colors group relative overflow-hidden"
                          onClick={() => toggleMonthExpand(monthKey)}
                        >
                          <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="flex items-center gap-3 sm:gap-4 md:gap-3 relative z-10">
                            <div className="p-2 sm:p-3 md:p-2.5 bg-white/5 rounded-xl sm:rounded-2xl md:rounded-xl group-hover:bg-orange-500/20 group-hover:scale-105 transition-all duration-300">
                              <CalendarDays className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5" />
                            </div>
                            <div>
                              <h4 className="text-base sm:text-xl md:text-lg lg:text-xl font-black text-white/90 tracking-tight">{data.name}</h4>
                              <p className="text-[10px] sm:text-xs md:text-[11px] text-white/50 mt-0.5 sm:mt-1 font-medium">{data.days.length} days recorded</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-6 md:gap-4 relative z-10">
                            <div className="text-right">
                              <span className="block text-lg sm:text-2xl md:text-xl lg:text-2xl font-black text-orange-400 drop-shadow-md">{formatMinutes(data.total)}</span>
                              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold block mt-0.5">Total</span>
                            </div>
                            <div className={`p-1.5 sm:p-2 md:p-1.5 rounded-full bg-white/5 transition-transform duration-300 ${isMonthExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown size={16} className="text-white/60 sm:w-5 sm:h-5 md:w-4 md:h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Monthly Health Totals */}
                        {isMonthExpanded && (
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-4 pb-3.5 sm:pb-4 md:pb-3 border-b border-white/5 bg-black/20">
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 md:gap-2 lg:gap-3 p-1.5 sm:p-2 md:p-1.5 sm:px-3 md:px-2 lg:px-3 rounded-lg sm:rounded-xl md:rounded-lg bg-purple-500/10 border border-purple-500/20 transition-transform hover:scale-105 text-center sm:text-left">
                              <div className="p-1 sm:p-2 md:p-1.5 bg-purple-500/20 rounded-md shrink-0">
                                <GraduationCap className="text-purple-400 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                              </div>
                              <div className="flex flex-col min-w-0 w-full">
                                <span className="text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] text-purple-200/60 uppercase tracking-widest font-bold truncate">Acad</span>
                                <span className="text-xs sm:text-sm font-bold text-purple-300 truncate">{formatMinutes(data.academic)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 md:gap-2 lg:gap-3 p-1.5 sm:p-2 md:p-1.5 sm:px-3 md:px-2 lg:px-3 rounded-lg sm:rounded-xl md:rounded-lg bg-pink-500/10 border border-pink-500/20 transition-transform hover:scale-105 text-center sm:text-left">
                              <div className="p-1 sm:p-2 md:p-1.5 bg-pink-500/20 rounded-md shrink-0">
                                <BookOpen className="text-pink-400 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                              </div>
                              <div className="flex flex-col min-w-0 w-full">
                                <span className="text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] text-pink-200/60 uppercase tracking-widest font-bold truncate">Read</span>
                                <span className="text-xs sm:text-sm font-bold text-pink-300 truncate">{formatMinutes(data.reading)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 md:gap-2 lg:gap-3 p-1.5 sm:p-2 md:p-1.5 sm:px-3 md:px-2 lg:px-3 rounded-lg sm:rounded-xl md:rounded-lg bg-yellow-500/10 border border-yellow-500/20 transition-transform hover:scale-105 text-center sm:text-left">
                              <div className="p-1 sm:p-2 md:p-1.5 bg-yellow-500/20 rounded-md shrink-0">
                                <MessageCircle className="text-yellow-400 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                              </div>
                              <div className="flex flex-col min-w-0 w-full">
                                <span className="text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] text-yellow-200/60 uppercase tracking-widest font-bold truncate">Vocab</span>
                                <span className="text-xs sm:text-sm font-bold text-yellow-300 truncate">{data.english} w</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Days inside Month */}
                        {isMonthExpanded && (
                          <div className="flex flex-col p-2 sm:p-4 md:p-3 bg-black/40 gap-1.5 sm:gap-2 md:gap-1.5">
                            {data.days.map((date: string) => {
                              const hData = healthData[date];
                              return (
                                <div key={date} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2.5 sm:p-3 md:p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 transition-colors border border-white/5 gap-2 sm:gap-3 md:gap-2">
                                  <div className="flex items-center gap-2 min-w-max">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400/50" />
                                    <span className="font-medium text-white/80 text-xs sm:text-sm md:text-xs">
                                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                                    {hData ? (
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] md:text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded" title="Academic">
                                          <GraduationCap size={11} className="sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" /> <span className="font-bold">{formatMinutes(hData.academic || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] md:text-[10px] text-pink-300 bg-pink-500/10 px-1.5 py-0.5 rounded" title="Reading">
                                          <BookOpen size={11} className="sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" /> <span className="font-bold">{formatMinutes(hData.reading || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] md:text-[10px] text-yellow-300 bg-yellow-500/10 px-1.5 py-0.5 rounded" title="Vocab">
                                          <MessageCircle size={11} className="sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" /> <span className="font-bold">{hData.english || 0}</span>
                                        </div>
                                      </div>
                                    ) : <div />}

                                    <span className="font-bold text-orange-200 bg-orange-500/10 px-2 py-0.5 sm:px-3 sm:py-1 md:px-2.5 md:py-0.5 rounded-lg border border-orange-500/20 shadow-inner text-xs sm:text-sm shrink-0">
                                      {formatMinutes(history[date])}
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
    </div>
  );
}