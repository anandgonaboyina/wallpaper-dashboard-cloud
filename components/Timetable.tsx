"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { CalendarDays, Edit2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];
export default function Timetable() {
  const { timetableGrid, updateTimetableCell, weekdayTimes, weekendTimes, updateTimetableTime } = useDashboardStore();
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<"weekdays" | "weekends">("weekdays");

  useEffect(() => {
    const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    setCurrentDayIndex(day);
    if (day === 0 || day === 6) {
      setViewMode("weekends");
    }
  }, []);

  const activeDays = viewMode === "weekdays" ? WEEKDAYS : WEEKENDS;
  const isWeekendMode = viewMode === "weekends";
  const defaultTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  const TIMES = (isWeekendMode ? weekendTimes : weekdayTimes) || defaultTimes;

  return (
    <div className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-1.5 shadow-2xl w-fit pointer-events-auto transition-all duration-500">
      <div className="flex items-center justify-between text-white/80 mb-2 pb-1.5 border-b border-white/10 mt-1 px-2 min-w-[300px]">
        <button 
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
          title="Previous view"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-purple-400" />
          <span className="font-bold tracking-widest uppercase text-base">
            {viewMode === "weekdays" ? "Weekly Schedule" : "Weekend Schedule"}
          </span>
        </div>

        <button 
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
          title="Next view"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-1 px-1">
        <div className={`grid gap-1.5 ${viewMode === "weekdays" ? "grid-cols-6 min-w-[700px]" : "grid-cols-3 min-w-[350px]"}`}>

          {/* Time Column */}
          <div className="flex flex-col gap-0.5">
            <div className="text-center font-bold text-white/40 uppercase tracking-widest text-[10px] py-1 mb-1">Time</div>
            {TIMES.map((time, index) => (
              <TimeCell key={index} time={time} index={index} isWeekend={isWeekendMode} onUpdate={updateTimetableTime} />
            ))}
          </div>

          {/* Day Columns */}
          {activeDays.map((day) => {
            const dayIndexMap: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
            const isToday = currentDayIndex === dayIndexMap[day];
            return (
              <div key={day} className={`flex flex-col gap-0.5 rounded-2xl p-0.5 transition-colors ${isToday ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}`}>
                <div className={`text-center font-bold uppercase tracking-widest text-xs py-1 rounded-xl border mb-0.5 ${isToday ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : 'bg-white/5 text-white/80 border-white/5'}`}>
                  {day}
                </div>

                {TIMES.map((time, index) => {
                  const subject = timetableGrid?.[day]?.[time] || "";

                  // Visual Merging Logic
                  const prevTime = index > 0 ? TIMES[index - 1] : null;
                  const prevSubject = prevTime ? (timetableGrid?.[day]?.[prevTime] || "") : "";

                  const nextTime = index < TIMES.length - 1 ? TIMES[index + 1] : null;
                  const nextSubject = nextTime ? (timetableGrid?.[day]?.[nextTime] || "") : "";

                  const isContinuation = subject !== "" && subject === prevSubject;
                  const isContinuedByNext = subject !== "" && subject === nextSubject;

                  let roundedClass = 'rounded-xl';
                  if (isContinuation && isContinuedByNext) roundedClass = 'rounded-none';
                  else if (isContinuation) roundedClass = 'rounded-b-xl rounded-t-sm';
                  else if (isContinuedByNext) roundedClass = 'rounded-t-xl rounded-b-sm';

                  const textClass = isContinuation ? 'text-transparent focus:text-white' : 'text-white';
                  const borderClass = isContinuation ? 'border-t-transparent' : 'border-transparent';

                  return (
                    <div key={index} className="relative group h-10">
                      <textarea
                        value={subject}
                        onChange={(e) => updateTimetableCell(day, time, e.target.value)}
                        placeholder="Free"
                        className={`w-full h-full text-center hover:bg-white/10 focus:bg-white/10 border ${borderClass} focus:border-purple-500/50 ${roundedClass} ${textClass} text-xs leading-snug outline-none transition-all placeholder:text-white/20 z-10 relative focus:z-20 ${isToday ? 'bg-purple-500/10' : 'bg-white/5'} resize-none overflow-hidden break-words py-1 px-1`}
                      />
                      <Edit2 size={10} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none text-white z-20" />
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

function TimeCell({ time, index, isWeekend, onUpdate }: { time: string, index: number, isWeekend: boolean, onUpdate: (isWeekend: boolean, idx: number, val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [hStr, setHStr] = useState("12");
  const [mStr, setMStr] = useState("00");
  const [ampm, setAmpm] = useState("AM");

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

  const adjust = (type: 'h'|'m'|'a', delta: number) => {
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
    <div className="relative group h-10 flex items-center justify-center bg-black/20 rounded-xl border border-white/5 px-0.5">
      {isEditing ? (
        <div className="absolute inset-0 z-50 bg-gray-900 border border-blue-500/50 rounded-xl shadow-2xl flex items-center justify-center px-1 scale-110">
          <div className="flex items-center gap-0.5 text-white">
            <div className="flex flex-col items-center">
               <button onClick={() => adjust('h', 1)} className="hover:text-white/60 p-0.5"><ChevronUp size={12}/></button>
               <input 
                 value={hStr} 
                 onChange={e => setHStr(e.target.value)} 
                 onKeyDown={e => e.key === 'Enter' && save()}
                 className="w-5 text-center bg-transparent outline-none text-xs tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/20" 
               />
               <button onClick={() => adjust('h', -1)} className="hover:text-white/60 p-0.5"><ChevronDown size={12}/></button>
            </div>
            <span className="text-xs pb-0.5 opacity-50">:</span>
            <div className="flex flex-col items-center">
               <button onClick={() => adjust('m', 1)} className="hover:text-white/60 p-0.5"><ChevronUp size={12}/></button>
               <input 
                 value={mStr} 
                 onChange={e => setMStr(e.target.value)} 
                 onKeyDown={e => e.key === 'Enter' && save()}
                 className="w-5 text-center bg-transparent outline-none text-xs tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/20" 
               />
               <button onClick={() => adjust('m', -1)} className="hover:text-white/60 p-0.5"><ChevronDown size={12}/></button>
            </div>
            <div className="flex flex-col items-center ml-0.5 text-[10px] cursor-pointer select-none hover:text-white/80" onClick={() => adjust('a', 1)}>
               <span className="font-bold tracking-tighter mt-0.5">{ampm}</span>
            </div>
            <button onClick={save} className="ml-1 p-1 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"><Check size={12}/></button>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)} className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors">
          <span className="text-white/80 text-sm font-semibold font-mono select-none">{time}</span>
          <Edit2 size={10} className="absolute right-1.5 opacity-0 group-hover:opacity-30 text-white transition-opacity" />
        </div>
      )}
    </div>
  );
}
