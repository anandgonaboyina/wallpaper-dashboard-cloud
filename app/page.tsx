'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User as UserIcon, Loader2, Eye, EyeOff, Target, Calendar, ListTodo, Cloud, Trophy, Pin } from 'lucide-react';

const features = [
  { id: 1, title: 'Unified Workspace', desc: 'Eliminate distractions with a clean, centralized hub. Stay deeply focused, organize your day, and crush your daily objectives from anywhere.', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 2, title: 'Smart Timetable', desc: 'Take absolute control of your schedule. Use our precision interactive, draggable timetable to map out every hour of your workflow.', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 3, title: 'Task Management', desc: 'Never miss a deadline again. Stay on top of your workflow with intuitive, interactive drag-and-drop to-do lists.', icon: ListTodo, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 4, title: 'Global Leaderboard', desc: 'Turn productivity into a game! Climb the global ranks and compete alongside other highly driven users mastering their time.', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 5, title: 'Focus Widgets', desc: 'Customize your space. Pin beautiful sticky notes, live weather updates, and your most important goals directly to your screen.', icon: Pin, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 6, title: 'Cloud Sync', desc: 'Your data, everywhere. Seamlessly and securely access your entire dashboard configuration across all your devices in real-time.', icon: Cloud, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

function FeatureCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const containerCenter = scrollRef.current.scrollLeft + scrollRef.current.offsetWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(scrollRef.current.children).forEach((child, index) => {
      const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
  };

  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      if (scrollRef.current && scrollRef.current.children.length > 0) {
        let nextIndex = activeIndex + 1;
        if (nextIndex >= features.length) nextIndex = 0;

        const targetElement = scrollRef.current.children[nextIndex] as HTMLElement;
        if (targetElement) {
          const scrollPos = targetElement.offsetLeft - (scrollRef.current.offsetWidth / 2) + (targetElement.offsetWidth / 2);
          scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, isDragging]);

  return (
    <div className="w-full relative flex flex-col items-center select-none touch-pan-y">
      <div className="lg:mb-0 lg:absolute lg:-top-6 z-20 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center animate-fade-in">
        <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-blue-200">Core Features</span>
      </div>
      <div
        ref={scrollRef}
        className={`w-full flex overflow-x-auto hide-scrollbar pt-4 pb-8 lg:py-8 cursor-grab active:cursor-grabbing px-[5%] sm:px-[15%] lg:px-[22.5%] ${isDragging ? '' : 'snap-x snap-mandatory scroll-smooth'}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const isActive = idx === activeIndex;

          return (
            <div key={feat.id} className="min-w-[90%] sm:min-w-[70%] lg:min-w-[90%] flex-[0_0_90%] sm:flex-[0_0_70%] lg:flex-[0_0_55%] snap-center px-1.5 flex justify-center items-center transition-transform duration-500">
              <div className={`w-full p-4 sm:p-6 rounded-3xl border backdrop-blur-2xl flex flex-col gap-2 sm:gap-3 transition-all duration-500 shadow-2xl ${isActive ? 'scale-[1.02] sm:scale-110 bg-white/20 border-white/40 opacity-100 z-10' : 'scale-[0.92] sm:scale-[0.88] bg-white/5 border-white/10 opacity-50 z-0'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${feat.bg} ${feat.color} shadow-lg ring-1 ring-white/10`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">{feat.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed text-left">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 mt-2 sm:mt-5">
        {features.map((_, idx) => (
          <div key={idx} onClick={() => {
            if (scrollRef.current) {
              const targetElement = scrollRef.current.children[idx] as HTMLElement;
              const scrollPos = targetElement.offsetLeft - (scrollRef.current.offsetWidth / 2) + (targetElement.offsetWidth / 2);
              scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
          }} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/40 ${activeIndex === idx ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}

export default function CloudLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('dashboard_token');
    const syncToken = localStorage.getItem('dashboard_sync_token');
    const role = localStorage.getItem('dashboard_role');

    if (token && token !== 'null') {
      if (role === 'admin') {
        router.push('/admin');
      } else if (syncToken && syncToken !== 'null') {
        router.push('/dashboard');
      } else {
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
            body: JSON.stringify({ username })
          });
          const data = await res.json();
          if (res.ok) {
            setSuccessMsg(data.message);
            setForgotStep(2);
          } else {
            setError(data.error);
          }
        } else if (forgotStep === 2) {
          if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
          }
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, resetCode, newPassword: password, confirmPassword })
          });
          const data = await res.json();
          if (res.ok) {
            setSuccessMsg('Password successfully reset! You can now log in.');
            setForgotStep(1);
            setIsForgotMode(false);
            setPassword('');
            setConfirmPassword('');
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
          if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
          }
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword, otp: resetCode })
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
            router.push('/dashboard');
          }
        } else {
          setError(data.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white flex flex-col lg:flex-row items-center justify-start lg:justify-center pt-2 sm:pt-6 lg:pt-6 pb-12 px-2 sm:px-6 lg:p-12 font-sans relative overflow-x-hidden overflow-y-auto lg:overflow-hidden gap-2 lg:gap-16 w-full">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-pink-500/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0"></div>

      {/* Feature Carousel (Hero Section) */}
      {!isAdminMode && (
        <div className="w-full lg:w-1/2 max-w-full lg:max-w-xl z-10 animate-slide-up duration-700 flex flex-col justify-center shrink-0">
          <FeatureCarousel />
        </div>
      )}

      {/* Form Container */}
      <div className={`w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-5 sm:p-8 backdrop-blur-xl relative z-10 shadow-2xl animate-zoom-in shrink-0 mb-4 lg:mb-0 mx-2 lg:mx-0 ${isAdminMode ? 'mx-auto' : ''}`}>

        <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 text-center">
          <div className="animate-slide-up delay-300">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{isAdminMode ? 'Admin Access' : (isRegisterMode ? 'Create Account' : (isForgotMode ? 'Reset Password' : 'Productive Dashboard'))}</h1>
            </div>
            <p className="text-white/70 text-xs sm:text-sm mt-1">
              {isAdminMode ? 'Sign in to access the Global Admin Panel.' : (isRegisterMode ? 'Register to sync your dashboard data.' : (isForgotMode ? 'Recover your account access.' : 'Sign in to sync your dashboard data.'))}
            </p>
          </div>
        </div>

        <div className="flex bg-black/30 p-1 rounded-xl w-full mb-4 sm:mb-6 border border-white/10 animate-slide-up delay-500">
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setIsRegisterMode(false); setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${!isAdminMode && !isRegisterMode && !isForgotMode ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white/90'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setIsRegisterMode(true); setIsForgotMode(false); setError(''); setSuccessMsg(''); setRegisterStep(1); }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${!isAdminMode && isRegisterMode ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white/90'}`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setIsRegisterMode(false); setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${isAdminMode ? 'bg-red-500/40 text-white shadow-sm' : 'text-white/50 hover:text-white/90'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3 animate-slide-up delay-700">
          {(error || successMsg) && (
            <div className={`p-2 sm:p-3 border text-xs sm:text-sm rounded-xl text-center ${successMsg ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100' : 'bg-red-500/20 border-red-500/30 text-red-100'}`}>
              {error || successMsg}
            </div>
          )}

          {(!isRegisterMode || (isRegisterMode && registerStep === 1)) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-white/80 ml-1">{isForgotMode || (!isRegisterMode && !isAdminMode) ? 'Username or Email' : 'Username'}</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isForgotMode || (!isRegisterMode && !isAdminMode) ? "Enter your username or email" : "Enter your username"}
                  className="w-full bg-black/20 border border-white/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-white/50 transition-colors placeholder:text-white/40"
                  required
                  disabled={isForgotMode && forgotStep === 2}
                />
              </div>
            </div>
          )}

          {isRegisterMode && !isAdminMode && registerStep === 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-white/80 ml-1">Email</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-black/20 border border-white/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-white/50 transition-colors placeholder:text-white/40"
                  required
                />
              </div>
            </div>
          )}

          {((isForgotMode && forgotStep === 2) || (isRegisterMode && registerStep === 2)) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-white/80 ml-1">6-Digit Verification Code</label>
              <div className="relative">
                <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter code from email"
                  className="w-full bg-black/20 border border-white/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm outline-none focus:border-white/50 transition-colors placeholder:text-white/40 font-mono tracking-widest"
                  required
                />
              </div>
            </div>
          )}

          {(!isForgotMode || (isForgotMode && forgotStep === 2)) && (!isRegisterMode || (isRegisterMode && registerStep === 2)) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-white/80 ml-1">{isForgotMode ? 'New Password' : 'Password'}</label>
              <div className="relative">
                <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isForgotMode ? 'Enter new password' : 'Enter your password'}
                  className="w-full bg-black/20 border border-white/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-10 sm:pr-12 text-sm outline-none focus:border-white/50 transition-colors placeholder:text-white/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {((isForgotMode && forgotStep === 2) || (isRegisterMode && registerStep === 2)) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-white/80 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-black/20 border border-white/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-10 sm:pr-12 text-sm outline-none focus:border-white/50 transition-colors placeholder:text-white/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${isAdminMode ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30'}`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAdminMode ? 'Login as Admin' : (isRegisterMode ? (registerStep === 1 ? 'Verify Email' : 'Complete Registration') : (isForgotMode ? (forgotStep === 1 ? 'Send Reset Code' : 'Update Password') : 'Secure Login')))}
          </button>

          {!isAdminMode && !isRegisterMode && !isForgotMode && (
            <div className="flex justify-center mt-1">
              <button type="button" onClick={() => { setIsForgotMode(true); setForgotStep(1); setError(''); setSuccessMsg(''); setUsername(''); }} className="text-xs text-white/60 hover:text-white transition-colors">
                Forgot your password?
              </button>
            </div>
          )}
          {isForgotMode && (
            <div className="flex justify-center mt-1">
              <button type="button" onClick={() => { setIsForgotMode(false); setError(''); setSuccessMsg(''); setForgotStep(1); setPassword(''); setResetCode(''); }} className="text-xs text-white/60 hover:text-white transition-colors">
                Back to Login
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}