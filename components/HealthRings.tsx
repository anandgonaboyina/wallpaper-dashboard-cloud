'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { Droplet, Activity, BookOpen, ActivitySquare, GraduationCap, MessageCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getLocalDateString } from '@/utils/date';

const TARGETS = {
    water: 8, // glasses
    stretch: 5, // sessions
    reading: 60, // minutes
    academic: 120, // minutes
    english: 10 // words
};

export default function HealthRings() {
    const { healthData, updateHealth, toggleHealthModal, fetchHealthData } = useDashboardStore();
    const [todayKey, setTodayKey] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const startX = useRef<number | null>(null);

        // Global listeners removed in favor of pointer capture on the element

    const handlePointerDown = (e: React.PointerEvent) => {
        startX.current = e.clientX;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (startX.current !== null) {
            const deltaX = startX.current - e.clientX;
            // Drag left to close (since it's on the left edge)
            if (deltaX > 15) {
                setIsExpanded(false);
            }
            startX.current = null;
        }
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        const updateDate = () => setTodayKey(getLocalDateString());
        updateDate();
        fetchHealthData();
        const interval = setInterval(updateDate, 60000); // Check every minute for midnight reset
        return () => clearInterval(interval);
    }, [fetchHealthData]);

    const handleExpand = () => {
        setIsExpanded(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsExpanded(false);
        }, 8000);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!todayKey) return null;

    const formatMinutes = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    };

    const todayData = healthData[todayKey] || { water: 0, stretch: 0, reading: 0, academic: 0, english: 0 };

    const getOffset = (value: number, target: number, radius: number) => {
        const circumference = 2 * Math.PI * radius;
        const percent = Math.min(value / target, 1);
        return circumference - (percent * circumference);
    };

    const getCircumference = (radius: number) => 2 * Math.PI * radius;

    return (
        <div 
            className={`relative group pointer-events-auto select-none transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                isExpanded ? 'translate-x-0' : 'translate-x-[calc(-100%+40px)] md:translate-x-[calc(-100%-24px)] cursor-pointer'
            }`}
            onClick={!isExpanded ? handleExpand : undefined}
            onMouseEnter={isExpanded ? handleExpand : undefined}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* Scaled down width, padding, and gap for mobile */}
            <div className={`bg-black/20 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl flex flex-col items-center gap-2 md:gap-4 transition-all duration-300 hover:bg-black/30 w-[240px] md:w-[300px] ${!isExpanded ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}>

                {/* Rings Container: Scaled down from w-36 to w-24 on mobile */}
                <div className="relative w-24 h-24 md:w-36 md:h-36 cursor-pointer" onClick={toggleHealthModal} title="View Health History">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                        {/* Background Rings */}
                        <circle cx="60" cy="60" r="50" className="stroke-blue-500/20" strokeWidth="7" fill="none" />
                        <circle cx="60" cy="60" r="40" className="stroke-green-500/20" strokeWidth="7" fill="none" />
                        <circle cx="60" cy="60" r="30" className="stroke-pink-500/20" strokeWidth="7" fill="none" />
                        <circle cx="60" cy="60" r="20" className="stroke-purple-500/20" strokeWidth="7" fill="none" />
                        <circle cx="60" cy="60" r="10" className="stroke-yellow-500/20" strokeWidth="7" fill="none" />

                        {/* Progress Rings */}
                        {/* Water */}
                        <circle
                            cx="60" cy="60" r="50"
                            className="stroke-blue-400 transition-all duration-1000 ease-out"
                            strokeWidth="7" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={getCircumference(50)}
                            strokeDashoffset={getOffset(todayData.water, TARGETS.water, 50)}
                        />
                        {/* Stretch */}
                        <circle
                            cx="60" cy="60" r="40"
                            className="stroke-green-400 transition-all duration-1000 ease-out"
                            strokeWidth="7" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={getCircumference(40)}
                            strokeDashoffset={getOffset(todayData.stretch, TARGETS.stretch, 40)}
                        />
                        {/* Reading */}
                        <circle
                            cx="60" cy="60" r="30"
                            className="stroke-pink-400 transition-all duration-1000 ease-out"
                            strokeWidth="7" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={getCircumference(30)}
                            strokeDashoffset={getOffset(todayData.reading, TARGETS.reading, 30)}
                        />
                        {/* Academic */}
                        <circle
                            cx="60" cy="60" r="20"
                            className="stroke-purple-400 transition-all duration-1000 ease-out"
                            strokeWidth="7" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={getCircumference(20)}
                            strokeDashoffset={getOffset(todayData.academic, TARGETS.academic, 20)}
                        />
                        {/* English */}
                        <circle
                            cx="60" cy="60" r="10"
                            className="stroke-yellow-400 transition-all duration-1000 ease-out"
                            strokeWidth="7" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={getCircumference(10)}
                            strokeDashoffset={getOffset(todayData.english, TARGETS.english, 10)}
                        />
                    </svg>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                        <ActivitySquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                </div>

                {/* Quick Controls: Tighter padding, gaps, and text size on mobile */}
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                    <button
                        onClick={() => updateHealth(todayKey, 'water', 1)}
                        className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-1.5 py-1 md:px-2 md:py-1.5 rounded-xl text-[10px] md:text-xs font-semibold transition-colors border border-blue-500/30"
                        title="Drink Water (+1 glass)"
                    >
                        <Droplet className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="tabular-nums">{todayData.water}/{TARGETS.water}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'stretch', 1)}
                        className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-1.5 py-1 md:px-2 md:py-1.5 rounded-xl text-[10px] md:text-xs font-semibold transition-colors border border-green-500/30"
                        title="Stretch Session (+1 session)"
                    >
                        <Activity className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="tabular-nums">{todayData.stretch}/{TARGETS.stretch}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'reading', 15)}
                        className="flex items-center gap-1 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 px-1.5 py-1 md:px-2 md:py-1.5 rounded-xl text-[10px] md:text-xs font-semibold transition-colors border border-pink-500/30"
                        title="Read/Screen Time (+15 mins)"
                    >
                        <BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="tabular-nums">{formatMinutes(todayData.reading)}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'academic', 30)}
                        className="flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-1.5 py-1 md:px-2 md:py-1.5 rounded-xl text-[10px] md:text-xs font-semibold transition-colors border border-purple-500/30"
                        title="Study (+30 mins)"
                    >
                        <GraduationCap className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="tabular-nums">{formatMinutes(todayData.academic)}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'english', 1)}
                        className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 px-1.5 py-1 md:px-2 md:py-1.5 rounded-xl text-[10px] md:text-xs font-semibold transition-colors border border-yellow-500/30"
                        title="English Vocab (+1 word)"
                    >
                        <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="tabular-nums">{todayData.english}/{TARGETS.english}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}