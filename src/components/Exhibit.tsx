import React, { useEffect, useRef } from 'react';
import { useExhibitStore } from '../store/useExhibitStore';
import Scene from './Scene';
import UIOverlay from './UIOverlay';
import { initAudio } from '../utils/sound';

const IDLE_TIMEOUT_MS = 30000; // 30 seconds of inactivity triggers idle mode

export default function Exhibit() {
  const { resetIdleTimer, setIdle, isIdle } = useExhibitStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleActivity = () => {
    initAudio();
    resetIdleTimer();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIdle(true);
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    handleActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center overflow-hidden font-sans p-4 md:p-6">
      <div
        className="relative w-full h-[92vh] min-h-[680px] max-h-[960px] bg-gray-900 shadow-2xl overflow-hidden rounded-[28px]"
      >
        <Scene />
        <UIOverlay />
        
        <div className="absolute inset-0 pointer-events-none flex opacity-10">
          <div className="w-1/3 h-full border-r border-white/20"></div>
          <div className="w-1/3 h-full border-r border-white/20"></div>
          <div className="w-1/3 h-full"></div>
        </div>
      </div>
    </div>
  );
}
