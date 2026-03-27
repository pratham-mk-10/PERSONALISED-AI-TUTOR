import { useNavigate } from "react-router-dom";
import { chapters } from "../data/learningFlow";
import { useSessionStore } from "../state/sessionStore";

const Chapters = () => {
  const navigate = useNavigate();
  const selectChapter = useSessionStore((s) => s.selectChapter);

  const handleSelect = (id) => {
    selectChapter(id);
    navigate(`/chapters/${id}/topics`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4">Choose a chapter</h1>
        <p className="mb-8 text-slate-300">
          We&apos;ll start with reflection and later add more topics.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => handleSelect(ch.id)}
              className="text-left rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">{ch.title}</h2>
              <p className="text-sm text-slate-300">{ch.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chapters;
