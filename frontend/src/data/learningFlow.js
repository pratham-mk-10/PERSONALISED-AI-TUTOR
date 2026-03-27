// Static learning content + questions for the first chapter.

export const chapters = [
  {
    id: "reflection",
    title: "Reflection of Light",
    description: "Understand how light reflects from plane mirrors.",
    topics: [
      {
        id: "laws-of-reflection",
        title: "Laws of Reflection",
        level: "Core concept",
        summary:
          "Explore the first and second laws of reflection with a simple ray diagram.",
        svg: `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="#020617" />
  <line x1="150" y1="20" x2="150" y2="180" stroke="#38bdf8" stroke-width="3" />
  <line x1="40" y1="40" x2="150" y2="100" stroke="#f97316" stroke-width="3" />
  <line x1="150" y1="100" x2="260" y2="160" stroke="#22c55e" stroke-width="3" />
  <circle cx="150" cy="100" r="4" fill="#e5e7eb" />
  <text x="60" y="35" fill="#f97316" font-size="12">Incident ray</text>
  <text x="190" y="155" fill="#22c55e" font-size="12">Reflected ray</text>
  <text x="155" y="70" fill="#38bdf8" font-size="12">Normal</text>
</svg>`,
        questions: [
          // 6 MCQs
          ...Array.from({ length: 6 }).map((_, i) => ({
            id: `mcq-${i + 1}`,
            type: "mcq",
            prompt: `MCQ ${i + 1}: Sample question about laws of reflection?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctIndex: 1,
          })),
          // 2 short answers
          ...Array.from({ length: 2 }).map((_, i) => ({
            id: `short-${i + 1}`,
            type: "short",
            prompt: `Short answer ${i + 1}: Explain briefly one law of reflection.`,
          })),
          // 2 long answers
          ...Array.from({ length: 2 }).map((_, i) => ({
            id: `long-${i + 1}`,
            type: "long",
            prompt: `Long answer ${i + 1}: Describe an everyday situation where laws of reflection apply.`,
          })),
        ],
      },
    ],
  },
];

export const getChapterById = (id) => chapters.find((c) => c.id === id);

export const getTopic = (chapterId, topicId) => {
  const chapter = getChapterById(chapterId);
  if (!chapter) return null;
  return chapter.topics.find((t) => t.id === topicId) || null;
};
