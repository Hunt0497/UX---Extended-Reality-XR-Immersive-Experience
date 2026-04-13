import { create } from 'zustand';
import { CelestialBody, solarSystemData } from '../data/solarSystem';

interface ExhibitState {
  selectedBody: CelestialBody | null;
  isIdle: boolean;
  idleTimer: number;
  selectBody: (body: CelestialBody | null) => void;
  resetIdleTimer: () => void;
  setIdle: (idle: boolean) => void;
}

export const useExhibitStore = create<ExhibitState>((set, get) => ({
  selectedBody: null,
  isIdle: false,
  idleTimer: 0,
  selectBody: (body) => set({ selectedBody: body, isIdle: false }),
  setIdle: (idle) => set({ isIdle: idle }),
  resetIdleTimer: () => {
    set({ isIdle: false });
  },
}));
