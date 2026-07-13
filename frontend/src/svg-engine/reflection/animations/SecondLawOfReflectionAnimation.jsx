// ============================================================
// SecondLawOfReflectionAnimation.jsx — 8-PART AUDIO-SYNCED VERSION
//
// Part 1: Introduction to 2nd Law (coplanarity)
// Part 2: Mirror surface
// Part 3: Normal line
// Part 4: Plane of incidence definition
// Part 5: Incident ray in the plane
// Part 6: Reflected ray in the plane
// Part 7: All three in the SAME plane (emphasis)
// Part 8: 2nd Law statement
//
// Physics: incident ray, reflected ray, and normal are coplanar
// ============================================================

import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import {
  incidentRayStart,
  reflectedRayEnd,
  lerp,
  clamp,
} from "../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  Label,
} from "../../shared/SVGUtils";

const SVG_W = 420;
const SVG_H = 320;
const CX = 210;
const CY = 200;
const RAY_LEN = 140;
const ANGLE = 35;

const S = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0];

function sp(progress, stepIndex) {
  const start = S[stepIndex];
  const end = S[stepIndex + 1];
  return clamp((progress - start) / (end - start), 0, 1);
}

const AUDIO_STEPS = [
  {
    progress: S[1],
    text:
      "Welcome to the second law of reflection. " +
      "The first law told us that angle i equals angle r. " +
      "The second law tells us something equally important about geometry. " +
      "It states that the incident ray, the reflected ray, and the normal " +
      "all lie in the same flat plane. " +
      "This property is called coplanarity. Let us understand this step by step.",
  },
  {
    progress: S[2],
    text:
      "Here is our plane mirror — the smooth reflecting surface at the bottom. " +
      "All reflection happens at this surface. " +
      "The mirror defines one boundary of our diagram. " +
      "Everything we draw must relate to this mirror surface.",
  },
  {
    progress: S[3],
    text:
      "At the centre of the mirror, we draw the Normal — a dashed line perpendicular to the mirror. " +
      "The normal makes exactly ninety degrees with the mirror surface. " +
      "It is our reference line for measuring angles, just as in the first law.",
  },
  {
    progress: S[4],
    text:
      "Now imagine an invisible flat sheet of paper standing upright on the mirror. " +
      "This sheet contains both the mirror surface and the normal line. " +
      "This flat surface is called the plane of incidence. " +
      "It is perpendicular to the mirror — like a wall standing on the mirror floor. " +
      "All rays of light in reflection must stay on this plane.",
  },
  {
    progress: S[5],
    text:
      "Watch the blue incident ray draw in slowly. " +
      "It travels toward the mirror from the upper left. " +
      "Notice carefully: this ray lies entirely within the plane of incidence. " +
      "It does not go above or below the plane — it stays flat on our imaginary sheet of paper.",
  },
  {
    progress: S[6],
    text:
      "Now watch the red reflected ray appear. " +
      "After striking the mirror, light bounces off as the reflected ray. " +
      "The reflected ray also stays within the same plane of incidence. " +
      "It does not pop out of the plane — it remains on the same flat surface as the incident ray and the normal.",
  },
  {
    progress: S[7],
    text:
      "Look at all three elements together: the incident ray in blue, the reflected ray in red, and the normal in grey. " +
      "All three lie in the exact same plane. " +
      "They are coplanar — they share one flat two-dimensional surface. " +
      "This is the key idea of the second law of reflection.",
  },
  {
    progress: S[8],
    text:
      "To summarise the Second Law of Reflection: " +
      "The incident ray, the reflected ray, and the normal at the point of incidence " +
      "all lie in the same plane. " +
      "This plane is perpendicular to the reflecting surface. " +
      "Together with the first law — angle i equals angle r — " +
      "these two laws completely describe how light reflects from a smooth surface.",
  },
];

