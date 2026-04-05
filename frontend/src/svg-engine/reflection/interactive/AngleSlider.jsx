// ============================================================
// AngleSlider.jsx
// TRY stage — student controls angle of incidence via slider.
// Reflected ray updates in real-time.
// Appears after LawsOfReflectionAnimation completes.
//
// PROPS:
//   attempt          {number}  1, 2, or 3 (controls labels/hints)
//   misconceptionTag {string}  detected tag (controls which hint shows)
//   onInteracted     {func}    called when student first moves slider
//
// LOCATION: svg-engine/reflection/interactive/AngleSlider.jsx
// ============================================================

import React, { useState, useCallback } from "react";
import {
  incidentRayStart,
  reflectedRayEnd,
  describeArc,
  clamp,
} from "../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  AngleArc,
  Label,
} from "../../shared/SVGUtils";

// ── CONSTANTS ────────────────────────────────────────────────
const SVG_W   = 420;
const SVG_H   = 300;
const CX      = 210;
const CY      = 220;
const RAY_LEN = 155;
const ARC_R   = 48;

// Hints shown based on misconception tag
const HINTS = {
  angle_from_surface:
    "⚠️ Remember: angles are always measured from the Normal (dashed line), NOT from the mirror surface.",
  normal_orientation_wrong:
    "⚠️ The Normal is always perpendicular (90°) to the mirror at the point of contact.",
  reflection_not_equal:
    "⚠️ Notice: angle i always equals angle r — no matter how you move the slider!",
  plane_not_same:
    "⚠️ Incident ray, reflected ray and normal must all lie in the same plane.",
  default:
    "💡 Drag the slider and watch how the reflected ray changes.",
};

const AngleSlider = ({
  attempt = 1,
  misconceptionTag = "",
  onInteracted,
}) => {

  const [angle,       setAngle]       = useState(35);
  const [hasInteracted, setHasInteracted] = useState(false);

  // ── HANDLE SLIDER ────────────────────────────────────────
  const handleSlider = useCallback((e) => {
    setAngle(Number(e.target.value));
    if (!hasInteracted) {
      setHasInteracted(true);
      if (onInteracted) onInteracted();
    }
  }, [hasInteracted, onInteracted]);

  // ── COMPUTED VALUES ──────────────────────────────────────
  const incStart  = incidentRayStart(CX, CY, RAY_LEN, angle);
  const refEnd    = reflectedRayEnd(CX, CY, RAY_LEN, angle);

  const incArcPath = describeArc(CX, CY, ARC_R, -angle, 0);
  const refArcPath = describeArc(CX, CY, ARC_R, 0, angle);

  const incLabelX = CX - ARC_R * 1.5 * Math.sin((angle / 2) * Math.PI / 180);
  const incLabelY = CY - ARC_R * 1.3 * Math.cos((angle / 2) * Math.PI / 180);
  const refLabelX = CX + ARC_R * 1.5 * Math.sin((angle / 2) * Math.PI / 180);
  const refLabelY = CY - ARC_R * 1.3 * Math.cos((angle / 2) * Math.PI / 180);

  const hint = HINTS[misconceptionTag] || HINTS.default;

  return (
    <div style={styles.wrapper}>

      {/* Title */}
      <p style={styles.title}>
        {attempt === 1 && "Try it: change the angle of incidence"}
        {attempt === 2 && "Try again: focus on where the angles are measured from"}
        {attempt === 3 && "Step by step: use the slider slowly"}
      </p>

      {/* Hint box — shown on attempt 2 and 3 or if misconception exists */}
      {(attempt > 1 || misconceptionTag) && (
        <div style={styles.hintBox}>{hint}</div>
      )}

      {/* SVG */}
      <div style={styles.svgWrapper}>
        <svg width={SVG_W} height={SVG_H}>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

          {/* Mirror + Normal */}
          <PlaneMirror x1={60} x2={360} y={CY} />
          <Normal x={CX} topY={60} bottomY={CY} />
          <Label x={CX + 8} y={75} text="Normal" color="#6B7280" size={12} anchor="start" />

          {/* Incident Ray */}
          <line
            x1={incStart.x} y1={incStart.y}
            x2={CX}         y2={CY}
            stroke="#2563EB" strokeWidth="2.5"
            markerEnd="url(#arr-blue-s)"
          />

          {/* Reflected Ray */}
          <line
            x1={CX}      y1={CY}
            x2={refEnd.x} y2={refEnd.y}
            stroke="#DC2626" strokeWidth="2.5"
            markerEnd="url(#arr-red-s)"
          />

          {/* Arrowhead markers */}
          <defs>
            <marker id="arr-blue-s" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
            </marker>
            <marker id="arr-red-s" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
            </marker>
          </defs>

          {/* Angle arcs */}
          <AngleArc
            pathD={incArcPath} color="#2563EB"
            label={`${angle}°`}
            labelX={incLabelX - 6} labelY={incLabelY}
          />
          <AngleArc
            pathD={refArcPath} color="#DC2626"
            label={`${angle}°`}
            labelX={refLabelX + 6} labelY={refLabelY}
          />

          {/* i and r symbols */}
          <Label x={incLabelX - 20} y={incLabelY + 2} text="i" color="#2563EB" size={15} bold />
          <Label x={refLabelX + 20} y={refLabelY + 2} text="r" color="#DC2626" size={15} bold />

          {/* Ray labels */}
          <Label x={incStart.x - 6} y={incStart.y - 10} text="Incident" color="#2563EB" size={12} anchor="end" />
          <Label x={refEnd.x + 6}   y={refEnd.y - 10}   text="Reflected" color="#DC2626" size={12} anchor="start" />

          {/* Law box */}
          <rect x={100} y={10} width={220} height={26} rx={5} fill="#EFF6FF" stroke="#BFDBFE" />
          <Label x={210} y={27} text={`i = r = ${angle}°  (from Normal)`} color="#1E40AF" size={12} bold />

        </svg>
      </div>

      {/* Slider */}
      <div style={styles.sliderRow}>
        <span style={styles.sliderLabel}>0°</span>
        <input
          type="range"
          min={5}
          max={85}
          value={angle}
          onChange={handleSlider}
          style={styles.slider}
        />
        <span style={styles.sliderLabel}>85°</span>
      </div>

      {/* Live readout */}
      <p style={styles.readout}>
        Angle of Incidence: <strong>{angle}°</strong> (from Normal)
        &nbsp;=&nbsp;
        Angle of Reflection: <strong>{angle}°</strong> (from Normal)
      </p>

      {/* First interaction nudge */}
      {!hasInteracted && (
        <p style={styles.nudge}>👆 Move the slider to explore</p>
      )}

    </div>
  );
};

// ── STYLES ───────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "16px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1E40AF",
    margin: 0,
  },
  hintBox: {
    background: "#FFF7ED",
    border: "1px solid #FED7AA",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "13px",
    color: "#92400E",
    maxWidth: "420px",
    textAlign: "center",
  },
  svgWrapper: {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#F8FAFF",
  },
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    maxWidth: "420px",
  },
  slider: {
    flex: 1,
    accentColor: "#2563EB",
    cursor: "pointer",
  },
  sliderLabel: {
    fontSize: "13px",
    color: "#6B7280",
    minWidth: "28px",
    textAlign: "center",
  },
  readout: {
    fontSize: "14px",
    color: "#374151",
    margin: 0,
    background: "#F0FDF4",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #BBF7D0",
  },
  nudge: {
    fontSize: "13px",
    color: "#9CA3AF",
    margin: 0,
  },
};

export default AngleSlider;