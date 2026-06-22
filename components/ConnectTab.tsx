import React, { useState, useEffect } from 'react';
import { useDashboardStore, setAuthTransition } from '@/store/dashboardStore';
import { Users, UserPlus, Rss, LogIn, UserCircle, Search, Check, X, ShieldAlert, BarChart2, Map, Clock, Trophy, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

interface ConnectTabProps {
  friendStats: { username: string, stats: any } | null;
  setFriendStats: (stats: { username: string, stats: any } | null) => void;
}

export default function ConnectTab({ friendStats, setFriendStats }: ConnectTabProps) {
  const { history, tasks, timetableGrid } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'requests' | 'broadcasts' | 'leaderboard'>('profile');
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
  const [searchResults, setSearchResults] = useState<{ id: string, username: string }[]>([]);
  const [friends, setFriends] = useState<{ id: string, user: { id: string, username: string, lastActive?: string } }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: string, user: { id: string, username: string, lastActive?: string } }[]>([]);
  const [sentRequests, setSentRequests] = useState<{ id: string, user: { id: string, username: string, lastActive?: string } }[]>([]);

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState<{ id: string, title: string, content: string, type: string, createdAt: string }[]>([]);
  const [broadcastSubTab, setBroadcastSubTab] = useState<'announcements' | 'roadmap'>('announcements');
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  // Feedback state
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug' | 'other'>('feature');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Leaderboard & Alias state
  const [alias, setAlias] = useState('');
  const [aliasLoading, setAliasLoading] = useState(false);
  const [isAliasUnlocked, setIsAliasUnlocked] = useState(false);
  const [aliasPassword, setAliasPassword] = useState('');
  const [aliasUnlockLoading, setAliasUnlockLoading] = useState(false);
  const [aliasUnlockError, setAliasUnlockError] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePictureLoading, setProfilePictureLoading] = useState(false);
  
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'today' | 'week' | 'month'>('today');
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [expandedLeaderboardUserId, setExpandedLeaderboardUserId] = useState<string | null>(null);

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
      fetchProfile();
    }
    if (activeTab === 'broadcasts') {
      fetchRoadmap();
    }
    if (activeTab === 'leaderboard' && isLoggedIn) {
      fetchLeaderboard();
    }
  }, [activeTab, isLoggedIn]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('dashboard_sync_token');
      const res = await fetch('/api/users', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.users) {
        const storedUsername = localStorage.getItem('dashboard_username');
        const me = data.users.find((u: any) => u.username === storedUsername);
        if (me) {
          if (me.alias) setAlias(me.alias);
          if (me.profilePicture) setProfilePicture(me.profilePicture);
        }
      }
    } catch (err) {}
  };

  const updateProfilePicture = async (url: string) => {
    setProfilePictureLoading(true);
    try {
      const token = localStorage.getItem('dashboard_sync_token');
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ profilePicture: url })
      });
      if (res.ok) {
        setProfilePicture(url);
      }
    } catch (err) {}
    setProfilePictureLoading(false);
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const token = localStorage.getItem('dashboard_sync_token');
      const res = await fetch('/api/leaderboard', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      }
    } catch (e) {
    } finally {
      setLeaderboardLoading(false);
    }
  };

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
      setAuthTransition(true); // Stop any saves from old session!
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
    setAuthTransition(true); // Stop any saves from old session!
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

  const viewMyStats = () => {
    const state = useDashboardStore.getState();
    setFriendStats({
      username: `${username} (Me)`,
      stats: {
        history: state.history || {},
        tasks: state.tasks || [],
        deadlines: state.deadlines || [],
        timetableGrid: state.timetableGrid || {},
        createdAt: localStorage.getItem('dashboard_created_at') || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    });
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
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap font-medium text-sm ${activeTab === 'leaderboard' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <Trophy size={18} /> <span className="hidden sm:inline">Leaderboard</span><span className="sm:hidden">Rankings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-2">
        {activeTab === 'profile' && (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg border-4 border-white/10 overflow-hidden shrink-0">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="text-3xl font-bold mb-2">{username}</h3>
            <p className="text-green-400 font-medium flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Cloud Sync Active
            </p>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl w-full mb-4 text-left shadow-lg">
              <label className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <UserCircle size={16} className="text-blue-400" /> Profile Picture URL
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={profilePicture}
                    onChange={e => setProfilePicture(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => updateProfilePicture(profilePicture)}
                    disabled={profilePictureLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    {profilePictureLoading ? 'Saving...' : 'Update'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove your profile picture?')) {
                        updateProfilePicture('');
                      }
                    }}
                    disabled={profilePictureLoading || !profilePicture}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl w-full mb-6 text-left shadow-lg">
              <label className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <ShieldAlert size={16} className={isAliasUnlocked ? "text-green-400" : "text-yellow-400"} /> Anonymous Alias
              </label>
              
              {!isAliasUnlocked ? (
                <div className="flex flex-col gap-2">
                  <p className="text-white/40 text-xs mb-1">Your alias is password-protected to ensure friends looking at your screen cannot see it.</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter dashboard password"
                      value={aliasPassword}
                      onChange={e => setAliasPassword(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors text-sm"
                    />
                    <button
                      onClick={async () => {
                        setAliasUnlockLoading(true);
                        setAliasUnlockError('');
                        try {
                          const res = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password: aliasPassword })
                          });
                          if (res.ok) {
                            setIsAliasUnlocked(true);
                            setAliasPassword('');
                          } else {
                            setAliasUnlockError('Incorrect password');
                          }
                        } catch (err) {
                          setAliasUnlockError('Network error');
                        } finally {
                          setAliasUnlockLoading(false);
                        }
                      }}
                      disabled={aliasUnlockLoading || !aliasPassword}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                    >
                      {aliasUnlockLoading ? '...' : 'Unlock'}
                    </button>
                  </div>
                  {aliasUnlockError && <p className="text-red-400 text-xs">{aliasUnlockError}</p>}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter alias for leaderboard"
                      value={alias}
                      onChange={e => setAlias(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-green-500 transition-colors"
                    />
                    <button
                      onClick={async () => {
                        setAliasLoading(true);
                        const token = localStorage.getItem('dashboard_sync_token');
                        await fetch('/api/users', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ alias })
                        });
                        setAliasLoading(false);
                      }}
                      disabled={aliasLoading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      {aliasLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <p className="text-white/40 text-xs mt-1">This name appears on the global leaderboard. Friends will still see your real name.</p>
                  <button 
                    onClick={() => setIsAliasUnlocked(false)}
                    className="text-white/30 hover:text-white/60 text-xs mt-2 underline underline-offset-2 self-start"
                  >
                    Lock Alias Settings
                  </button>
                </div>
              )}
            </div>

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
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h4 className="text-lg font-semibold">My Friends ({friends.length})</h4>
                <button
                  onClick={viewMyStats}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-500/20 flex items-center justify-center gap-1.5 animate-pulse"
                >
                  <BarChart2 size={14} /> View My Stats
                </button>
              </div>
              {friends.length === 0 ? (
                <p className="text-white/40 italic">You haven't added any friends yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {friends.map(f => (
                    <div key={f.id} className="flex items-center justify-between bg-black/30 border border-white/10 p-3 sm:p-4 rounded-xl hover:bg-black/40 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow shrink-0 overflow-hidden border border-white/10">
                          {f.user.profilePicture ? <img src={f.user.profilePicture} alt="" className="w-full h-full object-cover" /> : f.user.username.charAt(0).toUpperCase()}
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
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-white/10">
                          {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.username}</span>
                      </div>
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
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden border border-white/10">
                            {r.user.profilePicture ? <img src={r.user.profilePicture} alt="" className="w-full h-full object-cover" /> : r.user.username.charAt(0).toUpperCase()}
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

        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-4">
              <h4 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="text-yellow-400" size={24} /> Global Leaderboard
              </h4>
              <button
                onClick={fetchLeaderboard}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <RefreshCw size={16} className={leaderboardLoading ? "animate-spin text-blue-400" : "text-white/60"} />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-2 bg-black/40 p-1 rounded-xl w-full border border-white/10 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-fit overflow-x-auto">
                <button 
                  onClick={() => setLeaderboardFilter('today')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${leaderboardFilter === 'today' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 hover:text-white/70'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setLeaderboardFilter('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${leaderboardFilter === 'week' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 hover:text-white/70'}`}
                >
                  Last 7 Days
                </button>
                <button 
                  onClick={() => setLeaderboardFilter('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${leaderboardFilter === 'month' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 hover:text-white/70'}`}
                >
                  Last 30 Days
                </button>
              </div>
              
              <div className="relative w-full sm:w-48 px-1 sm:px-0">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search user..." 
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {leaderboardLoading && leaderboardData.length === 0 ? (
              <p className="text-white/40 italic text-center py-10">Loading leaderboard...</p>
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
                    
                    const isTop3 = index < 3 && val > 0;
                    const rankColors = ['bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]', 'bg-gray-300/20 text-gray-300 border-gray-300/30', 'bg-amber-700/20 text-amber-500 border-amber-700/30'];
                    const rankColor = isTop3 ? rankColors[index] : 'bg-white/5 text-white/50 border-white/10';

                    return (
                      <div key={user.id} className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all ${user.isMe ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] scale-[1.02]' : 'bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/10'}`}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg border shrink-0 ${rankColor}`}>
                              {index + 1}
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm sm:text-base shrink-0 overflow-hidden border border-white/10">
                              {user.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : user.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`font-bold text-base sm:text-lg tracking-wide truncate ${user.isMe ? 'text-blue-400' : 'text-white/90'}`}>
                                {user.displayName}
                              </span>
                              <div className="flex gap-1.5 mt-1 flex-wrap">
                                {user.badges?.today > 0 && <span className="text-[9px] sm:text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-md border border-yellow-500/20 font-bold tracking-wider">🏆 {user.badges.today} Daily</span>}
                                {user.badges?.week > 0 && <span className="text-[9px] sm:text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-md border border-purple-500/20 font-bold tracking-wider">🌟 {user.badges.week} Weekly</span>}
                                {user.badges?.month > 0 && <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20 font-bold tracking-wider">👑 {user.badges.month} Monthly</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2 sm:gap-4 shrink-0">
                            <div className="flex flex-col items-end justify-center">
                              <span className="font-mono font-bold text-lg sm:text-xl md:text-2xl tracking-tighter text-white/90">{Math.floor(val / 60)}<span className="text-xs sm:text-sm text-white/40 mr-0.5 sm:mr-1">h</span>{val % 60}<span className="text-xs sm:text-sm text-white/40">m</span></span>
                              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-semibold">Focused</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setExpandedLeaderboardUserId(expandedLeaderboardUserId === user.id ? null : user.id)}
                              className="p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20 text-white/50 hover:text-white shrink-0"
                            >
                              {expandedLeaderboardUserId === user.id ? <ChevronUp size={18} className="sm:w-5 sm:h-5" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Time Stats */}
                        {expandedLeaderboardUserId === user.id && (
                          <div className="w-full mt-2 pt-3 border-t border-white/10 grid grid-cols-3 gap-3 text-center animate-fade-in">
                            <div className="flex flex-col bg-black/20 p-2 rounded-lg border border-white/5">
                              <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Today</span>
                              <span className="font-mono text-sm md:text-base font-bold text-yellow-300">{Math.floor(user.todayFocused / 60)}h {user.todayFocused % 60}m</span>
                            </div>
                            <div className="flex flex-col bg-black/20 p-2 rounded-lg border border-white/5">
                              <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Week</span>
                              <span className="font-mono text-sm md:text-base font-bold text-purple-300">{Math.floor(user.last7DaysFocused / 60)}h {user.last7DaysFocused % 60}m</span>
                            </div>
                            <div className="flex flex-col bg-black/20 p-2 rounded-lg border border-white/5">
                              <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Month</span>
                              <span className="font-mono text-sm md:text-base font-bold text-emerald-300">{Math.floor(user.last30DaysFocused / 60)}h {user.last30DaysFocused % 60}m</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
