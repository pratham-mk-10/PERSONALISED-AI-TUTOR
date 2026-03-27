import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getTopic } from "../data/learningFlow";
import { useSessionStore } from "../state/sessionStore";

const TopicLearn = () => {
  const { chapterId, topicId } = useParams();
  const recordResult = useSessionStore((s) => s.recordResult);
  const progress = useSessionStore((s) => s.progress[topicId]);

  const topic = getTopic(chapterId, topicId);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [passed, setPassed] = useState(null);

  const mcqs = useMemo(
    () => topic?.questions.filter((q) => q.type === "mcq") || [],
    [topic]
  );
  const short = useMemo(
    () => topic?.questions.filter((q) => q.type === "short") || [],
    [topic]
  );
  const long = useMemo(
    () => topic?.questions.filter((q) => q.type === "long") || [],
    [topic]
  );

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-50">
        <p>Topic not found.</p>
      </div>
    );
  }

  const handleSubmit = () => {
    let correct = 0;
    mcqs.forEach((q) => {
      const given = answers[q.id];
      if (typeof given === "number" && given === q.correctIndex) correct += 1;
    });
    const total = mcqs.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    setScore(percent);
    recordResult(topicId, percent);
    setPassed(percent >= 75);
  };

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleRetry = () => {
    setAnswers({});
    setScore(null);
    setPassed(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col lg:flex-row">
      <div className="lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <p className="text-slate-300">{topic.summary}</p>
        <div
          className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
          dangerouslySetInnerHTML={{ __html: topic.svg }}
        />
        {progress && (
          <p className="text-sm text-emerald-300">
            Best score: {progress.bestScore}% over {progress.attempts} attempt
            {progress.attempts > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <div className="lg:w-1/2 p-6 space-y-6 overflow-y-auto max-h-screen">
        <section>
          <h2 className="text-xl font-semibold mb-3">MCQ (6)</h2>
          <div className="space-y-4">
            {mcqs.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-slate-800 p-4 bg-slate-800/60">
                <p className="font-medium mb-2">
                  {idx + 1}. {q.prompt}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        className="text-emerald-500"
                        checked={answers[q.id] === i}
                        onChange={() => handleChange(q.id, i)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Short answer (2)</h2>
          <div className="space-y-4">
            {short.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-slate-800 p-4 bg-slate-800/60">
                <p className="font-medium mb-2">
                  {idx + 1}. {q.prompt}
                </p>
                <textarea
                  className="w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder="Type your explanation here..."
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Long answer (2)</h2>
          <div className="space-y-4">
            {long.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-slate-800 p-4 bg-slate-800/60">
                <p className="font-medium mb-2">
                  {idx + 1}. {q.prompt}
                </p>
                <textarea
                  className="w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder="Write your detailed answer here..."
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
          >
            Submit answers
          </button>
          {score !== null && (
            <div className="text-sm text-slate-200 space-y-1">
              <p>
                MCQ score: <span className="font-semibold">{score}%</span>
              </p>
              <p>
                Threshold: <span className="font-semibold">75%</span>.
                {passed === true && " Great job, you passed this topic."}
                {passed === false && " You are below the threshold; review the animation and try again."}
              </p>
              {passed === false && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 inline-flex items-center px-3 py-1 rounded-md border border-amber-400 text-xs text-amber-200 hover:bg-amber-500/10"
                >
                  Retry this topic quiz
                </button>
              )}
              <p className="text-xs text-slate-400">
                Short and long answers will later be evaluated by the AI model pipeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicLearn;
