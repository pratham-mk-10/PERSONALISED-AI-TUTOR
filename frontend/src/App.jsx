import React, { useState } from "react";
import QuizPage from "./components/quiz/QuizPage";
import FirstLawOfReflectionAnimation from "./svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import FirstLawPlaneInteractive from "./svg-engine/reflection/interactive/FirstLawPlaneInteractive";
import SecondLawOfReflectionAnimation from "./svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import SecondLawPlaneInteractive from "./svg-engine/reflection/interactive/SecondLawPlaneInteractive";
import PlaneMirrorBasicsAnimation from "./svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import SphericalMirrorDetailedAnimation from "./svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorDetailedAnimation";
import Dashboard from "./components/dashboard/Dashboard";
import { useSessionStore } from "./state/sessionStore";
import Sandbox from "./Sandbox";

function App() {
  const [view, setView] = useState("dashboard");
  const [stage, setStage] = useState("pmTell");
  const selectTopic = useSessionStore((s) => s.selectTopic);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Secret keybind: press backtick (`) to toggle Sandbox
      if (e.key === '`') {
         setView(v => v === 'sandbox' ? 'dashboard' : 'sandbox');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stages = [
    "pmTell",
    "pmShow",
    "smTell",
    "smShow",
    "smQuiz",
    "tell1",
    "show1",
    "try1",
    "tell2",
    "show2",
    "try2",
    "test",
  ];
  const currentIndex = stages.indexOf(stage);

  const renderSession = () => (
    <div style={styles.sessionPage}>
      <button style={styles.backBtn} onClick={() => setView("dashboard")}>
        ← Back to Dashboard
      </button>

      <div style={styles.header}>
        <h1 style={styles.h1}>Personalised AI Tutor</h1>
        <p style={styles.subtitle}>
          Class 10 NCERT — Light: Reflection & Refraction
        </p>
      </div>

      <div style={styles.stageBar}>
        {stages
          .filter((s) => {
            if (stage === "pmTell" || stage === "pmShow") {
              return s === "pmTell" || s === "pmShow";
            }
            if (stage === "smTell" || stage === "smShow" || stage === "smQuiz") {
              return s === "smTell" || s === "smShow" || s === "smQuiz";
            }
            // Hide all prior stages (including smQuiz) when in Laws of Reflection
            return s !== "pmTell" && s !== "pmShow" && s !== "smTell" && s !== "smShow" && s !== "smQuiz";
          })
          .map((s, i) => {
            const isActive = stages.indexOf(s) === currentIndex;
            const isCompleted = stages.indexOf(s) < currentIndex;
            
            return (
              <div
                key={s}
                style={{
                  ...styles.stageStep,
                  background: isActive 
                    ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" 
                    : isCompleted ? "#EFF6FF" : "transparent",
                  color: isActive ? "#FFFFFF" : isCompleted ? "#2563EB" : "#9CA3AF",
                  border: isActive 
                    ? "1px solid #2563EB" 
                    : isCompleted ? "1px solid #DBEAFE" : "1px solid #E5E7EB",
                  boxShadow: isActive ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {{
                  pmTell: "1. Plane Basics",
                  pmShow: "2. Watch",
                  smTell: "1. Spherical Mirrors",
                  smShow: "2. Watch",
                  smQuiz: "3. Quiz",
                  tell1: "1. 1st Law",
                  show1: "2. Watch",
                  try1: "3. Try",
                  tell2: "4. 2nd Law",
                  show2: "5. Watch",
                  try2: "6. Try",
                  test: "7. Quiz",
                }[s]}
              </div>
            );
          })}
      </div>

      {/* PLANE MIRROR BASICS - TELL */}
      {stage === "pmTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Plane Mirror Basics</h2>

          <p style={styles.explanation}>
            A <strong>plane mirror</strong> is a flat, polished surface that reflects light.
          </p>

          <p style={styles.explanation}>
            In this lesson you will learn every core term: mirror, point of incidence,
            incident ray, reflected ray, normal, angle of incidence, and angle of reflection.
          </p>

          <p style={styles.explanation}>
            You will also see how these are represented in standard ray diagrams used in
            Class 10 NCERT.
          </p>

          <button style={styles.btnPrimary} onClick={() => setStage("pmShow")}>
            Start Plane Mirror Animation →
          </button>
        </div>
      )}

      {/* PLANE MIRROR BASICS - SHOW */}
      {stage === "pmShow" && (
        <div style={styles.card}>
          <PlaneMirrorBasicsAnimation
            onContinue={() => {
              selectTopic("laws-reflection");
              setStage("tell1");
            }}
          />
        </div>
      )}

      {/* SPHERICAL MIRROR BASICS - TELL */}
      {stage === "smTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Spherical Mirror Basics</h2>

          <p style={styles.explanation}>
            Learn spherical mirrors, their types (concave and convex), and key points:
            pole (P), focus (F), centre of curvature (C), and relation R = 2f.
          </p>

          <button style={styles.btnPrimary} onClick={() => setStage("smShow")}>
            Start Spherical Mirror Animation →
          </button>
        </div>
      )}

      {/* SPHERICAL MIRROR BASICS - SHOW */}
      {stage === "smShow" && (
        <div style={styles.cardWide}>
          <SphericalMirrorDetailedAnimation onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz") }>
              Go to spherical mirror quiz →
            </button>
          </div>
        </div>
      )}

      {/* SPHERICAL MIRROR QUIZ */}
      {stage === "smQuiz" && (
        <div style={styles.card}>
          <QuizPage />
        </div>
      )}

      {/* TELL 1 - REFLECTION */}
      {stage === "tell1" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Reflection Lesson</h2>

          <p style={styles.explanation}>
            When a ray of light hits a mirror, it bounces back. This is called
            <strong> reflection</strong>.
          </p>

          <p style={styles.explanation}>
            The ray that hits the mirror is called the
            <strong> incident ray</strong>, and the ray that bounces back is the
            <strong> reflected ray</strong>.
          </p>

          <p style={styles.explanation}>
            The <strong>Normal</strong> is a line perpendicular (90°) to the mirror.
          </p>

          <div style={styles.lawBox}>
            <p style={styles.lawText}>
              The Angle of Incidence = Angle of Reflection
            </p>
            <p style={styles.lawText}>(Both measured from the Normal)</p>
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("show1")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* SHOW 1 - REFLECTION */}
      {stage === "show1" && (
        <div style={styles.card}>
          <FirstLawOfReflectionAnimation onTryItClicked={() => setStage("try1")} />
        </div>
      )}

      {/* TRY 1 - REFLECTION */}
      {stage === "try1" && (
        <div style={styles.card}>
          <FirstLawPlaneInteractive attempt={1} misconceptionTag="" onInteracted={() => {}} />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("tell2")}
          >
            Continue reflection lesson →
          </button>
        </div>
      )}

      {/* TELL 2 - REFLECTION */}
      {stage === "tell2" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Reflection Lesson</h2>

          <p style={styles.explanation}>
            The incident ray, reflected ray, and the normal all lie in the
            <strong> same plane</strong>.
          </p>

          <p style={styles.explanation}>
            A <strong>plane</strong> is a flat surface. Think of it as a sheet of paper.
            All three elements (incident ray, reflected ray, and normal) must be
            drawn on the same sheet of paper.
          </p>

          <p style={styles.explanation}>
            They can never go "above" or "below" the page. They stay together in
            one flat plane.
          </p>

          <div style={styles.lawBox}>
            <p style={styles.lawText}>
              Incident Ray, Reflected Ray, and Normal = Same Plane
            </p>
            <p style={styles.lawText}>(Coplanarity)</p>
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("show2")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* SHOW 2 - REFLECTION */}
      {stage === "show2" && (
        <div style={styles.card}>
          <SecondLawOfReflectionAnimation onTryItClicked={() => setStage("try2")} />
        </div>
      )}

      {/* TRY 2 - REFLECTION */}
      {stage === "try2" && (
        <div style={styles.card}>
          <SecondLawPlaneInteractive />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("test")}
          >
            Ready for Quiz? →
          </button>
        </div>
      )}

      {/* TEST - BOTH LAWS */}
      {stage === "test" && (
        <div style={styles.card}>
          <QuizPage />
        </div>
      )}
  </div>
);

  if (view === "session") {
    return <div style={styles.page}>{renderSession()}</div>;
  }

  if (view === "sandbox") {
    return <Sandbox />;
  }

  return (
    <div style={styles.page}>
      <Dashboard
        onStartTopic={(topicId) => {
          if (topicId === "plane-mirror") {
            setStage("pmTell");
          } else if (topicId === "spherical-mirror-basics") {
              setStage("smTell");
          } else if (topicId === "laws-reflection") {
            setStage("tell1");
          } else {
            setStage("test");
          }
          setView("session");
        }}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F0F4FF",
    fontFamily:
      "Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sessionPage: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  h1: {
    fontSize: "26px",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
  },
  stageBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  stageStep: {
    padding: "8px 18px",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "default",
    userSelect: "none",
  },
  card: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  cardWide: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "860px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  h2: {
    color: "#1E3A8A",
  },
  explanation: {
    fontSize: "14px",
    color: "#374151",
  },
  lawBox: {
    background: "#EFF6FF",
    padding: "10px",
    borderRadius: "6px",
    marginTop: 10,
    marginBottom: 10,
  },
  lawText: {
    fontWeight: 600,
    color: "#1E40AF",
  },
  btnPrimary: {
    background: "#2563EB",
    color: "#FFFFFF",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnSecondary: {
    padding: "8px",
    border: "1px solid #D1D5DB",
    cursor: "pointer",
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    border: "none",
    background: "transparent",
    color: "#2563EB",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default App;
