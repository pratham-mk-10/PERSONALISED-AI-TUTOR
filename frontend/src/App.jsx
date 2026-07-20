import React, { useState } from "react";
import QuizPage from "./components/quiz/QuizPage";
import FirstLawOfReflectionAnimation from "./svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import FirstLawPlaneInteractive from "./svg-engine/reflection/interactive/FirstLawPlaneInteractive";
import SecondLawOfReflectionAnimation from "./svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import SecondLawPlaneInteractive from "./svg-engine/reflection/interactive/SecondLawPlaneInteractive";
import PlaneMirrorBasicsAnimation from "./svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import SphericalMirrorDetailedAnimation from "./svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorDetailedAnimation";
import RayTracingRulesLesson from "./svg-engine/reflection/spherical-mirrors/animations/RayTracingRulesLesson";
import ImageFormationLesson from "./svg-engine/reflection/spherical-mirrors/animations/ImageFormationLesson";
import RefractionSession, { topicIdForStage } from "./components/session/RefractionSession";
import { REFRACTION_STAGES, REFRACTION_TOPICS, REFRACTION_TOPIC_ORDER } from "./config/refractionTopics";
import Dashboard from "./components/dashboard/Dashboard";
import { useSessionStore } from "./state/sessionStore";
import Sandbox from "./Sandbox";

