'use client';

import { useState, useEffect } from 'react';
import { Shield, Bug, Trash2, CheckCircle, RefreshCw, Radio, LogOut, Quote as QuoteIcon, Upload, Users, Trophy, Award, Search } from 'lucide-react';
import { setAuthTransition } from '@/store/dashboardStore';

export default function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'broadcasts' | 'users' | 'quotes' | 'roadmap' | 'leaderboard'>('feedback');

  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'today' | 'week' | 'month'>('today');
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [expandedLeaderboardUserId, setExpandedLeaderboardUserId] = useState<string | null>(null);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [editingBroadcastId, setEditingBroadcastId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Quote state
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [isAddingQuote, setIsAddingQuote] = useState(false);

  // Roadmap state
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDesc, setRoadmapDesc] = useState('');
  const [roadmapStatus, setRoadmapStatus] = useState('planned');
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('dashboard_token');
    if (!token || token === 'null') {
      window.location.href = '/';
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchFeedback(), fetchBroadcasts(), fetchUsers(), fetchQuotes(), fetchRoadmap(), fetchLeaderboard()]);
    setIsLoading(false);
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      const data = await res.json();
      if (res.ok && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      }
    } catch (err) { } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      const data = await res.json();
      if (data.feedback) setFeedbacks(data.feedback);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      const data = await res.json();
      if (data.broadcasts) setBroadcasts(data.broadcasts);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      const data = await res.json();
      if (data.quotes) setQuotes(data.quotes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (data.roadmap) setRoadmaps(data.roadmap);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm("Delete this feedback forever?")) return;
    try {
      const res = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      if (res.ok) {
        setFeedbacks(feedbacks.filter(f => f._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      if (status === 'added_to_roadmap') {
        const fb = feedbacks.find(f => f._id === id);
        if (fb) {
          const typeLabel = fb.type ? `[${fb.type.toUpperCase()}] ` : '';
          const addRes = await fetch('/api/roadmap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}`
            },
            body: JSON.stringify({
              title: typeLabel + (fb.message.substring(0, 40) + (fb.message.length > 40 ? '...' : '')),
              description: fb.message,
              status: 'planned'
            })
          });
          if (addRes.ok) fetchRoadmap();
        }
      }

      const res = await fetch(`/api/feedback`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}`
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status } : f));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle || !broadcastContent) {
      alert("Please provide both title and content for the broadcast.");
      return;
    }

    setIsBroadcasting(true);
    try {
      const method = editingBroadcastId ? 'PATCH' : 'POST';
      const bodyPayload = editingBroadcastId
        ? { id: editingBroadcastId, title: broadcastTitle, content: broadcastContent }
        : { title: broadcastTitle, content: broadcastContent, type: 'INFO' };

      const res = await fetch('/api/broadcasts', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Broadcast ${editingBroadcastId ? 'updated' : 'sent'} successfully!`);
        setBroadcastTitle('');
        setBroadcastContent('');
        setEditingBroadcastId(null);
        fetchBroadcasts();
      } else {
        alert(data.error || `Failed to ${editingBroadcastId ? 'update' : 'send'} broadcast`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const deleteBroadcast = async (id: string) => {
    if (!window.confirm("Delete this broadcast?")) return;
    try {
      const res = await fetch(`/api/broadcasts?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      if (res.ok) {
        setBroadcasts(broadcasts.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editBroadcast = (b: any) => {
    setBroadcastTitle(b.title);
    setBroadcastContent(b.content);
    setEditingBroadcastId(b.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIconForType = (type: string) => {
    if (type === 'bug') return '🐛';
    if (type === 'feature') return '💡';
    return '💬';
  };

  const handleAddQuote = async () => {
    if (!quoteText || !quoteAuthor) return alert("Quote text and author required");
    setIsAddingQuote(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}`
        },
        body: JSON.stringify({ text: quoteText, author: quoteAuthor })
      });
      if (res.ok) {
        setQuoteText('');
        setQuoteAuthor('');
        fetchQuotes();
      } else {
        alert("Failed to add quote");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingQuote(false);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!window.confirm("Delete this quote?")) return;
    try {
      const res = await fetch(`/api/quotes?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      if (res.ok) {
        setQuotes(quotes.filter(q => q._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!roadmapTitle) return alert("Please provide a title for the feature.");
    setIsSavingRoadmap(true);
    try {
      const method = editingRoadmapId ? 'PATCH' : 'POST';
      const bodyPayload = editingRoadmapId
        ? { id: editingRoadmapId, title: roadmapTitle, description: roadmapDesc, status: roadmapStatus }
        : { title: roadmapTitle, description: roadmapDesc, status: roadmapStatus };

      const res = await fetch('/api/roadmap', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        setRoadmapTitle('');
        setRoadmapDesc('');
        setRoadmapStatus('planned');
        setEditingRoadmapId(null);
        fetchRoadmap();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save roadmap item.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRoadmap(false);
    }
  };

  const deleteRoadmap = async (id: string) => {
    if (!window.confirm("Delete this roadmap item?")) return;
    try {
      const res = await fetch(`/api/roadmap?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}` }
      });
      if (res.ok) {
        setRoadmaps(roadmaps.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editRoadmap = (r: any) => {
    setRoadmapTitle(r.title);
    setRoadmapDesc(r.description || '');
    setRoadmapStatus(r.status || 'planned');
    setEditingRoadmapId(r.id);
  };

  const handleQuoteJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(json)) return alert("JSON must be an array of {text, author} objects");

        setIsAddingQuote(true);
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('dashboard_token')}`
          },
          body: JSON.stringify({ quotes: json })
        });

        const data = await res.json();
        if (res.ok) {
          alert(`Successfully added ${data.count} quotes!`);
          fetchQuotes();
        } else {
          alert("Failed to upload quotes");
        }
      } catch (err) {
        alert("Invalid JSON format");
      } finally {
        setIsAddingQuote(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white p-2 sm:p-4 md:p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden select-text relative">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-pink-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto flex flex-col gap-3 md:gap-6 relative z-10">

        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-red-500/20 text-red-300 rounded-xl sm:rounded-2xl border border-red-500/30">
              <Shield size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Super Admin Panel</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">Manage global data & users.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setAuthTransition(true);
              localStorage.removeItem('dashboard_token');
              localStorage.removeItem('dashboard_sync_token');
              localStorage.removeItem('dashboard_role');
              localStorage.removeItem('dashboard_username');
              window.location.href = '/';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 border border-white/20 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 rounded-lg sm:rounded-xl transition-all font-semibold text-xs sm:text-sm text-white/80 shadow-sm"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </header>

        {/* Navigation Tabs - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 snap-x w-full">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'feedback' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
          >
            <Bug size={14} /> Feedback
          </button>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'broadcasts' ? 'bg-pink-500/30 text-pink-200 border border-pink-400/50' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
          >
            <Radio size={14} /> Broadcasts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
          >
            <Users size={14} /> Users
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'quotes' ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
          >
            <QuoteIcon size={14} /> Quotes
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'roadmap' ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
          >
            <CheckCircle size={14} /> Roadmap
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
          >
            <Trophy size={14} /> Ranks
          </button>
        </div>

        <div className="w-full">

          {/* Feedback Area */}
          {activeTab === 'feedback' && (
            <div className="flex flex-col gap-4 w-full lg:max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Bug className="text-orange-400" size={18} /> Inbox
                </h2>
                <button onClick={fetchFeedback} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/20">
                  <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-300" : "text-white/80"} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {isLoading && <p className="text-white/50 text-sm">Loading...</p>}
                {!isLoading && feedbacks.length === 0 && (
                  <div className="p-6 border border-white/20 border-dashed rounded-xl flex flex-col items-center justify-center text-center gap-2 bg-white/5 backdrop-blur-sm">
                    <CheckCircle size={24} className="text-green-400/70" />
                    <p className="text-white/60 text-sm font-medium">Inbox zero!</p>
                  </div>
                )}

                {feedbacks.map((item) => (
                  <div key={item._id} className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:border-white/40 transition-all group flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-lg leading-none">{getIconForType(item.type)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/30 px-1.5 py-0.5 rounded border border-white/10">
                          {item.type}
                        </span>
                        {item.status && item.status !== 'pending' && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.status === 'reviewed' ? 'text-blue-300 bg-blue-500/20 border-blue-400/30' :
                              item.status === 'added_to_roadmap' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30' :
                                'text-white/70 bg-black/30 border-white/10'
                            }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        )}
                        <span className="text-[10px] text-white/50 ml-1">
                          {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteFeedback(item._id)}
                        className="p-1 text-red-400/70 hover:bg-red-500/20 hover:text-red-300 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-white/90 leading-snug text-xs sm:text-sm whitespace-pre-wrap">{item.message}</p>

                    <div className="pt-2 mt-1 border-t border-white/10 flex flex-wrap gap-1.5 sm:gap-2">
                      {item.status !== 'reviewed' && (
                        <button
                          onClick={() => updateFeedbackStatus(item._id, 'reviewed')}
                          className="px-2 py-1 text-[10px] sm:text-xs font-semibold bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 rounded border border-blue-400/30 transition-colors"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {item.status !== 'added_to_roadmap' && (
                        <button
                          onClick={() => updateFeedbackStatus(item._id, 'added_to_roadmap')}
                          className="px-2 py-1 text-[10px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 rounded border border-emerald-400/30 transition-colors"
                        >
                          + Roadmap
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Broadcasts */}
          {activeTab === 'broadcasts' && (
            <div className="flex flex-col gap-4 w-full lg:max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Radio className="text-pink-400" size={18} /> Broadcasts
              </h2>

              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col gap-3">
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full bg-black/20 border border-white/20 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-pink-400/50 placeholder:text-white/40"
                />
                <textarea
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Message..."
                  rows={2}
                  className="w-full bg-black/20 border border-white/20 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-pink-400/50 resize-none placeholder:text-white/40"
                />
                <button
                  onClick={handleSendBroadcast}
                  disabled={isBroadcasting}
                  className="w-full py-1.5 bg-pink-500/30 text-pink-100 hover:bg-pink-500/40 disabled:opacity-50 border border-pink-400/40 font-bold rounded-md text-sm transition-all flex justify-center items-center gap-1.5"
                >
                  {isBroadcasting ? <RefreshCw className="animate-spin" size={14} /> : <Radio size={14} />}
                  {editingBroadcastId ? 'Update' : 'Send'}
                </button>
                {editingBroadcastId && (
                  <button
                    onClick={() => { setEditingBroadcastId(null); setBroadcastTitle(''); setBroadcastContent(''); }}
                    className="w-full py-1.5 bg-white/10 text-white/80 hover:bg-white/20 border border-white/20 rounded-md text-xs transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {broadcasts.map(b => (
                  <div key={b.id} className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg relative group flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-pink-300">{b.title}</h4>
                      <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editBroadcast(b)} className="text-white/60 hover:text-white p-1"><Shield size={12} /></button>
                        <button onClick={() => deleteBroadcast(b.id)} className="text-red-400/80 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 whitespace-pre-wrap">{b.content}</p>
                    <span className="text-[9px] text-white/50 mt-1">
                      {new Date(b.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="flex flex-col gap-4 w-full lg:max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <CheckCircle className="text-indigo-400" size={18} /> Pipeline
              </h2>

              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col gap-3">
                <input
                  type="text"
                  value={roadmapTitle}
                  onChange={(e) => setRoadmapTitle(e.target.value)}
                  placeholder="Feature Title"
                  className="w-full bg-black/20 border border-white/20 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400/50 placeholder:text-white/40"
                />
                <textarea
                  value={roadmapDesc}
                  onChange={(e) => setRoadmapDesc(e.target.value)}
                  placeholder="Description..."
                  rows={2}
                  className="w-full bg-black/20 border border-white/20 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400/50 resize-none placeholder:text-white/40"
                />
                <select
                  value={roadmapStatus}
                  onChange={(e) => setRoadmapStatus(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400/50 text-white"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button
                  onClick={handleSaveRoadmap}
                  disabled={isSavingRoadmap}
                  className="w-full py-1.5 bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/40 disabled:opacity-50 border border-indigo-400/40 font-bold rounded-md text-sm transition-all flex justify-center items-center gap-1.5"
                >
                  {isSavingRoadmap ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                  {editingRoadmapId ? 'Update' : 'Add'}
                </button>
                {editingRoadmapId && (
                  <button
                    onClick={() => { setEditingRoadmapId(null); setRoadmapTitle(''); setRoadmapDesc(''); setRoadmapStatus('planned'); }}
                    className="w-full py-1.5 bg-white/10 text-white/80 hover:bg-white/20 border border-white/20 rounded-md text-xs transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {roadmaps.map(r => (
                  <div key={r.id} className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg relative group flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-indigo-300">{r.title}</h4>
                      <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editRoadmap(r)} className="text-white/60 hover:text-white p-1"><Shield size={12} /></button>
                        <button onClick={() => deleteRoadmap(r.id)} className="text-red-400/80 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {r.description && <p className="text-xs text-white/70 whitespace-pre-wrap">{r.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${r.status === 'done' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30' :
                          r.status === 'in_progress' ? 'text-amber-300 bg-amber-500/20 border-amber-400/30' :
                            'text-indigo-300 bg-indigo-500/20 border-indigo-400/30'
                        }`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="flex flex-col gap-4 w-full lg:max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={18} /> Ranks
                </h2>
                <button onClick={fetchLeaderboard} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/20 self-end sm:self-auto">
                  <RefreshCw size={14} className={leaderboardLoading ? "animate-spin text-blue-300" : "text-white/80"} />
                </button>
              </div>

              <div className="flex flex-col gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                <div className="flex overflow-x-auto hide-scrollbar gap-1.5 pb-1">
                  <button
                    onClick={() => setLeaderboardFilter('today')}
                    className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold transition-all ${leaderboardFilter === 'today' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40' : 'text-white/70 bg-black/20 border border-transparent'}`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setLeaderboardFilter('week')}
                    className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold transition-all ${leaderboardFilter === 'week' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40' : 'text-white/70 bg-black/20 border border-transparent'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setLeaderboardFilter('month')}
                    className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold transition-all ${leaderboardFilter === 'month' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40' : 'text-white/70 bg-black/20 border border-transparent'}`}
                  >
                    30 Days
                  </button>
                </div>
                <div className="relative w-full">
                  <Search size={12} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className="w-full bg-black/20 border border-white/20 rounded-md pl-7 pr-2.5 py-1.5 text-xs outline-none focus:border-blue-400/50 transition-colors placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {(() => {
                  const sortedData = [...leaderboardData].sort((a, b) => {
                    const valA = leaderboardFilter === 'today' ? a.todayFocused : leaderboardFilter === 'week' ? a.last7DaysFocused : a.last30DaysFocused;
                    const valB = leaderboardFilter === 'today' ? b.todayFocused : leaderboardFilter === 'week' ? b.last7DaysFocused : b.last30DaysFocused;
                    return valB - valA;
                  });
                  const filteredData = sortedData.filter(u => u.displayName.toLowerCase().includes(leaderboardSearch.toLowerCase()));

                  if (filteredData.length === 0 && !leaderboardLoading) {
                    return <p className="text-white/50 text-xs text-center py-4">No users found.</p>;
                  }

                  return filteredData.map((user, index) => {
                    const val = leaderboardFilter === 'today' ? user.todayFocused : leaderboardFilter === 'week' ? user.last7DaysFocused : user.last30DaysFocused;
                    const rankColors = ['bg-yellow-500/30 text-yellow-200 border-yellow-400/40', 'bg-gray-300/30 text-white border-gray-400/40', 'bg-amber-700/30 text-amber-200 border-amber-600/40'];
                    const rankColor = index < 3 && val > 0 ? rankColors[index] : 'bg-black/20 text-white/60 border-white/10';

                    return (
                      <div key={user.id} className="flex flex-col gap-2 p-2.5 rounded-lg border bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setExpandedLeaderboardUserId(expandedLeaderboardUserId === user.id ? null : user.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs border shrink-0 ${rankColor}`}>
                              {index + 1}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-white/10">
                              {user.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : user.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm text-white/90 leading-tight flex items-center gap-2">
                                {user.displayName}
                                {expandedLeaderboardUserId === user.id && <span className="text-[9px] font-mono font-normal text-white/40 bg-black/40 px-1.5 py-0.5 rounded">ID: {user.id}</span>}
                              </span>
                              <div className="flex gap-1 mt-0.5">
                                {user.badges?.today > 0 && <span className="text-[8px] bg-yellow-500/30 text-yellow-100 px-1 rounded border border-yellow-400/30">🏆 {user.badges.today}</span>}
                                {user.badges?.week > 0 && <span className="text-[8px] bg-purple-500/30 text-purple-100 px-1 rounded border border-purple-400/30">🌟 {user.badges.week}</span>}
                                {user.badges?.month > 0 && <span className="text-[8px] bg-emerald-500/30 text-emerald-100 px-1 rounded border border-emerald-400/30">👑 {user.badges.month}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col">
                            <span className="font-mono font-bold text-sm text-blue-200">{Math.floor(val / 60)}h {val % 60}m</span>
                          </div>
                        </div>
                        
                        {/* Expanded Time Stats */}
                        {expandedLeaderboardUserId === user.id && (
                          <div className="mt-1 pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center animate-fade-in">
                            <div className="flex flex-col bg-black/20 p-1.5 rounded-md border border-white/5">
                              <span className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">Today</span>
                              <span className="font-mono text-xs font-bold text-yellow-200">{Math.floor(user.todayFocused / 60)}h {user.todayFocused % 60}m</span>
                            </div>
                            <div className="flex flex-col bg-black/20 p-1.5 rounded-md border border-white/5">
                              <span className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">Week</span>
                              <span className="font-mono text-xs font-bold text-purple-200">{Math.floor(user.last7DaysFocused / 60)}h {user.last7DaysFocused % 60}m</span>
                            </div>
                            <div className="flex flex-col bg-black/20 p-1.5 rounded-md border border-white/5">
                              <span className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">Month</span>
                              <span className="font-mono text-xs font-bold text-emerald-200">{Math.floor(user.last30DaysFocused / 60)}h {user.last30DaysFocused % 60}m</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeTab === 'users' && (
            <div className="w-full">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-4">
                <Users className="text-emerald-400" size={18} /> Users
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.map(user => (
                  <div key={user._id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-500/30 text-emerald-100 flex items-center justify-center font-bold text-base border border-emerald-400/40">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-white/90 truncate leading-tight">{user.username}</h3>
                        <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-1 pt-2 border-t border-white/10 flex justify-between text-[9px] text-white/60">
                      <div>
                        Last: <span className="text-white/90">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                      </div>
                      <div>
                        Reg: <span className="text-white/90">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '?'}</span>
                      </div>
                    </div>
                    {user.deletionScheduledAt && (
                      <div className="mt-1 p-1.5 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-[10px] leading-tight">
                        <strong>Auto-Del:</strong> {new Date(new Date(user.deletionScheduledAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotes Section */}
          {activeTab === 'quotes' && (
            <div className="w-full flex flex-col lg:flex-row gap-4 mb-10">
              <div className="w-full lg:w-1/3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <QuoteIcon className="text-purple-400" size={18} /> Quotes
                  </h2>
                  <label className="cursor-pointer p-1.5 bg-white/10 hover:bg-white/20 rounded-md border border-white/20 transition-colors">
                    <Upload size={14} />
                    <input type="file" accept=".json" className="hidden" onChange={handleQuoteJsonUpload} />
                  </label>
                </div>

                <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col gap-2">
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    placeholder="Text..."
                    rows={3}
                    className="w-full bg-black/20 border border-white/20 rounded-md px-2 py-1.5 text-xs outline-none focus:border-purple-400/50 resize-none placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    placeholder="Author"
                    className="w-full bg-black/20 border border-white/20 rounded-md px-2 py-1.5 text-xs outline-none focus:border-purple-400/50 placeholder:text-white/40"
                  />
                  <button
                    onClick={handleAddQuote}
                    disabled={isAddingQuote}
                    className="w-full py-1.5 bg-purple-500/30 text-purple-100 hover:bg-purple-500/40 disabled:opacity-50 border border-purple-400/40 font-bold rounded-md text-xs transition-all mt-1"
                  >
                    {isAddingQuote ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-2/3 flex flex-col gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2 h-[400px] sm:h-[500px]">
                <div className="flex justify-between items-center px-2 py-1 text-xs font-bold text-white/50 border-b border-white/10 pb-2">
                  <span>Database ({quotes.length})</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                  {quotes.map((q, idx) => (
                    <div key={q._id || idx} className="p-2.5 bg-black/20 border border-white/10 rounded-lg flex items-start justify-between gap-3 group hover:border-white/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/90 italic leading-snug">"{q.text}"</p>
                        <p className="text-[10px] font-bold text-purple-300 mt-1">— {q.author}</p>
                      </div>
                      <button
                        onClick={() => deleteQuote(q._id)}
                        className="p-1.5 text-red-400/50 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}