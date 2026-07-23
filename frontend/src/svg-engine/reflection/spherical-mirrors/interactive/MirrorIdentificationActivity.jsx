// ============================================================
// MirrorIdentificationActivity.jsx
// TRY-style activity: 3 "mystery mirror" panels (concave, convex,
// plane) shown at a fixed close distance, mirror curve hidden.
// Student guesses the type from the reflection alone (magnified
// vs diminished vs same size, per Lakhmir Singh's own
// "hold close to your face" identification method), then the
// curve is revealed. A static by-touch + spoon-analogy panel
// follows once all 3 are guessed.
// ============================================================

import React, { useState } from "react";
import { Label } from "../../../shared/SVGUtils";

// Concave: face held between F and P -> magnified, erect reflection
//   (same case verified elsewhere this project: f=10, u=5, h=4 -> v=+10, h'=+8, m=+2).
// Convex: any finite distance -> diminished, erect reflection
//   (f=10, u=10, h=4 -> v=+5, h'=+2, m=+0.5).
// Plane: same size, erect, always.
const PANELS = [
  { type: "concave", scale: 2.0, label: "Panel A" },
  { type: "convex", scale: 0.5, label: "Panel B" },
  { type: "plane", scale: 1.0, label: "Panel C" },
];

const TYPE_LABELS = { concave: "Concave", convex: "Convex", plane: "Plane" };

const FaceIcon = ({ cx, cy, r, color = "#374151" }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={Math.max(1.5, r / 10)} />
    <circle cx={cx - r * 0.35} cy={cy - r * 0.15} r={Math.max(1, r * 0.08)} fill={color} />
    <circle cx={cx + r * 0.35} cy={cy - r * 0.15} r={Math.max(1, r * 0.08)} fill={color} />
    <path
      d={`M ${cx - r * 0.35} ${cy + r * 0.3} Q ${cx} ${cy + r * 0.55} ${cx + r * 0.35} ${cy + r * 0.3}`}
      fill="none"
      stroke={color}
      strokeWidth={Math.max(1, r / 12)}
    />
  </g>
);

const MirrorPanel = ({ panel, guess, revealed, onGuess }) => {
  const W = 220, H = 190;
  const mirrorX = 150;
  const axisY = 95;
  const isCorrect = guess === panel.type;

  const concaveArc = `M ${mirrorX - 5} ${axisY - 70} Q ${mirrorX + 22} ${axisY} ${mirrorX - 5} ${axisY + 70}`;
  const convexArc = `M ${mirrorX - 5} ${axisY - 70} Q ${mirrorX - 32} ${axisY} ${mirrorX - 5} ${axisY + 70}`;

  return (
    <div style={styles.panelWrapper}>
      <p style={styles.panelLabel}>{panel.label}</p>
      <svg width={W} height={H} style={styles.svgBox}>
        <rect width={W} height={H} fill="#F8FAFF" />
        {!revealed && <line x1={mirrorX} y1={axisY - 70} x2={mirrorX} y2={axisY + 70} stroke="#1F2937" strokeWidth={5} />}
        {revealed && panel.type === "concave" && <path d={concaveArc} fill="none" stroke="#1F2937" strokeWidth={5} />}
        {revealed && panel.type === "convex" && <path d={convexArc} fill="none" stroke="#1F2937" strokeWidth={5} />}
        {revealed && panel.type === "plane" && <line x1={mirrorX} y1={axisY - 70} x2={mirrorX} y2={axisY + 70} stroke="#1F2937" strokeWidth={5} />}

        <FaceIcon cx={50} cy={axisY} r={22} color="#16A34A" />
        <Label x={50} y={axisY + 45} text="You" size={11} color="#16A34A" />

        <FaceIcon cx={mirrorX + 30} cy={axisY} r={22 * panel.scale > 45 ? 45 : 22 * panel.scale} color="#DC2626" />
        <Label x={mirrorX + 30} y={axisY + 55} text="Your reflection" size={11} color="#DC2626" />
      </svg>

      {!revealed && (
        <div style={styles.choiceRow}>
          {["concave", "convex", "plane"].map((t) => (
            <button key={t} style={styles.btnGuess} onClick={() => onGuess(t)}>{TYPE_LABELS[t]}</button>
          ))}
        </div>
      )}
      {revealed && (
        <p style={{ ...styles.resultText, color: isCorrect ? "#34D399" : "#F87171" }}>
          {isCorrect ? "✓ Correct" : "✗ Not quite"} — this is a <strong>{TYPE_LABELS[panel.type]}</strong> mirror.
        </p>
      )}
    </div>
  );
};

const MirrorIdentificationActivity = () => {
  const [guesses, setGuesses] = useState({});

  const handleGuess = (index, type) => {
    setGuesses((prev) => ({ ...prev, [index]: type }));
  };

  const allGuessed = PANELS.every((_, i) => guesses[i] !== undefined);

  return (
    <div style={styles.wrapper}>
      <p style={styles.title}>Three mystery mirrors — guess the type from your reflection alone</p>
      <p style={styles.subtitle}>
        Hold your face close to each mirror. A giant, magnified reflection means concave; a tiny,
        diminished reflection means convex; a same-size reflection means plane.
      </p>
      <div style={styles.panelsRow}>
        {PANELS.map((panel, i) => (
          <MirrorPanel
            key={i}
            panel={panel}
            guess={guesses[i]}
            revealed={guesses[i] !== undefined}
            onGuess={(t) => handleGuess(i, t)}
          />
        ))}
      </div>

      {allGuessed && (
        <div style={styles.explainBox}>
          <p style={styles.explainTitle}>Two more ways to tell, without even looking:</p>
          <p style={styles.explainText}>
            <strong>By touch:</strong> run your finger over the reflecting surface. A concave mirror's
            surface is depressed inward (like the inside of a bowl); a convex mirror's surface bulges
            outward.
          </p>
          <p style={styles.explainText}>
            <strong>The spoon analogy:</strong> look at your reflection in a steel spoon. The inner,
            hollow side behaves exactly like a concave mirror (magnified when close). The outer,
            bulging back behaves exactly like a convex mirror (always diminished).
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "12px", padding: "16px", fontFamily: "Arial, sans-serif" },
  title: { fontSize: "15px", fontWeight: 600, color: "#F8FAFC", margin: 0 },
  subtitle: { fontSize: "13px", color: "#9CA3AF", margin: 0 },
  panelsRow: { display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" },
  panelWrapper: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "#F8FAFF", borderRadius: "12px", padding: "10px", border: "1px solid #334155" },
  panelLabel: { fontSize: "12px", fontWeight: 700, color: "#1E40AF", margin: 0 },
  svgBox: { borderRadius: "8px", overflow: "hidden" },
  choiceRow: { display: "flex", gap: "6px" },
  btnGuess: { padding: "6px 12px", borderRadius: "9999px", border: "1px solid #3B82F6", background: "transparent", color: "#1D4ED8", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  resultText: { fontSize: "12px", margin: 0, textAlign: "center", maxWidth: "200px" },
  explainBox: { background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "8px", padding: "14px 18px", marginTop: "8px" },
  explainTitle: { fontSize: "14px", fontWeight: 600, color: "#60A5FA", margin: "0 0 8px 0" },
  explainText: { fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6, margin: "0 0 8px 0" },
};

export default MirrorIdentificationActivity;