function App() {
  const [view, setView] = useState("dashboard");
  const [stage, setStage] = useState("pmTell");
  const [activeCaseId, setActiveCaseId] = useState("concave-infinity");
  const selectTopic = useSessionStore((s) => s.selectTopic);
  const currentTopicId = useSessionStore((s) => s.currentTopicId);

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
    "smRulesTell",
    "smRulesShow",
    "smFormationTell",
    "smFormationShow",
    "tell1",
    "show1",
    "try1",
    "tell2",
    "show2",
    "try2",
    "test",
    "mirrorFormulaComingSoon",
    // ── REFRACTION ──
    ...REFRACTION_STAGES,
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
            if (currentTopicId === "spherical-mirror-basics") {
              return s === "smTell" || s === "smShow" || s === "smQuiz";
            }
            if (currentTopicId === "spherical-mirror-rules") {
              return s === "smRulesTell" || s === "smRulesShow" || s === "smQuiz";
            }
            if (currentTopicId === "spherical-mirror-image-formation") {
              return s === "smFormationTell" || s === "smFormationShow" || s === "smQuiz";
            }
            if (stage === "mirrorFormulaComingSoon") {
              return s === "mirrorFormulaComingSoon";
            }
            if (REFRACTION_TOPIC_ORDER.includes(currentTopicId)) {
              const rf = REFRACTION_TOPICS[currentTopicId];
              return s === rf.tell || s === rf.show || s === rf.quiz;
            }
            if (topicIdForStage(stage)) {
              const rf = REFRACTION_TOPICS[topicIdForStage(stage)];
              return s === rf.tell || s === rf.show || s === rf.quiz;
            }
            // Hide all prior stages when in Laws of Reflection
            return s !== "pmTell" && s !== "pmShow" && s !== "smTell" && s !== "smShow" && s !== "smQuiz" && s !== "smRulesTell" && s !== "smRulesShow" && s !== "smFormationTell" && s !== "smFormationShow" && s !== "mirrorFormulaComingSoon" && !REFRACTION_STAGES.includes(s);
          })
          .map((s, i) => {
            const isActive = stage === s;
            const isCompleted = stages.indexOf(s) < stages.indexOf(stage);
            
            return (
              <div
                key={s}
                style={{
                  ...styles.stageStep,
                  background: isActive 
                    ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" 
                    : isCompleted ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: isActive ? "#FFFFFF" : isCompleted ? "#60A5FA" : "#6B7280",
                  border: isActive 
                    ? "1px solid #3B82F6" 
                    : isCompleted ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255, 255, 255, 0.02)",
                  boxShadow: isActive ? "0 4px 12px rgba(59,130,246,0.3)" : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {{
                  pmTell: "1. Plane Basics",
                  pmShow: "2. Watch",
                  smTell: "1. Basics",
                  smShow: "2. Watch",
                  smRulesTell: "1. Rules",
                  smRulesShow: "2. Watch",
                  smFormationTell: "1. Image Formation",
                  smFormationShow: "2. Watch",
                  smQuiz: "3. Quiz",
                  tell1: "1. 1st Law",
                  show1: "2. Watch",
                  try1: "3. Try",
                  tell2: "4. 2nd Law",
                  show2: "5. Watch",
                  try2: "6. Try",
                  test: "7. Quiz",
                  mirrorFormulaComingSoon: "Coming Soon",
                  rfIntroTell: "1. Intro",
                  rfIntroShow: "2. Watch",
                  rfIntroQuiz: "3. Quiz",
                  rfSnellTell: "1. Snell's Law",
                  rfSnellShow: "2. Watch",
                  rfSnellQuiz: "3. Quiz",
                  rfGlassTell: "1. Glass Slab",
                  rfGlassShow: "2. Watch",
                  rfGlassQuiz: "3. Quiz",
                  rfLensesTell: "1. Lenses",
                  rfLensesShow: "2. Watch",
                  rfLensesQuiz: "3. Quiz",
                  rfLensImgTell: "1. Images",
                  rfLensImgShow: "2. Watch",
                  rfLensImgQuiz: "3. Quiz",
                  rfLensFormulaTell: "1. Formula",
                  rfLensFormulaShow: "2. Watch",
                  rfLensFormulaQuiz: "3. Quiz",
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
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Continue to Basics Quiz →
            </button>
          </div>
        </div>
      )}

      {/* RAY TRACING RULES - TELL */}
      {stage === "smRulesTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Prerequisite: Ray Tracing Rules</h2>
          <p style={styles.explanation}>
            Before we can form images with spherical mirrors, we need to know how light rays behave.
            There are 3 standard rules of ray tracing that you must master.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("smRulesShow")}>
            Watch the 3 Rules →
          </button>
        </div>
      )}

      {/* RAY TRACING RULES - SHOW */}
      {stage === "smRulesShow" && (
        <div style={styles.cardWide}>
          <RayTracingRulesLesson onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Continue to Rules Quiz →
            </button>
          </div>
        </div>
      )}

      {/* IMAGE FORMATION - TELL */}
      {stage === "smFormationTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Image Formation by Spherical Mirrors</h2>
          <p style={styles.explanation}>
            By combining the 3 rules you just learned, we can predict exactly where an image will form for any object!
            There are 8 total cases (6 for Concave, 2 for Convex). Let's watch them in action.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("smFormationShow")}>
            Watch Image Formation →
          </button>
        </div>
      )}

      {/* IMAGE FORMATION - SHOW */}
      {stage === "smFormationShow" && (
        <div style={styles.cardWide}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
            {[
              { id: "concave-infinity", label: "Concave: Obj At Infinity" },
              { id: "concave-beyond-c", label: "Concave: Obj Beyond C" },
              { id: "concave-at-c", label: "Concave: Obj At C" },
              { id: "concave-between-c-and-f", label: "Concave: Obj Between C & F" },
              { id: "concave-at-f", label: "Concave: Obj At F" },
              { id: "concave-between-f-and-p", label: "Concave: Obj Between F & P" },
              { id: "convex-infinity", label: "Convex: Obj At Infinity" },
              { id: "convex-finite", label: "Convex: Obj Finite Distance" },
            ].map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCaseId(c.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  border: `1px solid ${activeCaseId === c.id ? "#2563EB" : "#D1D5DB"}`,
                  background: activeCaseId === c.id ? "#2563EB" : "#fff",
                  color: activeCaseId === c.id ? "#fff" : "#111827",
                  fontWeight: activeCaseId === c.id ? "600" : "500",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ImageFormationLesson caseId={activeCaseId} onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Go to Spherical Mirror Quiz →
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

      {/* TELL 1 - 1st LAW */}
      {stage === "tell1" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>1st Law of Reflection</h2>

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
          <FirstLawPlaneInteractive attempt={1} misconceptionTag="" onInteracted={() => { }} />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("tell2")}
          >
            Continue reflection lesson →
          </button>
        </div>
      )}

      {/* TELL 2 - 2nd LAW */}
      {stage === "tell2" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>2nd Law of Reflection</h2>

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

      {/* MIRROR FORMULA - COMING SOON */}
      {stage === "mirrorFormulaComingSoon" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>4. Mirror Formula (Numerical Section)</h2>
          <p style={styles.explanation}>
            This numerical and formula section is currently under development.
          </p>
          <div style={styles.lawBox || { padding: "12px", background: "#fef2f2", border: "1px dashed #fca5a5", borderRadius: "8px", margin: "16px 0", textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#991b1b" }}>Coming Soon!</p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setView("dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          REFRACTION MODULE (all 6 topics)
      ═══════════════════════════════════════════════════════ */}
      {topicIdForStage(stage) && (
        <RefractionSession
          stage={stage}
          setStage={setStage}
          setView={setView}
          selectTopic={selectTopic}
          styles={styles}
        />
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
          } else if (topicId === "spherical-mirror-rules") {
            setStage("smRulesTell");
          } else if (topicId === "spherical-mirror-image-formation") {
            setStage("smFormationTell");
          } else if (topicId === "mirror-formula") {
            setStage("mirrorFormulaComingSoon");
          } else if (topicId === "laws-reflection") {
            setStage("tell1");
          } else if (topicId === "refraction-intro") {
            setStage("rfIntroTell");
          } else if (REFRACTION_TOPICS[topicId]) {
            setStage(REFRACTION_TOPICS[topicId].tell);
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
    background: "#0B0F19",
    color: "#F8FAFC",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sessionPage: {
    maxWidth: "1000px",
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
    color: "#60A5FA",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: "14px",
    color: "#9CA3AF",
  },
  stageBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    padding: "12px",
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.02)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
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
    background: "#1E293B",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255, 255, 255, 0.02)",
  },
  cardWide: {
    background: "#1E293B",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "960px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255, 255, 255, 0.02)",
  },
  h2: {
    color: "#F8FAFC",
    marginBottom: "16px",
  },
  explanation: {
    fontSize: "15px",
    color: "#D1D5DB",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  lawBox: {
    background: "rgba(59, 130, 246, 0.1)",
    padding: "16px",
    borderRadius: "8px",
    marginTop: 10,
    marginBottom: 10,
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  lawText: {
    fontWeight: 600,
    color: "#60A5FA",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    color: "#FFFFFF",
    padding: "12px 24px",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
    transition: "transform 0.2s",
  },
  btnSecondary: {
    padding: "12px 24px",
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    borderRadius: "9999px",
    backgroundColor: "transparent",
    color: "#FFFFFF",
    fontWeight: 600,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
    border: "none",
    background: "transparent",
    color: "#60A5FA",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
};

export default App;
