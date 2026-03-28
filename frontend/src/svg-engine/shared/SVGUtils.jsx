// ============================================================
// SVGUtils.js
// Reusable SVG drawing helper functions.
// Every animation and interactive component imports from here.
// Returns JSX elements — import React before using.
// ============================================================

import React, { useState } from "react";

// ─── RAYS & ARROWS ──────────────────────────────────────────

/**
 * Draw a ray (line with arrowhead at the end)
 * @param {object} props
 * @param {number} props.x1, props.y1 - start point
 * @param {number} props.x2, props.y2 - end point
 * @param {string} props.color        - stroke color (default blue)
 * @param {number} props.strokeWidth  - line width (default 2)
 * @param {string} props.id           - optional id for the marker
 */
export function Ray({ x1, y1, x2, y2, color = "#2563EB", strokeWidth = 2, id = "ray" }) {
  const markerId = `arrowhead-${id}`;
  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
      />
    </>
  );
}

/**
 * Draw a plain line (no arrowhead) — used for mirrors, axis etc.
 */
export function Line({ x1, y1, x2, y2, color = "#333", strokeWidth = 2, dashed = false }) {
  return (
    <line
      x1={x1} y1={y1}
      x2={x2} y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "6,4" : undefined}
    />
  );
}

// ─── MIRRORS ────────────────────────────────────────────────

/**
 * Draw a flat plane mirror (thick horizontal line with hatch marks below)
 * @param {number} x1, y   - left end
 * @param {number} x2      - right end
 * @param {number} y       - y position
 */
export function PlaneMirror({ x1 = 50, x2 = 350, y = 220 }) {
  // hatch marks to show solid surface
  const hatches = [];
  for (let x = x1 + 10; x < x2; x += 20) {
    hatches.push(
      <line key={x} x1={x} y1={y} x2={x - 10} y2={y + 12}
        stroke="#888" strokeWidth="1" />
    );
  }
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#333" strokeWidth="4" />
      {hatches}
    </g>
  );
}

/**
 * Draw a concave mirror (arc curving inward — opening to the left)
 * Centre of mirror at (cx, cy)
 */
export function ConcaveMirror({ cx = 350, cy = 200, radius = 140, span = 100 }) {
  // Arc from top to bottom, curving right (concave toward left)
  const topY    = cy - span;
  const bottomY = cy + span;
  // SVG arc: large-arc=0, sweep=0 for concave shape opening left
  const d = `M ${cx} ${topY} A ${radius} ${radius} 0 0 0 ${cx} ${bottomY}`;
  const hatches = [];
  for (let i = 0; i <= 8; i++) {
    const t   = i / 8;
    const ang = -60 + t * 120; // degrees from vertical
    const rad = (ang * Math.PI) / 180;
    const mx  = cx + radius * Math.sin(rad) * 0.08;
    const my  = cy - radius * Math.cos(rad) + radius * (1 - Math.cos((ang * Math.PI) / 180));
    // simplified hatch: just draw small outward lines
  }
  return (
    <g>
      <path d={d} fill="none" stroke="#333" strokeWidth="4" />
    </g>
  );
}

/**
 * Draw a convex mirror (arc curving outward — bulging to the left)
 */
export function ConvexMirror({ cx = 350, cy = 200, radius = 140, span = 100 }) {
  const topY    = cy - span;
  const bottomY = cy + span;
  // sweep=1 makes arc bulge to the right (convex toward left side)
  const d = `M ${cx} ${topY} A ${radius} ${radius} 0 0 1 ${cx} ${bottomY}`;
  return (
    <g>
      <path d={d} fill="none" stroke="#333" strokeWidth="4" />
    </g>
  );
}

// ─── LENSES ─────────────────────────────────────────────────

/**
 * Draw a convex (converging) lens — biconvex shape
 * Centred at (cx, cy), height = h
 */
export function ConvexLens({ cx = 300, cy = 200, h = 120 }) {
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const bow = 30; // how much it bows out
  return (
    <g>
      {/* left arc */}
      <path
        d={`M ${cx} ${top} Q ${cx - bow} ${cy} ${cx} ${bot}`}
        fill="none" stroke="#1D4ED8" strokeWidth="3"
      />
      {/* right arc */}
      <path
        d={`M ${cx} ${top} Q ${cx + bow} ${cy} ${cx} ${bot}`}
        fill="none" stroke="#1D4ED8" strokeWidth="3"
      />
      {/* top and bottom caps */}
      <line x1={cx} y1={top} x2={cx} y2={top} stroke="#1D4ED8" strokeWidth="3" />
    </g>
  );
}

/**
 * Draw a concave (diverging) lens — biconcave shape
 */
export function ConcaveLens({ cx = 300, cy = 200, h = 120 }) {
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const bow = 25;
  return (
    <g>
      {/* straight edges with inward curves */}
      <path
        d={`M ${cx} ${top} Q ${cx + bow} ${cy} ${cx} ${bot}`}
        fill="none" stroke="#1D4ED8" strokeWidth="3"
      />
      <path
        d={`M ${cx} ${top} Q ${cx - bow} ${cy} ${cx} ${bot}`}
        fill="none" stroke="#1D4ED8" strokeWidth="3"
      />
    </g>
  );
}

// ─── PRINCIPAL AXIS & FOCAL POINTS ──────────────────────────

/**
 * Draw the principal axis (horizontal dashed line)
 */
export function PrincipalAxis({ y = 200, width = 600 }) {
  return (
    <line
      x1={0} y1={y} x2={width} y2={y}
      stroke="#999" strokeWidth="1" strokeDasharray="6,4"
    />
  );
}

/**
 * Draw focal point markers (F and 2F on both sides of lens/mirror)
 * @param {number} cx    - optical centre x
 * @param {number} cy    - principal axis y
 * @param {number} f     - focal length in SVG units
 */
