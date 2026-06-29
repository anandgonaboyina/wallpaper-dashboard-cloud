'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardStore, setAuthTransition } from '@/store/dashboardStore';
import { Users, UserPlus, Rss, LogIn, UserCircle, Search, Trash, Lock, Unlock, Check, X, ShieldAlert, BarChart2, Map, Clock, Trophy, RefreshCw, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

export default function ConnectTab() {
  const { history, tasks, timetableGrid } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'broadcasts' | 'leaderboard'>('profile');
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

    // Listen for custom event from StatsModal
    const handleOpenLeaderboard = () => {
      setActiveTab('leaderboard');
    };
    window.addEventListener('open-leaderboard', handleOpenLeaderboard);
    return () => window.removeEventListener('open-leaderboard', handleOpenLeaderboard);
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
        useDashboardStore.getState().setViewingFriend({ username: friendUsername, stats: data.stats });
        useDashboardStore.getState().toggleSettings(); // Close settings to see stats modal
        if (!useDashboardStore.getState().isStatsOpen) {
          useDashboardStore.getState().toggleStats();
        }
      } else {
        alert('Failed to fetch stats: ' + data.error);
      }
    } catch (err) { }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-h-[80vh] w-full max-w-sm mx-auto p-4 overflow-hidden ">
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10 w-full text-center shadow-2xl backdrop-blur-md">
          <ShieldAlert className="mx-auto text-blue-400 w-10 h-10 mb-3" />
          <h3 className="text-xl font-bold mb-1">Cloud Sync & Connect</h3>
          <p className="text-white/60 mb-5 text-xs">Log in to backup data and connect.</p>

          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            {authMode === 'forgot' ? (
              <>
                {forgotStep === 'email' ? (
                  <input
                    type="email"
                    placeholder="Enter email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="6-digit OTP"
                      required
                      value={authPin}
                      onChange={e => setAuthPin(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors tracking-widest text-center text-sm"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
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
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                )}
                <input
                  type="text"
                  placeholder={authMode === 'login' ? "Username or Email" : "Username"}
                  required
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </>
            )}

            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            {authSuccessMsg && <p className="text-green-400 text-xs">{authSuccessMsg}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors mt-2 text-sm shadow-lg shadow-blue-500/20"
            >
              {authLoading ? 'Wait...' : (authMode === 'login' ? 'Login' : 'Register')}
            </button>

            <div className="flex flex-col gap-2 mt-2">
              {authMode !== 'login' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  Back to Login
                </button>
              )}
              {authMode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    Need an account? Register
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setAuthError(''); }}
                    className="text-white/40 hover:text-white/60 text-xs transition-colors"
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
    <div className="flex flex-col w-full h-full max-h-[80vh] min-w-0 relative max-w-lg mx-auto pt-2 px-2">

      {/* Pill-shaped Navbar - Now OUTSIDE the scroller, pinned to the absolute top */}
      <div className="sticky flex justify-between items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1 mb-2 shadow-lg w-full shrink-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-full transition-all ${activeTab === 'profile' ? 'bg-blue-500 text-white shadow-md' : 'text-white/50 hover:text-white/90'}`}
        >
          <UserCircle size={16} />
          <span className="text-[9px] font-bold">Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-full transition-all ${activeTab === 'friends' ? 'bg-blue-500 text-white shadow-md' : 'text-white/50 hover:text-white/90'}`}
        >
          <Users size={16} />
          <span className="text-[9px] font-bold">Friends</span>
          {pendingRequests.length > 0 && (
            <span className="absolute top-1 right-3 sm:right-6 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-md">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-full transition-all ${activeTab === 'broadcasts' ? 'bg-blue-500 text-white shadow-md' : 'text-white/50 hover:text-white/90'}`}
        >
          <Rss size={16} />
          <span className="text-[9px] font-bold">News</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-full transition-all ${activeTab === 'leaderboard' ? 'bg-blue-500 text-white shadow-md' : 'text-white/50 hover:text-white/90'}`}
        >
          <Trophy size={16} />
          <span className="text-[9px] font-bold">Ranks</span>
        </button>
      </div>

      {/* Tab Content Wrapper - This is the ONLY part that scrolls now */}
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="flex flex-col items-center w-full gap-2.5 md:gap-3 animate-in fade-in slide-in-from-bottom-2">

          {/* Header Card */}
          <div className="flex items-center w-full gap-3 bg-gradient-to-r from-white/5 to-transparent p-2 rounded-2xl border border-white/10 shadow-sm">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold shadow-inner border-2 border-white/10 shrink-0 overflow-hidden">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col min-w-0 w-full">
              <h3 className="text-lg md:text-xl font-bold truncate w-full text-white/90 leading-tight">{username}</h3>
              <div className="flex items-center gap-1.5 mt-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                <span className="text-[9px] md:text-[10px] text-green-400 font-bold tracking-wide uppercase">Sync Active</span>
              </div>

              {/* Danger Zone Actions */}
              <div className="flex gap-4 w-full mt-2 pb-1">
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to sign out?")) {
                      handleLogout();
                    }
                  }}
                  className="flex-1 p-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl transition-colors border border-white/10 font-semibold text-[10px] md:text-xs"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => {
                    if (!isAliasUnlocked) {
                      alert("Please enter your password in the Security settings below to unlock Account Deletion.");
                      return;
                    }
                    handleDeleteAccount();
                  }}
                  className={`flex-1 px-2 ${!isAliasUnlocked ? 'bg-red-900/10 text-red-400/40 border-red-900/20 cursor-not-allowed' : 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-900/50'} rounded-xl transition-colors border font-semibold text-[10px] md:text-xs flex items-center justify-center gap-1.5`}
                >
                  {isAliasUnlocked ? <Trash size={12} /> : <Lock size={12} />}
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-500/10 border border-white/60 text-white-200 text-[10px] leading-relaxed p-2.5 rounded-xl flex items-start gap-2 w-full shadow-sm">
            <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-400" />
            <p>
              Accounts inactive for 90 days are <strong className="text-red-400 font-bold">permanently deleted</strong>. Export your data regularly!
            </p>
          </div>

          {/* Profile Pic Settings */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl w-full flex flex-col gap-2 shadow-sm">
            <label className="text-[10px] md:text-xs font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCircle className="text-blue-400 w-3.5 h-3.5" /> Avatar URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input
                type="url"
                placeholder="https://.../img.png"
                value={profilePicture}
                onChange={e => setProfilePicture(e.target.value)}
                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 transition-colors text-[10px] md:text-xs text-white/90 placeholder:text-white/30"
              />
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => updateProfilePicture(profilePicture)}
                  disabled={profilePictureLoading}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold text-[10px] md:text-xs shadow-md"
                >
                  {profilePictureLoading ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Remove profile picture?')) updateProfilePicture('');
                  }}
                  disabled={profilePictureLoading || !profilePicture}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg transition-colors font-semibold text-[10px] md:text-xs disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Alias & Security Settings */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl w-full flex flex-col gap-2 shadow-sm">
            <label className="text-[10px] md:text-xs font-bold text-white/60 flex items-center justify-between uppercase tracking-wider w-full">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className={`${isAliasUnlocked ? "text-green-400" : "text-yellow-400"} w-3.5 h-3.5`} /> Security & Alias
              </div>
              {isAliasUnlocked && (
                <button onClick={() => setIsAliasUnlocked(false)} className="text-[9px] text-white/40 hover:text-white transition-colors underline underline-offset-2 capitalize">
                  Lock
                </button>
              )}
            </label>

            {!isAliasUnlocked ? (
              <div className="flex flex-col gap-1.5 w-full">
                <p className="text-white/40 text-[9px] leading-tight">Enter your password to unlock alias settings and account deletion.</p>
                <div className="flex gap-1.5 w-full mt-0.5">
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={aliasPassword}
                    onChange={e => setAliasPassword(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && aliasPassword && !aliasUnlockLoading) {
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
                          setAliasUnlockError('Error');
                        } finally {
                          setAliasUnlockLoading(false);
                        }
                      }
                    }}
                    className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-yellow-500 transition-colors text-[10px] md:text-xs text-white/90 placeholder:text-white/30"
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
                        setAliasUnlockError('Error');
                      } finally {
                        setAliasUnlockLoading(false);
                      }
                    }}
                    disabled={aliasUnlockLoading || !aliasPassword}
                    className="px-4 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-colors font-semibold text-[10px] md:text-xs disabled:opacity-50 shrink-0"
                  >
                    {aliasUnlockLoading ? '...' : 'Unlock'}
                  </button>
                </div>
                {aliasUnlockError && <p className="text-red-400 text-[9px] mt-0.5 font-medium">{aliasUnlockError}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex gap-1.5 w-full mt-0.5">
                  <input
                    type="text"
                    placeholder="Anonymous alias..."
                    value={alias}
                    onChange={e => setAlias(e.target.value)}
                    className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-green-500 transition-colors text-[10px] md:text-xs text-white/90 placeholder:text-white/30"
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
                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold text-[10px] md:text-xs shadow-md shrink-0"
                  >
                    {aliasLoading ? 'Wait' : 'Save'}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-white/40 text-[10px] leading-tight">Shown on leaderboard.</p>
                  <button
                    onClick={() => setIsAliasUnlocked(false)}
                    className="text-white/40 hover:text-white text-[10px] underline underline-offset-2"
                  >
                    Lock Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="flex flex-col gap-5 min-w-0 w-full animate-in fade-in slide-in-from-bottom-2">
          <div className="min-w-0 w-full">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h4 className="text-sm font-semibold truncate pr-2">My Friends ({friends.length})</h4>
              <button
                onClick={() => {
                  useDashboardStore.getState().setViewingFriend(null);
                  useDashboardStore.getState().toggleSettings();
                  if (!useDashboardStore.getState().isStatsOpen) useDashboardStore.getState().toggleStats();
                }}
                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold transition-colors border border-blue-500/20 flex items-center justify-center gap-1.5 animate-pulse shrink-0"
              >
                <BarChart2 size={14} /> My Stats
              </button>
            </div>
            {friends.length === 0 ? (
              <p className="text-white/40 italic text-xs">No friends added.</p>
            ) : (
              <div className="flex flex-col gap-2 w-full min-w-0">
                {friends.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-black/30 border border-white/10 p-3 rounded-xl hover:bg-black/40 transition-colors group min-w-0 w-full gap-2">
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-white/10 shrink-0 overflow-hidden">
                        {f.user.profilePicture ? <img src={f.user.profilePicture} alt="" className="w-full h-full object-cover" /> : f.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className="font-bold text-sm tracking-wide truncate w-full">{f.user.username}</span>
                        {f.user.lastActive ? (
                          <span className="text-[10px] text-white/60 flex items-center gap-1.5 mt-0.5 truncate w-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="truncate">Active: {new Date(f.user.lastActive).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/40 flex items-center gap-1.5 mt-0.5 truncate w-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0"></span>
                            <span className="truncate">Active: Unknown</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => viewFriendStats(f.user.id, f.user.username)}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/20 flex items-center gap-1.5 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                      >
                        <BarChart2 size={12} /> Stats
                      </button>
                      <button
                        onClick={() => removeFriend(f.id)}
                        className="text-red-400/70 hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full min-w-0 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Find user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-blue-500 transition-colors text-xs"
              />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-4 rounded-lg font-semibold transition-colors text-xs shrink-0 shadow-md">
              Search
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-3 w-full min-w-0">
              <h4 className="font-semibold mb-2 text-white/60 text-[10px] uppercase tracking-wider">Results</h4>
              <div className="flex flex-col gap-2 w-full min-w-0">
                {searchResults.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg min-w-0 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-white/10 overflow-hidden">
                        {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm truncate">{u.username}</span>
                    </div>
                    <button onClick={() => sendFriendRequest(u.id)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors">
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requests Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
            <div className="bg-black/20 p-3 rounded-xl border border-white/5 min-w-0 w-full">
              <h4 className="text-xs font-semibold mb-2 border-b border-white/10 pb-1.5 flex items-center gap-1.5 text-white/70 uppercase tracking-wider truncate">
                Approvals {pendingRequests.length > 0 && <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px]">{pendingRequests.length}</span>}
              </h4>
              {pendingRequests.length === 0 ? (
                <p className="text-white/40 italic text-[10px]">No pending requests.</p>
              ) : (
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  {pendingRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-black/40 border border-white/10 p-2 rounded-lg min-w-0 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center font-bold shrink-0 border border-white/10 overflow-hidden text-xs">
                          {r.user.profilePicture ? <img src={r.user.profilePicture} alt="" className="w-full h-full object-cover" /> : r.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-xs truncate">{r.user.username}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => handleFriendRequest(r.id, 'ACCEPTED')} className="w-7 h-7 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md border border-green-500/30 transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => handleFriendRequest(r.id, 'REJECTED')} className="w-7 h-7 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md border border-red-500/30 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-black/20 p-3 rounded-xl border border-white/5 min-w-0 w-full opacity-70">
              <h4 className="text-xs font-semibold mb-2 border-b border-white/10 pb-1.5 uppercase tracking-wider truncate text-white/70">Sent Requests</h4>
              {sentRequests.length === 0 ? (
                <p className="text-white/40 italic text-[10px]">No sent requests.</p>
              ) : (
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  {sentRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg text-xs min-w-0 gap-2 border border-white/5">
                      <span className="truncate min-w-0 flex-1">{r.user.username}</span>
                      <span className="text-white/40 shrink-0 text-[10px]">Pending</span>
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
        <div className="flex flex-col gap-5 w-full animate-in fade-in slide-in-from-bottom-2">
          {/* Global Announcements */}
          <div>
            <h4 className="text-sm font-semibold mb-3 border-b border-white/10 pb-2 flex items-center gap-1.5 text-white/90">
              <Rss className="text-orange-400 w-4 h-4" /> Announcements
            </h4>
            {broadcasts.length === 0 ? (
              <p className="text-white/40 italic text-center py-6 text-xs bg-white/5 rounded-xl border border-white/5">No news at the moment.</p>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {broadcasts.map(b => (
                  <div key={b.id} className="bg-white/5 border border-white/10 p-3.5 rounded-xl relative overflow-hidden w-full shadow-md">
                    {b.type === 'WARNING' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                    {b.type === 'UPDATE' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                    {b.type === 'INFO' && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}
                    <div className="flex justify-between items-start mb-2 pl-2 gap-2">
                      <h5 className="font-bold text-sm text-white/90 truncate leading-tight">{b.title}</h5>
                      <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded border border-white/5 shrink-0">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/70 pl-2 leading-relaxed text-xs whitespace-pre-wrap break-words">{b.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Pipeline */}
          <div className="mt-2">
            <h4 className="text-sm font-semibold text-white/90 mb-3 border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Map className="text-purple-400 w-4 h-4" />
              Pipeline
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-500/30 ml-auto">{roadmapItems.length} PLAN</span>
            </h4>
            {roadmapItems.length === 0 ? (
              <p className="text-white/40 text-xs italic text-center py-4 bg-white/5 rounded-xl border border-white/5">No features in pipeline.</p>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {roadmapItems.map((item, i) => {
                  const statusColors: Record<string, string> = {
                    planned: 'bg-white/5 border-white/10 text-white/50',
                    in_progress: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                    done: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  };
                  const statusLabels: Record<string, string> = {
                    planned: 'Plan', in_progress: '🔨 WIP', done: '✅ Done'
                  };
                  return (
                    <div key={item.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-3 w-full">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-black text-xs shrink-0 border border-purple-500/30">{i + 1}</div>
                      <div className="flex-1 flex flex-col gap-1 w-full min-w-0">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <p className="text-white/90 text-xs font-bold truncate">{item.title}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${statusColors[item.status] || statusColors.planned}`}>
                            {statusLabels[item.status] || item.status}
                          </span>
                        </div>
                        {item.description && <p className="text-white/50 text-[10px] leading-relaxed break-words">{item.description}</p>}
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
  );
}