// ============================================================
// SphericalMirrorImageFormationInteractive.jsx
// TRY stage: Student controls object position via slider
// Real-time ray diagram updates, image responds dynamically
//
// PROPS:
//   attempt          {number}  1, 2, or 3 (controls hints)
//   misconceptionTag {string}  tag for targeted hint
//   onInteracted     {func}    called when student first moves slider
// ============================================================

import React, { useState, useCallback, useMemo } from "react";
import {
  ConcaveMirrorArc,
  PrincipalAxis,
  FocalPoint,
  CentreOfCurvature,
  Pole,
  Arrow,
  RayLine,
  Label,
  DataBox,
} from "../../shared/SVGUtils";

// ── CONSTANTS ────────────────────────────────────────────────
const SVG_W = 720;
const SVG_H = 500;

const MIRROR_CENTER_X = 360;
const MIRROR_CENTER_Y = 250;
const RADIUS_OF_CURVATURE = 80;
const FOCAL_LENGTH = 40;
const SCALE = 2;

// Misconception-specific hints
const HINTS = {
  position_confusion:
    "⚠️ Remember: object distance (u) and image distance (v) are measured FROM THE POLE (P), not from C or F.",
  
  linear_assumption:
    "⚠️ Image doesn't move linearly! The mirror formula (1/f = 1/u + 1/v) is nonlinear. Small changes in u cause big changes in v near F.",
  
  nature_confusion:
    "⚠️ Real images (left of mirror, green arrow) are inverted. Virtual images (right of mirror, dashed) are erect. Watch the rays to see why.",
  
  focal_misunderstanding:
    "⚠️ At the focal point, rays become parallel. No image forms because rays never converge. Image goes to infinity!",
  
  magnification_confusion:
    "⚠️ Magnification m = -v/u. Negative means inverted. |m| > 1 means enlarged, |m| < 1 means diminished.",
  
  default:
    "💡 Drag the slider to move the object. Watch how the rays, image, and data change in real-time!",
};

