"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { CalendarDays, Edit2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check, Settings, Plus, Trash, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];

export default function Timetable() {
  const { timetableGrid, updateTimetableCell, weekdayTimes, weekendTimes, updateTimetableTime, addTimetableRow, deleteTimetableRow, useTimetableRange, toggleTimetableRange } = useDashboardStore();
  const [currentDayIndex, setCurrentDayIndex] = useState(() => new Date().getDay());
  const [viewMode, setViewMode] = useState<"weekdays" | "weekends">(
    () => (new Date().getDay() === 0 || new Date().getDay() === 6) ? "weekends" : "weekdays"
  );
  const [focusedCell, setFocusedCell] = useState<{ day: string, time: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    setCurrentDayIndex(day);
    if (day === 0 || day === 6) setViewMode("weekends");
    else setViewMode("weekdays");
  }, []);

  const [activeTimeIndex, setActiveTimeIndex] = useState(-1);

  useEffect(() => {
    const checkActiveTime = () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();

      const parseMins = (tStr: string) => {
        const m = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!m) return 0;
        let h = parseInt(m[1]);
        const min = parseInt(m[2]);
        const ampm = m[3].toUpperCase();
        if (h === 12 && ampm === "AM") h = 0;
        if (h !== 12 && ampm === "PM") h += 12;
        return h * 60 + min;
      };

      const timesToUse = viewMode === "weekdays" ? weekdayTimes : weekendTimes;
      const TIMES = timesToUse.length ? timesToUse : ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

      let activeIdx = -1;
      for (let i = 0; i < TIMES.length; i++) {
        const blockStart = TIMES[i];
        let blockEnd = "";
        if (i + 1 < TIMES.length) {
          blockEnd = TIMES[i + 1];
        } else {
          const match = TIMES[TIMES.length - 1].match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            let h = parseInt(match[1]);
            let a = match[3].toUpperCase();
            if (h === 11) a = a === "AM" ? "PM" : "AM";
            h = h === 12 ? 1 : h + 1;
            blockEnd = `${h.toString().padStart(2, '0')}:${match[2]} ${a}`;
          }
        }

        if (blockStart && blockEnd) {
          const startMins = parseMins(blockStart);
          const endMins = parseMins(blockEnd);

          let isActive = false;
          if (endMins < startMins) {
            isActive = nowMins >= startMins || nowMins < endMins;
          } else {
            isActive = nowMins >= startMins && nowMins < endMins;
          }
          if (isActive) {
            activeIdx = i;
            break;
          }
        }
      }
      setActiveTimeIndex(activeIdx);
    };

    checkActiveTime();
    const interval = setInterval(checkActiveTime, 60000);
    return () => clearInterval(interval);
  }, [viewMode, weekdayTimes, weekendTimes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeDays = viewMode === "weekdays" ? WEEKDAYS : WEEKENDS;
  const isWeekendMode = viewMode === "weekends";
  const defaultTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  const TIMES = (isWeekendMode ? weekendTimes : weekdayTimes) || defaultTimes;

  return (
    <div suppressHydrationWarning className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-1.5 shadow-2xl w-full max-w-[100vw] md:w-fit transition-all duration-500 overflow-hidden md:overflow-visible">
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
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors ml-1 shrink-0">
            <Settings size={14} />
          </button>
          {showSettings && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 flex flex-col min-w-[130px]">
              <button onClick={() => { addTimetableRow(isWeekendMode); setShowSettings(false); }} className="px-3 py-2 hover:bg-white/10 text-xs text-white/80 flex items-center gap-2 transition-colors">
                <Plus size={14} /> Add Row
              </button>
              <button onClick={() => { toggleTimetableRange(); setShowSettings(false); }} className="px-3 py-2 hover:bg-white/10 text-xs text-white/80 flex items-center gap-2 transition-colors border-b border-white/5">
                <Clock size={14} /> Format: {useTimetableRange ? "Range" : "Start"}
              </button>
              <button onClick={() => { if (confirm("Delete the last row?")) deleteTimetableRow(isWeekendMode, TIMES.length - 1); setShowSettings(false); }} className="px-3 py-2 hover:bg-red-500/20 text-xs text-red-400 flex items-center gap-2 transition-colors">
                <Trash size={14} /> Delete Row
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

      <div className="overflow-x-auto custom-scrollbar pb-1 px-1 w-full">
        <div
          className={`grid gap-1 md:gap-1.5 ${viewMode === "weekdays" ? "min-w-[500px] md:min-w-[750px] grid-cols-[75px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)]" : "min-w-[280px] md:min-w-[400px] grid-cols-[75px_repeat(2,1fr)] md:grid-cols-[120px_repeat(2,1fr)]"}`}
        >
          {/* Time Column */}
          <div className="sticky left-0 rounded-xl z-30 backdrop-blur-md bg-black/80 flex flex-col">
            <div className="text-center font-bold text-white/40 uppercase tracking-widest text-[9px] md:text-[10px] py-1 mb-1">Time</div>
            {TIMES.map((time, index) => {
              const nextTime = index < TIMES.length - 1 ? TIMES[index + 1] : undefined;
              return (
                <div key={index} className="mb-[2px]">
                  <TimeCell time={time} nextTime={nextTime} index={index} isWeekend={isWeekendMode} onUpdate={updateTimetableTime} isActive={activeTimeIndex === index} />
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

            let skipCount = 0;

            return (
              <div key={day} className={`flex flex-col rounded-2xl p-0.5 transition-colors ${isToday ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}`}>
                <div className={`text-center font-bold uppercase tracking-widest text-[10px] md:text-xs py-1 rounded-xl border mb-0.5 ${isToday ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : colorMap[day]}`}>
                  {day}
                </div>

                {TIMES.map((time, index) => {
                  const subject = timetableGrid?.[day]?.[time] || "";

                  const prevTime = index > 0 ? TIMES[index - 1] : null;
                  const prevSubject = prevTime ? (timetableGrid?.[day]?.[prevTime] || "") : "";
                  const nextTime = index < TIMES.length - 1 ? TIMES[index + 1] : null;
                  const nextSubject = nextTime ? (timetableGrid?.[day]?.[nextTime] || "") : "";

                  const isContinuation = subject === prevSubject;
                  const isContinuedByNext = subject === nextSubject;

                  let spanCount = 1;
                  if (!isContinuation && isContinuedByNext) {
                    for (let j = index + 1; j < TIMES.length; j++) {
                      if ((timetableGrid?.[day]?.[TIMES[j]] || "") === subject) {
                        spanCount++;
                      } else {
                        break;
                      }
                    }
                  }

                  const isDayFocused = focusedCell?.day === day;
                  const isActiveBlock = false;

                  let roundedClass = 'rounded-xl';
                  if (!isDayFocused) {
                    if (isContinuation && isContinuedByNext) roundedClass = 'rounded-none';
                    else if (isContinuation) roundedClass = 'rounded-b-xl rounded-t-sm';
                    else if (isContinuedByNext) roundedClass = 'rounded-t-xl rounded-b-sm';
                  }

                  const isPartOfBlock = isContinuation || spanCount > 1;
                  const isHiddenText = !isDayFocused && isPartOfBlock;

                  const textClass = isHiddenText ? 'text-transparent placeholder:text-transparent selection:bg-transparent' : (isActiveBlock ? 'text-white font-bold placeholder:text-white/40' : 'text-white placeholder:text-white/20');
                  const borderClass = isActiveBlock ? 'border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.3)] z-20' : 'border-transparent';
                  const bgClass = isActiveBlock ? 'bg-purple-500/30' : (isToday ? 'bg-purple-500/10' : 'bg-white/5');
                  const marginBottom = (!isDayFocused && isContinuedByNext) ? 'mb-0' : 'mb-[2px]';

                  const showOverlay = !isContinuation && spanCount > 1 && !isDayFocused;
                  const overlayHeightPx = spanCount * 40; // Since inner margin is 0 when merged

                  return (
                    <div key={index} className={`relative group h-10 ${marginBottom} flex items-center justify-center border transition-all z-10 ${borderClass} ${roundedClass} hover:bg-white/10 focus-within:bg-white/10 focus-within:border-purple-500/50 focus-within:z-20 ${bgClass}`}>

                      {showOverlay && (
                        <div style={{ height: `${overlayHeightPx}px` }} className="absolute top-0 left-0 w-full pointer-events-none flex items-center justify-center z-30">
                          <span className={`${isActiveBlock ? 'text-white font-bold scale-[1.02]' : 'text-white font-semibold'} px-1 md:px-2 text-center break-words transition-all duration-500 text-[10px] md:text-xs`}>{subject || "Free"}</span>
                        </div>
                      )}

                      <textarea
                        value={subject}
                        onChange={(e) => updateTimetableCell(day, time, e.target.value)}
                        onFocus={() => setFocusedCell({ day, time })}
                        onBlur={() => setFocusedCell(null)}
                        ref={el => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }
                        }}
                        rows={1}
                        placeholder="Free"
                        spellCheck={false}
                        className={`w-full text-center bg-transparent outline-none ${textClass} text-[10px] md:text-xs leading-snug resize-none overflow-hidden break-words px-1`}
                      />
                      <Edit2 size={10} className={`absolute right-1 md:right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none ${isHiddenText ? 'text-transparent' : 'text-white'} z-20`} />
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

function TimeCell({ time, nextTime, index, isWeekend, onUpdate, isActive }: { time: string, nextTime?: string, index: number, isWeekend: boolean, onUpdate: (isWeekend: boolean, idx: number, val: string) => void, isActive?: boolean }) {
  const { useTimetableRange } = useDashboardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [hStr, setHStr] = useState("12");
  const [mStr, setMStr] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  const getNextHour = (t: string) => {
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return t;
    let h = parseInt(match[1]);
    const m = match[2];
    let a = match[3].toUpperCase();
    if (h === 11) a = a === "AM" ? "PM" : "AM";
    h = h === 12 ? 1 : h + 1;
    return `${h.toString().padStart(2, '0')}:${m} ${a}`;
  };

  useEffect(() => {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      setHStr(match[1].padStart(2, '0'));
      setMStr(match[2].padStart(2, '0'));
      setAmpm(match[3].toUpperCase());
    } else {
      setHStr("12"); setMStr("00"); setAmpm("AM");
    }
  }, [time, isEditing]);

  const save = () => {
    const finalH = hStr.padStart(2, '0');
    const finalM = mStr.padStart(2, '0');
    onUpdate(isWeekend, index, `${finalH}:${finalM} ${ampm}`);
    setIsEditing(false);
  };

  const adjust = (type: 'h' | 'm' | 'a', delta: number) => {
    if (type === 'h') {
      let h = parseInt(hStr) || 12;
      h += delta;
      if (h > 12) h = 1;
      if (h < 1) h = 12;
      setHStr(h.toString().padStart(2, '0'));
    } else if (type === 'm') {
      let m = parseInt(mStr) || 0;
      m += delta;
      if (m > 59) m = 0;
      if (m < 0) m = 59;
      setMStr(m.toString().padStart(2, '0'));
    } else if (type === 'a') {
      setAmpm(ampm === "AM" ? "PM" : "AM");
    }
  };

  return (
    <div className={`relative group h-10 flex items-center justify-center rounded-xl border px-0.5 transition-all ${isActive ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] z-20' : 'bg-black/20 border-white/5'}`}>
      {isEditing ? (
        <div className="absolute inset-0 z-50 bg-gray-900 border border-blue-500/50 rounded-xl shadow-2xl flex items-center justify-center px-1 scale-110">
          <div className="flex items-center gap-0.5 text-white">
            <div className="flex flex-col items-center">
              <button onClick={() => adjust('h', 1)} className="hover:text-white/60 p-0.5"><ChevronUp size={12} /></button>
              <input
                value={hStr}
                onChange={e => setHStr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                className="w-4 md:w-5 text-center bg-transparent outline-none text-[10px] md:text-xs tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/20"
              />
              <button onClick={() => adjust('h', -1)} className="hover:text-white/60 p-0.5"><ChevronDown size={12} /></button>
            </div>
            <span className="text-[10px] md:text-xs pb-0.5 opacity-50">:</span>
            <div className="flex flex-col items-center">
              <button onClick={() => adjust('m', 1)} className="hover:text-white/60 p-0.5"><ChevronUp size={12} /></button>
              <input
                value={mStr}
                onChange={e => setMStr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                className="w-4 md:w-5 text-center bg-transparent outline-none text-[10px] md:text-xs tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/20"
              />
              <button onClick={() => adjust('m', -1)} className="hover:text-white/60 p-0.5"><ChevronDown size={12} /></button>
            </div>
            <div className="flex flex-col items-center ml-0.5 text-[9px] md:text-[10px] cursor-pointer select-none hover:text-white/80" onClick={() => adjust('a', 1)}>
              <span className="font-bold tracking-tighter mt-0.5">{ampm}</span>
            </div>
            <button onClick={save} className="ml-1 p-1 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"><Check size={10} className="md:w-3 md:h-3" /></button>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)} className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors leading-none">
          {useTimetableRange ? (
            <div className="flex flex-col md:flex-row items-center gap-0.5 text-[9px] md:text-xs tracking-tight font-semibold font-mono select-none">
              <span className="text-white/80">{time.replace(" AM", "AM").replace(" PM", "PM")}</span>
              <span className="text-white/30 hidden md:inline">-</span>
              <span className="text-white/80">{(nextTime || getNextHour(time)).replace(" AM", "AM").replace(" PM", "PM")}</span>
            </div>
          ) : (
            <span className="text-white/80 text-[10px] md:text-sm font-semibold font-mono select-none">{time}</span>
          )}
          <Edit2 size={10} className="absolute right-1 md:right-1.5 opacity-0 group-hover:opacity-30 text-white transition-opacity hidden md:block" />
        </div>
      )}
    </div>
  );
}