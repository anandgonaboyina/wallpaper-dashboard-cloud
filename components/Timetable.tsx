"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { CalendarDays, Edit2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check, Settings, Plus, Trash, Clock, ArrowUp, ArrowDown, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];

export const CELL_COLORS = [
  { name: 'default', bg: 'bg-white/5', active: 'bg-purple-500/30', text: 'text-white' },
  { name: 'red', bg: 'bg-red-500/20', active: 'bg-red-500/40', text: 'text-red-200' },
  { name: 'blue', bg: 'bg-blue-500/20', active: 'bg-blue-500/40', text: 'text-blue-200' },
  { name: 'green', bg: 'bg-green-500/20', active: 'bg-green-500/40', text: 'text-green-200' },
  { name: 'yellow', bg: 'bg-yellow-500/20', active: 'bg-yellow-500/40', text: 'text-yellow-200' },
  { name: 'purple', bg: 'bg-purple-500/20', active: 'bg-purple-500/40', text: 'text-purple-200' },
  { name: 'orange', bg: 'bg-orange-500/20', active: 'bg-orange-500/40', text: 'text-orange-200' },
  { name: 'cyan', bg: 'bg-cyan-500/20', active: 'bg-cyan-500/40', text: 'text-cyan-200' },
  { name: 'pink', bg: 'bg-pink-500/20', active: 'bg-pink-500/40', text: 'text-pink-200' },
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
    <div suppressHydrationWarning className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-1.5 shadow-2xl w-full max-w-[100vw] md:w-fit overflow-hidden md:overflow-visible">
      {/* Start Time Modal Overlay */}
      {isEditingStartTime && (
        <StartTimeEditor currentMins={startTime} onSave={handleSetStartTime} onCancel={() => setIsEditingStartTime(false)} />
      )}

      <div className="flex items-center justify-between text-white/80 mb-2 pb-1.5 border-b border-white/10 mt-1 px-2 min-w-0 md:min-w-[300px]">
        <button
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0"
          title="Previous view"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1.5 md:gap-2 relative" ref={settingsRef}>
          <CalendarDays size={18} className="text-purple-400 md:w-5 md:h-5" />
          <span className="font-bold tracking-widest uppercase text-sm md:text-base text-center truncate">
            {viewMode === "weekdays" ? "Weekly Schedule" : "Weekend Schedule"}
          </span>
          {!viewingFriend && (
            <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors ml-1 shrink-0">
              <Settings size={14} />
            </button>
          )}

          {showSettings && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 flex flex-col min-w-[200px]">
              <div className="px-3 py-1.5 text-[10px] text-white/40 uppercase tracking-wider font-bold border-b border-white/5">Row Management</div>
              <button onClick={handleAddTopRow} className="px-3 py-2 hover:bg-white/10 text-xs text-white/80 flex items-center justify-between transition-colors w-full text-left border-b border-white/5">
                <span className="flex items-center gap-2"><ArrowUp size={14} /> Add Top Row</span>
              </button>
              <button onClick={() => { addTimetableRow(isWeekendMode); setShowSettings(false); }} className="px-3 py-2 hover:bg-white/10 text-xs text-white/80 flex items-center gap-2 transition-colors border-b border-white/5 w-full text-left">
                <ArrowDown size={14} /> Add Bottom Row
              </button>
              <button onClick={handleDeleteTopRow} className="px-3 py-2 hover:bg-red-500/20 text-xs text-red-400 flex items-center gap-2 transition-colors w-full text-left">
                <Trash size={14} /> Delete Top Row
              </button>
              <button onClick={() => { if (confirm("Delete the bottom row?")) deleteTimetableRow(isWeekendMode, generatedTimes.length - 1); setShowSettings(false); }} className="px-3 py-2 hover:bg-red-500/20 text-xs text-red-400 flex items-center gap-2 transition-colors w-full text-left border-b border-white/5">
                <Trash size={14} /> Delete Bottom Row
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0"
          title="Next view"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {/* Compact Start Time Trigger */}
      <div className="mb-1 mx-auto flex justify-center">
        <button
          onClick={() => !viewingFriend && setIsEditingStartTime(true)}
          className={`text-[9px] md:text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1 font-bold shadow-sm ${viewingFriend ? 'cursor-default' : ''}`}
        >
          <Clock size={10} /> Day Starts: {formatTime(startTime)}
        </button>
      </div>
      <div 
        className="overflow-auto custom-scrollbar pb-1 px-1 w-full max-h-[50vh] md:max-h-[60vh] cursor-grab active:cursor-grabbing"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div
          className={`grid gap-1 md:gap-1.5 ${viewMode === "weekdays" ? "min-w-[500px] md:min-w-[750px] grid-cols-[75px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)]" : "min-w-[280px] md:min-w-[400px] grid-cols-[75px_repeat(2,1fr)] md:grid-cols-[120px_repeat(2,1fr)]"}`}
        >
          {/* Time Column */}
          <div className="sticky left-0 rounded-xl z-30 bg-[#0a0a0a] flex flex-col">
            <div className="text-center font-bold text-white/40 uppercase tracking-widest text-[9px] md:text-[10px] py-1 mb-1">Time</div>


            {generatedTimes.map((block, index) => {
              return (
                <div key={index} className="mb-[2px] relative">
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
              "Mon": "text-red-400 border-red-400/20 bg-red-500/5",
              "Tue": "text-orange-400 border-orange-400/20 bg-orange-500/5",
              "Wed": "text-yellow-400 border-yellow-400/20 bg-yellow-500/5",
              "Thu": "text-green-400 border-green-400/20 bg-green-500/5",
              "Fri": "text-blue-400 border-blue-400/20 bg-blue-500/5",
              "Sat": "text-purple-400 border-purple-400/20 bg-purple-500/5",
              "Sun": "text-pink-400 border-pink-400/20 bg-pink-500/5"
            };

            return (
              <div key={day} className={`flex flex-col rounded-2xl p-0.5 transition-colors ${isToday ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}`}>
                <div className={`text-center font-bold uppercase tracking-widest text-[10px] md:text-xs py-1 rounded-xl border ${isToday ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : colorMap[day]}`}>
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
                  const isActiveBlock = false;

                  let roundedClass = 'rounded-xl';
                  if (!isDayFocused) {
                    if (isContinuation && isContinuedByNext) roundedClass = 'rounded-none';
                    else if (isContinuation) roundedClass = 'rounded-b-xl rounded-t-sm';
                    else if (isContinuedByNext) roundedClass = 'rounded-t-xl rounded-b-sm';
                  }

                  const isPartOfBlock = isContinuation || spanCount > 1;
                  const isHiddenText = !isDayFocused && isPartOfBlock;

                  const textClassFinal = isHiddenText ? 'text-transparent' : customColor.text;
                  const borderClass = isActiveBlock ? 'border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.3)] z-20' : 'border-transparent';
                  const bgClass = isActiveBlock ? customColor.active : (isToday && customColor.name === 'default' ? 'bg-purple-500/10' : customColor.bg);
                  const marginBottom = (!isDayFocused && isContinuedByNext) ? 'mb-0' : 'mb-[2px]';

                  const showOverlay = !isContinuation && spanCount > 1 && !isDayFocused;
                  const overlayHeightPx = spanCount * 40;
                  
                  const isEditingThisCell = editingCell?.day === day && editingCell?.time === gridKey;

                  return (
                    <div 
                      key={index} 
                      onDoubleClick={() => !viewingFriend && setEditingCell({ day, time: gridKey })}
                      className={`relative group h-10 ${marginBottom} flex items-center justify-center border transition-all z-10 ${borderClass} ${roundedClass} ${!viewingFriend ? 'hover:bg-white/10' : ''} ${isEditingThisCell ? 'ring-2 ring-purple-500 z-50' : ''} ${bgClass}`}
                    >
                      {showOverlay && !isEditingThisCell && (
                        <div style={{ height: `${overlayHeightPx}px` }} className="absolute top-0 left-0 w-full pointer-events-none flex items-center justify-center z-30">
                          <span className={`${isActiveBlock ? 'text-white font-bold scale-[1.02]' : (customColor.name !== 'default' ? customColor.text : 'text-white')} font-semibold px-1 md:px-2 text-center break-words transition-all duration-200 text-[10px] md:text-xs`}>{subject || "Free"}</span>
                        </div>
                      )}

                      <div className={`w-full h-full flex items-center justify-center overflow-hidden break-words px-1 cursor-pointer select-none ${isEditingThisCell ? 'opacity-30' : ''}`}>
                        <span className={`w-full text-center ${textClassFinal} text-[10px] md:text-xs leading-snug`}>{subject || (!isHiddenText ? "Free" : "")}</span>
                      </div>

                      {!viewingFriend && !isEditingThisCell && <Edit2 size={10} className={`absolute right-1 md:right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none ${isHiddenText ? 'text-transparent' : customColor.text} z-20`} />}
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingCell(null)}>
          <div className="bg-[#0f0f11] border border-purple-500/50 rounded-2xl shadow-2xl p-4 w-full max-w-[280px] flex flex-col gap-4 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditingCell(null)} className="absolute top-2 right-2 p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10"><X size={16}/></button>
            
            <div className="text-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">{editingCell.day} - {editingCell.time}</h3>
              <p className="text-[10px] text-white/40 mt-0.5 uppercase font-semibold">Edit subject and color</p>
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
              placeholder="e.g. Math, Free, Meeting..."
              spellCheck={false}
              className="w-full text-center bg-black/40 border border-white/10 rounded-xl outline-none text-white text-sm md:text-base leading-snug resize-none overflow-hidden break-words p-3 focus:border-purple-500/50 transition-colors shadow-inner shadow-black"
            />
            
            <div className="flex flex-wrap gap-2 justify-center mx-auto mt-1 px-1">
              {CELL_COLORS.map(c => {
                const isActive = (timetableColors?.[editingCell.day]?.[editingCell.time] || 'default') === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => updateTimetableColor(editingCell.day, editingCell.time, c.name)}
                    title={c.name}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${c.bg.replace('/20', '/80')} ${isActive ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'opacity-60 hover:opacity-100 hover:scale-105'} transition-all flex items-center justify-center shrink-0`}
                  >
                     {isActive && <Check size={14} className="text-white drop-shadow-md" />}
                  </button>
                );
              })}
            </div>
            
            <button onClick={() => setEditingCell(null)} className="mt-1 w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
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
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-[#0f0f11] border border-blue-500/40 rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-4 w-full max-w-[240px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-sm tracking-wide">Set Day Start Time</h3>

        <input
          type="time"
          value={timeValue}
          onChange={e => setTimeValue(e.target.value)}
          className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-lg text-center outline-none focus:border-blue-500 transition-colors cursor-pointer [color-scheme:dark]"
        />

        <div className="flex w-full gap-2 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); save(); }}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
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
    <div className={`relative group h-10 flex items-center justify-center rounded-xl border px-0.5 transition-colors ${isActive ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] z-20' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
      {isEditingOverride ? (
        <div className="absolute inset-0 z-[60] bg-[#0f0f11] border border-purple-500/50 rounded-xl shadow-2xl flex items-center justify-center px-1 scale-[1.15]">
          <div className="flex items-center gap-1 text-white">
            <div className="flex flex-col items-center">
              <button onClick={() => adjust(15)} className="hover:text-purple-400 p-0.5"><ChevronUp size={12} /></button>
              <div className="flex items-baseline">
                <input
                  value={durStr}
                  onChange={e => setDurStr(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  className="w-6 md:w-8 text-center bg-transparent outline-none text-[10px] md:text-xs font-bold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[8px] text-white/50 -ml-1">m</span>
              </div>
              <button onClick={() => adjust(-15)} className="hover:text-purple-400 p-0.5"><ChevronDown size={12} /></button>
            </div>
            <button onClick={save} className="ml-1 p-1 bg-purple-500 hover:bg-purple-600 rounded-md transition-colors"><Check size={10} /></button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditingOverride(true)}
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors leading-none"
        >
          {/* {isRange ? ( */}
          <div className="absolute top-1 flex flex-col md:flex-row items-center justify-center gap-0.1 md:gap-1 text-[9px] md:text-xs tracking-tight font-semibold font-mono select-none w-full px-1">
            <span className="text-white/80 transition-colors group-hover:text-purple-400">
              {block.startStr.replace(" AM", "AM").replace(" PM", "PM")}
            </span>
            <span className="text-white/30 hidden md:inline">-</span>
            <span className="text-white/50 transition-colors group-hover:text-purple-400">
              {block.endStr.replace(" AM", "AM").replace(" PM", "PM")}
            </span>
          </div>
          {/* ) : (
            <span className="text-white/80 text-[10px] md:text-sm font-semibold font-mono select-none group-hover:text-purple-400 transition-colors">
              {block.startStr}
            </span>
          )} */}
          <span className="absolute bottom-0.5 text-[8px] text-yellow-300/60 font-bold uppercase ">{block.duration > 60 ? Math.floor(block.duration / 60) + "hr " + block.duration % 60 + "m" : block.duration + "m"}</span>
        </div>
      )}
    </div>
  );
}