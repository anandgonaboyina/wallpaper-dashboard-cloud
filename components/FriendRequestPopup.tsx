"use client";

import React, { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function FriendRequestPopup() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const toggleSettings = useDashboardStore(state => state.toggleSettings);

  useEffect(() => {
    const checkRequests = async () => {
      const token = localStorage.getItem('dashboard_sync_token');
      if (!token) return;

      try {
        const res = await fetch('/api/friends', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.pendingRequests && data.pendingRequests.length > 0) {
          setPendingCount(data.pendingRequests.length);
          setIsVisible(true);
        }
      } catch (err) {
        console.error('Failed to check friend requests:', err);
      }
    };

    // Check on load
    checkRequests();

    // Check every 5 minutes
    const interval = setInterval(checkRequests, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || pendingCount === 0) return null;

  return (
    <div className="fixed top-6 right-20 z-[9999] bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
        <UserPlus size={20} />
      </div>
      <div>
        <h4 className="text-white font-bold text-sm">New Friend Requests</h4>
        <p className="text-white/60 text-xs">You have {pendingCount} pending request{pendingCount > 1 ? 's' : ''}.</p>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          toggleSettings();
        }}
        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg"
      >
        View
      </button>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-white/40 hover:text-white/80 p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
