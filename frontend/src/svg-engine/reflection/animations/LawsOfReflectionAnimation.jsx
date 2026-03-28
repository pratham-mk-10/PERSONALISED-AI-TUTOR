// ============================================================
// LawsOfReflectionAnimation.jsx
// SHOW stage — auto-plays when student first sees the topic.
// Demonstrates the Law of Reflection step by step.
//
// FLOW:
//   0.0 - 0.1 : mirror + normal appear
//   0.1 - 0.5 : incident ray travels toward mirror
//   0.5 - 0.9 : reflected ray travels away from mirror
//   0.9 - 1.0 : angle arcs + labels fade in
//
// LOCATION: svg-engine/reflection/animations/LawsOfReflectionAnimation.jsx
// ============================================================

import React, { useState } from "react";
import AnimationPlayer from "../../shared/AnimationPlayer";
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

// ── CONSTANTS ────────────────────────────────────────────────
const SVG_W    = 420;
const SVG_H    = 300;
const CX       = 210;   // mirror centre x
const CY       = 220;   // mirror y (point of incidence)
const RAY_LEN  = 160;
const ANGLE    = 35;    // angle of incidence in degrees
const ARC_R    = 45;    // radius of angle arc

const LawsOfReflectionAnimation = ({ onTryItClicked }) => {

  const incStart  = incidentRayStart(CX, CY, RAY_LEN, ANGLE);
  const refEnd    = reflectedRayEnd(CX, CY, RAY_LEN, ANGLE);

  return (
    <AnimationPlayer
      duration={4000}
      title="Watch: Law of Reflection"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {

        // ── PHASE CALCULATIONS ──────────────────────────────

        // Phase 1 (0→0.1): mirror + normal fade in
        const mirrorOpacity  = clamp(progress / 0.1, 0, 1);

        // Phase 2 (0.1→0.5): incident ray travels from source to mirror
        const incPhase       = clamp((progress - 0.1) / 0.4, 0, 1);
        const incTip         = lerp(incStart.x, incStart.y, CX, CY, incPhase);

        // Phase 3 (0.5→0.9): reflected ray travels from mirror outward
        const refPhase       = clamp((progress - 0.5) / 0.4, 0, 1);
        const refTip         = lerp(CX, CY, refEnd.x, refEnd.y, refPhase);

        // Phase 4 (0.9→1.0): arcs + labels fade in
        const labelOpacity   = clamp((progress - 0.9) / 0.1, 0, 1);

        // ── ARC PATHS ───────────────────────────────────────
        // Incident arc: from normal (0°) to incident ray (-ANGLE)
        const incArcPath = describeArc(CX, CY, ARC_R, -ANGLE, 0);
        // Reflected arc: from normal (0°) to reflected ray (+ANGLE)
        const refArcPath = describeArc(CX, CY, ARC_R, 0, ANGLE);

        // Label positions (midpoint of each arc)
        const incLabelX = CX - ARC_R * 1.4 * Math.sin((ANGLE / 2) * Math.PI / 180);
        const incLabelY = CY - ARC_R * 1.2 * Math.cos((ANGLE / 2) * Math.PI / 180);
        const refLabelX = CX + ARC_R * 1.4 * Math.sin((ANGLE / 2) * Math.PI / 180);
        const refLabelY = CY - ARC_R * 1.2 * Math.cos((ANGLE / 2) * Math.PI / 180);

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>

            {/* ── BACKGROUND ── */}
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {/* ── MIRROR + NORMAL (Phase 1) ── */}
            <g opacity={mirrorOpacity}>
              <PlaneMirror x1={60} x2={360} y={CY} />
              <Normal x={CX} topY={60} bottomY={CY} />
              <Label x={CX + 8} y={75} text="Normal" color="#6B7280" size={12} anchor="start" />
            </g>

            {/* ── INCIDENT RAY (Phase 2) ── */}
            {incPhase > 0 && (
              <g>
                <line
                  x1={incStart.x} y1={incStart.y}
                  x2={incTip.x}   y2={incTip.y}
                  stroke="#2563EB" strokeWidth="2.5"
                  markerEnd="url(#arrow-blue)"
                />
                {/* Source label at start */}
                {incPhase < 0.3 && (
                  <Label
                    x={incStart.x - 8} y={incStart.y - 10}
                    text="Incident Ray" color="#2563EB" size={12} anchor="end"
                  />
                )}
              </g>
            )}

            {/* ── REFLECTED RAY (Phase 3) ── */}
            {refPhase > 0 && (
              <line
                x1={CX}       y1={CY}
                x2={refTip.x} y2={refTip.y}
                stroke="#DC2626" strokeWidth="2.5"
                markerEnd="url(#arrow-red)"
              />
            )}

            {/* ── ARROWHEAD MARKERS ── */}
            <defs>
              <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
              </marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {/* ── ANGLE ARCS + LABELS (Phase 4) ── */}
            <g opacity={labelOpacity}>
              {/* Incident angle arc (blue) */}
              <AngleArc
                pathD={incArcPath}
                color="#2563EB"
                label={`${ANGLE}°`}
                labelX={incLabelX - 6}
                labelY={incLabelY}
              />
              {/* Reflected angle arc (red) */}
              <AngleArc
                pathD={refArcPath}
                color="#DC2626"
                label={`${ANGLE}°`}
                labelX={refLabelX + 6}
                labelY={refLabelY}
              />

              {/* i and r symbols */}
              <Label x={incLabelX - 22} y={incLabelY + 2} text="i" color="#2563EB" size={14} bold />
              <Label x={refLabelX + 22} y={refLabelY + 2} text="r" color="#DC2626" size={14} bold />

              {/* Ray labels */}
              <Label
                x={incStart.x - 6} y={incStart.y - 12}
                text="Incident Ray" color="#2563EB" size={12} anchor="end"
              />
              <Label
                x={refEnd.x + 6} y={refEnd.y - 12}
                text="Reflected Ray" color="#DC2626" size={12} anchor="start"
              />

              {/* Law statement */}
              <rect x={90} y={10} width={240} height={28} rx={6}
                fill="#EFF6FF" stroke="#BFDBFE" />
              <Label
                x={210} y={29}
                text="∠i = ∠r  (both from Normal)"
                color="#1E40AF" size={12} bold
              />
            </g>

          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default LawsOfReflectionAnimation;