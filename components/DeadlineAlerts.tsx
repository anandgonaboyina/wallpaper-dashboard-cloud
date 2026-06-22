'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { X, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DeadlineAlerts() {
  const { deadlines, deadlineAlertDays, dismissedDeadlineAlerts, dismissDeadlineAlert } = useDashboardStore();
  const [activeAlerts, setActiveAlerts] = useState<typeof deadlines>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts = deadlines.filter((d) => {
      const deadlineDate = new Date(d.date);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isToday = diffDays === 0;
      const alertKey = `${d.id}-${isToday ? 'today' : 'preview'}`;

      if (dismissedDeadlineAlerts.includes(alertKey)) return false;

      return diffDays === 0 || (diffDays > 0 && diffDays <= deadlineAlertDays);
    });

    setActiveAlerts(alerts);
  }, [deadlines, deadlineAlertDays, dismissedDeadlineAlerts]);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-9 md:top-1/2 md:-translate-y-1/2 z-[10000] flex flex-col gap-2 md:gap-3 pointer-events-none w-[92vw] max-w-[320px] md:max-w-[360px] items-center">
      {activeAlerts.map((alert) => {
        const deadlineDate = new Date(alert.date);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((deadlineDate.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
        const daysText = diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow!' : `In ${diffDays} days`;

        return (
          <div key={alert.id} className="bg-black/95 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-3 md:p-3.5 shadow-2xl shadow-yellow-500/10 w-full flex gap-3 animate-in fade-in zoom-in slide-in-from-top-4 md:slide-in-from-bottom-4 duration-400 pointer-events-auto">

            {/* Compact Icon */}
            <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-orange-500/10 rounded-xl h-fit border border-yellow-500/20 shrink-0">
              <CalendarClock className="text-yellow-400 w-4 h-4 md:w-5 md:h-5" />
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-white/95 leading-none">
                    Deadline Alert
                  </h3>
                  <span className="text-yellow-400 font-semibold text-[10px] md:text-[11px] mt-1">{daysText}</span>
                </div>
                <button
                  onClick={() => dismissDeadlineAlert(`${alert.id}-${diffDays === 0 ? 'today' : 'preview'}`)}
                  className="p-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors rounded-full shrink-0 -mt-0.5 -mr-0.5"
                  title="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text & Date combined to save space */}
              <div className="mt-1.5">
                <p className="text-white/80 text-xs leading-snug line-clamp-2 md:line-clamp-none">{alert.text}</p>
                <p className="text-white/40 text-[9px] md:text-[10px] mt-1.5 uppercase font-medium tracking-wider">
                  Due: {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}