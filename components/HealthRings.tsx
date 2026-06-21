'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { Droplet, Activity, BookOpen, ActivitySquare, GraduationCap, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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

    useEffect(() => {
        const updateDate = () => setTodayKey(getLocalDateString());
        updateDate();
        fetchHealthData();
        const interval = setInterval(updateDate, 60000); // Check every minute for midnight reset
        return () => clearInterval(interval);
    }, [fetchHealthData]);

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
        <div className="relative group pointer-events-auto select-none">
            <div className="bg-black/20 backdrop-blur-3xl border border-white/10 rounded-3xl p-1 shadow-2xl flex flex-col items-center gap-4 transition-colors duration-300 hover:bg-black/30 w-[300px]">

                {/* Rings Container */}
                <div className="relative w-36 h-36 cursor-pointer" onClick={toggleHealthModal} title="View Health History">
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
                        <ActivitySquare size={16} className="text-white" />
                    </div>
                </div>

                {/* Quick Controls */}
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => updateHealth(todayKey, 'water', 1)}
                        className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-blue-500/30"
                        title="Drink Water (+1 glass)"
                    >
                        <Droplet size={14} />
                        <span className="tabular-nums">{todayData.water}/{TARGETS.water}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'stretch', 1)}
                        className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-green-500/30"
                        title="Stretch Session (+1 session)"
                    >
                        <Activity size={14} />
                        <span className="tabular-nums">{todayData.stretch}/{TARGETS.stretch}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'reading', 15)}
                        className="flex items-center gap-1 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-pink-500/30"
                        title="Read/Screen Time (+15 mins)"
                    >
                        <BookOpen size={14} />
                        <span className="tabular-nums">{formatMinutes(todayData.reading)}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'academic', 30)}
                        className="flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-purple-500/30"
                        title="Study (+30 mins)"
                    >
                        <GraduationCap size={14} />
                        <span className="tabular-nums">{formatMinutes(todayData.academic)}</span>
                    </button>
                    <button
                        onClick={() => updateHealth(todayKey, 'english', 1)}
                        className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-yellow-500/30"
                        title="English Vocab (+1 word)"
                    >
                        <MessageCircle size={14} />
                        <span className="tabular-nums">{todayData.english}/{TARGETS.english}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