const SphericalMirrorImageFormationInteractive = ({
  attempt = 1,
  misconceptionTag = "",
  onInteracted,
}) => {
  const [sliderValue, setSliderValue] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  // ── MAP SLIDER (0-100) TO OBJECT DISTANCE (u) ──────────────
  // 0 = very far (u=150), 100 = very close (u=5)
  // Key positions:
  //   ~16: u = ∞
  //   ~30: u = 2.5*R = 200
  //   ~40: u = R = 80
  //   ~50: u = 1.5*f = 60
  //   ~60: u = f = 40
  //   ~80: u = f*0.6 = 24
  const mapSliderToU = useCallback((slider) => {
    // Exponential decay from far to near
    const normalized = slider / 100;
    if (normalized < 0.16) return 300; // ∞
    if (normalized > 0.8) return 24; // very close
    // Linear interpolation in log space for smoothness
    const u = 150 * Math.exp(-2 * normalized);
    return Math.max(u, 24);
  }, []);

  const u = useMemo(() => mapSliderToU(sliderValue), [sliderValue, mapSliderToU]);

  // ── HANDLE SLIDER ────────────────────────────────────────
  const handleSlider = useCallback(
    (e) => {
      setSliderValue(Number(e.target.value));
      if (!hasInteracted) {
        setHasInteracted(true);
        if (onInteracted) onInteracted();
      }
    },
    [hasInteracted, onInteracted]
  );

  // ── CALCULATE IMAGE PROPERTIES ───────────────────────────
  const f = FOCAL_LENGTH;
  let v = (u * f) / (u - f);

  // Clamp v for display if approaching infinity
  if (Math.abs(u - f) < 3) v = 400;

  const m = -v / u;
  const isReal = v > 0;
  const isErect = m > 0;
  const isEnlarged = Math.abs(m) > 1;

  // ── POSITIONS ────────────────────────────────────────────
  const objectX = MIRROR_CENTER_X - u * SCALE;
  const imageX = MIRROR_CENTER_X - v * SCALE;

  const objectHeight = 60;
  const imageHeight = Math.abs(m) * objectHeight;

  const objectY = MIRROR_CENTER_Y;
  const imageY = isErect ? MIRROR_CENTER_Y : MIRROR_CENTER_Y;

  // ── RAY PATHS ────────────────────────────────────────────
  // Ray 1: Parallel → through F
  const ray1Start = { x: objectX, y: objectY - objectHeight / 2 };
  const ray1End = { x: MIRROR_CENTER_X - f * SCALE, y: MIRROR_CENTER_Y };
  const ray1EndParallel = { x: 500, y: objectY - objectHeight / 2 };

  // Ray 2: Through F → parallel
  const ray2Start = { x: objectX, y: objectY + objectHeight / 2 };
  const ray2Through = { x: MIRROR_CENTER_X - f * SCALE, y: MIRROR_CENTER_Y };
  const ray2End = { x: 500, y: objectY + objectHeight / 2 };

  // Ray 3: Through C → straight back
  const ray3Start = { x: objectX, y: objectY - objectHeight / 3 };
  const ray3Through = { x: MIRROR_CENTER_X - RADIUS_OF_CURVATURE * SCALE, y: MIRROR_CENTER_Y };
  const ray3End = isReal
    ? { x: imageX, y: imageY - imageHeight / 2 }
    : { x: MIRROR_CENTER_X + 150, y: objectY - objectHeight / 3 };

  // ── IMAGE POSITION TEXT ──────────────────────────────────
  const positionText =
    u > 100
      ? "Object at ∞"
      : u > RADIUS_OF_CURVATURE
      ? "Beyond C"
      : u > FOCAL_LENGTH + 5
      ? "Between C & F"
      : u > FOCAL_LENGTH - 2 && u < FOCAL_LENGTH + 2
      ? "AT F (no image)"
      : "Between F & P";

  const hint = HINTS[misconceptionTag] || HINTS.default;

  return (
    <div style={styles.wrapper}>
      {/* Title */}
      <p style={styles.title}>
        {attempt === 1 && "Try it: move the object and watch the image"}
        {attempt === 2 && "Try again: focus on how image distance changes nonlinearly"}
        {attempt === 3 && "Step by step: pause at each key position (∞, C, F, P)"}
      </p>

      {/* Hint box */}
      {(attempt > 1 || misconceptionTag) && (
        <div style={styles.hintBox}>{hint}</div>
      )}

      {/* SVG */}
      <div style={styles.svgWrapper}>
        <svg width={SVG_W} height={SVG_H}>
          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

          {/* ── MIRROR ANATOMY ── */}
          <ConcaveMirrorArc
            centerX={MIRROR_CENTER_X}
            centerY={MIRROR_CENTER_Y}
            radius={RADIUS_OF_CURVATURE}
            color="#3B82F6"
          />

          <PrincipalAxis
            startX={100}
            endX={550}
            y={MIRROR_CENTER_Y}
          />

          <Pole x={MIRROR_CENTER_X} y={MIRROR_CENTER_Y} />
          <FocalPoint
            x={MIRROR_CENTER_X - FOCAL_LENGTH * SCALE}
            y={MIRROR_CENTER_Y}
            label="F"
          />
          <CentreOfCurvature
            x={MIRROR_CENTER_X - RADIUS_OF_CURVATURE * SCALE}
            y={MIRROR_CENTER_Y}
            label="C"
          />

          {/* ── OBJECT ARROW (red) ── */}
          <Arrow
            x={objectX}
            y={objectY}
            height={objectHeight}
            color="#EF4444"
            label="Object"
            direction="up"
          />

          {/* ── IMAGE ARROW (green, only if reasonable) ── */}
          {v > 0 && v < 200 && (
            <Arrow
              x={imageX}
              y={imageY + (isErect ? 0 : imageHeight)}
              height={imageHeight}
              color="#22C55E"
              label="Image"
              direction={isErect ? "up" : "down"}
            />
          )}

          {/* ── RAY PATHS ── */}
          {/* Ray 1: Parallel → F → image */}
          <line
            x1={ray1Start.x}
            y1={ray1Start.y}
            x2={MIRROR_CENTER_X}
            y2={MIRROR_CENTER_Y}
            stroke="#F97316"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.7"
          />
          <line
            x1={MIRROR_CENTER_X}
            y1={MIRROR_CENTER_Y}
            x2={v < 200 ? ray1End.x : ray1EndParallel.x}
            y2={v < 200 ? ray1End.y : ray1EndParallel.y}
            stroke="#F97316"
            strokeWidth="2.5"
            markerEnd="url(#arrow-orange)"
          />

          {/* Ray 2: Through F → parallel → image */}
          <line
            x1={ray2Start.x}
            y1={ray2Start.y}
            x2={ray2Through.x}
            y2={ray2Through.y}
            stroke="#A855F7"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.7"
          />
          <line
            x1={ray2Through.x}
            y1={ray2Through.y}
            x2={ray2End.x}
            y2={ray2End.y}
            stroke="#A855F7"
            strokeWidth="2.5"
            markerEnd="url(#arrow-purple)"
          />

          {/* Ray 3: Through C → straight back */}
          <line
            x1={ray3Start.x}
            y1={ray3Start.y}
            x2={ray3Through.x}
            y2={ray3Through.y}
            stroke="#14B8A6"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.7"
          />
          <line
            x1={ray3Through.x}
            y1={ray3Through.y}
            x2={ray3End.x}
            y2={ray3End.y}
            stroke="#14B8A6"
            strokeWidth="2.5"
            markerEnd="url(#arrow-teal)"
          />

          {/* ── DATA BOX ── */}
          <DataBox
            x={550}
            y={120}
            u={u}
            v={v}
            f={FOCAL_LENGTH}
            m={m}
            isReal={isReal}
            isEnlarged={isEnlarged}
            isErect={isErect}
          />

          {/* ── POSITION LABEL ── */}
          <text
            x={360}
            y={420}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#1F2937"
          >
            {positionText}
          </text>

          {/* ── MARKERS ── */}
          <defs>
            <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#F97316" />
            </marker>
            <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#A855F7" />
            </marker>
            <marker id="arrow-teal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#14B8A6" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Slider */}
      <div style={styles.sliderRow}>
        <span style={styles.sliderLabel}>Far (∞)</span>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSlider}
          style={styles.slider}
        />
        <span style={styles.sliderLabel}>Close</span>
      </div>

      {/* Live data readout */}
      <div style={styles.readoutBox}>
        <div style={styles.readoutRow}>
          <span>Object distance (u):</span>
          <strong>{u.toFixed(1)}</strong>
        </div>
        <div style={styles.readoutRow}>
          <span>Image distance (v):</span>
          <strong>{v > 200 ? "∞" : v.toFixed(1)}</strong>
        </div>
        <div style={styles.readoutRow}>
          <span>Magnification (m):</span>
          <strong>{isEnlarged ? "Enlarged" : "Diminished"}</strong>
        </div>
        <div style={styles.readoutRow}>
          <span>Nature:</span>
          <strong>
            {isReal ? "Real, inverted" : "Virtual, erect"}
          </strong>
        </div>
      </div>

      {/* Interaction nudge */}
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
    gap: "12px",
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
    padding: "12px 16px",
    fontSize: "13px",
    color: "#92400E",
    maxWidth: "680px",
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
    gap: "12px",
    width: "100%",
    maxWidth: "680px",
  },
  slider: {
    flex: 1,
    accentColor: "#3B82F6",
    cursor: "pointer",
  },
  sliderLabel: {
    fontSize: "12px",
    color: "#6B7280",
    minWidth: "50px",
    textAlign: "center",
  },
  readoutBox: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#1F2937",
    maxWidth: "680px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  readoutRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nudge: {
    fontSize: "13px",
    color: "#9CA3AF",
    margin: 0,
  },
};

export default SphericalMirrorImageFormationInteractive;