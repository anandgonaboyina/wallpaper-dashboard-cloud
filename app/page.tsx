'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User as UserIcon, Loader2 } from 'lucide-react';

export default function CloudLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect based on role
    const token = localStorage.getItem('dashboard_token');
    const syncToken = localStorage.getItem('dashboard_sync_token');
    const role = localStorage.getItem('dashboard_role');
    
    if (token && token !== 'null') {
      if (role === 'admin') {
        router.push('/admin');
      } else if (syncToken && syncToken !== 'null') {
        router.push('/dashboard');
      } else {
        // Corrupted state: has token but no sync token. Clear to break infinite loop!
        localStorage.removeItem('dashboard_token');
        localStorage.removeItem('dashboard_role');
        localStorage.removeItem('dashboard_username');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Strict Mode Enforcement
        if (isAdminMode && data.role !== 'admin') {
          setError('Access Denied: Account is not an administrator.');
          return;
        }
        if (!isAdminMode && data.role === 'admin') {
          setError('Please switch to the Admin Panel tab to log in.');
          return;
        }

        localStorage.setItem('dashboard_token', data.token);
        localStorage.setItem('dashboard_sync_token', data.token);
        localStorage.setItem('dashboard_username', data.username || username);
        if (data.role === 'admin') {
          localStorage.setItem('dashboard_role', 'admin');
          router.push('/admin');
        } else {
          localStorage.removeItem('dashboard_role');
          // For non-admins, redirect to the web dashboard
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        
        <div className="flex flex-col items-center justify-center gap-3 mb-6 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg transition-colors ${isAdminMode ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20'}`}>
            <Shield size={32} />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{isAdminMode ? 'Admin Access' : 'Cloud Access'}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isAdminMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {isAdminMode ? 'Admin Only' : 'User Dashboard'}
              </span>
            </div>
            <p className="text-white/50 text-sm">{isAdminMode ? 'Sign in to access the Global Admin Panel.' : 'Sign in to sync your dashboard data.'}</p>
          </div>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl w-full mb-6 border border-white/5">
          <button 
            type="button" 
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isAdminMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 hover:text-white/70'}`}
          >
            Dashboard
          </button>
          <button 
            type="button"
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isAdminMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/40 hover:text-white/70'}`}
          >
            Admin Panel
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <div className={`p-3 border text-sm rounded-xl text-center ${error.includes('successful') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70 ml-1">Username</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full mt-4 py-3 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${isAdminMode ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20' : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/30'}`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isAdminMode ? 'Login as Admin' : 'Secure Login')}
          </button>
        </form>

      </div>
    </div>
  );
}
