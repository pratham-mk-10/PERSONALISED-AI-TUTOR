import React from "react";
import LongFormLesson from "../shared/LongFormLesson";
import RefractionDiagram from "../shared/RefractionDiagram";
import { SNELL_STEPS } from "../shared/refractionNarrations";
import { I_DEG, R_DEG, N_AIR, N_WATER } from "../shared/refractionConstants";
import { clamp } from "../../shared/PhysicsEngine";

const SnellsLawAnimation = ({ onContinue }) => (
  <LongFormLesson
    title="Watch: Laws of Refraction (Snell's Law) — Full Lesson"
    steps={SNELL_STEPS}
    onContinue={onContinue}
    tryButtonLabel="Continue to Glass Slab →"
  >
    {({ part, partProgress }) => {
      const formulaOp = part >= 2 ? clamp(partProgress, 0, 1) : 0;
      const verifyOp = part >= 3 ? clamp(partProgress, 0, 1) : 0;
      const rulesOp = part >= 4 ? clamp(partProgress, 0, 1) : 0;

      return (
        <div style={{ position: "relative" }}>
          <RefractionDiagram part={6} partProgress={1} showCaption={false} />
          {formulaOp > 0 && part === 2 && (
            <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", background: "#EFF6FF", border: "2px solid #BFDBFE", borderRadius: 8, padding: "8px 20px", opacity: formulaOp }}>
              <span style={{ fontFamily: "Arial", fontWeight: 800, color: "#1E40AF", fontSize: 16 }}>n₁ sin i = n₂ sin r</span>
            </div>
          )}
          {verifyOp > 0 && part === 3 && (
            <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: 8, padding: "6px 14px", opacity: verifyOp, textAlign: "center" }}>
              <div style={{ fontFamily: "Arial", fontSize: 12, fontWeight: 700, color: "#78350F" }}>{N_AIR} × sin({I_DEG}°) = {N_WATER} × sin({R_DEG}°)</div>
              <div style={{ fontFamily: "Arial", fontSize: 11, color: "#92400E" }}>≈ 0.643 = 0.643 ✓</div>
            </div>
          )}
          {rulesOp > 0 && part === 4 && (
            <div style={{ position: "absolute", bottom: 72, left: "50%", transform: "translateX(-50%)", background: "#ECFDF5", border: "1.5px solid #059669", borderRadius: 8, padding: "8px 16px", opacity: rulesOp, textAlign: "center" }}>
              <div style={{ fontFamily: "Arial", fontSize: 12, fontWeight: 700, color: "#064E3B" }}>Air → Water: r ({R_DEG}°) &lt; i ({I_DEG}°) → toward Normal</div>
            </div>
          )}
          <CaptionBar part={part} total={4} labels={["Law 1 — Coplanarity", "Law 2 — Snell's Formula", "Verification", "Golden Rules"]} />
        </div>
      );
    }}
  </LongFormLesson>
);

function CaptionBar({ part, total, labels }) {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 52, background: "#EEF2FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", fontFamily: "Arial" }}>Part {part} / {total}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", fontFamily: "Arial" }}>{labels[part - 1]}</span>
    </div>
  );
}

export default SnellsLawAnimation;
