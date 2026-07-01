"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

export default function ThemeProvider() {
  const theme = useDashboardStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let activeTheme = theme;

    if (theme === 'auto') {
      const hour = new Date().getHours();
      // 6 AM to 6 PM (18:00) is light, otherwise dark
      activeTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }

    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(activeTheme);
  }, [theme, mounted]);

  // Set up an interval to check auto theme if they stay on the page
  useEffect(() => {
    if (theme !== 'auto') return;
    
    const checkTheme = () => {
      const hour = new Date().getHours();
      const activeTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
      const html = document.documentElement;
      if (!html.classList.contains(activeTheme)) {
        html.classList.remove('light', 'dark');
        html.classList.add(activeTheme);
      }
    };

    const interval = setInterval(checkTheme, 60000);
    return () => clearInterval(interval);
  }, [theme]);

  return null;
}
