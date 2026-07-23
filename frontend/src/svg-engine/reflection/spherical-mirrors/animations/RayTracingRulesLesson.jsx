import React from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";
import { clamp, lerp } from "../../../shared/PhysicsEngine";
import { Label, PrincipalAxis } from "../../../shared/SVGUtils";

const SVG_W = 800;
const SVG_H = 500;
const AXIS_Y = 250;

const generateHatchPath = (poleX) => {
  let path = "";
  for (let y = 60; y <= 430; y += 15) {
    const t = (y - 50) / 400;
    const curveX = Math.pow(1 - t, 2) * (poleX - 30) + 2 * t * (1 - t) * (poleX + 30) + Math.pow(t, 2) * (poleX - 30);
    path += `M ${curveX.toFixed(1)} ${y} L ${(curveX + 12).toFixed(1)} ${y + 10} `;
  }
  return path;
};

// Geometry
const MIRROR_X = 650;
const RADIUS = 200;
const FOCAL_LENGTH = 100;

const POLE = { x: MIRROR_X, y: AXIS_Y };
const CENTER = { x: MIRROR_X - RADIUS, y: AXIS_Y };
const FOCUS = { x: MIRROR_X - FOCAL_LENGTH, y: AXIS_Y };

// Rule 1: Parallel -> Focus
const R1_INC_START = { x: 150, y: 150 };
const R1_HIT = { x: MIRROR_X, y: 150 };
const R1_REF_END = { x: 350, y: 450 };

// Rule 2: Focus -> Parallel
const R2_INC_START = { x: 150, y: 50 };
const R2_HIT = { x: MIRROR_X, y: 300 };
const R2_REF_END = { x: 50, y: 300 };

// Rule 3: Centre -> Centre
const R3_INC_START = { x: 250, y: 400 };
const R3_HIT = { x: MIRROR_X, y: 100 };
const R3_REF_END = { x: 250, y: 400 };

// Rule 4: ray incident AT the Pole reflects making an equal angle with the
// principal axis on the OTHER side -- the principal axis itself acts as the
// normal at the pole. Verified: incident dir (300,120) at 21.80 deg from the
// axis reflects (about normal (1,0)) to (-300,120), also 21.80 deg, on the
// opposite side of the axis.
const R4_INC_START = { x: 350, y: 130 };
const R4_HIT = POLE;
const R4_REF_END = { x: 500, y: 310 };

const AUDIO_STEPS = [
  { progress: 0.2, text: "Any ray diagram can be drawn using two of these four standard rays." },
  { progress: 0.4, text: "Rule 1: A ray parallel to the principal axis reflects through the Focus, F." },
  { progress: 0.6, text: "Rule 2: A ray passing through the Focus, F, reflects parallel to the principal axis." },
  { progress: 0.8, text: "Rule 3: A ray passing through the Centre of Curvature, C, reflects back along its exact same path." },
  { progress: 1.0, text: "Rule 4: A ray striking the Pole, P, reflects making an equal angle with the principal axis, but on the other side of it -- the principal axis itself acts as the normal at the pole." }
];

const normalizeBetween = (value, start, end) => {
  if (end <= start) return 0;
  return clamp((value - start) / (end - start), 0, 1);
};

