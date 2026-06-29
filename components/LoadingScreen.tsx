"use client";

import { useEffect, useState } from "react";
import FeatureCarousel from "@/components/FeatureCarousel";

export default function LoadingScreen() {
  const [randomMotive, setRandomMotive] = useState("Focus is the hidden driver of true excellence.");
  const [loadTimeExceeded, setLoadTimeExceeded] = useState(false);

  useEffect(() => {
    const motives = [
      "Master your time, master your life.",
      "Small daily improvements lead to staggering results.",
      "Your future is created by what you do today.",
      "Focus is the hidden driver of true excellence.",
      "Distraction is the enemy of greatness.",
      "The secret of your future is hidden in your routine.",
      "Discipline equals unparalleled freedom.",
      "You don't have to be extreme, just consistent.",
      "Every moment is a fresh beginning to focus.",
      "Success is the sum of small efforts repeated daily."
    ];
    setRandomMotive(motives[Math.floor(Math.random() * motives.length)]);
  }, []);

  useEffect(() => {
    // If the loading screen stays mounted for more than 2 seconds, 
    // it means auth and sync is taking a while, so we show the Motivator quote.
    const timer = setTimeout(() => {
      setLoadTimeExceeded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center text-white font-sans overflow-hidden opacity-100 pointer-events-auto">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-lg w-full h-full justify-evenly">
        <div className="flex flex-col items-center w-full min-h-[250px] justify-center">
          {loadTimeExceeded ? (
            <div className="flex flex-col items-center justify-center animate-in slide-in-from-bottom-10 fade-in duration-1000 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[60px]" />

              <div className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-purple-400/80 mb-6 px-4 py-2 border border-purple-500/20 rounded-full bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                Motivator Mode
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 text-center mb-10 leading-tight max-w-2xl px-6 drop-shadow-2xl z-10 font-serif italic">
                "{randomMotive}"
              </h2>

              <div className="flex items-center gap-4 z-10 mb-4">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,1)]"></div>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-purple-500/50"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 rounded-full overflow-hidden ring-4 ring-white/5 shadow-2xl shadow-blue-500/20">
                <img
                  src="/branding/author.jpeg"
                  alt="Creator Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/icon-192x192.png' }}
                />
              </div>

              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                Productive Dashboard
              </h1>
              <div className="text-[10px] md:text-xs font-mono text-blue-400 mb-8 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                Cloud Sync Enabled
              </div>

              <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md mx-auto">
                "Built to eliminate distractions and create a single, unified workspace.
                Everything you need to stay deeply focused, plan your day, and track your goals—now available anywhere."
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center mt-8">
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40 animate-pulse">
            Authenticating & Syncing Data...
          </div>
        </div>

        {loadTimeExceeded && (
          <div className="absolute bottom-8 left-0 right-0 overflow-hidden w-full mx-auto opacity-100 flex items-center h-auto z-50 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <FeatureCarousel />
          </div>
        )}
      </div>
    </div>
  );
}
