import React, { useState } from "react";

import LawsOfReflectionAnimation from "./svg-engine/reflection/animations/LawsOfReflectionAnimation";
import AngleSlider from "./svg-engine/reflection/interactive/AngleSlider";

function App() {
  const [stage, setStage] = useState("tell");

  // ✅ FIX: define stages array
  const stages = ["tell", "show", "try", "test"];
  const currentIndex = stages.indexOf(stage);

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.h1}>Personalised AI Tutor</h1>
        <p style={styles.subtitle}>
          Class 10 NCERT — Light: Reflection & Refraction
        </p>
      </div>

      {/* STAGE BAR */}
      <div style={styles.stageBar}>
        {stages.map((s, i) => (
          <div
            key={s}
            style={{
              ...styles.stageStep,
              background:
                i === currentIndex
                  ? "#2563EB"
                  : i < currentIndex
                  ? "#BFDBFE"
                  : "#E5E7EB",
              color: i === currentIndex ? "#fff" : "#374151",
            }}
          >
            {{ tell: "1. Learn", show: "2. Watch", try: "3. Try", test: "4. Quiz" }[s]}
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
            <p style={styles.lawText}>1. Angle of incidence = Angle of reflection</p>
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
          <LawsOfReflectionAnimation
            onTryItClicked={() => setStage("try")}
          />
        </div>
      )}

      {/* TRY */}
      {stage === "try" && (
        <div style={styles.card}>
          <AngleSlider
            attempt={1}
            misconceptionTag=""
            onInteracted={() => {}}
          />

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
          <h2 style={styles.h2}>Comprehension Quiz</h2>
          <p style={styles.explanation}>
            Quiz will be connected to backend.
          </p>

          <button
            style={styles.btnSecondary}
            onClick={() => setStage("tell")}
          >
            ← Back
          </button>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F0F4FF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    fontFamily: "Arial",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  h1: {
    fontSize: "26px",
    color: "#1E3A8A",
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
    fontWeight: "600",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "500px",
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
  },
  lawText: {
    fontWeight: "600",
    color: "#1E40AF",
  },
  btnPrimary: {
    background: "#2563EB",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "8px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
};

export default App;