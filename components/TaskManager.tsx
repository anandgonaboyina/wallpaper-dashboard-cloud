'use client';

import { useState, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, Play, Trash2, CheckCircle, Circle, Clock, RotateCcw, Filter } from 'lucide-react';
import { fetchQuote } from '@/utils/quoteEngine';
import DraggableWidget from './DraggableWidget';
import ScrollableWithArrows from './ScrollableWithArrows';

export default function TaskManager() {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('25');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');

    const { tasks, setTasks, addTask, toggleTask, deleteTask, triggerTimer, isTaskManagerOpen, showQuotePopup, editTaskDuration, updateTaskTitle } = useDashboardStore();

    // Render regardless of open state, so it doesn't lose internal filter state
    // It is hidden visually via page.tsx wrapper.

    const handleToggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        toggleTask(id);

        if (task && !task.completed) {
            const q = await fetchQuote();
            showQuotePopup(q);
        }
    };

    const handleRestartTask = (id: string) => {
        if (window.confirm('Are you sure you want to restart this task?')) {
            setTasks(tasks.map(t => {
                if (t.id === id) {
                    const totalDuration = t.duration + (t.timeSpent || 0);
                    return { ...t, completed: false, duration: totalDuration > 0 ? totalDuration : 25, timeSpent: 0 };
                }
                return t;
            }));
        }
    };

    const handleRestartAllCompleted = () => {
        if (window.confirm('Are you sure you want to restart ALL completed tasks?')) {
            setTasks(tasks.map(t => {
                if (t.completed) {
                    const totalDuration = t.duration + (t.timeSpent || 0);
                    return { ...t, completed: false, duration: totalDuration > 0 ? totalDuration : 25, timeSpent: 0 };
                }
                return t;
            }));
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        addTask({
            id: Date.now().toString(),
            title: newTaskTitle.trim(),
            duration: parseInt(newTaskDuration) || 25,
            completed: false
        });

        setNewTaskTitle('');
    };

    const cycleFilter = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFilter(prev => {
            if (prev === 'pending') return 'completed';
            if (prev === 'completed') return 'all';
            return 'pending';
        });
    };

    const isTaskCompleted = (t: any) => {
        if (Boolean(t.completed) && t.completed !== 'false') return true;
        if (t.timeSpent !== undefined && t.timeSpent >= t.duration && t.duration > 0) return true;
        return false;
    };

    const filteredTasks = tasks.filter(t => {
        const isDone = isTaskCompleted(t);
        if (filter === 'pending') return !isDone;
        if (filter === 'completed') return isDone;
        return true;
    }).sort((a, b) => {
        const aDone = isTaskCompleted(a);
        const bDone = isTaskCompleted(b);
        if (aDone === bDone) return 0;
        return aDone ? 1 : -1;
    });

    const totalRemainingMinutes = tasks.filter(t => !isTaskCompleted(t)).reduce((sum, t) => sum + (t.duration || 0), 0);
    const formatRemainingTime = (mins: number) => {
        if (mins < 60) return `${mins}m left`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    return (
        <div className="w-full h-full mr-24 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-xl  flex flex-col overflow-hidden text-white pointer-events-auto transition-all duration-300">
            <div className="px-2.5 py-2 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <h2 className="text-[10px] font-bold tracking-widest text-white uppercase drop-shadow-md">Tasks</h2>

                <div className="flex items-center gap-1.5 text-[8px] font-bold tracking-widest text-white/60 uppercase">
                    {filter === 'completed' && tasks.some(isTaskCompleted) && (
                        <button
                            onClick={handleRestartAllCompleted}
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/20 text-orange-300 hover:bg-orange-500 hover:text-white rounded-md transition-colors active:scale-95"
                            title="Restart all completed"
                        >
                            <RotateCcw className="w-2.5 h-2.5 " /> <span className="hidden ">Reset All</span>
                        </button>
                    )}

                    <button
                        onClick={cycleFilter}
                        className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-md transition-colors border border-transparent hover:border-white/10 active:scale-95"
                        title="Filter Tasks"
                    >
                        <Filter className="w-2.5 h-2.5 " />
                        {filter === 'pending' && `${tasks.filter(t => !isTaskCompleted(t)).length} Pending`}
                        {filter === 'completed' && `${tasks.filter(isTaskCompleted).length} Completed`}
                        {filter === 'all' && `${tasks.length} Total`}
                    </button>

                    {totalRemainingMinutes > 0 && filter !== 'completed' && (
                        <>
                            <span className="hidden w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-sky-300/90 flex items-center gap-0.5 bg-sky-500/10 px-1.5 py-0.5 rounded-md border border-sky-500/20">
                                <Clock className="w-2.5 h-2.5 mb-[1px]" /> {formatRemainingTime(totalRemainingMinutes)}
                            </span>
                        </>
                    )}
                    <button onClick={() => useDashboardStore.getState().toggleTaskManager()} className="ml-0.5 p-1 text-white/30 hover:text-white/70 hover:bg-white/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </div>

            <ScrollableWithArrows className="p-1.5 max-h-[350px] ">
                {filteredTasks.length === 0 ? (
                    <div className="text-center text-white/40 p-3 text-[10px] italic">
                        No {filter !== 'all' ? filter : ''} tasks found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5 ">
                        {filteredTasks.map((task, index) => {
                            const isTaskDone = isTaskCompleted(task);
                            return (
                                <div
                                    key={task.id}
                                    className={`group flex items-start justify-between p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/10 transition-all shadow-sm ${isTaskDone ? 'opacity-40 grayscale-[50%]' : ''}`}
                                >
                                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-1 mt-[1px] shrink-0">
                                            <span className="text-[9px] font-bold text-white/30 tabular-nums w-4 text-right select-none">{index + 1}.</span>
                                            <button onClick={() => handleToggleTask(task.id)} className="text-white/50 hover:text-white hover:scale-110 transition-all active:scale-95">
                                                {isTaskDone ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <Circle className="w-3.5 h-3.5 " />}
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0 w-full ml-0.5 ">
                                            {editingTaskId === task.id ? (
                                                <textarea
                                                    autoFocus
                                                    onBlur={() => setEditingTaskId(null)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            setEditingTaskId(null);
                                                        }
                                                    }}
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.style.height = 'auto';
                                                            el.style.height = el.scrollHeight + 'px';
                                                        }
                                                    }}
                                                    value={task.title}
                                                    onChange={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                        updateTaskTitle(task.id, e.target.value);
                                                    }}
                                                    rows={1}
                                                    spellCheck={false}
                                                    className={`bg-black/40 outline-none w-full text-[11px] leading-snug border-b border-sky-500/50 px-1 -mx-1 resize-none overflow-hidden block text-white rounded-md shadow-inner transition-colors`}
                                                />
                                            ) : (
                                                <div
                                                    onDoubleClick={() => setEditingTaskId(task.id)}
                                                    title="Double click to edit"
                                                    className={`w-full text-[11px] leading-snug px-1 -mx-1 cursor-text whitespace-pre-wrap ${isTaskDone ? 'line-through text-white/40' : 'text-white/90'}`}
                                                >
                                                    {task.title}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 mt-0.5 overflow-hidden w-full">
                                                {task.duration > 0 && !isTaskDone && (
                                                    editingDurationId === task.id ? (
                                                        <div className="shrink-0 flex items-center bg-sky-500/30 rounded-full border border-sky-400/30 px-1.5 py-px shadow-sm">
                                                            <input
                                                                autoFocus
                                                                type="number"
                                                                defaultValue={task.duration}
                                                                min="1"
                                                                max="999"
                                                                className="w-8 bg-transparent text-[9px] font-bold text-white outline-none placeholder:text-white/50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                onBlur={(e) => {
                                                                    const dur = parseInt(e.target.value);
                                                                    if (!isNaN(dur) && dur > 0) editTaskDuration(task.id, dur);
                                                                    setEditingDurationId(null);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const dur = parseInt(e.currentTarget.value);
                                                                        if (!isNaN(dur) && dur > 0) editTaskDuration(task.id, dur);
                                                                        setEditingDurationId(null);
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-[9px] font-semibold text-white/80 ml-0.5">m</span>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            onDoubleClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingDurationId(task.id);
                                                            }}
                                                            className="shrink-0 text-[9px] font-semibold tracking-wide text-white/90 bg-sky-500/20 hover:bg-sky-500/40 cursor-pointer px-1.5 py-0.5 rounded-full border border-sky-400/20 transition-colors shadow-sm"
                                                            title="Double click to edit duration"
                                                        >
                                                            {task.duration >= 60 ? Math.floor(task.duration / 60) + "h " + (task.duration % 60) + "m" : task.duration + "m"} left
                                                        </span>
                                                    )
                                                )}
                                                {task.timeSpent !== undefined && task.timeSpent > 0 && !isTaskDone && (
                                                    <span
                                                        className="shrink-0 text-[9px] font-semibold tracking-wide text-emerald-200 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/20 shadow-sm pointer-events-none"
                                                        title="Total time tracked for this task"
                                                    >
                                                        {task.timeSpent >= 60 ? Math.floor(task.timeSpent / 60) + "h " + (task.timeSpent % 60) + "m" : task.timeSpent + "m"} done
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 mt-0.5 opacity-100 transition-opacity">
                                        {!isTaskDone && (
                                            <button
                                                onClick={() => triggerTimer(task.duration, task.id, task.title)}
                                                className="p-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white rounded-md transition-all active:scale-95"
                                                title={`Start ${task.duration}m timer`}
                                            >
                                                <Play className="w-3 h-3 fill-current" />
                                            </button>
                                        )}
                                        {(isTaskDone || (task.timeSpent !== undefined && task.timeSpent > 0)) && (
                                            <button
                                                onClick={() => handleRestartTask(task.id)}
                                                className="p-1 bg-orange-500/10 text-orange-300 hover:bg-orange-500 hover:text-white rounded-md transition-all active:scale-95 border border-orange-500/20 hover:border-transparent"
                                                title="Restart task"
                                            >
                                                <RotateCcw className="w-3 h-3 " />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this task?')) {
                                                    deleteTask(task.id);
                                                }
                                            }}
                                            className="p-1 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all active:scale-95 border border-transparent hover:border-rose-500/20"
                                        >
                                            <Trash2 className="w-3 h-3 " />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollableWithArrows>

            <form onSubmit={handleAddTask} className="p-1.5 border-t border-white/5 bg-black/20 flex gap-1.5 ">
                <input
                    type="text"
                    placeholder="New task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px] outline-none focus:bg-white/10 focus:border-sky-500/50 transition-all placeholder:text-white/30 shadow-inner"
                />
                <input
                    type="number"
                    placeholder="min"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    title="Minutes"
                    className="w-10 bg-white/5 border border-white/10 rounded-md px-1.5 py-1 text-[11px] font-semibold text-center outline-none focus:bg-white/10 focus:border-sky-500/50 transition-all placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                />
                <button type="submit" className="p-1 bg-white/10 hover:bg-white/20 hover:text-sky-300 rounded-md transition-all shrink-0 active:scale-95 shadow-sm border border-white/5">
                    <Plus className="w-3.5 h-3.5 " />
                </button>
            </form>
        </div>
    );
}
