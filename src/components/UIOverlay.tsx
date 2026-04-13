import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useExhibitStore } from '../store/useExhibitStore';
import { Home, Info, Globe, ChevronRight } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/sound';

export default function UIOverlay() {
  const { selectedBody, selectBody, isIdle } = useExhibitStore();

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
      {/* Top Bar */}
      <div className="flex justify-between items-start w-full pointer-events-auto">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full transition-colors border border-white/20"
          onMouseEnter={playHoverSound}
          onClick={() => {
            playClickSound();
            selectBody(null);
          }}
        >
          <Home size={20} />
          <span className="font-medium tracking-wider uppercase text-sm">Overview</span>
        </motion.button>

        <div className="text-white/50 text-sm tracking-[0.2em] uppercase font-mono">
          Cosmic Explorer Prototype
        </div>
      </div>

      {/* Idle Attract Mode Overlay */}
      <AnimatePresence>
        {isIdle && !selectedBody && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.h1 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl md:text-8xl font-light text-white tracking-tighter mb-6 drop-shadow-2xl"
              >
                Discover the Cosmos
              </motion.h1>
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-xl text-white/80 tracking-widest uppercase"
              >
                Touch anywhere to begin
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Body Content Panels */}
      <AnimatePresence>
        {selectedBody && (
          <div className="absolute inset-0 flex pointer-events-none">
            {/* Left Wall Panel */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              className="w-1/3 h-full flex items-center justify-start pl-16 pointer-events-auto"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md text-white shadow-2xl">
                <h2 className="text-5xl font-bold mb-2 tracking-tight">{selectedBody.name}</h2>
                <div className="text-blue-400 uppercase tracking-widest text-sm font-semibold mb-6">
                  {selectedBody.type}
                </div>
                <p className="text-lg text-white/80 leading-relaxed mb-8">
                  {selectedBody.shortDescription}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/60 uppercase tracking-wider text-xs font-bold mb-2">
                    <Info size={16} /> Key Facts
                  </div>
                  {selectedBody.facts.map((fact, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm">
                      {fact}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Center Wall (Empty for visual focus) */}
            <div className="w-1/3 h-full flex items-end justify-center pb-16">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black/40 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full text-white/90 text-sm tracking-widest uppercase pointer-events-auto cursor-pointer hover:bg-white/20 hover:border-white/40 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    selectBody(null);
                  }}
               >
                 Return to Solar System <ChevronRight size={16} />
               </motion.div>
            </div>

            {/* Right Wall Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.1 }}
              className="w-1/3 h-full flex items-center justify-end pr-16 pointer-events-auto"
            >
              <div className="flex flex-col gap-6 max-w-md">
                <div className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-xl border border-blue-500/20 p-8 rounded-3xl text-white shadow-2xl">
                  <div className="flex items-center gap-3 text-blue-400 uppercase tracking-wider text-xs font-bold mb-4">
                    <Globe size={16} /> Earth Comparison
                  </div>
                  <p className="text-lg leading-relaxed">
                    {selectedBody.earthComparison}
                  </p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-white shadow-2xl">
                  <div className="text-white/50 uppercase tracking-wider text-xs font-bold mb-4">
                    Did you know?
                  </div>
                  <p className="text-xl font-light italic leading-relaxed">
                    "{selectedBody.coolFact}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
