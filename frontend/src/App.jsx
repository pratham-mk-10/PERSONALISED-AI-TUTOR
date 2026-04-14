import React, { useState } from "react";
import QuizPage from "./components/quiz/QuizPage";
import FirstLawOfReflectionAnimation from "./svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import FirstLawPlaneInteractive from "./svg-engine/reflection/interactive/FirstLawPlaneInteractive";
import SecondLawOfReflectionAnimation from "./svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import SecondLawPlaneInteractive from "./svg-engine/reflection/interactive/SecondLawPlaneInteractive";
import PlaneMirrorBasicsAnimation from "./svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import Dashboard from "./components/dashboard/Dashboard";
import { useSessionStore } from "./state/sessionStore";

function App() {
  const [view, setView] = useState("dashboard");
  const [stage, setStage] = useState("pmTell");
  const selectTopic = useSessionStore((s) => s.selectTopic);

  const stages = [
    "pmTell",
    "pmShow",
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
            return s !== "pmTell" && s !== "pmShow";
          })
          .map((s, i) => (
          <div
            key={s}
            style={{
              ...styles.stageStep,
              backgroundColor:
                stages.indexOf(s) === currentIndex
                  ? "#2563EB"
                  : stages.indexOf(s) < currentIndex
                  ? "#BFDBFE"
                  : "#E5E7EB",
              color: stages.indexOf(s) === currentIndex ? "#FFFFFF" : "#374151",
            }}
          >
            {{
              pmTell: "1. Plane Basics",
              pmShow: "2. Watch",
              tell1: "1. 1st Law",
              show1: "2. Watch",
              try1: "3. Try",
              tell2: "4. 2nd Law",
              show2: "5. Watch",
              try2: "6. Try",
              test: "7. Quiz",
            }[s]}
          </div>
        ))}
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

      {/* TELL 1 - 1ST LAW */}
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

      {/* SHOW 1 - 1ST LAW */}
      {stage === "show1" && (
        <div style={styles.card}>
          <FirstLawOfReflectionAnimation onTryItClicked={() => setStage("try1")} />
        </div>
      )}

      {/* TRY 1 - 1ST LAW */}
      {stage === "try1" && (
        <div style={styles.card}>
          <FirstLawPlaneInteractive attempt={1} misconceptionTag="" onInteracted={() => {}} />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("tell2")}
          >
            Learn 2nd Law of Reflection →
          </button>
        </div>
      )}

      {/* TELL 2 - 2ND LAW */}
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

      {/* SHOW 2 - 2ND LAW */}
      {stage === "show2" && (
        <div style={styles.card}>
          <SecondLawOfReflectionAnimation onTryItClicked={() => setStage("try2")} />
        </div>
      )}

      {/* TRY 2 - 2ND LAW */}
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

  return (
    <div style={styles.page}>
      <Dashboard
        onStartTopic={(topicId) => {
          if (topicId === "plane-mirror") {
            setStage("pmTell");
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
    gap: "8px",
    marginBottom: "20px",
  },
  stageStep: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  card: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "600px",
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
