import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import SessionPage from "./components/session/SessionPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chapters from "./pages/Chapters";
import Topics from "./pages/Topics";
import TopicLearn from "./pages/TopicLearn";
import Profile from "./pages/Profile";
import { useSessionStore } from "./state/sessionStore";

function App() {
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
        <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur flex items-center justify-between px-6 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            Physics AI Tutor
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/chapters" className="hover:text-emerald-400">
              Chapters
            </Link>
            <Link to="/profile" className="hover:text-emerald-400">
              Profile
            </Link>
            {user ? (
              <button
                onClick={logout}
                className="px-3 py-1 rounded-md border border-slate-600 hover:bg-slate-800 text-xs"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-emerald-400">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chapters" element={<Chapters />} />
            <Route path="/chapters/:chapterId/topics" element={<Topics />} />
            <Route
              path="/chapters/:chapterId/topics/:topicId"
              element={<TopicLearn />}
            />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;