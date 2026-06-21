'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { Map, ListTodo, BarChart2, StickyNote, Settings, Clock, Timer as TimerIcon, Hourglass, CalendarDays, Calendar } from 'lucide-react';
import DraggableWidget from './DraggableWidget';

export default function RightToolbar() {
  const isHidden = useDashboardStore((state) => state.isHidden);
  
  const isPlansOpen = useDashboardStore((state) => state.isPlansOpen);
  const togglePlans = useDashboardStore((state) => state.togglePlans);
  
  const isTaskManagerOpen = useDashboardStore((state) => state.isTaskManagerOpen);
  const toggleTaskManager = useDashboardStore((state) => state.toggleTaskManager);
  
  const isStatsOpen = useDashboardStore((state) => state.isStatsOpen);
  const toggleStats = useDashboardStore((state) => state.toggleStats);
  
  const isNotesOpen = useDashboardStore((state) => state.isNotesOpen);
  const toggleNotes = useDashboardStore((state) => state.toggleNotes);
  
  const toggleSettings = useDashboardStore((state) => state.toggleSettings);
  const showSettingsBtn = useDashboardStore((state) => state.showSettingsBtn);
  const hideConfig = useDashboardStore((state) => state.hideConfig);
  const isStopwatchOpen = useDashboardStore((state) => state.isStopwatchOpen);
  const toggleStopwatch = useDashboardStore((state) => state.toggleStopwatch);
  const showStopwatch = useDashboardStore((state) => state.showStopwatch);
  const showPlans = useDashboardStore((state) => state.showPlans);
  const showTasks = useDashboardStore((state) => state.showTasks);
  const showStats = useDashboardStore((state) => state.showStats);
  const showNotes = useDashboardStore((state) => state.showNotes);

  const isTimerOpen = useDashboardStore((state) => state.isTimerOpen);
  const toggleTimer = useDashboardStore((state) => state.toggleTimer);
  const showTimer = useDashboardStore((state) => state.showTimer);

  const isClockOpen = useDashboardStore((state) => state.isClockOpen);
  const toggleClock = useDashboardStore((state) => state.toggleClock);
  const showClock = useDashboardStore((state) => state.showClock);

  const showCalendar = useDashboardStore((state) => state.showCalendar);

  const isTimetableOpen = useDashboardStore((state) => state.isTimetableOpen);
  const setIsTimetableOpen = useDashboardStore((state) => state.setIsTimetableOpen);
  const showTimetable = useDashboardStore((state) => state.showTimetable);

  const handleMobileScrollToggle = (widgetId: string, toggleFn: () => void) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      const el = document.getElementById(widgetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      toggleFn();
    }
  };

  return (
    <DraggableWidget id="toolbar">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Plans Toggle Button */}
        {(!isHidden || !hideConfig.plans) && showPlans && (
          <button
            onClick={togglePlans}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isPlansOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Roadmap & Plans"
          >
            <Map size={24} />
          </button>
        )}

        {/* Task Manager Toggle Button */}
        {(!isHidden || !hideConfig.tasks) && showTasks && (
          <button
            onClick={() => handleMobileScrollToggle('tasks', toggleTaskManager)}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isTaskManagerOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Toggle Tasks"
          >
            <ListTodo size={24} />
          </button>
        )}

        {/* Stats Toggle Button */}
        {(!isHidden || !hideConfig.stats) && showStats && (
          <button
            onClick={toggleStats}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isStatsOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Focus History"
          >
            <BarChart2 size={24} />
          </button>
        )}

        {/* Stopwatch Toggle Button */}
        {(!isHidden || !hideConfig.stopwatch) && showStopwatch && (
          <button
            onClick={() => handleMobileScrollToggle('stopwatch', toggleStopwatch)}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isStopwatchOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Stopwatch"
          >
            <TimerIcon size={24} />
          </button>
        )}

        {/* Timer Toggle Button */}
        {(!isHidden || !hideConfig.timer) && showTimer && (
          <button
            onClick={() => handleMobileScrollToggle('timer', toggleTimer)}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isTimerOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Timer"
          >
            <Hourglass size={24} />
          </button>
        )}

        {/* Clock Toggle Button */}
        {(!isHidden || !hideConfig.clock) && showClock && (
          <button
            onClick={() => handleMobileScrollToggle('mobile-big-clock', toggleClock)}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isClockOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Clock"
          >
            <Clock size={24} />
          </button>
        )}

        {/* Mobile Calendar Scroll Button */}
        {(!isHidden || !hideConfig.calendar) && showCalendar && (
          <button
            onClick={() => {
              const el = document.getElementById('widget-calendar');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="md:hidden p-3 rounded-2xl border border-white/20 shadow-xl transition-all bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl"
            title="Scroll to Calendar"
          >
            <Calendar size={24} />
          </button>
        )}

        {/* Timetable Toggle Button */}
        {(!isHidden || !hideConfig.timetable) && showTimetable && (
          <button
            onClick={() => setIsTimetableOpen(!isTimetableOpen)}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isTimetableOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Timetable"
          >
            <CalendarDays size={24} className={isTimetableOpen ? 'text-purple-300' : 'text-purple-400'} />
          </button>
        )}

        {/* Notes Toggle Button */}
        {(!isHidden || !hideConfig.notes) && showNotes && (
          <button
            onClick={toggleNotes}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isNotesOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Quick Notes"
          >
            <StickyNote size={24} />
          </button>
        )}

        {/* Settings Toggle Button */}
        {(!isHidden || !hideConfig.settingsBtn) && showSettingsBtn && (
          <button
            onClick={toggleSettings}
            className="p-3 rounded-2xl border border-white/20 shadow-xl transition-all bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        )}
      </div>
    </DraggableWidget>
  );
}
