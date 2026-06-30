"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { CalendarDays, Edit2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check, Settings, Plus, Trash, Clock, ArrowUp, ArrowDown, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];

// Upgraded to a richer, softer, more modern color palette
export const CELL_COLORS = [
  { name: 'default', bg: 'bg-white/5', active: 'bg-violet-500/30', text: 'text-gray-300', solidBg: 'bg-white/40' },
  { name: 'red', bg: 'bg-rose-500/15', active: 'bg-rose-500/30', text: 'text-rose-300', solidBg: 'bg-rose-500/80' },
  { name: 'blue', bg: 'bg-sky-500/15', active: 'bg-sky-500/30', text: 'text-sky-300', solidBg: 'bg-sky-500/80' },
  { name: 'green', bg: 'bg-emerald-500/15', active: 'bg-emerald-500/30', text: 'text-emerald-300', solidBg: 'bg-emerald-500/80' },
  { name: 'yellow', bg: 'bg-amber-500/15', active: 'bg-amber-500/30', text: 'text-amber-300', solidBg: 'bg-amber-500/80' },
  { name: 'purple', bg: 'bg-violet-500/15', active: 'bg-violet-500/30', text: 'text-violet-300', solidBg: 'bg-violet-500/80' },
  { name: 'orange', bg: 'bg-orange-500/15', active: 'bg-orange-500/30', text: 'text-orange-300', solidBg: 'bg-orange-500/80' },
  { name: 'cyan', bg: 'bg-cyan-500/15', active: 'bg-cyan-500/30', text: 'text-cyan-300', solidBg: 'bg-cyan-500/80' },
  { name: 'pink', bg: 'bg-fuchsia-500/15', active: 'bg-fuchsia-500/30', text: 'text-fuchsia-300', solidBg: 'bg-fuchsia-500/80' },
];

