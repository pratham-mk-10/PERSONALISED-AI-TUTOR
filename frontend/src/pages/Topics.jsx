import { useNavigate, useParams } from "react-router-dom";
import { getChapterById } from "../data/learningFlow";
import { useSessionStore } from "../state/sessionStore";

const Topics = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const selectTopic = useSessionStore((s) => s.selectTopic);

  const chapter = getChapterById(chapterId);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-50">
        <p>Chapter not found.</p>
      </div>
    );
  }

  const handleSelect = (topicId) => {
    selectTopic(topicId);
    navigate(`/chapters/${chapterId}/topics/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4">{chapter.title}</h1>
        <p className="mb-8 text-slate-300">
          Pick a small topic to study with animation, summary and questions.
        </p>
        <div className="space-y-4">
          {chapter.topics.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="w-full text-left rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition p-5 shadow-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold mb-1">{t.title}</h2>
                <p className="text-sm text-slate-300">{t.summary}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                {t.level}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
