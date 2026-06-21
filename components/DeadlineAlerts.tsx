'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { X, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DeadlineAlerts() {
  const { deadlines, deadlineAlertDays, dismissedDeadlineAlerts, dismissDeadlineAlert } = useDashboardStore();
  const [activeAlerts, setActiveAlerts] = useState<typeof deadlines>([]);

  useEffect(() => {
    // Calculate which deadlines need alerting
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts = deadlines.filter((d) => {
      const deadlineDate = new Date(d.date);
      deadlineDate.setHours(0, 0, 0, 0);
      
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isToday = diffDays === 0;
      const alertKey = `${d.id}-${isToday ? 'today' : 'preview'}`;
      
      // If already dismissed for this phase (preview or today), ignore
      if (dismissedDeadlineAlerts.includes(alertKey)) return false;
      
      // Match exactly the days before, or any day closer (down to 0 days/today)
      return diffDays === 0 || (diffDays > 0 && diffDays <= deadlineAlertDays);
    });

    setActiveAlerts(alerts);
  }, [deadlines, deadlineAlertDays, dismissedDeadlineAlerts]);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] flex flex-col gap-4 pointer-events-none">
      {activeAlerts.map((alert) => {
        const deadlineDate = new Date(alert.date);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((deadlineDate.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
        const daysText = diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow!' : `In ${diffDays} days`;

        return (
          <div key={alert.id} className="bg-black/90 backdrop-blur-2xl border border-yellow-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(234,179,8,0.25)] w-[380px] sm:w-[450px] flex gap-5 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 pointer-events-auto">
            <div className="p-4 bg-gradient-to-br from-yellow-400/30 to-orange-500/20 rounded-2xl h-fit border border-yellow-500/20 shadow-inner">
              <CalendarClock className="text-yellow-400 drop-shadow-md" size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                    Deadline Alert
                  </h3>
                  <p className="text-yellow-400 font-bold text-sm tracking-wide mt-0.5">{daysText}</p>
                </div>
                <button 
                  onClick={() => dismissDeadlineAlert(`${alert.id}-${diffDays === 0 ? 'today' : 'preview'}`)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all rounded-full border border-white/10 hover:scale-110"
                  title="Dismiss alert"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-white/90 text-[15px] leading-relaxed font-medium">{alert.text}</p>
                <p className="text-white/40 text-xs mt-3 uppercase tracking-wider font-semibold">
                  Due: {deadlineDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
