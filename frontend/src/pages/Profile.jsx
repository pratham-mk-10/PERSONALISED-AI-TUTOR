import { chapters } from "../data/learningFlow";
import { useSessionStore } from "../state/sessionStore";

const Profile = () => {
  const user = useSessionStore((s) => s.user);
  const progress = useSessionStore((s) => s.progress);

  const topicsWithProgress = [];
  chapters.forEach((ch) => {
    ch.topics.forEach((t) => {
      topicsWithProgress.push({
        chapter: ch.title,
        topicId: t.id,
        topicTitle: t.title,
        stats: progress[t.id],
      });
    });
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-slate-300">
            {user ? `Signed in as ${user.name || user.email}` : "Guest mode (no login yet)."}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
          <h2 className="text-xl font-semibold mb-3">Topic progress</h2>
          {topicsWithProgress.length === 0 && (
            <p className="text-slate-300 text-sm">No topics available yet.</p>
          )}
          <div className="space-y-3">
            {topicsWithProgress.map((item) => (
              <div
                key={item.topicId}
                className="flex items-center justify-between text-sm border border-slate-700 rounded-lg px-3 py-2 bg-slate-900/60"
              >
                <div>
                  <p className="font-medium">{item.topicTitle}</p>
                  <p className="text-slate-400">{item.chapter}</p>
                </div>
                <div className="text-right">
                  {item.stats ? (
                    <>
                      <p className="font-semibold">Best: {item.stats.bestScore}%</p>
                      <p className="text-slate-400">Attempts: {item.stats.attempts}</p>
                    </>
                  ) : (
                    <p className="text-slate-400">Not attempted</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