const SecondLawOfReflectionAnimation = ({ onTryItClicked }) => {
  const incStart = incidentRayStart(CX, CY, RAY_LEN, ANGLE);
  const refEnd = reflectedRayEnd(CX, CY, RAY_LEN, ANGLE);

  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: 2nd Law of Reflection — 8 Parts"
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
          progress < S[6] ? 5 :
          progress < S[7] ? 6 : 7;

        const mirrorOpacity = part >= 1 ? clamp(sp(progress, 1) / 0.55, 0, 1) : (part === 0 ? 0.3 : 0);
        const normalOpacity = part >= 2 ? clamp(sp(progress, 2) / 0.55, 0, 1) : 0;
        const planeOpacity = part >= 3 ? clamp(sp(progress, 3) / 0.5, 0, 1) : 0;
        const incPhase = part >= 4 ? clamp(sp(progress, 4) / 0.7, 0, 1) : 0;
        const refPhase = part >= 5 ? clamp(sp(progress, 5) / 0.7, 0, 1) : 0;
        const emphasisOp = part >= 6 ? clamp(sp(progress, 6) / 0.45, 0, 1) : 0;
        const lawOp = part >= 7 ? clamp(sp(progress, 7) / 0.45, 0, 1) : 0;

        const incTip = lerp(incStart.x, incStart.y, CX, CY, incPhase);
        const refTip = lerp(CX, CY, refEnd.x, refEnd.y, refPhase);

        const showLaw = part >= 7;
        const planeLabelX = showLaw ? 95 : 95;
        const planeLabelY = showLaw ? 232 : 95;
        const normalLabelX = showLaw ? CX + 18 : CX + 8;
        const normalLabelY = showLaw ? 156 : 75;

        const CAPTIONS = [
          { top: "Part 1 — 2nd Law Introduction", bot: "Incident ray, reflected ray, and normal are coplanar" },
          { top: "Part 2 — The Mirror", bot: "Reflecting surface at the bottom" },
          { top: "Part 3 — The Normal (N)", bot: "Perpendicular to mirror at 90°" },
          { top: "Part 4 — Plane of Incidence", bot: "Flat sheet containing mirror + normal" },
          { top: "Part 5 — Incident Ray in Plane", bot: "Blue ray stays on the plane of incidence" },
          { top: "Part 6 — Reflected Ray in Plane", bot: "Red ray also stays on the same plane" },
          { top: "Part 7 — All Three Coplanar", bot: "Incident + Reflected + Normal = SAME plane ✓" },
          { top: "Part 8 — 2nd Law Statement", bot: "All three lie in one plane ⊥ to mirror" },
        ];
        const cap = CAPTIONS[part];

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {part >= 3 && (
              <g opacity={planeOpacity}>
                <rect x={80} y={80} width={260} height={160} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" rx="4" />
                <Label x={planeLabelX} y={planeLabelY} text="Plane of Incidence" color="#6B7280" size={11} anchor="start" italic />
              </g>
            )}

            <g opacity={mirrorOpacity}>
              <PlaneMirror x1={60} x2={360} y={CY} />
              {part === 1 && (
                <line x1={60} x2={360} y1={CY} y2={CY} stroke="#22C55E" strokeWidth="4" opacity="0.4" />
              )}
            </g>

            {normalOpacity > 0 && (
              <g opacity={normalOpacity}>
                <Normal x={CX} topY={60} bottomY={CY} />
                <Label x={normalLabelX} y={normalLabelY} text="Normal (N)" color="#6B7280" size={12} anchor="start" />
                {part === 2 && <circle cx={CX} cy={130} r={3} fill="#6B7280" />}
              </g>
            )}

            {incPhase > 0 && (
              <g>
                <line
                  x1={incStart.x} y1={incStart.y}
                  x2={incTip.x} y2={incTip.y}
                  stroke="#2563EB" strokeWidth="2.5"
                  markerEnd={incPhase >= 0.98 ? "url(#slr-arrow-blue)" : undefined}
                />
                {incPhase < 0.98 && <circle cx={incTip.x} cy={incTip.y} r={4} fill="#2563EB" />}
                {part === 4 && (
                  <Label x={incStart.x - 20} y={incStart.y - 15} text="Incident Ray" color="#2563EB" size={12} anchor="end" bold />
                )}
              </g>
            )}

            {refPhase > 0 && (
              <g>
                <line
                  x1={CX} y1={CY}
                  x2={refTip.x} y2={refTip.y}
                  stroke="#DC2626" strokeWidth="2.5"
                  markerEnd={refPhase >= 0.98 ? "url(#slr-arrow-red)" : undefined}
                />
                {refPhase < 0.98 && <circle cx={refTip.x} cy={refTip.y} r={4} fill="#DC2626" />}
                {part === 5 && (
                  <Label x={refEnd.x + 20} y={refEnd.y - 15} text="Reflected Ray" color="#DC2626" size={12} anchor="start" bold />
                )}
              </g>
            )}

            <defs>
              <marker id="slr-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
              </marker>
              <marker id="slr-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {emphasisOp > 0 && (
              <g opacity={emphasisOp}>
                <rect x={70} y={130} width={280} height={90} fill="none" stroke="#22C55E" strokeWidth="3" rx="8" opacity="0.6" />
                <Label x={210} y={295} text="All three lie in the SAME PLANE" color="#16A34A" size={12} anchor="middle" bold />
              </g>
            )}

            {lawOp > 0 && (
              <g opacity={lawOp}>
                <rect x={40} y={224} width={340} height={88} rx={8} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
                <Label x={210} y={246} text="2nd Law of Reflection:" color="#1E40AF" size={13} anchor="middle" bold />
                <Label x={210} y={266} text="Incident ray, reflected ray, and normal" color="#1E40AF" size={12} anchor="middle" />
                <Label x={210} y={284} text="ALL LIE IN THE SAME PLANE" color="#1E40AF" size={12} anchor="middle" bold />
                <Label x={210} y={302} text="(perpendicular to the mirror surface)" color="#6B7280" size={11} anchor="middle" italic />
              </g>
            )}

            <rect x={0} y={SVG_H - 52} width={SVG_W} height={52} fill="#EEF2FF" opacity="0.95" />
            <line x1={0} y1={SVG_H - 52} x2={SVG_W} y2={SVG_H - 52} stroke="#C7D2FE" strokeWidth="1.2" />
            <rect x={10} y={SVG_H - 45} width={60} height={18} rx={9} fill="#4F46E5" opacity="0.85" />
            <text x={40} y={SVG_H - 32} fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Arial" textAnchor="middle">
              Part {part + 1} / 8
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

export default SecondLawOfReflectionAnimation;
