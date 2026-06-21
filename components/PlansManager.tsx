'use client';
import { useState, useEffect, useRef } from 'react';
import { useDashboardStore, Plan, SubTopic } from '@/store/dashboardStore';
import { Target, Plus, X, Upload, ChevronLeft, CheckCircle, Circle, Trash2, Map, Calendar, Clock, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

const CATEGORY_SUGGESTIONS = ['DSA', 'Web Dev', 'Academics', 'Projects', 'Personal'];

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString();
};

export default function PlansManager() {
  const { isPlansOpen } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isPlansOpen) return null;

  return <PlansEditor />;
}

function PlansEditor() {
  const { plans, togglePlans, addPlan, deletePlan, addSubTopic, toggleSubTopic, deleteSubTopic } = useDashboardStore();
  const [view, setView] = useState<'gallery' | 'add' | 'detail'>('gallery');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Get unique categories for filter
  const allCategories = Array.from(new Set(plans.map(p => p.category)));

  // Filter plans based on selected category
  const filteredPlans = filterCategory === 'All' ? plans : plans.filter(p => p.category === filterCategory);

  // Group filtered plans by category for gallery
  const groupedPlans = filteredPlans.reduce((acc, plan) => {
    if (!acc[plan.category]) acc[plan.category] = [];
    acc[plan.category].push(plan);
    return acc;
  }, {} as Record<string, Plan[]>);

  // Sort each group by end date ascending (closest date first)
  Object.values(groupedPlans).forEach(group => {
    group.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  });

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 pb-16 sm:pb-24 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
      <div className="absolute inset-0" onClick={togglePlans} />

      <div className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] max-h-[850px] flex flex-col rounded-2xl sm:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            {view !== 'gallery' && (
              <button
                onClick={() => setView('gallery')}
                className="p-1 sm:p-2 -ml-1 sm:-ml-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2 sm:gap-3 truncate">
              <Map size={24} className="text-blue-400 shrink-0 sm:w-7 sm:h-7" />
              <span className="truncate">{view === 'gallery' ? 'Pending works' : view === 'add' ? 'New Master Plan' : selectedPlan?.title}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {view === 'gallery' && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white/70">
                  <Filter size={16} />
                  <CustomSelect
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={['All', ...allCategories]}
                  />
                </div>
                {/* Mobile Filter Button */}
                <div className="sm:hidden relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="All">All</option>
                    {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <button className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/70 flex items-center justify-center">
                    <Filter size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setView('add')}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm sm:text-base"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">Add Plan</span>
                </button>
              </div>
            )}
            <button
              onClick={togglePlans}
              className="p-1.5 sm:p-2 ml-1 sm:ml-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <ScrollableWithArrows className={`p-4 sm:p-6 ${view === 'detail' ? 'overflow-y-auto md:overflow-hidden' : ''}`} hideArrows={view === 'detail'}>
            {view === 'gallery' && (
              <GalleryView
                groupedPlans={groupedPlans}
                onSelect={(id) => { setSelectedPlanId(id); setView('detail'); }}
              />
            )}

            {view === 'add' && (
              <AddPlanView
                onAdd={(p) => { addPlan(p); setView('gallery'); }}
                onCancel={() => setView('gallery')}
              />
            )}

            {view === 'detail' && selectedPlan && (
              <DetailView
                plan={selectedPlan}
                onAddSub={(title) => addSubTopic(selectedPlan.id, title)}
                onToggleSub={(subId) => toggleSubTopic(selectedPlan.id, subId)}
                onDeleteSub={(subId) => deleteSubTopic(selectedPlan.id, subId)}
                onDeletePlan={() => { deletePlan(selectedPlan.id); setView('gallery'); }}
              />
            )}
          </ScrollableWithArrows>
        </div>
      </div>
    </div>
  );
}

