import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Users, UserPlus, Rss, LogIn, UserCircle, Search, Check, X, ShieldAlert, BarChart2, Map, Clock } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

export default function ConnectTab() {
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'requests' | 'broadcasts'>('profile');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  
  // Auth state
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPin, setAuthPin] = useState(''); // Used for OTP now
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Friends state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: string, username: string}[]>([]);
  const [friends, setFriends] = useState<{id: string, user: {id: string, username: string, lastActive?: string}}[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{id: string, user: {id: string, username: string, lastActive?: string}}[]>([]);
  const [sentRequests, setSentRequests] = useState<{id: string, user: {id: string, username: string, lastActive?: string}}[]>([]);
  const [friendStats, setFriendStats] = useState<{username: string, stats: any} | null>(null);

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState<{id: string, title: string, content: string, type: string, createdAt: string}[]>([]);
  const [broadcastSubTab, setBroadcastSubTab] = useState<'announcements' | 'roadmap'>('announcements');
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  // Feedback state
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug' | 'other'>('feature');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('dashboard_sync_token');
    const storedUsername = localStorage.getItem('dashboard_username');
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      fetchFriendsData();
    }
    fetchBroadcasts();
  }, []);

  // Poll for friends data when friends tab is active
  useEffect(() => {
    if (isLoggedIn && activeTab === 'friends') {
      fetchFriendsData();
      const interval = setInterval(fetchFriendsData, 10000); // 10s refresh
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, activeTab]);

  // Fetch roadmap when profile tab opens
  useEffect(() => {
    if (activeTab === 'profile' && isLoggedIn) {
      fetchRoadmap();
    }
    if (activeTab === 'broadcasts') {
      fetchRoadmap();
    }
  }, [activeTab, isLoggedIn]);

  const fetchFriendsData = async () => {
    const token = localStorage.getItem('dashboard_sync_token');
    if (!token) return;
    try {
      const res = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFriends(data.acceptedFriends || []);
        setPendingRequests(data.pendingRequests || []);
        setSentRequests(data.sentRequests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      const data = await res.json();
      if (res.ok && data.broadcasts) {
        setBroadcasts(data.broadcasts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const token = localStorage.getItem('dashboard_sync_token');
      const res = await fetch('/api/roadmap', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok) {
        setRoadmapItems(data.roadmap || []);
        setMySubmissions(data.mySubmissions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackLoading(true);
    setFeedbackSuccess('');
    try {
      const token = localStorage.getItem('dashboard_sync_token');
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: feedbackType, message: feedbackMsg })
      });
      if (res.ok) {
        setFeedbackMsg('');
        setFeedbackSuccess('Submitted! Check the Roadmap below to track its status.');
        fetchRoadmap(); // Refresh my submissions
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);
    
    if (authMode === 'forgot') {
      try {
        if (forgotStep === 'email') {
          const res = await fetch('/api/auth/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send_otp', email: authEmail })
          });
          const data = await res.json();
          if (res.ok) {
            setAuthSuccessMsg('OTP sent to your email! (Check spam folder)');
            setForgotStep('reset');
          } else {
            setAuthError(data.error || 'Failed to send OTP');
          }
        } else {
          const res = await fetch('/api/auth/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset_password', email: authEmail, otp: authPin, newPassword: authPassword })
          });
          const data = await res.json();
          if (res.ok) {
            setAuthSuccessMsg('Password reset successful! Please login.');
            setAuthMode('login');
            setForgotStep('email');
            setAuthPin('');
            setAuthPassword('');
          } else {
            setAuthError(data.error || 'Password reset failed');
          }
        }
      } catch (err) {
        setAuthError('Network error');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    try {
      const bodyPayload = authMode === 'register' 
        ? { username: authUsername, email: authEmail, password: authPassword }
        : { username: authUsername, password: authPassword };

      const res = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('dashboard_sync_token', data.token);
        localStorage.setItem('dashboard_username', data.username);
        
        // Persist session locally to survive Lively Wallpaper reboots
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token, username: data.username })
        });
        
        // Force a complete reload to let the dashboardStore sync perfectly with the cloud
        window.location.reload();
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('dashboard_sync_token');
    localStorage.removeItem('dashboard_token');
    localStorage.removeItem('dashboard_username');
    localStorage.removeItem('dashboard_role');
    // Clear local data as well to prevent mixing data between users
    localStorage.removeItem('dashboard-storage');
    localStorage.removeItem('dashboard_last_modified');
    
    // Clear persisted local session without awaiting so it doesn't block reload
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: null })
    }).catch(console.error);
    
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and ALL your data will be permanently deleted.')) return;
    
    const token = localStorage.getItem('dashboard_sync_token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/delete', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Your account has been deleted.');
        handleLogout();
      } else {
        alert('Failed to delete account.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting account.');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 1) return;
    const token = localStorage.getItem('dashboard_sync_token');
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSearchResults(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    const token = localStorage.getItem('dashboard_sync_token');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ receiverId })
      });
      if (res.ok) {
        alert('Friend request sent!');
        fetchFriendsData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFriendRequest = async (friendshipId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const token = localStorage.getItem('dashboard_sync_token');
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ friendshipId, status })
      });
      if (res.ok) fetchFriendsData();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    const token = localStorage.getItem('dashboard_sync_token');
    try {
      const res = await fetch(`/api/friends?id=${friendshipId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchFriendsData();
    } catch (err) {
      console.error(err);
    }
  };

  const viewFriendStats = async (friendId: string, friendUsername: string) => {
    const token = localStorage.getItem('dashboard_sync_token');
    try {
      const res = await fetch(`/api/friends/stats?friendId=${friendId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFriendStats({ username: friendUsername, stats: data.stats });
      } else {
        alert('Failed to fetch stats: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6">
        <div className="bg-black/30 p-8 rounded-2xl border border-white/10 w-full text-center shadow-xl">
          <ShieldAlert size={48} className="mx-auto text-blue-400 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Cloud Sync & Connect</h3>
          <p className="text-white/60 mb-6 text-sm">Log in or create an account to permanently backup your data to MongoDB and connect with friends.</p>
          
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {authMode === 'forgot' ? (
              <>
                {forgotStep === 'email' ? (
                  <input 
                    type="email" 
                    placeholder="Enter your registered email" 
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <>
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit OTP from email" 
                      required
                      value={authPin}
                      onChange={e => setAuthPin(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors tracking-widest text-center text-lg"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {authMode === 'register' && (
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                )}
                <input 
                  type="text" 
                  placeholder={authMode === 'login' ? "Username or Email" : "Username"} 
                  required
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                />
              </>
            )}

            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            {authSuccessMsg && <p className="text-green-400 text-sm">{authSuccessMsg}</p>}
            
            <button 
              type="submit" 
              disabled={authLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Login to Sync' : 'Create Account')}
            </button>
            
            <div className="flex flex-col gap-2 mt-2">
              {authMode !== 'login' && (
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Back to Login
                </button>
              )}
              {authMode === 'login' && (
                <>
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Need an account? Register
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Horizontal Tabs */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 pb-4 border-b border-white/10 mb-6 shrink-0">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap font-medium text-sm ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <UserCircle size={18} /> <span className="hidden sm:inline">My Profile</span><span className="sm:hidden">Profile</span>
        </button>
        <button 
          onClick={() => setActiveTab('friends')}
          className={`relative flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap font-medium text-sm ${activeTab === 'friends' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <Users size={18} /> <span className="hidden sm:inline">Friends Network</span><span className="sm:hidden">Friends</span>
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap font-medium text-sm ${activeTab === 'broadcasts' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <Rss size={18} /> <span className="hidden sm:inline">Global News</span><span className="sm:hidden">News</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-2">
        {activeTab === 'profile' && (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg border-4 border-white/10">
              {username.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-3xl font-bold mb-2">{username}</h3>
            <p className="text-green-400 font-medium flex items-center gap-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Cloud Sync Active
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-colors border border-red-500/30 font-medium"
              >
                Sign Out
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded-xl transition-colors border border-red-900/50 font-medium text-sm flex items-center gap-2"
              >
                <ShieldAlert size={16} /> Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">My Friends ({friends.length})</h4>
              {friends.length === 0 ? (
                <p className="text-white/40 italic">You haven't added any friends yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {friends.map(f => (
                    <div key={f.id} className="flex items-center justify-between bg-black/30 border border-white/10 p-3 sm:p-4 rounded-xl hover:bg-black/40 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow shrink-0">
                          {f.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg tracking-wide">{f.user.username}</span>
                          {f.user.lastActive ? (
                            <span className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                              Checked Out: {new Date(f.user.lastActive).toLocaleDateString()} at {new Date(f.user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          ) : (
                            <span className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-white/20"></span>
                              Checked Out: Unknown
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => viewFriendStats(f.user.id, f.user.username)}
                          className="px-3 sm:px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg text-sm font-bold transition-colors border border-blue-500/20 flex items-center justify-center gap-2"
                        >
                          <BarChart2 size={16} /> <span className="hidden sm:inline">View Stats</span>
                        </button>
                        <button 
                          onClick={() => removeFriend(f.id)} 
                          className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title="Remove Friend"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search by username..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-6 rounded-xl font-medium transition-colors">
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <h4 className="font-semibold mb-3 text-white/60 text-sm uppercase tracking-wider">Search Results</h4>
                <div className="flex flex-col gap-2">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg">
                      <span className="font-medium">{u.username}</span>
                      <button onClick={() => sendFriendRequest(u.id)} className="text-sm bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/30">
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5">
              <div>
                <h4 className="text-sm font-semibold mb-3 border-b border-white/10 pb-2 flex items-center gap-2 text-white/70 uppercase tracking-wider">
                  Pending Approvals <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md text-xs">{pendingRequests.length}</span>
                </h4>
                {pendingRequests.length === 0 ? (
                  <p className="text-white/40 italic text-xs">No pending requests.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pendingRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-black/40 border border-white/10 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">
                            {r.user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{r.user.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleFriendRequest(r.id, 'ACCEPTED')} className="w-10 h-10 flex items-center justify-center bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg border border-green-500/30 transition-colors">
                            <Check size={20} />
                          </button>
                          <button onClick={() => handleFriendRequest(r.id, 'REJECTED')} className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg border border-red-500/30 transition-colors">
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="opacity-60">
                <h4 className="text-xs font-semibold mb-3 border-b border-white/10 pb-2 uppercase tracking-wider">Sent Requests</h4>
                {sentRequests.length === 0 ? (
                  <p className="text-white/40 italic text-xs">No sent requests.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sentRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-xs">
                        <span>{r.user.username}</span>
                        <span className="text-white/40">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}


        {activeTab === 'broadcasts' && (
          <div className="flex flex-col gap-6">
            {/* Global Announcements */}
            <div>
              <h4 className="text-lg font-semibold mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
                <Rss className="text-orange-400" size={20} /> Global Announcements
              </h4>
              {broadcasts.length === 0 ? (
                <p className="text-white/40 italic text-center py-6">No news at the moment.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {broadcasts.map(b => (
                    <div key={b.id} className="bg-black/30 border border-white/10 p-5 rounded-xl relative overflow-hidden">
                      {b.type === 'WARNING' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                      {b.type === 'UPDATE' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                      {b.type === 'INFO' && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <h5 className="font-bold text-lg">{b.title}</h5>
                        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/70 pl-2 leading-relaxed text-sm whitespace-pre-wrap">{b.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Pipeline */}
            <div className="border-t border-white/10 pt-5">
              <h4 className="text-sm font-bold text-purple-400/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Map size={16} className="text-purple-400" />
                Feature Pipeline
                <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{roadmapItems.length} PLANNED</span>
              </h4>
              {roadmapItems.length === 0 ? (
                <p className="text-white/30 text-sm italic text-center py-4">No features in pipeline yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {roadmapItems.map((item, i) => {
                    const statusColors: Record<string, string> = {
                      planned: 'bg-white/5 border-white/10 text-white/40',
                      in_progress: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                      done: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    };
                    const statusLabels: Record<string, string> = {
                      planned: 'Planned',
                      in_progress: '🔨 In Progress',
                      done: '✅ Done'
                    };
                    return (
                      <div key={item.id} className="bg-purple-500/5 border border-purple-500/15 p-4 rounded-xl flex items-start gap-3">
                        <div className="w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-black text-xs shrink-0 mt-0.5">{i + 1}</div>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-white/90 text-sm font-semibold">{item.title}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[item.status] || statusColors.planned}`}>
                              {statusLabels[item.status] || item.status}
                            </span>
                          </div>
                          {item.description && <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Friend Stats Modal Overlay */}
      {friendStats && (() => {
        const calculateHistory = (days: number) => {
          if (!friendStats?.stats?.history) return 0;
          let total = 0;
          const today = new Date();
          for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            total += friendStats.stats.history[dateStr] || 0;
          }
          return total;
        };
        
        const formatMins = (totalMins: number) => {
          if (totalMins < 60) return `${totalMins}m`;
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
        };
        
        const todayMins = formatMins(calculateHistory(1));
        const sevenDaysMins = formatMins(calculateHistory(7));
        const monthMins = formatMins(calculateHistory(30));
        
        const allTasks = friendStats.stats?.tasks || [];
        const allDeadlines = friendStats.stats?.deadlines || [];
        const timetableGrid = friendStats.stats?.timetableGrid || {};
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const hasTimetable = weekDays.some(day => Object.values(timetableGrid[day] || {}).some(subj => subj));

        return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-300 pointer-events-auto">
          <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 w-full max-w-4xl h-[85vh] max-h-[850px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0">
              <div>
                <h4 className="font-bold text-2xl flex items-center gap-3">
                  <BarChart2 className="text-blue-400" size={28} /> {friendStats.username}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                  {friendStats.stats?.createdAt && (
                    <span className="bg-white/10 text-white/70 px-2.5 py-1 rounded-md">
                      Joined {new Date(friendStats.stats.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {friendStats.stats?.lastLogin && (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      Last Active: {new Date(friendStats.stats.lastLogin).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setFriendStats(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="relative flex-1 overflow-hidden flex flex-col">
              <ScrollableWithArrows className="p-6 flex flex-col gap-8">
              
              {/* Top Stats */}
              <div>
                <h5 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Work History</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-500/5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <span className="text-4xl font-black text-blue-400 mb-2 drop-shadow-md relative z-10">{todayMins}</span>
                    <span className="text-xs font-bold text-blue-400/50 uppercase tracking-widest relative z-10">Today</span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-purple-500/5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                    <span className="text-4xl font-black text-purple-400 mb-2 drop-shadow-md relative z-10">{sevenDaysMins}</span>
                    <span className="text-xs font-bold text-purple-400/50 uppercase tracking-widest relative z-10">7 Days</span>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    <span className="text-4xl font-black text-emerald-400 mb-2 drop-shadow-md relative z-10">{monthMins}</span>
                    <span className="text-xs font-bold text-emerald-400/50 uppercase tracking-widest relative z-10">30 Days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Task Manager */}
                <div>
                  <h5 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Tasks <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full text-[10px]">{allTasks.length}</span>
                  </h5>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                    {allTasks.length === 0 ? (
                      <p className="text-white/40 text-xs italic text-center py-4">No tasks found.</p>
                    ) : (
                      allTasks.map((t: any) => (
                        <div key={t.id} className="flex flex-col gap-2 text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/5 break-words whitespace-pre-wrap leading-relaxed">
                          <div className="flex items-start justify-between gap-2">
                            <span className={t.completed ? 'line-through text-white/40' : ''}>{t.title || t.text}</span>
                            {t.completed && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold shrink-0">Done</span>
                            )}
                          </div>
                          {(t.duration > 0 || t.timeSpent > 0) && (
                            <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium">
                              <span className="bg-white/10 px-1.5 py-0.5 rounded">
                                Time: {formatMins(t.timeSpent || 0)} / {formatMins(t.duration || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Timetable Overview */}
                <div>
                  <h5 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Timetable (Weekdays)</h5>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                    {!hasTimetable ? (
                      <p className="text-white/40 text-xs italic text-center py-4">No timetable set.</p>
                    ) : (
                      weekDays.map(day => {
                        const dayData = timetableGrid[day] || {};
                        const activeTimes = Object.entries(dayData).filter(([_, subj]) => subj);
                        if (activeTimes.length === 0) return null;
                        return (
                          <div key={day} className="flex flex-col gap-1 text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-blue-400 font-bold">{day}</span>
                            <div className="flex flex-wrap gap-1">
                              {activeTimes.map(([time, subject]) => (
                                <span key={time} className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                                  <span className="text-white/40 mr-1">{time}</span>{subject as string}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-center text-white/40 text-[10px] italic mt-auto pt-4 border-t border-white/10 shrink-0">Only public focus statistics are shared between friends.</p>
              </ScrollableWithArrows>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