const RayTracingRulesLesson = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: 3 Rules of Ray Tracing (Spherical Mirrors)"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {
        let step = 5;
        if (progress < 0.2) step = 1;
        else if (progress < 0.4) step = 2;
        else if (progress < 0.6) step = 3;
        else if (progress < 0.8) step = 4;
        else step = 5;

        const setupPhase = normalizeBetween(progress, 0, 0.2);

        // Rule 1
        const r1Total = normalizeBetween(progress, 0.2, 0.4);
        const r1Inc = clamp(r1Total * 2, 0, 1);
        const r1Ref = clamp((r1Total - 0.5) * 2, 0, 1);
        const currR1Inc = {
          x: lerp(R1_INC_START.x, R1_INC_START.y, R1_HIT.x, R1_HIT.y, r1Inc).x,
          y: lerp(R1_INC_START.x, R1_INC_START.y, R1_HIT.x, R1_HIT.y, r1Inc).y
        };
        const currR1Ref = {
          x: lerp(R1_HIT.x, R1_HIT.y, R1_REF_END.x, R1_REF_END.y, r1Ref).x,
          y: lerp(R1_HIT.x, R1_HIT.y, R1_REF_END.x, R1_REF_END.y, r1Ref).y
        };

        // Rule 2
        const r2Total = normalizeBetween(progress, 0.4, 0.6);
        const r2Inc = clamp(r2Total * 2, 0, 1);
        const r2Ref = clamp((r2Total - 0.5) * 2, 0, 1);
        const currR2Inc = {
          x: lerp(R2_INC_START.x, R2_INC_START.y, R2_HIT.x, R2_HIT.y, r2Inc).x,
          y: lerp(R2_INC_START.x, R2_INC_START.y, R2_HIT.x, R2_HIT.y, r2Inc).y
        };
        const currR2Ref = {
          x: lerp(R2_HIT.x, R2_HIT.y, R2_REF_END.x, R2_REF_END.y, r2Ref).x,
          y: lerp(R2_HIT.x, R2_HIT.y, R2_REF_END.x, R2_REF_END.y, r2Ref).y
        };

        // Rule 3
        const r3Total = normalizeBetween(progress, 0.6, 0.8);
        const r3Inc = clamp(r3Total * 2, 0, 1);
        const r3Ref = clamp((r3Total - 0.5) * 2, 0, 1);
        const currR3Inc = {
          x: lerp(R3_INC_START.x, R3_INC_START.y, R3_HIT.x, R3_HIT.y, r3Inc).x,
          y: lerp(R3_INC_START.x, R3_INC_START.y, R3_HIT.x, R3_HIT.y, r3Inc).y
        };
        const currR3Ref = {
          x: lerp(R3_HIT.x, R3_HIT.y, R3_REF_END.x, R3_REF_END.y, r3Ref).x,
          y: lerp(R3_HIT.x, R3_HIT.y, R3_REF_END.x, R3_REF_END.y, r3Ref).y
        };

        // Rule 4
        const r4Total = normalizeBetween(progress, 0.8, 1.0);
        const r4Inc = clamp(r4Total * 2, 0, 1);
        const r4Ref = clamp((r4Total - 0.5) * 2, 0, 1);
        const currR4Inc = {
          x: lerp(R4_INC_START.x, R4_INC_START.y, R4_HIT.x, R4_HIT.y, r4Inc).x,
          y: lerp(R4_INC_START.x, R4_INC_START.y, R4_HIT.x, R4_HIT.y, r4Inc).y
        };
        const currR4Ref = {
          x: lerp(R4_HIT.x, R4_HIT.y, R4_REF_END.x, R4_REF_END.y, r4Ref).x,
          y: lerp(R4_HIT.x, R4_HIT.y, R4_REF_END.x, R4_REF_END.y, r4Ref).y
        };

        return (
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block", background: "#F8FAFF" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />
            
            <defs>
              <marker id="inc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
              <marker id="ref-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
              <marker id="ref-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#3B82F6" />
              </marker>
              <marker id="inc-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#60A5FA" />
              </marker>
              <marker id="ref-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
              </marker>
              <marker id="inc-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#34D399" />
              </marker>
              <marker id="ref-arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#7C3AED" />
              </marker>
              <marker id="inc-arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#A78BFA" />
              </marker>
            </defs>

            <Label x={400} y={40} text="The 3 Standard Rules for Ray Tracing" color="#111827" size={20} bold />

            {/* Step 1: Base Setup */}
            <g opacity={setupPhase > 0 ? 1 : 0}>
              <PrincipalAxis startX={50} endX={750} y={AXIS_Y} />
              <text x={55} y={AXIS_Y - 10} fontSize="12" fill="#6B7280">Principal axis: the line through P and C, normal to the mirror at P</text>

              <path d="M 620 50 Q 680 250 620 450" fill="none" stroke="#333" strokeWidth="4" />
              <path d={generateHatchPath(MIRROR_X)} stroke="#888" strokeWidth="1" />

              {/* Aperture: the diameter of the reflecting surface actually in use */}
              <line x1={622} y1={50} x2={622} y2={450} stroke="#EA580C" strokeWidth="1.5" strokeDasharray="5,4" />
              <text x={628} y={470} fontSize="12" fontWeight="bold" fill="#EA580C">Aperture (diameter of the reflecting surface)</text>

              <circle cx={POLE.x} cy={POLE.y} r={4} fill="#DC2626" />
              <text x={POLE.x + 10} y={POLE.y - 10} fontSize="14" fontWeight="bold">P</text>

              <circle cx={FOCUS.x} cy={FOCUS.y} r={4} fill="#16A34A" />
              <text x={FOCUS.x - 5} y={FOCUS.y + 20} fontSize="14" fontWeight="bold" fill="#16A34A">F</text>

              <circle cx={CENTER.x} cy={CENTER.y} r={4} fill="#7C3AED" />
              <text x={CENTER.x - 5} y={CENTER.y + 20} fontSize="14" fontWeight="bold" fill="#7C3AED">C</text>
            </g>

            {/* Explanations Box */}
            <g>
              <rect x="50" y="390" width="700" height="70" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
              <text x="70" y="420" fontSize="15" fontWeight="700" fill="#1E40AF">
                {step === 1 && "Any ray diagram can be drawn using 2 of these 4 standard rays:"}
                {step === 2 && "Rule 1: A ray parallel to the principal axis reflects through the Focus (F)."}
                {step === 3 && "Rule 2: A ray passing through the Focus (F) reflects parallel to the axis."}
                {step === 4 && "Rule 3: A ray passing through the Centre of Curvature (C) reflects back along its path."}
                {step === 5 && "Rule 4: A ray striking the Pole (P) reflects at an equal angle, on the other side of the axis."}
              </text>
            </g>

            {/* Rule 1 (Orange/Red) */}
            {r1Inc > 0 && (
              <line x1={R1_INC_START.x} y1={R1_INC_START.y} x2={currR1Inc.x} y2={currR1Inc.y} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#inc-arrow)" />
            )}
            {r1Ref > 0 && (
              <line x1={R1_HIT.x} y1={R1_HIT.y} x2={currR1Ref.x} y2={currR1Ref.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#ref-arrow)" />
            )}

            {/* Rule 2 (Light/Dark Blue) */}
            {r2Inc > 0 && (
              <line x1={R2_INC_START.x} y1={R2_INC_START.y} x2={currR2Inc.x} y2={currR2Inc.y} stroke="#60A5FA" strokeWidth="2.5" markerEnd="url(#inc-arrow-blue)" />
            )}
            {r2Ref > 0 && (
              <line x1={R2_HIT.x} y1={R2_HIT.y} x2={currR2Ref.x} y2={currR2Ref.y} stroke="#3B82F6" strokeWidth="2.5" markerEnd="url(#ref-arrow-blue)" />
            )}

            {/* Rule 3 (Light/Dark Green) */}
            {r3Inc > 0 && (
              <line x1={R3_INC_START.x} y1={R3_INC_START.y} x2={currR3Inc.x} y2={currR3Inc.y} stroke="#34D399" strokeWidth="2.5" markerEnd="url(#inc-arrow-green)" />
            )}
            {r3Ref > 0 && (
              <line x1={R3_HIT.x} y1={R3_HIT.y} x2={currR3Ref.x} y2={currR3Ref.y} stroke="#10B981" strokeWidth="2.5" markerEnd="url(#ref-arrow-green)" />
            )}

            {/* Rule 4 (Light/Dark Purple) -- ray at the Pole, equal angle other side of axis */}
            {r4Inc > 0 && (
              <line x1={R4_INC_START.x} y1={R4_INC_START.y} x2={currR4Inc.x} y2={currR4Inc.y} stroke="#A78BFA" strokeWidth="2.5" markerEnd="url(#inc-arrow-purple)" />
            )}
            {r4Ref > 0 && (
              <line x1={R4_HIT.x} y1={R4_HIT.y} x2={currR4Ref.x} y2={currR4Ref.y} stroke="#7C3AED" strokeWidth="2.5" markerEnd="url(#ref-arrow-purple)" />
            )}

          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default RayTracingRulesLesson;
