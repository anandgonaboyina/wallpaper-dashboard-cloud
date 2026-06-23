'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardStore, setAuthTransition } from '@/store/dashboardStore';
import { Users, UserPlus, Rss, LogIn, UserCircle, Search, Check, X, ShieldAlert, BarChart2, Map, Clock, Trophy, RefreshCw, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

interface ConnectTabProps {
  friendStats: { username: string, stats: any } | null;
  setFriendStats: (stats: { username: string, stats: any } | null) => void;
}

export default function ConnectTab({ friendStats, setFriendStats }: ConnectTabProps) {
  const { history, tasks, timetableGrid } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'requests' | 'broadcasts' | 'leaderboard'>('profile');
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Auth state
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Friends state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string, username: string, profilePicture?: string }[]>([]);
  const [friends, setFriends] = useState<{ id: string, user: { id: string, username: string, lastActive?: string, profilePicture?: string } }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: string, user: { id: string, username: string, lastActive?: string, profilePicture?: string } }[]>([]);
  const [sentRequests, setSentRequests] = useState<{ id: string, user: { id: string, username: string, lastActive?: string, profilePicture?: string } }[]>([]);

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState<{ id: string, title: string, content: string, type: string, createdAt: string }[]>([]);
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

  useEffect(() => {
    if (isLoggedIn && activeTab === 'friends') {
      fetchFriendsData();
      const interval = setInterval(fetchFriendsData, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, activeTab]);

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

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    setIsMobileDetailView(true);
  };

  const fetchProfile = async () => {
    const cachedAlias = localStorage.getItem('dashboard_alias');
    const cachedPic = localStorage.getItem('dashboard_profile_picture');
    if (cachedAlias) setAlias(cachedAlias);
    if (cachedPic) setProfilePicture(cachedPic);

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
          if (me.alias) {
            setAlias(me.alias);
            localStorage.setItem('dashboard_alias', me.alias);
          }
          if (me.profilePicture) {
            setProfilePicture(me.profilePicture);
            localStorage.setItem('dashboard_profile_picture', me.profilePicture);
          } else {
            localStorage.removeItem('dashboard_profile_picture');
            setProfilePicture('');
          }
        }
      }
    } catch (err) { }
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
        if (url) {
          localStorage.setItem('dashboard_profile_picture', url);
        } else {
          localStorage.removeItem('dashboard_profile_picture');
        }
      }
    } catch (err) { }
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
    } catch (err) { }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      const data = await res.json();
      if (res.ok && data.broadcasts) {
        setBroadcasts(data.broadcasts);
      }
    } catch (err) { }
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
    } catch (err) { }
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
            setAuthSuccessMsg('OTP sent to your email! (Check spam)');
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
            setAuthSuccessMsg('Password reset! Please login.');
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
      setAuthTransition(true);
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

        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token, username: data.username })
        }).catch(console.error);

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
    setAuthTransition(true);
    localStorage.removeItem('dashboard_sync_token');
    localStorage.removeItem('dashboard_token');
    localStorage.removeItem('dashboard_username');
    localStorage.removeItem('dashboard_role');
    localStorage.removeItem('dashboard-storage');
    localStorage.removeItem('dashboard_last_modified');

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
    } catch (err) { }
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
    } catch (err) { }
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
    } catch (err) { }
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
    } catch (err) { }
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
    } catch (err) { }
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
      <div className="flex flex-col items-center justify-center h-full w-full max-w-[280px] md:max-w-md mx-auto p-2 md:p-6 overflow-hidden">
        <div className="bg-black/30 p-4 md:p-8 rounded-xl md:rounded-2xl border border-white/10 w-full text-center shadow-xl">
          <ShieldAlert className="mx-auto text-blue-400 w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
          <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2">Cloud Sync & Connect</h3>
          <p className="text-white/60 mb-4 md:mb-6 text-[9px] md:text-sm">Log in to backup data and connect.</p>

          <form onSubmit={handleAuth} className="flex flex-col gap-2.5 md:gap-4">
            {authMode === 'forgot' ? (
              <>
                {forgotStep === 'email' ? (
                  <input
                    type="email"
                    placeholder="Enter email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-md md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-sm"
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="6-digit OTP"
                      required
                      value={authPin}
                      onChange={e => setAuthPin(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-md md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3 outline-none focus:border-blue-500 transition-colors tracking-widest text-center text-xs md:text-lg"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-md md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-sm"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {authMode === 'register' && (
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-md md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-sm"
                  />
                )}
                <input
                  type="text"
                  placeholder={authMode === 'login' ? "Username/Email" : "Username"}
                  required
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-md md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-md md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-sm"
                />
              </>
            )}

            {authError && <p className="text-red-400 text-[9px] md:text-sm">{authError}</p>}
            {authSuccessMsg && <p className="text-green-400 text-[9px] md:text-sm">{authSuccessMsg}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 md:py-3 rounded-md md:rounded-xl transition-colors mt-1 md:mt-2 text-[10px] md:text-base"
            >
              {authLoading ? 'Wait...' : (authMode === 'login' ? 'Login' : 'Register')}
            </button>

            <div className="flex flex-col gap-1 md:gap-2 mt-1 md:mt-2">
              {authMode !== 'login' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                  className="text-blue-400 hover:text-blue-300 text-[9px] md:text-sm transition-colors"
                >
                  Back to Login
                </button>
              )}
              {authMode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-blue-400 hover:text-blue-300 text-[9px] md:text-sm transition-colors"
                  >
                    Need an account? Register
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setAuthError(''); }}
                    className="text-white/40 hover:text-white/60 text-[9px] md:text-sm transition-colors"
                  >
                    Forgot Password?
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
    <div className="flex flex-col w-full h-full min-w-0 overflow-x-hidden">

      {/* Horizontal Tabs / Vertical Mobile List */}
      <div className={`${isMobileDetailView ? 'hidden md:flex' : 'flex'} flex-col md:flex-row md:flex-wrap gap-1.5 md:gap-2 pb-2 md:pb-4 border-b border-white/10 mb-2 md:mb-6 shrink-0`}>
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl transition-colors whitespace-nowrap font-medium text-[10px] md:text-sm ${activeTab === 'profile' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-black/40 md:bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <UserCircle className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /> Profile
        </button>
        <button
          onClick={() => handleTabClick('friends')}
          className={`relative flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl transition-colors whitespace-nowrap font-medium text-[10px] md:text-sm ${activeTab === 'friends' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-black/40 md:bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <Users className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /> Friends Network
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center rounded-full animate-bounce">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabClick('broadcasts')}
          className={`flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl transition-colors whitespace-nowrap font-medium text-[10px] md:text-sm ${activeTab === 'broadcasts' && !isMobileDetailView ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-black/40 md:bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <Rss className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /> Global News
        </button>
        <button
          onClick={() => handleTabClick('leaderboard')}
          className={`flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl transition-colors whitespace-nowrap font-medium text-[10px] md:text-sm ${activeTab === 'leaderboard' && !isMobileDetailView ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-black/40 md:bg-white/5 hover:bg-white/10 text-white/70'}`}
        >
          <Trophy className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /> Leaderboard
        </button>
      </div>

      {/* Tab Content Wrapper */}
      <div className={`${isMobileDetailView ? 'flex' : 'hidden md:flex'} flex-col gap-2 min-w-0 w-full`}>

        {/* Mobile Back Button */}
        {isMobileDetailView && (
          <button
            onClick={() => setIsMobileDetailView(false)}
            className="md:hidden flex items-center gap-1 text-white/80 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-md w-fit mb-1 text-[10px] font-medium transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={14} /> Back to Menu
          </button>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-sm md:max-w-md mx-auto">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl md:text-4xl font-bold mb-2 md:mb-4 shadow-lg border-2 md:border-4 border-white/10 overflow-hidden shrink-0">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 truncate w-full text-center px-2">{username}</h3>
            <p className="text-green-400 font-medium flex items-center justify-center gap-1.5 mb-3 md:mb-2 text-[10px] md:text-base">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse"></span>
              Cloud Sync Active
            </p>

            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-[8px] md:text-xs text-center p-2 md:p-3 rounded-lg md:rounded-xl mb-3 md:mb-6 shadow-sm w-full">
              <span className="font-bold flex items-center justify-center gap-1 md:gap-1.5 mb-0.5 md:mb-1"><ShieldAlert size={12} className="md:w-[14px] md:h-[14px]" /> Attention</span>
              Accounts without login activity for 90 days are <strong className="text-red-400">permanently deleted</strong>. Export notes!
            </div>

            {/* Profile Pic Settings */}
            <div className="bg-white/5 border border-white/10 p-2.5 md:p-4 rounded-lg md:rounded-xl w-full mb-3 md:mb-4 text-left shadow-lg">
              <label className="text-[10px] md:text-sm font-semibold text-white/70 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <UserCircle className="text-blue-400 w-3.5 h-3.5 md:w-4 md:h-4" /> Profile Picture URL
              </label>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex gap-2 w-full min-w-0">
                  <input
                    type="url"
                    placeholder="https://.../img.png"
                    value={profilePicture}
                    onChange={e => setProfilePicture(e.target.value)}
                    className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-md md:rounded-lg px-2 py-1.5 md:px-3 md:py-2 outline-none focus:border-blue-500 transition-colors text-[9px] md:text-sm"
                  />
                </div>
                <div className="flex gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                  <button
                    onClick={() => updateProfilePicture(profilePicture)}
                    disabled={profilePictureLoading}
                    className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md md:rounded-lg transition-colors font-medium text-[9px] md:text-sm"
                  >
                    {profilePictureLoading ? 'Wait...' : 'Update'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Remove profile picture?')) updateProfilePicture('');
                    }}
                    disabled={profilePictureLoading || !profilePicture}
                    className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-md md:rounded-lg transition-colors font-medium text-[9px] md:text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Alias Settings */}
            <div className="bg-white/5 border border-white/10 p-2.5 md:p-4 rounded-lg md:rounded-xl w-full mb-4 md:mb-6 text-left shadow-lg">
              <label className="text-[10px] md:text-sm font-semibold text-white/70 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <ShieldAlert className={`${isAliasUnlocked ? "text-green-400" : "text-yellow-400"} w-3.5 h-3.5 md:w-4 md:h-4`} /> Anonymous Alias
              </label>

              {!isAliasUnlocked ? (
                <div className="flex flex-col gap-1.5 md:gap-2">
                  <p className="text-white/40 text-[8px] md:text-xs mb-0.5 md:mb-1 leading-tight">Alias requires password to unlock to hide from shoulder-surfers.</p>
                  <div className="flex gap-1.5 md:gap-2">
                    <input
                      type="password"
                      placeholder="Password"
                      value={aliasPassword}
                      onChange={e => setAliasPassword(e.target.value)}
                      className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-md md:rounded-lg px-2 py-1.5 md:px-3 md:py-2 outline-none focus:border-yellow-500 transition-colors text-[9px] md:text-sm"
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
                            setAliasUnlockError('Incorrect');
                          }
                        } catch (err) {
                          setAliasUnlockError('Error');
                        } finally {
                          setAliasUnlockLoading(false);
                        }
                      }}
                      disabled={aliasUnlockLoading || !aliasPassword}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-md md:rounded-lg transition-colors font-medium text-[9px] md:text-sm disabled:opacity-50"
                    >
                      {aliasUnlockLoading ? '...' : 'Unlock'}
                    </button>
                  </div>
                  {aliasUnlockError && <p className="text-red-400 text-[8px] md:text-xs">{aliasUnlockError}</p>}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 md:gap-2">
                  <div className="flex gap-1.5 md:gap-2 w-full min-w-0">
                    <input
                      type="text"
                      placeholder="Leaderboard alias"
                      value={alias}
                      onChange={e => setAlias(e.target.value)}
                      className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-md md:rounded-lg px-2 py-1.5 md:px-3 md:py-2 outline-none focus:border-green-500 transition-colors text-[9px] md:text-sm"
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
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-green-500 hover:bg-green-600 text-white rounded-md md:rounded-lg transition-colors font-medium text-[9px] md:text-sm"
                    >
                      {aliasLoading ? 'Wait' : 'Save'}
                    </button>
                  </div>
                  <p className="text-white/40 text-[8px] md:text-xs mt-0.5 md:mt-1 leading-tight">Shown on leaderboard. Friends see real name.</p>
                  <button
                    onClick={() => setIsAliasUnlocked(false)}
                    className="text-white/30 hover:text-white/60 text-[8px] md:text-xs mt-1 md:mt-2 underline underline-offset-2 self-start"
                  >
                    Lock Settings
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 md:gap-4 w-full justify-center">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 md:px-6 md:py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg md:rounded-xl transition-colors border border-red-500/30 font-medium text-[10px] md:text-base"
              >
                Sign Out
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-3 py-1.5 md:px-6 md:py-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded-lg md:rounded-xl transition-colors border border-red-900/50 font-medium text-[10px] md:text-sm flex items-center gap-1.5 md:gap-2 whitespace-nowrap"
              >
                <ShieldAlert className="w-3 h-3 md:w-4 md:h-4" /> Delete Acc
              </button>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="flex flex-col gap-4 md:gap-6 min-w-0 w-full">
            <div className="min-w-0 w-full">
              <div className="flex items-center justify-between mb-2 md:mb-4 border-b border-white/10 pb-1.5 md:pb-2">
                <h4 className="text-[11px] md:text-lg font-semibold truncate pr-2">My Friends ({friends.length})</h4>
                <button
                  onClick={viewMyStats}
                  className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-md md:rounded-lg text-[9px] md:text-xs font-bold transition-colors border border-blue-500/20 flex items-center justify-center gap-1 md:gap-1.5 animate-pulse shrink-0 whitespace-nowrap"
                >
                  <BarChart2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> My Stats
                </button>
              </div>
              {friends.length === 0 ? (
                <p className="text-white/40 italic text-[9px] md:text-base">No friends added.</p>
              ) : (
                <div className="flex flex-col gap-2 md:gap-3 w-full min-w-0">
                  {friends.map(f => (
                    <div key={f.id} className="flex items-center justify-between bg-black/30 border border-white/10 p-2 md:p-4 rounded-lg md:rounded-xl hover:bg-black/40 transition-colors group min-w-0 w-full gap-2">
                      <div className="flex items-center gap-2 md:gap-4 min-w-0 overflow-hidden">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-lg border border-white/10 shrink-0 overflow-hidden">
                          {f.user.profilePicture ? <img src={f.user.profilePicture} alt="" className="w-full h-full object-cover" /> : f.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0 overflow-hidden pr-1">
                          <span className="font-bold text-xs md:text-lg tracking-wide truncate w-full">{f.user.username}</span>
                          {f.user.lastActive ? (
                            <span className="text-[8px] md:text-xs text-white/70 flex items-center gap-1 md:gap-1.5 mt-0.5 truncate w-full">
                              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">Out: {new Date(f.user.lastActive).toLocaleDateString()}</span>
                            </span>
                          ) : (
                            <span className="text-[8px] md:text-xs text-white/40 flex items-center gap-1 md:gap-1.5 mt-0.5 truncate w-full">
                              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/20 shrink-0"></span>
                              <span className="truncate">Out: Unknown</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                        <button
                          onClick={() => viewFriendStats(f.user.id, f.user.username)}
                          className="px-2 py-1 md:px-4 md:py-2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20 flex items-center justify-center gap-1 md:gap-2 text-[9px] md:text-sm font-bold"
                        >
                          <BarChart2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Stats</span>
                        </button>
                        <button
                          onClick={() => removeFriend(f.id)}
                          className="text-red-400/70 hover:text-red-400 p-1 md:p-2 rounded border border-transparent hover:border-red-500/20 shrink-0"
                        >
                          <X className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex gap-1.5 md:gap-2 w-full min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-white/40 w-3 h-3 md:w-[18px] md:h-[18px]" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-md md:rounded-xl pl-7 md:pl-10 pr-2 md:pr-4 py-1.5 md:py-3 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-sm"
                />
              </div>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-3 md:px-6 rounded-md md:rounded-xl font-medium transition-colors text-[10px] md:text-base shrink-0">
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="bg-white/5 rounded-lg md:rounded-xl border border-white/10 p-2.5 md:p-4 w-full min-w-0">
                <h4 className="font-semibold mb-2 md:mb-3 text-white/60 text-[9px] md:text-sm uppercase tracking-wider">Search Results</h4>
                <div className="flex flex-col gap-1.5 md:gap-2 w-full min-w-0">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-black/40 p-2 md:p-3 rounded-md md:rounded-lg min-w-0 gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 pr-1">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm shrink-0 border border-white/10 overflow-hidden">
                          {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[10px] md:text-base truncate">{u.username}</span>
                      </div>
                      <button onClick={() => sendFriendRequest(u.id)} className="bg-blue-500/20 text-blue-400 px-2 py-1 md:px-3 md:py-1.5 rounded border border-blue-500/30 text-[9px] md:text-sm whitespace-nowrap shrink-0">
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 bg-black/20 p-2.5 md:p-5 rounded-lg md:rounded-2xl border border-white/5 w-full min-w-0">
              <div className="min-w-0 w-full">
                <h4 className="text-[10px] md:text-sm font-semibold mb-2 md:mb-3 border-b border-white/10 pb-1.5 md:pb-2 flex items-center gap-1.5 md:gap-2 text-white/70 uppercase tracking-wider truncate">
                  Approvals <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[8px] md:text-xs">{pendingRequests.length}</span>
                </h4>
                {pendingRequests.length === 0 ? (
                  <p className="text-white/40 italic text-[9px] md:text-xs">No pending requests.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 md:gap-3 min-w-0 w-full">
                    {pendingRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-black/40 border border-white/10 p-2 md:p-3 rounded-md md:rounded-xl min-w-0 gap-2">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 pr-1">
                          <div className="w-6 h-6 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center font-bold shrink-0 border border-white/10 overflow-hidden text-[10px] md:text-base">
                            {r.user.profilePicture ? <img src={r.user.profilePicture} alt="" className="w-full h-full object-cover" /> : r.user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[10px] md:text-base truncate">{r.user.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                          <button onClick={() => handleFriendRequest(r.id, 'ACCEPTED')} className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center bg-green-500/20 text-green-400 rounded border border-green-500/30">
                            <Check className="w-3.5 h-3.5 md:w-5 md:h-5" />
                          </button>
                          <button onClick={() => handleFriendRequest(r.id, 'REJECTED')} className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center bg-red-500/20 text-red-400 rounded border border-red-500/30">
                            <X className="w-3.5 h-3.5 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="opacity-60 min-w-0 w-full mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                <h4 className="text-[10px] md:text-xs font-semibold mb-2 md:mb-3 border-b border-white/10 pb-1.5 md:pb-2 uppercase tracking-wider truncate">Sent Requests</h4>
                {sentRequests.length === 0 ? (
                  <p className="text-white/40 italic text-[9px] md:text-xs">No sent requests.</p>
                ) : (
                  <div className="flex flex-col gap-1 md:gap-2 min-w-0 w-full">
                    {sentRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-black/20 p-1.5 md:p-2 rounded text-[9px] md:text-xs min-w-0 gap-2">
                        <span className="truncate min-w-0 flex-1">{r.user.username}</span>
                        <span className="text-white/40 shrink-0 pl-2">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Broadcasts Tab */}
        {activeTab === 'broadcasts' && (
          <div className="flex flex-col gap-4 md:gap-6 min-w-0 w-full">
            {/* Global Announcements */}
            <div className="min-w-0 w-full">
              <h4 className="text-[11px] md:text-lg font-semibold mb-2 md:mb-3 border-b border-white/10 pb-1.5 md:pb-2 flex items-center gap-1.5 md:gap-2">
                <Rss className="text-orange-400 w-3.5 h-3.5 md:w-5 md:h-5" /> Announcements
              </h4>
              {broadcasts.length === 0 ? (
                <p className="text-white/40 italic text-center py-4 md:py-6 text-[9px] md:text-base">No news at the moment.</p>
              ) : (
                <div className="flex flex-col gap-2.5 md:gap-4 w-full min-w-0">
                  {broadcasts.map(b => (
                    <div key={b.id} className="bg-black/30 border border-white/10 p-2.5 md:p-5 rounded-lg md:rounded-xl relative overflow-hidden min-w-0 w-full">
                      {b.type === 'WARNING' && <div className="absolute top-0 left-0 w-0.5 md:w-1 h-full bg-red-500"></div>}
                      {b.type === 'UPDATE' && <div className="absolute top-0 left-0 w-0.5 md:w-1 h-full bg-blue-500"></div>}
                      {b.type === 'INFO' && <div className="absolute top-0 left-0 w-0.5 md:w-1 h-full bg-green-500"></div>}
                      <div className="flex justify-between items-start mb-1 md:mb-2 pl-1.5 md:pl-2 gap-2">
                        <h5 className="font-bold text-[11px] md:text-lg truncate">{b.title}</h5>
                        <span className="text-[8px] md:text-xs text-white/40 bg-white/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded shrink-0">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/70 pl-1.5 md:pl-2 leading-relaxed text-[9px] md:text-sm whitespace-pre-wrap break-words">{b.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Pipeline */}
            <div className="border-t border-white/10 pt-3 md:pt-5 min-w-0 w-full">
              <h4 className="text-[10px] md:text-sm font-bold text-purple-400/80 uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                <Map className="text-purple-400 w-3.5 h-3.5 md:w-4 md:h-4" />
                Pipeline
                <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full text-[8px] md:text-[10px] font-bold">{roadmapItems.length} PLAN</span>
              </h4>
              {roadmapItems.length === 0 ? (
                <p className="text-white/30 text-[9px] md:text-sm italic text-center py-2 md:py-4">No features in pipeline.</p>
              ) : (
                <div className="flex flex-col gap-2 md:gap-3 w-full min-w-0">
                  {roadmapItems.map((item, i) => {
                    const statusColors: Record<string, string> = {
                      planned: 'bg-white/5 border-white/10 text-white/40',
                      in_progress: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                      done: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    };
                    const statusLabels: Record<string, string> = {
                      planned: 'Plan', in_progress: '🔨 WIP', done: '✅ Done'
                    };
                    return (
                      <div key={item.id} className="bg-purple-500/5 border border-purple-500/15 p-2 md:p-4 rounded-lg md:rounded-xl flex items-start gap-2 md:gap-3 min-w-0 w-full">
                        <div className="w-5 h-5 md:w-7 md:h-7 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-black text-[9px] md:text-xs shrink-0 mt-0.5">{i + 1}</div>
                        <div className="flex-1 flex flex-col gap-1 md:gap-1.5 min-w-0 w-full">
                          <div className="flex items-start justify-between gap-1 md:gap-2 min-w-0">
                            <p className="text-white/90 text-[10px] md:text-sm font-semibold truncate pr-1">{item.title}</p>
                            <span className={`text-[7px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded border shrink-0 ${statusColors[item.status] || statusColors.planned}`}>
                              {statusLabels[item.status] || item.status}
                            </span>
                          </div>
                          {item.description && <p className="text-white/50 text-[8px] md:text-xs leading-relaxed break-words">{item.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-3 md:gap-6 w-full lg:max-w-3xl mx-auto min-w-0">
            <div className="flex items-center justify-between mb-1 md:mb-2 border-b border-white/10 pb-2 md:pb-4 min-w-0 w-full">
              <h4 className="text-sm md:text-xl font-bold flex items-center gap-1.5 md:gap-2 truncate">
                <Trophy className="text-yellow-400 w-4 h-4 md:w-6 md:h-6 shrink-0" /> <span className="truncate">Global Leaderboard</span>
              </h4>
              <button
                onClick={fetchLeaderboard}
                className="p-1.5 md:p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${leaderboardLoading ? "animate-spin text-blue-400" : "text-white/60"}`} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-1 md:mb-2 bg-black/40 p-1.5 md:p-1 rounded-lg md:rounded-xl w-full border border-white/10 items-center justify-between min-w-0">
              <div className="flex gap-1 md:gap-2 w-full sm:w-fit overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setLeaderboardFilter('today')}
                  className={`px-2 py-1 md:px-4 md:py-2 rounded text-[9px] md:text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none border ${leaderboardFilter === 'today' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'border-transparent text-white/40'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setLeaderboardFilter('week')}
                  className={`px-2 py-1 md:px-4 md:py-2 rounded text-[9px] md:text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none border ${leaderboardFilter === 'week' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'border-transparent text-white/40'}`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setLeaderboardFilter('month')}
                  className={`px-2 py-1 md:px-4 md:py-2 rounded text-[9px] md:text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none border ${leaderboardFilter === 'month' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'border-transparent text-white/40'}`}
                >
                  30 Days
                </button>
              </div>

              <div className="relative w-full sm:w-48 shrink-0 min-w-0">
                <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-3 h-3 md:w-3.5 md:h-3.5" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-md md:rounded-lg pl-6 md:pl-9 pr-2 py-1 md:py-1.5 text-[9px] md:text-sm outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {leaderboardLoading && leaderboardData.length === 0 ? (
              <p className="text-white/40 italic text-center py-6 md:py-10 text-[9px] md:text-base">Loading...</p>
            ) : (
              <div className="flex flex-col gap-2 md:gap-3 w-full min-w-0">
                {(() => {
                  const sortedData = [...leaderboardData].sort((a, b) => {
                    const valA = leaderboardFilter === 'today' ? a.todayFocused : leaderboardFilter === 'week' ? a.last7DaysFocused : a.last30DaysFocused;
                    const valB = leaderboardFilter === 'today' ? b.todayFocused : leaderboardFilter === 'week' ? b.last7DaysFocused : b.last30DaysFocused;
                    return valB - valA;
                  });
                  const filteredData = sortedData.filter(u => u.displayName.toLowerCase().includes(leaderboardSearch.toLowerCase()));

                  if (filteredData.length === 0) return <p className="text-white/40 italic text-center py-6 md:py-10 text-[9px] md:text-base">No users found.</p>;

                  return filteredData.map((user, index) => {
                    const val = leaderboardFilter === 'today' ? user.todayFocused : leaderboardFilter === 'week' ? user.last7DaysFocused : user.last30DaysFocused;
                    const isTop3 = index < 3 && val > 0;
                    const rankColors = ['bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]', 'bg-gray-300/20 text-gray-300 border-gray-300/30', 'bg-amber-700/20 text-amber-500 border-amber-700/30'];
                    const rankColor = isTop3 ? rankColors[index] : 'bg-white/5 text-white/50 border-white/10';

                    return (
                      <div key={user.id} className={`flex flex-col gap-1.5 md:gap-2 p-2 md:p-4 rounded-lg md:rounded-2xl border transition-all w-full min-w-0 ${user.isMe ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] scale-[1.02]' : 'bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/10'}`}>
                        <div className="flex items-center justify-between w-full min-w-0 gap-2">
                          <div className="flex items-center gap-2 md:gap-4 min-w-0 pr-1">
                            <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[10px] md:text-lg border shrink-0 ${rankColor}`}>
                              {index + 1}
                            </div>
                            <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs md:text-base shrink-0 overflow-hidden border border-white/10">
                              {user.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : user.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0 overflow-hidden">
                              <span className={`font-bold text-[10px] md:text-lg tracking-wide truncate w-full ${user.isMe ? 'text-blue-400' : 'text-white/90'}`}>
                                {user.displayName}
                              </span>
                              <div className="flex gap-1 md:gap-1.5 mt-0.5 md:mt-1 flex-wrap w-full min-w-0">
                                {user.badges?.today > 0 && <span className="text-[7px] md:text-[10px] bg-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded border border-yellow-500/20 font-bold tracking-wider whitespace-nowrap">🏆 {user.badges.today} Day</span>}
                                {user.badges?.week > 0 && <span className="text-[7px] md:text-[10px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded border border-purple-500/20 font-bold tracking-wider whitespace-nowrap">🌟 {user.badges.week} Wk</span>}
                                {user.badges?.month > 0 && <span className="text-[7px] md:text-[10px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20 font-bold tracking-wider whitespace-nowrap">👑 {user.badges.month} Mo</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-1.5 md:gap-4 shrink-0">
                            <div className="flex flex-col items-end justify-center">
                              <span className="font-mono font-bold text-[10px] md:text-2xl tracking-tighter text-white/90">{Math.floor(val / 60)}<span className="text-[8px] md:text-sm text-white/40 mr-0.5">h</span>{val % 60}<span className="text-[8px] md:text-sm text-white/40">m</span></span>
                              <span className="text-[7px] md:text-[10px] text-white/40 uppercase tracking-widest font-semibold">Focus</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedLeaderboardUserId(expandedLeaderboardUserId === user.id ? null : user.id)}
                              className="p-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20 text-white/50 shrink-0"
                            >
                              {expandedLeaderboardUserId === user.id ? <ChevronUp className="w-3.5 h-3.5 md:w-5 md:h-5" /> : <ChevronDown className="w-3.5 h-3.5 md:w-5 md:h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Stats */}
                        {expandedLeaderboardUserId === user.id && (
                          <div className="w-full mt-1.5 md:mt-2 pt-2 md:pt-3 border-t border-white/10 grid grid-cols-3 gap-1.5 md:gap-3 text-center animate-fade-in min-w-0">
                            <div className="flex flex-col bg-black/20 p-1.5 md:p-2 rounded border border-white/5 min-w-0">
                              <span className="text-[7px] md:text-[10px] text-white/50 uppercase tracking-widest mb-0.5 md:mb-1 truncate">Today</span>
                              <span className="font-mono text-[9px] md:text-base font-bold text-yellow-300 truncate">{Math.floor(user.todayFocused / 60)}h {user.todayFocused % 60}m</span>
                            </div>
                            <div className="flex flex-col bg-black/20 p-1.5 md:p-2 rounded border border-white/5 min-w-0">
                              <span className="text-[7px] md:text-[10px] text-white/50 uppercase tracking-widest mb-0.5 md:mb-1 truncate">Week</span>
                              <span className="font-mono text-[9px] md:text-base font-bold text-purple-300 truncate">{Math.floor(user.last7DaysFocused / 60)}h {user.last7DaysFocused % 60}m</span>
                            </div>
                            <div className="flex flex-col bg-black/20 p-1.5 md:p-2 rounded border border-white/5 min-w-0">
                              <span className="text-[7px] md:text-[10px] text-white/50 uppercase tracking-widest mb-0.5 md:mb-1 truncate">Month</span>
                              <span className="font-mono text-[9px] md:text-base font-bold text-emerald-300 truncate">{Math.floor(user.last30DaysFocused / 60)}h {user.last30DaysFocused % 60}m</span>
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