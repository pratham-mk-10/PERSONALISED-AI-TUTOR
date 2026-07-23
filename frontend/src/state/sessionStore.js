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

// Maps a stored `unresolved_topics` title (from TOPIC_CONTEXTS[x].title in
// QuizPage.jsx) back to the Dashboard topic/card id that launches it.
export const TITLE_TO_TOPIC_ID = {
	"Introduction to Light": "intro-light",
	"Laws of Reflection": "laws-reflection",
	"Plane Mirror Basics": "plane-mirror",
	"Real vs Virtual Images": "real-virtual-images",
	"Spherical Mirror Basics": "spherical-mirror-basics",
	"Ray Tracing Rules of Spherical Mirrors": "spherical-mirror-rules",
	"Image Formation by Spherical Mirrors": "spherical-mirror-image-formation",
	"Uses of Concave and Convex Mirrors": "spherical-mirror-uses",
	"Mirror Formula and Magnification": "mirror-formula",
	"Numerical Problems: Find v": "numerical-find-v",
	"Numerical Problems: Find Height / Magnification": "numerical-find-m",
	"Numerical Problems: Find f": "numerical-find-f",
	"Numerical Problems: Find u": "numerical-find-u",
	"Numerical Problems: Mirror Identification": "numerical-mirror-id",
	"Numerical Problems: Combined": "numerical-combined",
	"Introduction to Refraction": "refraction-intro",
	"Laws of Refraction (Snell's Law)": "refraction-snells-law",
	"Refraction Through a Glass Slab": "refraction-glass-slab",
	"Spherical Lenses": "refraction-lenses",
	"Image Formation by Lenses": "refraction-lens-images",
	"Lens Formula & Power": "refraction-lens-formula",
};

// Global client-side session/progress store
export const useSessionStore = create((set, get) => ({
	user: loadUser(),
	currentChapterId: null,
	currentTopicId: null,
	// simple map: { [topicId]: { attempts: number, bestScore: number } }
	progress: {},
	// One-shot bias for the next attempt-1 quiz launch:
	// { topicId, tagBreakdown: [{tag, tagTitle, count}], severity: "red"|"yellow" } | null
	// tagBreakdown carries every misconception the student tripped on for this
	// topic (up to 3, most-frequent first) so QuizPage can weight the retest
	// quiz proportionally across all of them, not just a single top tag.
	retestBias: null,

	login: (user) => {
		saveUser(user);
		set({ user });
	},
	logout: () => {
		saveUser(null);
		set({ user: null, currentChapterId: null, currentTopicId: null });
	},

	selectChapter: (chapterId) =>
		set({ currentChapterId: chapterId, currentTopicId: null }),
	selectTopic: (topicId) => set({ currentTopicId: topicId }),

	setRetestBias: (bias) => set({ retestBias: bias }),
	clearRetestBias: () => set({ retestBias: null }),

	recordResult: (topicId, score, misconception) => {
		const { progress } = get();
		const prev = progress[topicId] || { attempts: 0, bestScore: 0, mastery: 0, misconception: null };
		const updated = {
			attempts: prev.attempts + 1,
			bestScore: Math.max(prev.bestScore, score),
			mastery: score,
			misconception: (misconception && misconception !== "none") ? misconception : prev.misconception,
		};
		set({ progress: { ...progress, [topicId]: updated } });
	},
}));

