'use client';

import { useState, useEffect } from 'react';
import { Shield, Bug, Trash2, CheckCircle, RefreshCw, Radio, LogOut, Quote as QuoteIcon, Upload, Users, Trophy, Award, Search } from 'lucide-react';

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
    } catch (err) {} finally {
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
      // Add to roadmap if that status is clicked
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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden select-text">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 md:gap-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Super Admin Panel</h1>
              <p className="text-white/50 text-sm mt-1">Manage global broadcasts, users, quotes and read feature requests.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('dashboard_token');
              localStorage.removeItem('dashboard_sync_token');
              localStorage.removeItem('dashboard_role');
              localStorage.removeItem('dashboard_username');
              window.location.href = '/';
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all font-semibold text-sm text-white/70 shadow-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 pb-2">
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center justify-center md:justify-start gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'feedback' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
          >
            <Bug size={18} /> <span className="hidden sm:inline">Feedback & Bugs</span><span className="sm:hidden">Feedback</span>
          </button>
          <button 
            onClick={() => setActiveTab('broadcasts')}
            className={`flex items-center justify-center md:justify-start gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'broadcasts' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
          >
            <Radio size={18} /> <span className="hidden sm:inline">Broadcasts</span><span className="sm:hidden">Broadcasts</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-center md:justify-start gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
          >
            <Users size={18} /> <span className="hidden sm:inline">Registered Users</span><span className="sm:hidden">Users</span>
          </button>
          <button 
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center justify-center md:justify-start gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'quotes' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
          >
            <QuoteIcon size={18} /> <span className="hidden sm:inline">Quotes</span><span className="sm:hidden">Quotes</span>
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center justify-center md:justify-start gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'roadmap' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
          >
            <CheckCircle size={18} /> <span className="hidden sm:inline">Feature Pipeline</span><span className="sm:hidden">Roadmap</span>
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center justify-center md:justify-start gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'}`}
          >
            <Trophy size={18} /> <span className="hidden sm:inline">Leaderboards</span><span className="sm:hidden">Ranks</span>
          </button>
        </div>

        <div className="w-full">
          
          {/* Main Content Area - Inbox */}
          {activeTab === 'feedback' && (
          <div className="flex flex-col gap-6 w-full lg:max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bug className="text-orange-400" size={20} /> Feedback & Bug Inbox
              </h2>
              <button 
                onClick={fetchFeedback}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-400" : "text-white/60"} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {isLoading && <p className="text-white/40">Loading messages...</p>}
              {!isLoading && feedbacks.length === 0 && (
                <div className="p-8 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                  <CheckCircle size={32} className="text-green-400/50" />
                  <p className="text-white/40 font-medium">Inbox zero! No new feedback.</p>
                </div>
              )}
              
              {feedbacks.map((item) => (
                <div key={item._id} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getIconForType(item.type)}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                        {item.type}
                      </span>
                      {item.status && item.status !== 'pending' && (
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          item.status === 'reviewed' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                          item.status === 'added_to_roadmap' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                          'text-white/50 bg-black/40 border-white/5'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-white/70 bg-black/40 px-2 py-1 rounded-md border border-white/5 ml-2">
                        {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                      <button 
                        onClick={() => deleteFeedback(item._id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-white/90 leading-relaxed text-sm whitespace-pre-wrap">{item.message}</p>
                  
                  <div className="pt-3 mt-1 border-t border-white/5 flex gap-2">
                    {item.status !== 'reviewed' && (
                      <button 
                        onClick={() => updateFeedbackStatus(item._id, 'reviewed')}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded border border-blue-500/20 transition-colors"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {item.status !== 'added_to_roadmap' && (
                      <button 
                        onClick={() => updateFeedbackStatus(item._id, 'added_to_roadmap')}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors"
                      >
                        + Add to Upcoming Changes
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Sidebar - Broadcasts */}
          {activeTab === 'broadcasts' && (
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl mx-auto">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Radio className="text-pink-400" size={20} /> Broadcast Manager
            </h2>
            
            <div className="p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col gap-4">
              <p className="text-sm text-white/60">Push a global notification to all users' dashboards.</p>
              
              <input 
                type="text" 
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Broadcast Title" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500/50" 
              />
              <textarea 
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                placeholder="Message content..." 
                rows={3} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500/50 resize-none" 
              />
              
              <button 
                onClick={handleSendBroadcast}
                disabled={isBroadcasting}
                className="w-full py-2 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 disabled:opacity-50 border border-pink-500/30 font-bold rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(236,72,153,0.15)] flex justify-center items-center gap-2"
              >
                {isBroadcasting ? <RefreshCw className="animate-spin" size={16} /> : <Radio size={16} />} 
                {isBroadcasting ? 'Saving...' : (editingBroadcastId ? 'Update Broadcast' : 'Send Broadcast')}
              </button>
              {editingBroadcastId && (
                <button 
                  onClick={() => {
                    setEditingBroadcastId(null);
                    setBroadcastTitle('');
                    setBroadcastContent('');
                  }}
                  className="w-full py-2 bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Existing Broadcasts */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2">Active Broadcasts</h3>
              {broadcasts.length === 0 && <p className="text-white/40 text-sm">No broadcasts found.</p>}
              {broadcasts.map(b => (
                <div key={b.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-pink-400">{b.title}</h4>
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editBroadcast(b)} className="text-white/40 hover:text-white"><Shield size={14} /></button>
                      <button onClick={() => deleteBroadcast(b.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 whitespace-pre-wrap">{b.content}</p>
                  <span className="text-xs font-semibold text-white/60 bg-black/20 px-2 py-1 rounded-md border border-white/5 inline-block mt-2">
                    {new Date(b.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>

          </div>
          )}

          {/* Feature Pipeline / Roadmap */}
          {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl mx-auto">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="text-indigo-400" size={20} /> Feature Pipeline Manager
            </h2>
            
            <div className="p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col gap-4">
              <p className="text-sm text-white/60">Manage what features show up on the public roadmap.</p>
              
              <input 
                type="text" 
                value={roadmapTitle}
                onChange={(e) => setRoadmapTitle(e.target.value)}
                placeholder="Feature Title (e.g. [FEATURE] Dark Mode)" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500/50" 
              />
              <textarea 
                value={roadmapDesc}
                onChange={(e) => setRoadmapDesc(e.target.value)}
                placeholder="Feature description..." 
                rows={3} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500/50 resize-none" 
              />
              <select
                value={roadmapStatus}
                onChange={(e) => setRoadmapStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500/50"
              >
                <option value="planned" className="bg-[#0a0a0a] text-white">Planned</option>
                <option value="in_progress" className="bg-[#0a0a0a] text-white">In Progress</option>
                <option value="done" className="bg-[#0a0a0a] text-white">Done</option>
              </select>
              
              <button 
                onClick={handleSaveRoadmap}
                disabled={isSavingRoadmap}
                className="w-full py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50 border border-indigo-500/30 font-bold rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] flex justify-center items-center gap-2"
              >
                {isSavingRoadmap ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />} 
                {isSavingRoadmap ? 'Saving...' : (editingRoadmapId ? 'Update Feature' : 'Add Feature')}
              </button>
              {editingRoadmapId && (
                <button 
                  onClick={() => {
                    setEditingRoadmapId(null);
                    setRoadmapTitle('');
                    setRoadmapDesc('');
                    setRoadmapStatus('planned');
                  }}
                  className="w-full py-2 bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2">Current Pipeline</h3>
              {roadmaps.length === 0 && <p className="text-white/40 text-sm">No items found.</p>}
              {roadmaps.map(r => (
                <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-indigo-400">{r.title}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editRoadmap(r)} className="text-white/40 hover:text-white"><Shield size={14} /></button>
                      <button onClick={() => deleteRoadmap(r.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {r.description && <p className="text-sm text-white/70 whitespace-pre-wrap">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      r.status === 'done' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      r.status === 'in_progress' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      'text-purple-400 bg-purple-500/10 border-purple-500/20'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-white/30">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Leaderboards */}
          {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-6 w-full lg:max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="text-yellow-400" size={20} /> Leaderboards & Badges
              </h2>
              <button 
                onClick={fetchLeaderboard}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <RefreshCw size={16} className={leaderboardLoading ? "animate-spin text-blue-400" : "text-white/60"} />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-black/40 p-4 rounded-xl border border-white/10">
              <div className="flex gap-2">
                <button 
                  onClick={() => setLeaderboardFilter('today')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${leaderboardFilter === 'today' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 bg-white/5 hover:text-white/70'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setLeaderboardFilter('week')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${leaderboardFilter === 'week' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 bg-white/5 hover:text-white/70'}`}
                >
                  Last 7 Days
                </button>
                <button 
                  onClick={() => setLeaderboardFilter('month')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${leaderboardFilter === 'month' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 bg-white/5 hover:text-white/70'}`}
                >
                  Last 30 Days
                </button>
              </div>
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search user..." 
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {leaderboardLoading && leaderboardData.length === 0 ? (
              <p className="text-white/40 italic py-10 text-center">Loading leaderboard...</p>
            ) : (
              <div className="flex flex-col gap-3">
                {(() => {
                  const sortedData = [...leaderboardData].sort((a, b) => {
                    const valA = leaderboardFilter === 'today' ? a.todayFocused : leaderboardFilter === 'week' ? a.last7DaysFocused : a.last30DaysFocused;
                    const valB = leaderboardFilter === 'today' ? b.todayFocused : leaderboardFilter === 'week' ? b.last7DaysFocused : b.last30DaysFocused;
                    return valB - valA;
                  });
                  const filteredData = sortedData.filter(u => u.displayName.toLowerCase().includes(leaderboardSearch.toLowerCase()));
                  
                  if (filteredData.length === 0) {
                    return <p className="text-white/40 italic text-center py-10">No users found.</p>;
                  }

                  return filteredData.map((user, index) => {
                    const val = leaderboardFilter === 'today' ? user.todayFocused : leaderboardFilter === 'week' ? user.last7DaysFocused : user.last30DaysFocused;

                    const rankColors = ['bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 'bg-gray-300/20 text-gray-300 border-gray-300/30', 'bg-amber-700/20 text-amber-500 border-amber-700/30'];
                    const rankColor = index < 3 && val > 0 ? rankColors[index] : 'bg-white/5 text-white/50 border-white/10';

                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border bg-black/30 border-white/5 hover:bg-black/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${rankColor}`}>
                            {index + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white/90">
                              {user.displayName} <span className="text-white/30 text-xs font-mono ml-2">ID: {user.id}</span>
                            </span>
                            <div className="flex gap-2 mt-1">
                              {user.badges?.today > 0 && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">🏆 {user.badges.today} Daily</span>}
                              {user.badges?.week > 0 && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">🌟 {user.badges.week} Weekly</span>}
                              {user.badges?.month > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">👑 {user.badges.month} Monthly</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col">
                          <span className="font-mono font-bold text-lg">{Math.floor(val / 60)}h {val % 60}m</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Focused</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
          )}

        </div>

        {/* Users Section */}
        {activeTab === 'users' && (
        <div className="w-full">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Users className="text-emerald-400" size={24} /> Registered Users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 && (
              <p className="text-white/40 col-span-full text-center py-10">No users found.</p>
            )}
            {users.map(user => (
              <div key={user._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col gap-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white/90 truncate">{user.username}</h3>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40 block mb-1">Last Login</span>
                    <span className="text-white/80 font-medium text-[10px]">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">Registered</span>
                    <span className="text-white/80 font-medium text-[10px]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="px-3 py-1.5 text-xs font-mono bg-white/5 text-white/50 border border-white/10 rounded-lg">
                    ID: {user._id}
                  </span>
                </div>

                {user.deletionScheduledAt && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                    <strong>Pending Auto-Deletion:</strong> Scheduled for {new Date(new Date(user.deletionScheduledAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    <br/>
                    Reason: {user.deletionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Quotes Section */}
        {activeTab === 'quotes' && (
        <div className="w-full mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <QuoteIcon className="text-purple-400" size={24} /> Quotes Manager
            </h2>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                <Upload size={16} /> Bulk Upload JSON
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleQuoteJsonUpload} 
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-4">
                <h3 className="font-bold text-purple-400">Add New Quote</h3>
                <textarea 
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Quote text..." 
                  rows={4} 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50 resize-none" 
                />
                <input 
                  type="text" 
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="Author name" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50" 
                />
                <button 
                  onClick={handleAddQuote}
                  disabled={isAddingQuote}
                  className="w-full py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 border border-purple-500/30 font-bold rounded-lg text-sm transition-all"
                >
                  {isAddingQuote ? 'Adding...' : 'Add Quote'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[500px]">
                <div className="p-4 border-b border-white/10 shrink-0 bg-white/5 flex items-center justify-between rounded-t-2xl">
                  <h3 className="font-bold text-white/90 flex items-center gap-2">
                    <QuoteIcon size={18} className="text-purple-400" /> Database Quotes
                  </h3>
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-md font-bold">{quotes.length} Total</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
                  {quotes.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/30 italic">
                      <QuoteIcon size={32} className="mb-2 opacity-20" />
                      <p>No custom quotes added yet.</p>
                    </div>
                  )}
                  {quotes.map((q, idx) => (
                    <div 
                      key={q._id || idx} 
                      className="p-4 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/10 rounded-xl transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 italic leading-relaxed break-words">"{q.text}"</p>
                        <p className="text-xs font-bold text-purple-400 mt-2">— {q.author}</p>
                      </div>
                      <button 
                        onClick={() => deleteQuote(q._id)}
                        className="shrink-0 p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 bg-white/5 border border-white/5 hover:border-red-500/20 rounded-lg transition-all"
                        title="Delete Quote"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
