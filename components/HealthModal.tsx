'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Droplet, Activity, BookOpen, GraduationCap, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLocalDateString } from '@/utils/date';

const TARGETS = {
  water: 8, // glasses
  stretch: 5, // sessions
  reading: 60, // minutes
  academic: 120, // minutes
  english: 10 // words
};

export default function HealthModal() {
  const { isHealthModalOpen, toggleHealthModal, healthData } = useDashboardStore();
  const [historyDates, setHistoryDates] = useState<string[]>([]);

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  useEffect(() => {
    // Generate the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(getLocalDateString(d));
    }
    setHistoryDates(dates.reverse()); // Most recent first
  }, [isHealthModalOpen]);

  if (!isHealthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={toggleHealthModal}></div>

      {/* Modal Box */}
      <div className="relative bg-black/50 backdrop-blur-3xl border border-white/20 p-5 md:p-8 rounded-3xl w-full max-w-[700px] max-h-full overflow-y-auto custom-scrollbar shadow-2xl text-white">
        <button
          onClick={toggleHealthModal}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl md:text-2xl font-light mb-5 md:mb-6 tracking-wide flex items-center gap-3 pr-8">
          Health & Habits <span className="text-white/40 text-xs md:text-sm whitespace-nowrap">Past 7 Days</span>
        </h2>

        <div className="flex flex-col gap-3 md:gap-4">
          {historyDates.map(date => {
            const data = healthData[date] || { water: 0, stretch: 0, reading: 0, academic: 0, english: 0 };
            const isToday = date === getLocalDateString();

            return (
              <div key={date} className={`flex flex-col gap-2 p-3.5 md:p-3 rounded-xl border ${isToday ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'}`}>
                <div className="flex justify-between items-center text-sm font-semibold text-white/80">
                  <span>{isToday ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>

                {/* Responsive Grid: 2 cols on mobile, 3 on small tablets, 5 on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-2 mt-1">

                  {/* Water */}
                  <div className="flex flex-col gap-1.5 md:gap-1">
                    <div className="flex items-center gap-1 text-blue-400 text-[11px] md:text-[10px] whitespace-nowrap">
                      <Droplet size={12} className="md:w-2.5 md:h-2.5" /> Water ({data.water})
                    </div>
                    <div className="h-2 md:h-1.5 w-full bg-blue-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min((data.water / TARGETS.water) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  {/* Stretch */}
                  <div className="flex flex-col gap-1.5 md:gap-1">
                    <div className="flex items-center gap-1 text-green-400 text-[11px] md:text-[10px] whitespace-nowrap">
                      <Activity size={12} className="md:w-2.5 md:h-2.5" /> Stretch ({data.stretch})
                    </div>
                    <div className="h-2 md:h-1.5 w-full bg-green-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.min((data.stretch / TARGETS.stretch) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Reading */}
                  <div className="flex flex-col gap-1.5 md:gap-1">
                    <div className="flex items-center gap-1 text-pink-400 text-[11px] md:text-[10px] whitespace-nowrap">
                      <BookOpen size={12} className="md:w-2.5 md:h-2.5" /> Screen ({formatMinutes(data.reading)})
                    </div>
                    <div className="h-2 md:h-1.5 w-full bg-pink-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 transition-all" style={{ width: `${Math.min((data.reading / TARGETS.reading) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Academic */}
                  <div className="flex flex-col gap-1.5 md:gap-1">
                    <div className="flex items-center gap-1 text-purple-400 text-[11px] md:text-[10px] whitespace-nowrap">
                      <GraduationCap size={12} className="md:w-2.5 md:h-2.5" /> Study ({formatMinutes(data.academic)})
                    </div>
                    <div className="h-2 md:h-1.5 w-full bg-purple-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all" style={{ width: `${Math.min((data.academic / TARGETS.academic) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* English */}
                  <div className="flex flex-col gap-1.5 md:gap-1">
                    <div className="flex items-center gap-1 text-yellow-400 text-[11px] md:text-[10px] whitespace-nowrap">
                      <MessageCircle size={12} className="md:w-2.5 md:h-2.5" /> Vocab ({data.english})
                    </div>
                    <div className="h-2 md:h-1.5 w-full bg-yellow-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.min((data.english / TARGETS.english) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}