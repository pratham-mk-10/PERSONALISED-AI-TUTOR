// ============================================================
// PlaneMirrorTryInteractive.jsx
// TRY stage — student controls the object's distance from a plane
// mirror via a slider; the virtual image updates live, always at
// the same distance behind the mirror, same size, erect.
//
// PROPS:
//   misconceptionTag {string}  detected tag (controls which hint shows)
//   onInteracted     {func}    called when student first moves slider
// ============================================================

import React, { useState, useCallback } from "react";
import { Label, Line, ObjectArrow, ImageArrow } from "../../shared/SVGUtils";

const SVG_W = 460;
const SVG_H = 300;
const MIRROR_X = 260;
const MIRROR_TOP = 60;
const MIRROR_BOTTOM = 260;
const AXIS_Y = 230;
const OBJ_HEIGHT = 60;
const MIN_DIST = 30;
const MAX_DIST = 190;

const HINTS = {
  image_real_confusion:
    "⚠️ No matter how close or far you drag the object, the image never becomes real -- it's always virtual.",
  size_mismatch:
    "⚠️ Watch the height readouts: the image height never changes relative to the object, at any distance.",
  distance_confusion:
    "⚠️ Read the two distance numbers below the mirror carefully -- they are always identical.",
  lateral_inversion_confusion:
    "⚠️ Distance changes, but left-right inversion never does -- that's a separate property.",
  default:
    "💡 Drag the slider and watch the image distance, size, and orientation track the object.",
};

const PlaneMirrorTryInteractive = ({ misconceptionTag = "", onInteracted }) => {
  const [distance, setDistance] = useState(90);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSlider = useCallback((e) => {
    setDistance(Number(e.target.value));
    if (!hasInteracted) {
      setHasInteracted(true);
      if (onInteracted) onInteracted();
    }
  }, [hasInteracted, onInteracted]);

  const objX = MIRROR_X - distance;
  const imgX = MIRROR_X + distance;
  const hint = HINTS[misconceptionTag] || HINTS.default;

  return (
    <div style={styles.wrapper}>
      <p style={styles.title}>Try it: drag the object closer to / further from the mirror</p>
      <div style={styles.hintBox}>{hint}</div>

      <div style={styles.svgWrapper}>
        <svg width={SVG_W} height={SVG_H}>
          <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

          <line x1={MIRROR_X} y1={MIRROR_TOP} x2={MIRROR_X} y2={MIRROR_BOTTOM} stroke="#1F2937" strokeWidth={3} />
          {Array.from({ length: 7 }).map((_, i) => {
            const y = MIRROR_TOP + (i * (MIRROR_BOTTOM - MIRROR_TOP)) / 6;
            return <line key={i} x1={MIRROR_X} y1={y} x2={MIRROR_X + 10} y2={y + 8} stroke="#9CA3AF" strokeWidth={1.5} />;
          })}
          <Line x1={20} y1={AXIS_Y} x2={SVG_W - 20} y2={AXIS_Y} color="#D1D5DB" strokeWidth={1} dashed />

          <ObjectArrow x={objX} axisY={AXIS_Y} height={OBJ_HEIGHT} color="#16A34A" label="Object" />
          <ImageArrow x={imgX} axisY={AXIS_Y} height={OBJ_HEIGHT} inverted={false} isVirtual={true} color="#DC2626" label="Image (virtual)" />

          <Line x1={objX} y1={AXIS_Y + 18} x2={MIRROR_X} y2={AXIS_Y + 18} color="#16A34A" strokeWidth={1.5} />
          <Label x={(objX + MIRROR_X) / 2} y={AXIS_Y + 32} text={`${distance}`} size={12} color="#16A34A" bold />
          <Line x1={MIRROR_X} y1={AXIS_Y + 18} x2={imgX} y2={AXIS_Y + 18} color="#DC2626" strokeWidth={1.5} />
          <Label x={(MIRROR_X + imgX) / 2} y={AXIS_Y + 32} text={`${distance}`} size={12} color="#DC2626" bold />
        </svg>
      </div>

      <div style={styles.sliderRow}>
        <span style={styles.sliderLabel}>Close</span>
        <input
          type="range"
          min={MIN_DIST}
          max={MAX_DIST}
          value={distance}
          onChange={handleSlider}
          style={styles.slider}
        />
        <span style={styles.sliderLabel}>Far</span>
      </div>

      <p style={styles.readout}>
        Object distance: <strong>{distance}</strong> &nbsp;|&nbsp; Image distance: <strong>{distance}</strong>
        &nbsp;&nbsp;|&nbsp;&nbsp; Object height: <strong>{OBJ_HEIGHT}</strong> &nbsp;|&nbsp; Image height: <strong>{OBJ_HEIGHT}</strong>
        &nbsp;&nbsp;|&nbsp;&nbsp; Virtual, Erect, Same Size -- always
      </p>

      {!hasInteracted && <p style={styles.nudge}>👆 Move the slider to explore</p>}
    </div>
  );
};

const styles = {
  wrapper: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "16px", fontFamily: "Arial, sans-serif" },
  title: { fontSize: "15px", fontWeight: "600", color: "#1E40AF", margin: 0 },
  hintBox: { background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#92400E", maxWidth: "460px", textAlign: "center" },
  svgWrapper: { border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", background: "#F8FAFF" },
  sliderRow: { display: "flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "460px" },
  slider: { flex: 1, accentColor: "#2563EB", cursor: "pointer" },
  sliderLabel: { fontSize: "13px", color: "#6B7280", minWidth: "36px", textAlign: "center" },
  readout: { fontSize: "13px", color: "#374151", margin: 0, background: "#F0FDF4", padding: "8px 16px", borderRadius: "6px", border: "1px solid #BBF7D0", textAlign: "center" },
  nudge: { fontSize: "13px", color: "#9CA3AF", margin: 0 },
};

export default PlaneMirrorTryInteractive;