// Utility to format minutes into h:mm AM/PM
const formatTime = (totalMins: number) => {
  let h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const parseMins = (tStr: string) => {
  if (!tStr) return 0;
  const m = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const ampm = m[3].toUpperCase();
  if (h === 12 && ampm === "AM") h = 0;
  if (h !== 12 && ampm === "PM") h += 12;
  return h * 60 + min;
};

export default function Timetable() {
  const {
    timetableGrid: myTimetableGrid,
    timetableColors: myTimetableColors,
    weekdayTimes: myWeekdayTimes,
    weekendTimes: myWeekendTimes,
    updateTimetableCell, updateTimetableColor,
    updateTimetableTime, addTimetableRow, deleteTimetableRow,
    useTimetableRange, toggleTimetableRange, renameTimetableKeys,
    viewingFriend, setViewingFriend
  } = useDashboardStore();

  const timetableGrid = viewingFriend ? (viewingFriend.stats.timetableGrid || {}) : myTimetableGrid;
  const timetableColors = viewingFriend ? (viewingFriend.stats.timetableColors || {}) : myTimetableColors;
  const weekdayTimes = viewingFriend ? (viewingFriend.stats.weekdayTimes || ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]) : myWeekdayTimes;
  const weekendTimes = viewingFriend ? (viewingFriend.stats.weekendTimes || ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"]) : myWeekendTimes;

  const [currentDayIndex, setCurrentDayIndex] = useState(() => new Date().getDay());
  const [viewMode, setViewMode] = useState<"weekdays" | "weekends">(
    () => (new Date().getDay() === 0 || new Date().getDay() === 6) ? "weekends" : "weekdays"
  );
  const [editingCell, setEditingCell] = useState<{ day: string, time: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [globalEditingIndex, setGlobalEditingIndex] = useState<number | null>(null);

  // Scroll logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setStartY(e.pageY - (scrollContainerRef.current?.offsetTop || 0));
    setScrollTop(scrollContainerRef.current?.scrollTop || 0);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walkY = (y - startY) * 1.5;
    scrollContainerRef.current.scrollTop = scrollTop - walkY;

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walkX = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
  };

  // Day Start Times
  const [weekdayStartTime, setWeekdayStartTime] = useState(540); // 9:00 AM default
  const [weekendStartTime, setWeekendStartTime] = useState(540);
  const [isEditingStartTime, setIsEditingStartTime] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWdStart = localStorage.getItem('timetable_start_weekday');
      const storedWeStart = localStorage.getItem('timetable_start_weekend');
      if (storedWdStart) setWeekdayStartTime(parseInt(storedWdStart));
      if (storedWeStart) setWeekendStartTime(parseInt(storedWeStart));
    }
    const day = new Date().getDay();
    setCurrentDayIndex(day);
    if (day === 0 || day === 6) setViewMode("weekends");
    else setViewMode("weekdays");
  }, []);

  const handleSetStartTime = (mins: number, skipRename = false) => {
    if (!skipRename) {
      const diff = mins - startTime;
      if (diff !== 0) {
        let oldAccumulated = startTime;
        let newAccumulated = mins;
        const keyMap: Record<string, string> = {};

        for (let i = 0; i < durations.length; i++) {
          const oldStr = formatTime(oldAccumulated);
          const newStr = formatTime(newAccumulated);
          if (oldStr !== newStr) {
            keyMap[oldStr] = newStr;
          }
          oldAccumulated += durations[i];
          newAccumulated += durations[i];
        }
        renameTimetableKeys(isWeekendMode, keyMap);
      }
    }

    if (viewMode === "weekdays") {
      setWeekdayStartTime(mins);
      localStorage.setItem('timetable_start_weekday', mins.toString());
    } else {
      setWeekendStartTime(mins);
      localStorage.setItem('timetable_start_weekend', mins.toString());
    }
    setIsEditingStartTime(false);
  };

  const isWeekendMode = viewMode === "weekends";
  const activeDays = isWeekendMode ? WEEKENDS : WEEKDAYS;
  const rawTimes = isWeekendMode ? weekendTimes : weekdayTimes;

  // Map old string times to durations (60 mins default) to safely migrate
  const durations = rawTimes.length > 0 ? rawTimes.map((t: any) => {
    if (typeof t === 'number') return t;
    return 60;
  }) : [60, 60, 60, 60, 60, 60, 60, 60, 60];

  // Calculate actual absolute TIMES based on Start Time + cumulative Durations
  const startTime = isWeekendMode ? weekendStartTime : weekdayStartTime;

  let currentAccumulatedMins = startTime;
  const generatedTimes: { startStr: string, endStr: string, startMins: number, endMins: number, duration: number }[] = [];

  for (let i = 0; i < durations.length; i++) {
    const dur = durations[i];
    const startStr = formatTime(currentAccumulatedMins);
    const endStr = formatTime(currentAccumulatedMins + dur);
    generatedTimes.push({
      startStr, endStr, startMins: currentAccumulatedMins, endMins: currentAccumulatedMins + dur, duration: dur
    });
    currentAccumulatedMins += dur;
  }

  // Active Time Detection
  const [activeTimeIndex, setActiveTimeIndex] = useState(-1);
  useEffect(() => {
    const checkActiveTime = () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();

      let activeIdx = -1;
      for (let i = 0; i < generatedTimes.length; i++) {
        const block = generatedTimes[i];
        let isActive = false;
        if (block.endMins < block.startMins) {
          // Crosses midnight
          isActive = nowMins >= block.startMins || nowMins < block.endMins;
        } else {
          isActive = nowMins >= block.startMins && nowMins < block.endMins;
        }
        if (isActive) {
          activeIdx = i;
          break;
        }
      }
      setActiveTimeIndex(activeIdx);
    };

    checkActiveTime();
    const interval = setInterval(checkActiveTime, 60000);
    return () => clearInterval(interval);
  }, [generatedTimes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateDuration = (idx: number, newDur: number) => {
    let oldAccumulated = startTime;
    const oldTimesStrs: string[] = [];
    for (let i = 0; i < durations.length; i++) {
      oldTimesStrs.push(formatTime(oldAccumulated));
      oldAccumulated += durations[i];
    }

    const newDurations = [...durations];
    newDurations[idx] = newDur;

    let newAccumulated = startTime;
    const newTimesStrs: string[] = [];
    for (let i = 0; i < newDurations.length; i++) {
      newTimesStrs.push(formatTime(newAccumulated));
      newAccumulated += newDurations[i];
    }

    const keyMap: Record<string, string> = {};
    for (let i = 0; i < oldTimesStrs.length; i++) {
      if (oldTimesStrs[i] !== newTimesStrs[i]) {
        keyMap[oldTimesStrs[i]] = newTimesStrs[i];
      }
    }

    updateTimetableTime(isWeekendMode, idx, newDur as any, keyMap);
  };

  // --- SMART ROW MANAGEMENT ---
  const handleAddTopRow = () => {
    const newStart = startTime - 60;
    if (newStart < 0) {
      alert("Cannot start before midnight!");
      return;
    }
    handleSetStartTime(newStart, true); // skip key renaming
    addTimetableRow(isWeekendMode, true);
    setShowSettings(false);
  };

  const handleDeleteTopRow = () => {
    if (confirm("Delete the top row?")) {
      const durationToRemove = generatedTimes[0]?.duration || 60;
      const newStart = startTime + durationToRemove;
      handleSetStartTime(newStart, true); // skip key renaming
      deleteTimetableRow(isWeekendMode, 0);
      setShowSettings(false);
    }
  };

  return (
    <div suppressHydrationWarning className="bg-gradient-to-br from-[#12121a] to-[#0a0a0c] border border-white/10 rounded-3xl p-1.5 md:p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] w-full max-w-[100vw] md:w-fit overflow-hidden md:overflow-visible relative">
      {/* Start Time Modal Overlay */}
      {isEditingStartTime && (
        <StartTimeEditor currentMins={startTime} onSave={handleSetStartTime} onCancel={() => setIsEditingStartTime(false)} />
      )}

      <div className="flex items-center justify-between text-white/90 mb-3 pb-2 border-b border-white/5 mt-1 px-2 min-w-0 md:min-w-[300px]">
        <button
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 active:scale-95 rounded-xl transition-all shrink-0 text-white/70 hover:text-white"
          title="Previous view"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1.5 md:gap-2 relative" ref={settingsRef}>
          <CalendarDays size={18} className="text-violet-400 md:w-5 md:h-5" />
          <span className="font-bold tracking-widest uppercase text-sm md:text-base text-center truncate text-gray-100">
            {viewMode === "weekdays" ? "Weekly Schedule" : "Weekend Schedule"}
          </span>
          {!viewingFriend && (
            <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all hover:rotate-90 ml-1 shrink-0">
              <Settings size={14} />
            </button>
          )}

          {showSettings && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1.5 z-50 flex flex-col min-w-[200px] animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="px-3 py-1.5 text-[10px] text-white/40 uppercase tracking-wider font-bold border-b border-white/5 mb-1">Row Management</div>
              <button onClick={handleAddTopRow} className="px-3 py-2 hover:bg-white/10 text-xs text-white/80 flex items-center justify-between transition-colors w-full text-left">
                <span className="flex items-center gap-2"><ArrowUp size={14} className="text-emerald-400" /> Add Top Row</span>
              </button>
              <button onClick={() => { addTimetableRow(isWeekendMode); setShowSettings(false); }} className="px-3 py-2 hover:bg-white/10 text-xs text-white/80 flex items-center justify-between transition-colors w-full text-left border-b border-white/5 pb-3 mb-1">
                <span className="flex items-center gap-2"><ArrowDown size={14} className="text-sky-400" /> Add Bottom Row</span>
              </button>
              <button onClick={handleDeleteTopRow} className="px-3 py-2 hover:bg-rose-500/10 text-xs text-rose-400 flex items-center gap-2 transition-colors w-full text-left">
                <Trash size={14} /> Delete Top Row
              </button>
              <button onClick={() => { if (confirm("Delete the bottom row?")) deleteTimetableRow(isWeekendMode, generatedTimes.length - 1); setShowSettings(false); }} className="px-3 py-2 hover:bg-rose-500/10 text-xs text-rose-400 flex items-center gap-2 transition-colors w-full text-left">
                <Trash size={14} /> Delete Bottom Row
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 active:scale-95 rounded-xl transition-all shrink-0 text-white/70 hover:text-white"
          title="Next view"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Compact Start Time Trigger */}
      <div className="mb-2 mx-auto flex justify-center">
        <button
          onClick={() => !viewingFriend && setIsEditingStartTime(true)}
          className={`text-[9px] md:text-[10px] text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 hover:bg-sky-500/20 transition-all flex items-center gap-1.5 font-semibold shadow-sm ${viewingFriend ? 'cursor-default' : 'active:scale-95 hover:shadow-[0_0_12px_rgba(14,165,233,0.15)]'}`}
        >
          <Clock size={12} /> Day Starts: {formatTime(startTime)}
        </button>
      </div>

      <div
        className="relative overflow-auto custom-scrollbar pb-1 px-1 w-full max-h-[50vh] md:max-h-[60vh] cursor-grab active:cursor-grabbing"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div
          className={`grid gap-1.5 md:gap-2 ${viewMode === "weekdays" ? "min-w-[500px] md:min-w-[750px] grid-cols-[75px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)]" : "min-w-[280px] md:min-w-[400px] grid-cols-[75px_repeat(2,1fr)] md:grid-cols-[120px_repeat(2,1fr)]"}`}
        >
          {/* Time Column */}
          <div className="sticky left-0 rounded-xl z-30 bg-[#0f0f13]/90 backdrop-blur-md flex flex-col shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)] pr-1">
            <div className="text-center font-bold text-white/30 uppercase tracking-widest text-[9px] md:text-[10px] py-1.5 mb-1.5">Time</div>

            {generatedTimes.map((block, index) => {
              return (
                <div key={index} className="mb-[3px] relative">
                  <DurationCell
                    block={block}
                    index={index}
                    onUpdate={(newDur) => handleUpdateDuration(index, newDur)}
                    isActive={activeTimeIndex === index}
                    isRange={useTimetableRange}
                    isEditingOverride={globalEditingIndex === index}
                    setEditingOverride={(state) => !viewingFriend && setGlobalEditingIndex(state ? index : null)}
                    isReadOnly={!!viewingFriend}
                  />
                </div>
              )
            })}
          </div>

          {/* Day Columns */}
          {activeDays.map((day) => {
            const dayIndexMap: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
            const isToday = currentDayIndex === dayIndexMap[day];

            const colorMap: Record<string, string> = {
              "Mon": "text-rose-300 border-rose-400/20 bg-rose-500/10",
              "Tue": "text-orange-300 border-orange-400/20 bg-orange-500/10",
              "Wed": "text-amber-300 border-amber-400/20 bg-amber-500/10",
              "Thu": "text-emerald-300 border-emerald-400/20 bg-emerald-500/10",
              "Fri": "text-sky-300 border-sky-400/20 bg-sky-500/10",
              "Sat": "text-violet-300 border-violet-400/20 bg-violet-500/10",
              "Sun": "text-fuchsia-300 border-fuchsia-400/20 bg-fuchsia-500/10"
            };

            return (
              <div key={day} className={`flex flex-col rounded-2xl p-1 transition-all duration-300 ${isToday ? 'bg-white/[0.08] border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' : ''}`}>
                <div className={`text-center font-bold uppercase tracking-widest text-[10px] md:text-xs py-1.5 mb-1.5 rounded-xl border backdrop-blur-sm ${isToday ? 'bg-violet-500/20 text-violet-200 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : colorMap[day]}`}>
                  {day}
                </div>

                {generatedTimes.map((block, index) => {
                  const gridKey = block.startStr;
                  const subject = timetableGrid?.[day]?.[gridKey] || "";
                  const customColorName = timetableColors?.[day]?.[gridKey];
                  const customColor = CELL_COLORS.find(c => c.name === customColorName) || CELL_COLORS[0];

                  const prevKey = index > 0 ? generatedTimes[index - 1].startStr : null;
                  const prevSubject = prevKey ? (timetableGrid?.[day]?.[prevKey] || "") : "";
                  const nextKey = index < generatedTimes.length - 1 ? generatedTimes[index + 1].startStr : null;
                  const nextSubject = nextKey ? (timetableGrid?.[day]?.[nextKey] || "") : "";

                  const isContinuation = subject === prevSubject;
                  const isContinuedByNext = subject === nextSubject;

                  let spanCount = 1;
                  if (!isContinuation && isContinuedByNext) {
                    for (let j = index + 1; j < generatedTimes.length; j++) {
                      if ((timetableGrid?.[day]?.[generatedTimes[j].startStr] || "") === subject) {
                        spanCount++;
                      } else {
                        break;
                      }
                    }
                  }

                  const isDayFocused = editingCell?.day === day;
                  const isActiveBlock = isToday && activeTimeIndex === index;

                  let roundedClass = 'rounded-xl';
                  if (!isDayFocused) {
                    if (isContinuation && isContinuedByNext) roundedClass = 'rounded-none border-y-transparent';
                    else if (isContinuation) roundedClass = 'rounded-b-xl rounded-t-[4px] border-t-transparent';
                    else if (isContinuedByNext) roundedClass = 'rounded-t-xl rounded-b-[4px] border-b-transparent';
                  }

                  const isPartOfBlock = isContinuation || spanCount > 1;
                  const isHiddenText = !isDayFocused && isPartOfBlock;

                  const textClassFinal = isHiddenText ? 'text-transparent' : customColor.text;
                  const borderClass = isActiveBlock
                    ? 'border-violet-400/60 shadow-[0_0_12px_rgba(139,92,246,0.4)] z-20'
                    : (customColor.name === 'default' ? 'border-white/5' : 'border-transparent');

                  const bgClass = isActiveBlock ? customColor.active : customColor.bg;
                  const marginBottom = (!isDayFocused && isContinuedByNext) ? 'mb-0' : 'mb-[3px]';

                  const showOverlay = !isContinuation && spanCount > 1 && !isDayFocused;
                  const overlayHeightPx = spanCount * 43; // Adjusted for gap/margins

                  const isEditingThisCell = editingCell?.day === day && editingCell?.time === gridKey;

                  return (
                    <div
                      key={index}
                      onDoubleClick={() => !viewingFriend && setEditingCell({ day, time: gridKey })}
                      className={`relative group h-10 ${marginBottom} flex items-center justify-center border transition-all duration-200 z-10 ${borderClass} ${roundedClass} ${!viewingFriend ? 'hover:brightness-125' : ''} ${isEditingThisCell ? 'ring-2 ring-violet-500 z-50 shadow-lg' : ''} ${bgClass}`}
                    >
                      {showOverlay && !isEditingThisCell && (
                        <div style={{ height: `${overlayHeightPx}px` }} className="absolute top-0 left-0 w-full pointer-events-none flex items-center justify-center z-30">
                          <span className={`${isActiveBlock ? 'text-white font-bold scale-[1.02]' : (customColor.name !== 'default' ? customColor.text : 'text-gray-300')} font-medium px-1 md:px-2 text-center break-words transition-all duration-200 text-[10px] md:text-xs tracking-wide`}>{subject || "Free"}</span>
                        </div>
                      )}

                      <div className={`w-full h-full flex items-center justify-center overflow-hidden break-words px-1 cursor-pointer select-none ${isEditingThisCell ? 'opacity-30' : ''}`}>
                        <span className={`w-full text-center ${textClassFinal} text-[10px] md:text-xs leading-snug tracking-wide font-medium`}>{subject || (!isHiddenText ? "Free" : "")}</span>
                      </div>

                      {!viewingFriend && !isEditingThisCell && <Edit2 size={10} className={`absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 pointer-events-none ${isHiddenText ? 'text-transparent' : customColor.text} z-20 transition-opacity`} />}

                      {/* Active indicator dot */}
                      {isActiveBlock && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(139,92,246,1)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>

      {/* Centered Cell Editor Modal */}
      {editingCell && (
        <div className="fixed inset-4 z-[10000] flex items-center justify-center p-4  animate-in fade-in duration-200" onClick={() => setEditingCell(null)}>
          <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-5 w-full max-w-[300px] flex flex-col gap-4 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditingCell(null)} className="absolute top-3 right-3 p-1.5 text-white/40 hover:text-white transition-all rounded-full hover:bg-white/10 active:scale-95"><X size={16} /></button>

            <div className="text-center mt-1">
              <h3 className="font-bold text-gray-100 text-sm uppercase tracking-wider">{editingCell.day} <span className="text-white/30 mx-1">•</span> <span className="text-violet-300">{editingCell.time}</span></h3>
              <p className="text-[10px] text-white/40 mt-1 uppercase font-semibold tracking-wide">Edit Subject & Color</p>
            </div>

            <textarea
              value={timetableGrid?.[editingCell.day]?.[editingCell.time] || ""}
              onChange={(e) => updateTimetableCell(editingCell.day, editingCell.time, e.target.value)}
              autoFocus
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setEditingCell(null);
                }
              }}
              rows={2}
              placeholder="e.g. Math, Free, Break..."
              spellCheck={false}
              className="w-full text-center bg-black/20 border border-white/10 rounded-2xl outline-none text-white text-sm md:text-base leading-relaxed resize-none overflow-hidden break-words p-3 focus:bg-black/40 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner placeholder:text-white/20"
            />

            <div className="flex flex-wrap gap-2.5 bg-white/20 rounded-md justify-center mx-auto mt-2 p-1">
              {CELL_COLORS.map(c => {
                const isActive = (timetableColors?.[editingCell.day]?.[editingCell.time] || 'default') === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => updateTimetableColor(editingCell.day, editingCell.time, c.name)}
                    title={c.name}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${c.solidBg} ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 shadow-lg' : 'opacity-100 hover:scale-110'} transition-all duration-200 flex items-center justify-center shrink-0`}
                  >
                    {isActive && <Check size={14} className="text-white drop-shadow-md" />}
                  </button>
                );
              })}
            </div>

            <button onClick={() => setEditingCell(null)} className="mt-2 w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95">
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// Component for editing Start Time (Modal Overlay)
// -------------------------------------------------------------
function StartTimeEditor({ currentMins, onSave, onCancel }: { currentMins: number, onSave: (mins: number) => void, onCancel: () => void }) {
  const initialH = Math.floor(currentMins / 60) % 24;
  const initialM = currentMins % 60;

  const [timeValue, setTimeValue] = useState(
    `${initialH.toString().padStart(2, '0')}:${initialM.toString().padStart(2, '0')}`
  );

  const save = () => {
    if (!timeValue) {
      onCancel();
      return;
    }
    const [hStr, mStr] = timeValue.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    onSave(h * 60 + m);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 flex flex-col items-center gap-5 w-full max-w-[260px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-full mb-1">
            <Clock size={20} />
          </div>
          <h3 className="text-gray-100 font-bold text-sm tracking-wide">Set Day Start Time</h3>
        </div>

        <input
          type="time"
          value={timeValue}
          onChange={e => setTimeValue(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-xl font-medium tracking-wider text-center outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer [color-scheme:dark] shadow-inner"
        />

        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); save(); }}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component for editing Duration
// -------------------------------------------------------------
function DurationCell({
  block,
  index,
  onUpdate,
  isActive,
  isRange,
  isEditingOverride,
  setEditingOverride,
  isReadOnly
}: {
  block: { startStr: string, endStr: string, duration: number },
  index: number,
  onUpdate: (dur: number) => void,
  isActive?: boolean,
  isRange: boolean,
  isEditingOverride: boolean,
  setEditingOverride: (s: boolean) => void,
  isReadOnly?: boolean
}) {
  const [durStr, setDurStr] = useState(block.duration.toString());

  useEffect(() => {
    if (isEditingOverride) {
      setDurStr(block.duration.toString());
    }
  }, [isEditingOverride, block.duration]);

  const save = () => {
    const d = parseInt(durStr);
    if (!isNaN(d) && d > 0 && d <= 1440) {
      onUpdate(d);
    }
    setEditingOverride(false);
  };

  const adjust = (delta: number) => {
    let d = parseInt(durStr) || 60;
    d += delta;
    if (d < 15) d = 15; // Minimum 15 min block
    setDurStr(d.toString());
  };

  return (
    <div className={`relative group h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${isActive ? 'bg-violet-600/20 border-violet-500/50 shadow-[inset_0_0_15px_rgba(139,92,246,0.15)] z-20' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/5'}`}>
      {isEditingOverride ? (
        <div className="absolute inset-0 z-[60] bg-gray-900/95 backdrop-blur-md border border-violet-500/50 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center px-1 scale-[1.15] animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-white">
            <div className="flex flex-col items-center">
              <button onClick={() => adjust(15)} className="hover:text-violet-400 p-0.5 transition-colors"><ChevronUp size={14} /></button>
              <div className="flex items-baseline bg-black/40 px-1.5 rounded-md border border-white/5">
                <input
                  value={durStr}
                  onChange={e => setDurStr(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  className="w-7 md:w-9 text-center bg-transparent outline-none text-[10px] md:text-xs font-bold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[8px] text-white/40 -ml-0.5">m</span>
              </div>
              <button onClick={() => adjust(-15)} className="hover:text-violet-400 p-0.5 transition-colors"><ChevronDown size={14} /></button>
            </div>
            <button onClick={save} className="ml-0.5 p-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-all active:scale-90 shadow-md"><Check size={12} /></button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditingOverride(true)}
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors leading-none"
        >
          <div className="absolute top-1.5 flex flex-col md:flex-row items-center justify-center gap-[1px] md:gap-1 text-[9px] md:text-[10px] tracking-tight font-semibold font-mono select-none w-full px-1">
            <span className="text-white/70 transition-colors group-hover:text-white">
              {block.startStr.replace(" AM", "AM").replace(" PM", "PM")}
            </span>
            <span className="text-white/20 hidden md:inline">-</span>
            <span className="text-white/40 transition-colors group-hover:text-white/80">
              {block.endStr.replace(" AM", "AM").replace(" PM", "PM")}
            </span>
          </div>

          <span className="absolute bottom-[3px] text-[7px] md:text-[8px] text-violet-300/60 font-bold uppercase tracking-wider group-hover:text-violet-300/90 transition-colors">
            {block.duration > 60 ? Math.floor(block.duration / 60) + "hr " + block.duration % 60 + "m" : block.duration + "m"}
          </span>
        </div>
      )}
    </div>
  );
}