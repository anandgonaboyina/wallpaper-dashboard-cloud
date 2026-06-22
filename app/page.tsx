'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User as UserIcon, Loader2 } from 'lucide-react';

export default function CloudLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
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
    setSuccessMsg('');

    try {
      if (isForgotMode) {
        if (forgotStep === 1) {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }) // Takes username or email
          });
          const data = await res.json();
          if (res.ok) {
            setSuccessMsg(data.message);
            setForgotStep(2);
          } else {
            setError(data.error);
          }
        } else if (forgotStep === 2) {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, resetCode, newPassword: password })
          });
          const data = await res.json();
          if (res.ok) {
            setSuccessMsg('Password successfully reset! You can now log in.');
            setForgotStep(1);
            setIsForgotMode(false);
            setPassword('');
            setResetCode('');
          } else {
            setError(data.error);
          }
        }
        setIsLoading(false);
        return;
      }

      if (isRegisterMode) {
        if (registerStep === 1) {
          // Request Registration OTP
          const res = await fetch('/api/auth/register/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email })
          });
          const data = await res.json();
          if (res.ok) {
            setSuccessMsg(data.message);
            setRegisterStep(2);
          } else {
            setError(data.error);
          }
        } else if (registerStep === 2) {
          // Submit Registration with OTP
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, otp: resetCode })
          });
          const data = await res.json();
          if (res.ok && data.token) {
            setSuccessMsg('Registration successful! Logging you in...');
            setTimeout(() => {
              localStorage.setItem('dashboard_token', data.token);
              localStorage.setItem('dashboard_sync_token', data.token);
              localStorage.setItem('dashboard_username', data.username || username);
              localStorage.removeItem('dashboard_role');
              router.push('/dashboard');
            }, 1000);
          } else {
            setError(data.error || 'Registration failed');
          }
        }
      } else {
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
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      if (!isRegisterMode || error) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 backdrop-blur-xl relative z-10 shadow-2xl">

        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6 text-center">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-lg transition-colors ${isAdminMode ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20'}`}>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{isAdminMode ? 'Admin Access' : (isRegisterMode ? 'Create Account' : (isForgotMode ? 'Reset Password' : 'Cloud Access'))}</h1>
              <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isAdminMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {isAdminMode ? 'Admin Only' : 'User Dashboard'}
              </span>
            </div>
            <p className="text-white/50 text-xs sm:text-sm mt-1 sm:mt-0">
              {isAdminMode ? 'Sign in to access the Global Admin Panel.' : (isRegisterMode ? 'Register to sync your dashboard data.' : (isForgotMode ? 'Recover your account access.' : 'Sign in to sync your dashboard data.'))}
            </p>
          </div>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl w-full mb-5 sm:mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setIsRegisterMode(false); setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${!isAdminMode && !isRegisterMode && !isForgotMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 hover:text-white/70'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setIsRegisterMode(true); setIsForgotMode(false); setError(''); setSuccessMsg(''); setRegisterStep(1); }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${!isAdminMode && isRegisterMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/40 hover:text-white/70'}`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setIsRegisterMode(false); setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${isAdminMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/40 hover:text-white/70'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4">
          {(error || successMsg) && (
            <div className={`p-2 sm:p-3 border text-xs sm:text-sm rounded-xl text-center ${successMsg ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {error || successMsg}
            </div>
          )}

          {(!isRegisterMode || (isRegisterMode && registerStep === 1)) && (
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-white/70 ml-1">{isForgotMode ? 'Username or Email' : 'Username'}</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isForgotMode ? "Enter your username or email" : "Enter your username"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30"
                  required
                  disabled={isForgotMode && forgotStep === 2}
                />
              </div>
            </div>
          )}

          {isRegisterMode && !isAdminMode && registerStep === 1 && (
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-white/70 ml-1">Email</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30"
                  required
                />
              </div>
            </div>
          )}

          {((isForgotMode && forgotStep === 2) || (isRegisterMode && registerStep === 2)) && (
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-white/70 ml-1">6-Digit Verification Code</label>
              <div className="relative">
                <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter code from email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30 font-mono tracking-widest"
                  required
                />
              </div>
            </div>
          )}

          {(!isForgotMode || (isForgotMode && forgotStep === 2)) && (!isRegisterMode || (isRegisterMode && registerStep === 2)) && (
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-white/70 ml-1">{isForgotMode ? 'New Password' : 'Password'}</label>
              <div className="relative">
                <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isForgotMode ? 'Enter new password' : 'Enter your password'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/30"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 sm:mt-4 py-2.5 sm:py-3 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${isAdminMode ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20' : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/30'}`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate-spin" /> : (isAdminMode ? 'Login as Admin' : (isRegisterMode ? (registerStep === 1 ? 'Verify Email' : 'Complete Registration') : (isForgotMode ? (forgotStep === 1 ? 'Send Reset Code' : 'Update Password') : 'Secure Login')))}
          </button>

          {!isAdminMode && !isRegisterMode && !isForgotMode && (
            <div className="flex justify-center mt-1 sm:mt-2">
              <button type="button" onClick={() => { setIsForgotMode(true); setForgotStep(1); setError(''); setSuccessMsg(''); setUsername(''); }} className="text-[11px] sm:text-xs text-white/40 hover:text-blue-400 transition-colors">
                Forgot your password?
              </button>
            </div>
          )}
          {isForgotMode && (
            <div className="flex justify-center mt-1 sm:mt-2">
              <button type="button" onClick={() => { setIsForgotMode(false); setError(''); setSuccessMsg(''); setForgotStep(1); setPassword(''); setResetCode(''); }} className="text-[11px] sm:text-xs text-white/40 hover:text-blue-400 transition-colors">
                Back to Login
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
