// ============================================================
// FirstLawOfReflectionAnimation.jsx — 7-PART AUDIO-SYNCED VERSION
//
// Part 1: Mirror (reflecting surface)
// Part 2: Normal (perpendicular to mirror)
// Part 3: Incident Ray draws in slowly
// Part 4: Angle of Incidence (i)
// Part 5: Reflected Ray draws in slowly
// Part 6: Angle of Reflection (r)
// Part 7: First Law — ∠i = ∠r (both from Normal)
//
// Physics: angle of incidence = angle of reflection = 35°
// ============================================================

import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import {
  incidentRayStart,
  reflectedRayEnd,
  describeArc,
  lerp,
  clamp,
} from "../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  AngleArc,
  Label,
} from "../../shared/SVGUtils";

const SVG_W = 420;
const SVG_H = 300;
const CX = 210;
const CY = 220;
const RAY_LEN = 160;
const ANGLE = 35;
const ARC_R = 45;

const S = [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1.0];

function sp(progress, stepIndex) {
  const start = S[stepIndex];
  const end = S[stepIndex + 1];
  return clamp((progress - start) / (end - start), 0, 1);
}

const AUDIO_STEPS = [
  {
    progress: S[1],
    text:
      "Welcome. Let us learn the first law of reflection. " +
      "Look at this horizontal line at the bottom of the diagram. " +
      "This is a plane mirror — a smooth, flat, polished reflecting surface. " +
      "When light strikes this surface, it bounces back. " +
      "This bouncing of light is called reflection. " +
      "The mirror is our reflecting surface for this entire lesson.",
  },
  {
    progress: S[2],
    text:
      "Now, at the centre of the mirror, we draw a dashed line going straight upward. " +
      "This line is perpendicular to the mirror — it makes exactly ninety degrees with the surface. " +
      "This important reference line is called the Normal. " +
      "Remember this critical rule: in reflection, ALL angles are measured from the Normal, " +
      "never from the mirror surface itself.",
  },
  {
    progress: S[3],
    text:
      "Now watch the blue ray appear slowly. " +
      "This is the Incident Ray — the ray of light travelling toward the mirror. " +
      "It moves from the upper left and strikes the mirror at the point of incidence. " +
      "The incident ray is still approaching the mirror at this moment.",
  },
  {
    progress: S[4],
    text:
      "The angle between the Incident Ray and the Normal, measured in the air above the mirror, " +
      "is called the Angle of Incidence. We write it as the letter i. " +
      "In this diagram, i equals thirty five degrees. " +
      "Always measure this angle from the Normal, not from the mirror surface.",
  },
  {
    progress: S[5],
    text:
      "Now watch the red ray appear. " +
      "This is the Reflected Ray — the ray that bounces off the mirror after impact. " +
      "It leaves the point of incidence and travels into the upper right. " +
      "The reflected ray obeys the same physics: it stays in the same plane as the incident ray and the normal.",
  },
  {
    progress: S[6],
    text:
      "The angle between the Reflected Ray and the Normal, on the other side of the normal, " +
      "is called the Angle of Reflection. We write it as the letter r. " +
      "In this diagram, r also equals thirty five degrees. " +
      "Notice that r is on the opposite side of the normal from i, but both are measured from the normal.",
  },
  {
    progress: S[7],
    text:
      "This brings us to the First Law of Reflection. " +
      "The angle of incidence equals the angle of reflection. " +
      "In symbols: angle i equals angle r. " +
      "Both angles are measured from the Normal. " +
      "In our diagram, i equals thirty five degrees and r equals thirty five degrees — they are equal. " +
      "This is the fundamental rule of reflection that you must always remember.",
  },
];

