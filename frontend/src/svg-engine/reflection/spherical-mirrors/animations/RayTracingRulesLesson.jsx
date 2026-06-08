import React, { useMemo, useState } from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";
import { clamp, lerp } from "../../../shared/PhysicsEngine";
import { Label, PrincipalAxis } from "../../../shared/SVGUtils";

const SVG_W = 800;
const SVG_H = 500;
const AXIS_Y = 250;

// Geometry
const MIRROR_X = 650;
const RADIUS = 200;
const FOCAL_LENGTH = 100;

const POLE = { x: MIRROR_X, y: AXIS_Y };
const CENTER = { x: MIRROR_X - RADIUS, y: AXIS_Y }; // 450
const FOCUS = { x: MIRROR_X - FOCAL_LENGTH, y: AXIS_Y }; // 550

// Rule 1: Parallel -> Focus
const R1_INC_START = { x: 150, y: 150 };
const R1_HIT = { x: MIRROR_X, y: 150 };
const R1_REF_END = { x: 350, y: 450 }; // slope = -1 through F(550, 250)

// Rule 2: Focus -> Parallel
const R2_INC_START = { x: 150, y: 50 }; // passes through F(550, 250)
const R2_HIT = { x: MIRROR_X, y: 300 };
const R2_REF_END = { x: 50, y: 300 };

// Rule 3: Centre -> Centre
// Line through C(450, 250) and hitting mirror at (650, 100)
const R3_INC_START = { x: 250, y: 400 };
const R3_HIT = { x: MIRROR_X, y: 100 };
const R3_REF_END = { x: 250, y: 400 };

const STEP_ORDER = [1, 2, 3, 4];
const DEFAULT_STEP_DURATIONS_MS = {
  1: 4000, // Show mirror, P, F, C
  2: 6000, // Rule 1
  3: 6000, // Rule 2
  4: 6000  // Rule 3
};

const normalizeBetween = (value, start, end) => {
  if (end <= start) return 0;
  return clamp((value - start) / (end - start), 0, 1);
};

const RayTracingRulesLesson = ({ onTryItClicked }) => {
  const [stepDurationsMs] = useState(DEFAULT_STEP_DURATIONS_MS);

  const totalDurationMs = useMemo(() => {
    return STEP_ORDER.reduce((acc, step) => acc + (stepDurationsMs[step] || 0), 0);
  }, [stepDurationsMs]);

  const stepRanges = useMemo(() => {
    let elapsed = 0;
    const ranges = {};
    STEP_ORDER.forEach((step) => {
      const stepDuration = stepDurationsMs[step];
      const start = elapsed / totalDurationMs;
      elapsed += stepDuration;
      const end = elapsed / totalDurationMs;
      ranges[step] = { start, end };
    });
    return ranges;
  }, [stepDurationsMs, totalDurationMs]);

  return (
    <AnimationPlayer
      duration={totalDurationMs}
      title="Watch: 3 Rules of Ray Tracing (Spherical Mirrors)"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {
        let step = 4;
        for (const candidateStep of STEP_ORDER) {
          if (progress < stepRanges[candidateStep].end) {
            step = candidateStep;
            break;
          }
        }

        const setupPhase = normalizeBetween(progress, stepRanges[1].start, stepRanges[1].end);
        
        // Rule 1
        const r1Total = normalizeBetween(progress, stepRanges[2].start, stepRanges[2].end);
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
        const r2Total = normalizeBetween(progress, stepRanges[3].start, stepRanges[3].end);
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
        const r3Total = normalizeBetween(progress, stepRanges[4].start, stepRanges[4].end);
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
            </defs>

            <Label x={400} y={40} text="The 3 Standard Rules for Ray Tracing" color="#111827" size={20} bold />

            {/* Step 1: Base Setup */}
            <g opacity={setupPhase > 0 ? 1 : 0}>
              <PrincipalAxis startX={50} endX={750} y={AXIS_Y} />
              
              <path d="M 620 50 Q 680 250 620 450" fill="none" stroke="#333" strokeWidth="4" />
              <path d="M 622 60 L 632 70 M 626 100 L 636 110 M 633 140 L 643 150 M 640 180 L 650 190 M 645 220 L 655 230 M 648 260 L 658 270 M 642 300 L 652 310 M 635 340 L 645 350 M 628 380 L 638 390 M 622 420 L 632 430" stroke="#888" strokeWidth="1" />
              
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
                {step === 1 && "Any ray diagram can be drawn using 2 of these 3 standard rays:"}
                {step === 2 && "Rule 1: A ray parallel to the principal axis reflects through the Focus (F)."}
                {step === 3 && "Rule 2: A ray passing through the Focus (F) reflects parallel to the axis."}
                {step === 4 && "Rule 3: A ray passing through the Centre of Curvature (C) reflects back along its path."}
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

          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default RayTracingRulesLesson;
