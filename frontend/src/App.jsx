import React, { useState } from "react";
import QuizPage from "./components/quiz/QuizPage";
import LawsOfReflectionAnimation from "./svg-engine/reflection/animations/LawsOfReflectionAnimation";
import AngleSlider from "./svg-engine/reflection/interactive/AngleSlider";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  const [view, setView] = useState("dashboard");
  const [stage, setStage] = useState("tell");

  const stages = ["tell", "show", "try", "test"];
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
        {stages.map((s, i) => (
          <div
            key={s}
            style={{
              ...styles.stageStep,
              backgroundColor:
                i === currentIndex
                  ? "#2563EB"
                  : i < currentIndex
                  ? "#BFDBFE"
                  : "#E5E7EB",
              color: i === currentIndex ? "#FFFFFF" : "#374151",
            }}
          >
            {{
              tell: "1. Learn",
              show: "2. Watch",
              try: "3. Try",
              test: "4. Quiz",
            }[s]}
          </div>
        ))}
      </div>

      {/* TELL */}
      {stage === "tell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Laws of Reflection</h2>

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
              1. Angle of incidence = Angle of reflection
            </p>
            <p style={styles.lawText}>2. Measured from the Normal</p>
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("show")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* SHOW */}
      {stage === "show" && (
        <div style={styles.card}>
          <LawsOfReflectionAnimation onTryItClicked={() => setStage("try")} />
        </div>
      )}

      {/* TRY */}
      {stage === "try" && (
        <div style={styles.card}>
          <AngleSlider attempt={1} misconceptionTag="" onInteracted={() => {}} />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("test")}
          >
            I'm ready — Take the Quiz →
          </button>
        </div>
      )}

      {/* TEST */}
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
        onStartTopic={() => {
          setStage("tell");
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