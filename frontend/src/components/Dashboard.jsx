import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900 text-slate-50 px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Adaptive Physics Tutor
        </h1>
        <p className="text-slate-300">
          Watch interactive SVG animations, read concise summaries, and answer
          MCQ, short and long questions powered by your AI models.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/chapters")}
            className="px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/30"
          >
            Start learning
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg border border-slate-500 hover:bg-slate-900/60 transition"
          >
            Login / Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;