export function FocalPoints({ cx = 300, cy = 200, f = 80 }) {
  const points = [
    { x: cx + f,     label: "F",  side: "right" },
    { x: cx - f,     label: "F",  side: "left"  },
    { x: cx + 2 * f, label: "2F", side: "right" },
    { x: cx - 2 * f, label: "2F", side: "left"  },
  ];
  return (
    <g>
      {points.map((pt) => (
        <g key={`${pt.label}-${pt.side}`}>
          <circle cx={pt.x} cy={cy} r={4} fill="#DC2626" />
          <text x={pt.x} y={cy + 20} textAnchor="middle"
            fontSize="13" fill="#DC2626" fontFamily="Arial">{pt.label}</text>
        </g>
      ))}
    </g>
  );
}

// ─── OBJECT & IMAGE ARROWS ──────────────────────────────────

/**
 * Draw an upright object arrow at position x on the principal axis
 * @param {number} x      - x position
 * @param {number} axisY  - y of principal axis
 * @param {number} height - arrow height (positive = upward)
 * @param {string} color
 * @param {string} label
 */
export function ObjectArrow({ x, axisY = 200, height = 60, color = "#16A34A", label = "Object" }) {
  return (
    <g>
      <line x1={x} y1={axisY} x2={x} y2={axisY - height}
        stroke={color} strokeWidth="2.5" />
      {/* arrowhead at top */}
      <polygon
        points={`${x},${axisY - height} ${x - 6},${axisY - height + 12} ${x + 6},${axisY - height + 12}`}
        fill={color}
      />
      <text x={x} y={axisY + 18} textAnchor="middle"
        fontSize="12" fill={color} fontFamily="Arial">{label}</text>
    </g>
  );
}

/**
 * Draw an image arrow — can be inverted (real) or upright (virtual)
 * @param {boolean} inverted - true for real image (inverted arrow)
 * @param {boolean} virtual  - true = dashed lines (virtual image)
 */
export function ImageArrow({ x, axisY = 200, height = 60, inverted = false, isVirtual = false, color = "#DC2626", label = "Image" }) {
  const tipY = inverted ? axisY + height : axisY - height;
  const arrowPoints = inverted
    ? `${x},${tipY} ${x - 6},${tipY - 12} ${x + 6},${tipY - 12}`
    : `${x},${tipY} ${x - 6},${tipY + 12} ${x + 6},${tipY + 12}`;
  return (
    <g>
      <line x1={x} y1={axisY} x2={x} y2={tipY}
        stroke={color} strokeWidth="2.5"
        strokeDasharray={isVirtual ? "5,4" : undefined}
      />
      <polygon points={arrowPoints} fill={color} />
      <text x={x} y={axisY + (inverted ? -8 : 18)} textAnchor="middle"
        fontSize="12" fill={color} fontFamily="Arial">{label}</text>
    </g>
  );
}

// ─── NORMAL LINE ─────────────────────────────────────────────

/**
 * Draw the normal line (dashed vertical at point of incidence)
 */
export function Normal({ x = 300, topY = 60, bottomY = 250, color = "#6B7280" }) {
  return (
    <line x1={x} y1={topY} x2={x} y2={bottomY}
      stroke={color} strokeWidth="1.5" strokeDasharray="6,4" />
  );
}

// ─── ANGLE ARC ───────────────────────────────────────────────

/**
 * Draw an angle arc with a label
 * @param {string} pathD   - SVG path string (from describeArc in PhysicsEngine)
 * @param {string} color
 * @param {string} label   - angle value e.g. "30°"
 * @param {number} labelX, labelY
 */
export function AngleArc({ pathD, color = "#2563EB", label = "", labelX = 0, labelY = 0 }) {
  return (
    <g>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
      {label && (
        <text x={labelX} y={labelY} fill={color}
          fontSize="13" fontFamily="Arial" fontWeight="bold">{label}</text>
      )}
    </g>
  );
}

// ─── SVG LABEL ───────────────────────────────────────────────

/**
 * Simple SVG text label
 */
export function Label({ x, y, text, color = "#374151", size = 13, anchor = "middle", bold = false }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size}
      fontFamily="Arial" textAnchor={anchor}
      fontWeight={bold ? "bold" : "normal"}>
      {text}
    </text>
  );
}

// ─── MEDIA BOUNDARY (for refraction) ────────────────────────

/**
 * Draw two media separated by a horizontal boundary
 * @param {number} boundaryY - y position of interface
 * @param {number} width, height - SVG dimensions
 * @param {string} topLabel    - e.g. "Air (n=1.0)"
 * @param {string} bottomLabel - e.g. "Glass (n=1.5)"
 */
export function MediaBoundary({ boundaryY = 200, width = 500, height = 400, topLabel = "Air", bottomLabel = "Glass" }) {
  return (
    <g>
      {/* top medium */}
      <rect x={0} y={0} width={width} height={boundaryY}
        fill="#EFF6FF" fillOpacity="0.6" />
      {/* bottom medium */}
      <rect x={0} y={boundaryY} width={width} height={height - boundaryY}
        fill="#BFDBFE" fillOpacity="0.6" />
      {/* boundary line */}
      <line x1={0} y1={boundaryY} x2={width} y2={boundaryY}
        stroke="#3B82F6" strokeWidth="2" />
      {/* labels */}
      <text x={10} y={boundaryY - 10} fontSize="13"
        fill="#1E40AF" fontFamily="Arial">{topLabel}</text>
      <text x={10} y={boundaryY + 20} fontSize="13"
        fill="#1E3A8A" fontFamily="Arial">{bottomLabel}</text>
    </g>
  );
}