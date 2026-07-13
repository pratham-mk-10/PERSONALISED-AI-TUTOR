// ============================================================
// SnellsLawAnimation.jsx — Laws of Refraction (Snell's Law)
// n₁ sin i = n₂ sin r  |  4-part audio-synced lesson
// ============================================================

import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import { clamp } from "../../shared/PhysicsEngine";
import RefractionDiagram from "../shared/RefractionDiagram";
import { I_DEG, R_DEG, N_AIR, N_WATER } from "../shared/refractionConstants";

const S = [0, 0.25, 0.5, 0.75, 1.0];

function sp(progress, stepIndex) {
  const start = S[stepIndex];
  const end = S[stepIndex + 1];
  return clamp((progress - start) / (end - start), 0, 1);
}

const AUDIO_STEPS = [
  {
    progress: S[1],
    text:
      "Now we learn the Laws of Refraction, also called Snell's Law. " +
      "The first law states that the incident ray, the refracted ray, and the normal " +
      "all lie in the same plane — just like in reflection. " +
      "The second law gives us the mathematical relationship between the angles and the refractive indices.",
  },
  {
    progress: S[2],
    text:
      "Snell's Law is written as: n one sin i equals n two sin r. " +
      "Here, n one is the refractive index of the first medium — air, equal to one point zero zero. " +
      "n two is the refractive index of the second medium — water, equal to one point three three. " +
      "i is the angle of incidence and r is the angle of refraction. " +
      "Both angles are always measured from the Normal.",
  },
  {
    progress: S[3],
    text:
      "Let us verify with our diagram. " +
      "Angle i equals forty degrees. Angle r equals twenty nine degrees. " +
      "Substituting into Snell's Law: one point zero zero times sin forty degrees " +
      "equals one point three three times sin twenty nine degrees. " +
      "Both sides are approximately zero point six four three — the law is satisfied. " +
      "This confirms our ray diagram is physically correct.",
  },
  {
    progress: S[4],
    text:
      "Remember the golden rules of refraction. " +
      "When light travels from a rarer medium to a denser medium, r is less than i — the ray bends toward the Normal. " +
      "When light travels from a denser medium to a rarer medium, r is greater than i — the ray bends away from the Normal. " +
      "In our case, air to water: r equals twenty nine degrees, which is less than i equals forty degrees. " +
      "The ray bends toward the Normal, exactly as Snell's Law predicts.",
  },
];

const SnellsLawAnimation = ({ onContinue }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Laws of Refraction (Snell's Law) — 4 Parts"
      showTryIt={!!onContinue}
      onTryItClicked={onContinue}
      tryButtonLabel="Back to Dashboard →"
    >
      {({ progress }) => {
        const part =
          progress < S[1] ? 0 :
          progress < S[2] ? 1 :
          progress < S[3] ? 2 : 3;

        const diagramProgress = part === 0 ? sp(progress, 0) * 0.3 :
          part === 1 ? 0.5 + sp(progress, 1) * 0.3 :
          part === 2 ? 0.85 + sp(progress, 2) * 0.15 : 1;

        const formulaOp = part >= 1 ? clamp(sp(progress, 1) / 0.4, 0, 1) : 0;
        const verifyOp = part >= 2 ? clamp(sp(progress, 2) / 0.5, 0, 1) : 0;
        const rulesOp = part >= 3 ? clamp(sp(progress, 3) / 0.45, 0, 1) : 0;

        const CAPTIONS = [
          { top: "Law 1 — Coplanarity", bot: "Incident ray, refracted ray, and normal lie in the same plane" },
          { top: "Law 2 — Snell's Formula", bot: "n₁ sin i = n₂ sin r" },
          { top: "Verification", bot: `sin ${I_DEG}° ≈ sin ${R_DEG}° × (n₂/n₁) — equation balances ✓` },
          { top: "Golden Rules", bot: "Rarer→Denser: r < i  |  Denser→Rarer: r > i" },
        ];
        const cap = CAPTIONS[part];

        return (
          <div style={{ position: "relative" }}>
            <RefractionDiagram part={6} partProgress={diagramProgress} showCaption={false} />

            {formulaOp > 0 && (
              <div style={{
                position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                background: "#EFF6FF", border: "2px solid #BFDBFE", borderRadius: 8,
                padding: "8px 20px", opacity: formulaOp, pointerEvents: "none",
              }}>
                <span style={{ fontFamily: "Arial", fontWeight: 800, color: "#1E40AF", fontSize: 16 }}>
                  n₁ sin i = n₂ sin r
                </span>
              </div>
            )}

            {verifyOp > 0 && (
              <div style={{
                position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)",
                background: "#FEF3C7", border: "1.5px solid #D97706", borderRadius: 8,
                padding: "6px 14px", opacity: verifyOp, pointerEvents: "none", textAlign: "center",
              }}>
                <div style={{ fontFamily: "Arial", fontSize: 12, fontWeight: 700, color: "#78350F" }}>
                  {N_AIR} × sin({I_DEG}°) = {N_WATER} × sin({R_DEG}°)
                </div>
                <div style={{ fontFamily: "Arial", fontSize: 11, color: "#92400E" }}>≈ 0.643 = 0.643 ✓</div>
              </div>
            )}

            {rulesOp > 0 && (
              <div style={{
                position: "absolute", bottom: 72, left: "50%", transform: "translateX(-50%)",
                background: "#ECFDF5", border: "1.5px solid #059669", borderRadius: 8,
                padding: "8px 16px", opacity: rulesOp, pointerEvents: "none", textAlign: "center",
                maxWidth: 420,
              }}>
                <div style={{ fontFamily: "Arial", fontSize: 12, fontWeight: 700, color: "#064E3B" }}>
                  Air → Water: r ({R_DEG}°) &lt; i ({I_DEG}°) → bends TOWARD Normal
                </div>
              </div>
            )}

            {/* Override caption for Snell lesson */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 62,
              background: "#EEF2FF", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", pointerEvents: "none",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", fontFamily: "Arial" }}>{cap.top}</span>
              <span style={{ fontSize: 11, color: "#4B5563", fontFamily: "Arial" }}>{cap.bot}</span>
            </div>
          </div>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default SnellsLawAnimation;