const FirstLawOfReflectionAnimation = ({ onTryItClicked }) => {
  const incStart = incidentRayStart(CX, CY, RAY_LEN, ANGLE);
  const refEnd = reflectedRayEnd(CX, CY, RAY_LEN, ANGLE);
  const incArcPath = describeArc(CX, CY, ARC_R, -ANGLE, 0);
  const refArcPath = describeArc(CX, CY, ARC_R, 0, ANGLE);
  const incLabelX = CX - ARC_R * 1.4 * Math.sin((ANGLE / 2) * Math.PI / 180);
  const incLabelY = CY - ARC_R * 1.2 * Math.cos((ANGLE / 2) * Math.PI / 180);
  const refLabelX = CX + ARC_R * 1.4 * Math.sin((ANGLE / 2) * Math.PI / 180);
  const refLabelY = CY - ARC_R * 1.2 * Math.cos((ANGLE / 2) * Math.PI / 180);

  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: 1st Law of Reflection — 7 Parts"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Try it yourself →"
    >
      {({ progress }) => {
        const part =
          progress < S[1] ? 0 :
          progress < S[2] ? 1 :
          progress < S[3] ? 2 :
          progress < S[4] ? 3 :
          progress < S[5] ? 4 :
          progress < S[6] ? 5 : 6;

        const mirrorOpacity = part >= 0 ? clamp(sp(progress, 0) / 0.5, 0, 1) : 0;
        const normalOpacity = part >= 1 ? clamp(sp(progress, 1) / 0.55, 0, 1) : 0;
        const incPhase = part >= 2 ? clamp(sp(progress, 2) / 0.7, 0, 1) : 0;
        const refPhase = part >= 4 ? clamp(sp(progress, 4) / 0.7, 0, 1) : 0;
        const arcIOp = part >= 3 ? clamp(sp(progress, 3) / 0.45, 0, 1) : 0;
        const arcROp = part >= 5 ? clamp(sp(progress, 5) / 0.45, 0, 1) : 0;
        const lawOp = part >= 6 ? clamp(sp(progress, 6) / 0.4, 0, 1) : 0;

        const incTip = lerp(incStart.x, incStart.y, CX, CY, incPhase);
        const refTip = lerp(CX, CY, refEnd.x, refEnd.y, refPhase);

        const CAPTIONS = [
          { top: "Part 1 — The Mirror", bot: "Smooth flat reflecting surface where light bounces back" },
          { top: "Part 2 — The Normal (N)", bot: "⊥ to mirror at 90° — all angles measured from here" },
          { top: "Part 3 — Incident Ray", bot: "Blue ray travelling toward the mirror" },
          { top: "Part 4 — Angle of Incidence (i)", bot: "i = 35° measured from Normal in air" },
          { top: "Part 5 — Reflected Ray", bot: "Red ray bouncing off the mirror" },
          { top: "Part 6 — Angle of Reflection (r)", bot: "r = 35° measured from Normal on other side" },
          { top: "Part 7 — 1st Law: ∠i = ∠r", bot: "Angle of incidence equals angle of reflection" },
        ];
        const cap = CAPTIONS[part];

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            <g opacity={mirrorOpacity}>
              <PlaneMirror x1={60} x2={360} y={CY} />
              {part === 0 && (
                <line x1={60} x2={360} y1={CY} y2={CY} stroke="#22C55E" strokeWidth="4" opacity="0.4" />
              )}
            </g>

            {normalOpacity > 0 && (
              <g opacity={normalOpacity}>
                <Normal x={CX} topY={60} bottomY={CY} />
                <Label x={CX + 8} y={75} text="Normal" color="#6B7280" size={12} anchor="start" />
              </g>
            )}

            {incPhase > 0 && (
              <g>
                <line
                  x1={incStart.x} y1={incStart.y}
                  x2={incTip.x} y2={incTip.y}
                  stroke="#2563EB" strokeWidth="2.5"
                  markerEnd={incPhase >= 0.98 ? "url(#flr-arrow-blue)" : undefined}
                />
                {incPhase < 0.98 && <circle cx={incTip.x} cy={incTip.y} r={4} fill="#2563EB" />}
              </g>
            )}

            {refPhase > 0 && (
              <g>
                <line
                  x1={CX} y1={CY}
                  x2={refTip.x} y2={refTip.y}
                  stroke="#DC2626" strokeWidth="2.5"
                  markerEnd={refPhase >= 0.98 ? "url(#flr-arrow-red)" : undefined}
                />
                {refPhase < 0.98 && <circle cx={refTip.x} cy={refTip.y} r={4} fill="#DC2626" />}
              </g>
            )}

            <defs>
              <marker id="flr-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
              </marker>
              <marker id="flr-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {arcIOp > 0 && (
              <g opacity={arcIOp}>
                <AngleArc pathD={incArcPath} color="#2563EB" label="i" labelX={incLabelX - 6} labelY={incLabelY} />
                <Label x={incLabelX} y={incLabelY + 18} text="= 35°" color="#1E40AF" size={10} anchor="middle" />
              </g>
            )}

            {arcROp > 0 && (
              <g opacity={arcROp}>
                <AngleArc pathD={refArcPath} color="#DC2626" label="r" labelX={refLabelX + 6} labelY={refLabelY} />
                <Label x={refLabelX} y={refLabelY + 18} text="= 35°" color="#991B1B" size={10} anchor="middle" />
              </g>
            )}

            {lawOp > 0 && (
              <g opacity={lawOp}>
                <rect x={90} y={55} width={240} height={28} rx={6} fill="#EFF6FF" stroke="#BFDBFE" />
                <Label x={210} y={29} text="∠i = ∠r  (both from Normal)" color="#1E40AF" size={12} bold anchor="middle" />
              </g>
            )}

            <rect x={0} y={SVG_H - 52} width={SVG_W} height={52} fill="#EEF2FF" opacity="0.95" />
            <line x1={0} y1={SVG_H - 52} x2={SVG_W} y2={SVG_H - 52} stroke="#C7D2FE" strokeWidth="1.2" />
            <rect x={10} y={SVG_H - 45} width={60} height={18} rx={9} fill="#4F46E5" opacity="0.85" />
            <text x={40} y={SVG_H - 32} fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Arial" textAnchor="middle">
              Part {part + 1} / 7
            </text>
            <text x={SVG_W / 2} y={SVG_H - 28} fill="#1D4ED8" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">
              {cap.top}
            </text>
            <text x={SVG_W / 2} y={SVG_H - 12} fill="#4B5563" fontSize="10" fontFamily="Arial" textAnchor="middle">
              {cap.bot}
            </text>
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default FirstLawOfReflectionAnimation;