function GalleryView({ groupedPlans, onSelect }: { groupedPlans: Record<string, Plan[]>, onSelect: (id: string) => void }) {
  if (Object.keys(groupedPlans).length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 italic p-4 text-center">
        <Map size={48} className="mb-4 opacity-20 sm:w-16 sm:h-16" />
        <p className="text-lg sm:text-xl mb-2">No plans defined yet.</p>
        <p className="text-sm sm:text-base">Click "Add Plan" to map out your ambitious journey!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {Object.entries(groupedPlans).map(([category, plans]) => (
        <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg sm:text-xl font-semibold text-white/80 mb-3 sm:mb-4 px-1 sm:px-2 tracking-widest uppercase text-xs sm:text-sm border-b border-white/10 pb-2">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map(plan => {
              const total = plan.subTopics.length;
              const completed = plan.subTopics.filter(st => st.completed).length;
              const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const targetDate = new Date(plan.endDate);
              targetDate.setHours(0, 0, 0, 0);
              const diffTime = targetDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={plan.id}
                  onClick={() => onSelect(plan.id)}
                  className="group relative h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-2xl shadow-black/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 transition-transform duration-700 group-hover:scale-110 flex items-center justify-center p-4">
                    <span className="text-white/20 font-bold text-2xl sm:text-3xl text-center uppercase tracking-widest leading-none drop-shadow-md break-words">{plan.title}</span>
                  </div>
                  {/* Top Middle Days Left Badge */}
                  <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
                    {diffDays > 0 ? (
                      <span className="flex items-center gap-1 sm:gap-1.5 text-white bg-blue-500/80 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-blue-400/50 shadow-lg text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                        {diffDays} Days Left
                      </span>
                    ) : diffDays === 0 ? (
                      <span className="flex items-center gap-1 sm:gap-1.5 text-white bg-orange-500/80 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-orange-400/50 shadow-lg text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                        Due Today
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 sm:gap-1.5 text-white bg-red-500/80 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-red-400/50 shadow-lg text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                        {Math.abs(diffDays)} Days Overdue
                      </span>
                    )}
                  </div>

                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                  <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-1">{plan.title}</h4>

                    <div className="flex items-center flex-wrap gap-2 text-[10px] sm:text-xs font-medium text-white/60 mb-2 sm:mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} /> {plan.duration}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {parseLocalDate(plan.endDate)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-xs font-medium text-white/70">
                      <span>{completed}/{total} Topics</span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddPlanView({ onAdd, onCancel }: { onAdd: (plan: Plan) => void, onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [endDate, setEndDate] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !duration.trim() || !endDate) return;
    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      category: category.trim(),
      duration: duration.trim(),
      endDate: endDate,
      subTopics: []
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto flex flex-col gap-4 sm:gap-6 animate-in slide-in-from-bottom-8 duration-500 w-full">

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-white/70 font-medium text-sm sm:text-base">Plan Title</label>
        <input
          required
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Master Dynamic Programming"
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/20 text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-white/70 font-medium text-sm sm:text-base">Category</label>
        <input
          required
          list="category-suggestions"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g. DSA, Web Dev..."
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/20 text-sm sm:text-base"
        />
        <datalist id="category-suggestions">
          {CATEGORY_SUGGESTIONS.map(cat => <option key={cat} value={cat} />)}
        </datalist>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1.5 sm:gap-2 flex-1">
          <label className="text-white/70 font-medium text-sm sm:text-base">Duration</label>
          <input
            required
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 30 Days, 2 Months..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/20 text-sm sm:text-base"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 relative">
          <label className="text-white/70 font-medium flex justify-between text-sm sm:text-base">
            Target End Date
          </label>
          <CustomDatePicker value={endDate} onChange={setEndDate} />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2 sm:mt-4">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors text-sm sm:text-base border border-white/10 sm:border-none">
          Cancel
        </button>
        <button type="submit" disabled={!title || !category || !duration || !endDate} className="w-full sm:w-auto px-8 py-2.5 sm:py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors shadow-lg shadow-blue-500/20 text-sm sm:text-base">
          Create Master Plan
        </button>
      </div>
    </form>
  );
}

function DetailView({ plan, onAddSub, onToggleSub, onDeleteSub, onDeletePlan }: { plan: Plan, onAddSub: (t: string) => void, onToggleSub: (id: string) => void, onDeleteSub: (id: string) => void, onDeletePlan: () => void }) {
  const { updatePlanDetails } = useDashboardStore();
  const [newSub, setNewSub] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editDuration, setEditDuration] = useState(plan.duration);
  const [editEndDate, setEditEndDate] = useState(plan.endDate);

  const submitSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    onAddSub(newSub.trim());
    setNewSub('');
  };

  const handleSaveDetails = () => {
    updatePlanDetails(plan.id, editDuration, editEndDate);
    setIsEditing(false);
  };

  const total = plan.subTopics.length;
  const completed = plan.subTopics.filter(st => st.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(plan.endDate);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 h-auto md:h-full animate-in slide-in-from-bottom-8 duration-500">
      {/* Left Column: Visuals & Progress */}
      <div className="w-full md:w-1/3 flex flex-col sm:flex-row md:flex-col gap-4 md:gap-6 shrink-0">
        <div className="w-full sm:w-1/2 md:w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative max-w-[300px] sm:max-w-none mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
            <span className="text-white/20 font-bold text-2xl md:text-4xl text-center uppercase tracking-widest leading-none drop-shadow-md break-words">{plan.title}</span>
          </div>
          {/* Top Middle Days Left Badge */}
          <div className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
            {diffDays > 0 ? (
              <span className="flex items-center gap-1.5 md:gap-2 text-white bg-blue-500/80 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-blue-400/50 shadow-lg text-[10px] md:text-sm font-bold tracking-widest uppercase">
                <Calendar size={12} className="md:w-3.5 md:h-3.5" /> {diffDays} Days Left
              </span>
            ) : diffDays === 0 ? (
              <span className="flex items-center gap-1.5 md:gap-2 text-white bg-orange-500/80 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-orange-400/50 shadow-lg text-[10px] md:text-sm font-bold tracking-widest uppercase">
                <Clock size={12} className="md:w-3.5 md:h-3.5" /> Due Today
              </span>
            ) : (
              <span className="flex items-center gap-1.5 md:gap-2 text-white bg-red-500/80 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-red-400/50 shadow-lg text-[10px] md:text-sm font-bold tracking-widest uppercase">
                <Clock size={12} className="md:w-3.5 md:h-3.5" /> {Math.abs(diffDays)} Days Overdue
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 md:bottom-4 left-3 right-3 md:left-4 md:right-4 text-center flex flex-col gap-2">
            <span className="px-2.5 py-1 md:px-3 md:py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] md:text-xs font-semibold text-white tracking-widest uppercase shadow-xl inline-block mx-auto border border-white/10">
              {plan.category}
            </span>
            {isEditing ? (
              <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-md p-2 md:p-3 rounded-xl border border-white/20 shadow-2xl mt-2 relative z-50">
                <input
                  value={editDuration}
                  onChange={e => setEditDuration(e.target.value)}
                  placeholder="Duration..."
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-white text-[10px] md:text-xs outline-none focus:border-blue-500"
                />
                <input
                  type="date"
                  value={editEndDate}
                  onChange={e => setEditEndDate(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-white text-[10px] md:text-xs outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveDetails} className="flex-1 py-1 md:py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-[10px] md:text-xs font-medium transition-colors">Save</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-1 md:py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-[10px] md:text-xs font-medium transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-1.5 md:gap-2 flex-wrap group cursor-pointer" onClick={() => setIsEditing(true)} title="Click to edit">
                <span className="flex items-center gap-1 px-2 py-1 bg-black/60 group-hover:bg-black/80 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-medium text-white/80 border border-white/10 transition-colors">
                  <Clock size={10} /> {plan.duration}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-black/60 group-hover:bg-black/80 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-medium text-white/80 border border-white/10 transition-colors">
                  <Calendar size={10} /> {parseLocalDate(plan.endDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full sm:w-1/2 md:w-full flex flex-col justify-between">
          <div className="bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-center mb-4 sm:mb-0 md:mb-4">
            <div className="text-4xl md:text-5xl font-bold text-white mb-1 md:mb-2">{percent}%</div>
            <div className="text-white/50 text-xs md:text-sm tracking-widest uppercase mb-3 md:mb-4">Completion</div>
            <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm text-white/40">{completed} of {total} topics conquered</div>
          </div>

          <button
            onClick={() => { if (confirm('Are you sure you want to delete this entire plan?')) onDeletePlan() }}
            className="w-full py-2.5 md:py-3 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-colors flex justify-center items-center gap-2 font-medium text-sm md:text-base mt-auto"
          >
            <Trash2 size={16} className="md:w-[18px] md:h-[18px]" /> Drop Plan
          </button>
        </div>
      </div>

      {/* Right Column: Interactive Checklist */}
      <div className="flex-1 flex flex-col bg-black/20 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 overflow-hidden relative min-h-[350px]">
        <h3 className="text-lg md:text-xl font-bold text-white/80 mb-4 md:mb-6 flex items-center gap-2">
          <CheckCircle className="text-green-400 w-5 h-5 md:w-6 md:h-6" /> Action Items
        </h3>

        <div className="relative flex-1 overflow-hidden flex flex-col min-h-[200px]">
          <ScrollableWithArrows className="p-1 md:p-2 flex flex-col gap-2 pr-1">
            {plan.subTopics.length === 0 ? (
              <div className="h-full min-h-[100px] flex items-center justify-center text-white/30 italic text-center px-4 md:px-8 text-sm md:text-base">
                No action items yet. Break your ambitious plan down into small, conquerable steps below!
              </div>
            ) : (
              plan.subTopics.map(st => (
                <div
                  key={st.id}
                  onClick={() => onToggleSub(st.id)}
                  className={`group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer border border-transparent hover:border-white/10 transition-all ${st.completed ? 'bg-white/5 opacity-60' : 'bg-black/40 shadow-lg'}`}
                >
                  <div className={`shrink-0 transition-colors ${st.completed ? 'text-green-500' : 'text-white/20 group-hover:text-white/50'}`}>
                    {st.completed ? <CheckCircle size={20} className="md:w-6 md:h-6" /> : <Circle size={20} className="md:w-6 md:h-6" />}
                  </div>
                  <span className={`flex-1 text-sm md:text-lg transition-all ${st.completed ? 'text-white/50 line-through' : 'text-white/90'}`}>
                    {st.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSub(st.id); }}
                    className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1.5 md:p-2 text-white/30 hover:text-red-400 hover:bg-white/10 rounded-lg md:rounded-xl transition-all shrink-0"
                  >
                    <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                  </button>
                </div>
              ))
            )}
          </ScrollableWithArrows>
        </div>

        <form onSubmit={submitSub} className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10 shrink-0">
          <div className="relative">
            <input
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              placeholder="Add a new sub-topic..."
              className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl pl-4 pr-12 py-3 md:py-4 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/30 text-sm md:text-base"
            />
            <button
              type="submit"
              disabled={!newSub.trim()}
              className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-blue-500 text-white rounded-lg md:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Plus size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-transparent text-white hover:text-white/80 transition-colors text-sm sm:text-base"
      >
        <span>{value === 'All' ? 'All Categories' : value}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-gray-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`px-3 py-2 sm:px-4 sm:py-2 cursor-pointer transition-colors text-sm sm:text-base ${value === opt ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              {opt === 'All' ? 'All Categories' : opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDatePicker({ value, onChange }: { value: string, onChange: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => value ? new Date(value) : new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleSelect = (day: number) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="relative w-full z-50">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-between text-sm sm:text-base"
      >
        <span className={value ? "text-white" : "text-white/20"}>
          {value || "Select a date..."}
        </span>
        <Calendar size={16} className="text-white/40 sm:w-[18px] sm:h-[18px]" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div ref={popupRef} className="relative w-full max-w-[320px] bg-gray-900 border border-white/20 rounded-3xl shadow-2xl p-4 sm:p-5 z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <button onClick={prevMonth} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="text-white font-semibold text-base sm:text-lg tracking-wide">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2 sm:mb-3">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] sm:text-xs font-bold text-white/40 tracking-wider uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return (
                  <button
                    key={day}
                    onClick={(e) => { e.preventDefault(); handleSelect(day); }}
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full text-xs sm:text-sm font-medium transition-all mx-auto flex items-center justify-center
                      ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}