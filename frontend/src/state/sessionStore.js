import { create } from 'zustand';

// Simple placeholder store for session state
export const useSessionStore = create((set) => ({
  currentQuestion: null,
  misconceptions: [],
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setMisconceptions: (misconceptions) => set({ misconceptions }),
}));
