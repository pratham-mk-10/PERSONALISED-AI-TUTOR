import { create } from "zustand";

const loadUser = () => {
  try {
    const raw = localStorage.getItem("apt_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUser = (user) => {
  try {
    if (user) localStorage.setItem("apt_user", JSON.stringify(user));
    else localStorage.removeItem("apt_user");
  } catch {
    // ignore
  }
};

// Global client-side session/progress store
export const useSessionStore = create((set, get) => ({
  user: loadUser(),
  currentChapterId: null,
  currentTopicId: null,
  // simple map: { [topicId]: { attempts: number, bestScore: number } }
  progress: {},

  login: (user) => {
    saveUser(user);
    set({ user });
  },
  logout: () => {
    saveUser(null);
    set({ user: null, currentChapterId: null, currentTopicId: null });
  },

  selectChapter: (chapterId) => set({ currentChapterId: chapterId, currentTopicId: null }),
  selectTopic: (topicId) => set({ currentTopicId: topicId }),

  recordResult: (topicId, score) => {
    const { progress } = get();
    const prev = progress[topicId] || { attempts: 0, bestScore: 0 };
    const updated = {
      attempts: prev.attempts + 1,
      bestScore: Math.max(prev.bestScore, score),
    };
    set({ progress: { ...progress, [topicId]: updated } });
  },
}));
