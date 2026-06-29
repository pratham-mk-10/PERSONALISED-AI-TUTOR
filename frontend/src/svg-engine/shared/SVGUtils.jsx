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
export function PrincipalAxis({ startX = 0, endX, y = 200, width = 600 }) {
  const x1 = startX;
  const x2 = endX !== undefined ? endX : width;
  return (
    <line
      x1={x1} y1={y} x2={x2} y2={y}
      stroke="#999" strokeWidth="1.5" strokeDasharray="6,4"
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

// ─── ADDED COMPONENTS FOR SPHERICAL MIRROR ANIMATIONS ──────────

/**
 * Draw a high-quality Concave Mirror Arc
 * Vertex is at (centerX, centerY). Center of curvature is to the left at distance (radius * SCALE).
 */
export function ConcaveMirrorArc({ centerX, centerY, radius, color = "#3B82F6", strokeWidth = 4 }) {
  const scale = 2;
  const r = radius * scale; // 160
  const cx = centerX - r; // center of curvature x
  const cy = centerY;
  
  const ySpan = 95;
  const xOffset = Math.sqrt(r * r - ySpan * ySpan);
  const xStart = cx + xOffset;
  const yStart = cy - ySpan;
  const yEnd = cy + ySpan;
  
  const d = `M ${xStart} ${yStart} A ${r} ${r} 0 0 0 ${xStart} ${yEnd}`;
  
  const hatches = [];
  const hatchCount = 12;
  for (let i = 0; i <= hatchCount; i++) {
    const t = i / hatchCount;
    const y = yStart + t * (2 * ySpan);
    const x = cx + Math.sqrt(r * r - (y - cy) * (y - cy));
    const nx = (x - cx) / r;
    const ny = (y - cy) / r;
    const hatchLength = 8;
    const hx1 = x;
    const hy1 = y;
    const hx2 = x + nx * hatchLength - ny * 3;
    const hy2 = y + ny * hatchLength + nx * 3;
    hatches.push(
      <line key={i} x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#9CA3AF" strokeWidth="1" />
    );
  }
  
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {hatches}
    </g>
  );
}

/**
 * Draw a single focal point marker (F)
 */
export function FocalPoint({ x, y, label = "F" }) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill="#DC2626" />
      <text x={x} y={y + 20} textAnchor="middle" fontSize="13" fill="#DC2626" fontFamily="Arial" fontWeight="bold">{label}</text>
    </g>
  );
}

/**
 * Draw a single Centre of Curvature marker (C)
 */
export function CentreOfCurvature({ x, y, label = "C" }) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill="#4B5563" />
      <text x={x} y={y + 20} textAnchor="middle" fontSize="13" fill="#4B5563" fontFamily="Arial" fontWeight="bold">{label}</text>
    </g>
  );
}

/**
 * Draw the Pole marker (P)
 */
export function Pole({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill="#1F2937" />
      <text x={x + 10} y={y + 5} fontSize="13" fontWeight="bold" fill="#1F2937" fontFamily="Arial">P</text>
    </g>
  );
}

/**
 * Draw a generic Arrow component (used for Object and Image arrows)
 */
export function Arrow({ x, y, height, color = "#EF4444", label = "", direction = "up" }) {
  const tipY = direction === "up" ? y - height : y + height;
  const arrowPoints = direction === "up"
    ? `${x},${tipY} ${x - 6},${tipY + 12} ${x + 6},${tipY + 12}`
    : `${x},${tipY} ${x - 6},${tipY - 12} ${x + 6},${tipY - 12}`;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={tipY} stroke={color} strokeWidth="2.5" />
      <polygon points={arrowPoints} fill={color} />
      {label && (
        <text x={x} y={y + (direction === "up" ? 18 : -8)} textAnchor="middle"
          fontSize="12" fill={color} fontFamily="Arial" fontWeight="bold">{label}</text>
      )}
    </g>
  );
}

/**
 * Draw a RayLine with arrowhead indicating direction and an optional label
 */
export function RayLine({ x1, y1, x2, y2, color = "#2563EB", strokeWidth = 2, label = "", id = "rayline" }) {
  const markerId = `arrowhead-${id}-${Math.random().toString(36).substr(2, 9)}`;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
      />
      {label && (
        <text x={midX} y={midY - 8} fill={color} fontSize="12" fontFamily="Arial" fontWeight="bold" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Draw a DataBox inside the SVG canvas displaying real-time physics variables
 */
export function DataBox({ x = 550, y = 120, u, v, f, m, isReal, isEnlarged, isErect }) {
  const width = 150;
  const height = 155;
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={width}
        height={height}
        fill="#FFFFFF"
        stroke="#E5E7EB"
        strokeWidth="1.5"
        rx="8"
      />
      <text x="12" y="22" fontSize="12" fontWeight="bold" fill="#374151" fontFamily="Arial">
        Live Values
      </text>
      <line x1="12" y1="30" x2={width - 12} y2="30" stroke="#E5E7EB" strokeWidth="1" />
      
      <text x="12" y="48" fontSize="11" fill="#6B7280" fontFamily="Arial">u (obj dist):</text>
      <text x={width - 12} y="48" fontSize="11" fontWeight="bold" fill="#111827" fontFamily="Arial" textAnchor="end">
        {u ? u.toFixed(1) : "N/A"}
      </text>

      <text x="12" y="66" fontSize="11" fill="#6B7280" fontFamily="Arial">v (img dist):</text>
      <text x={width - 12} y="66" fontSize="11" fontWeight="bold" fill="#111827" fontFamily="Arial" textAnchor="end">
        {Math.abs(v) > 300 ? "∞" : v ? v.toFixed(1) : "N/A"}
      </text>

      <text x="12" y="84" fontSize="11" fill="#6B7280" fontFamily="Arial">f (focal len):</text>
      <text x={width - 12} y="84" fontSize="11" fontWeight="bold" fill="#111827" fontFamily="Arial" textAnchor="end">
        {f ? f.toFixed(0) : "N/A"}
      </text>

      <text x="12" y="102" fontSize="11" fill="#6B7280" fontFamily="Arial">m (mag):</text>
      <text x={width - 12} y="102" fontSize="11" fontWeight="bold" fill="#111827" fontFamily="Arial" textAnchor="end">
        {m ? m.toFixed(2) : "N/A"}
      </text>

      <text x="12" y="124" fontSize="10" fill="#3B82F6" fontWeight="bold" fontFamily="Arial">
        {isReal ? "Real & Inverted" : "Virtual & Erect"}
      </text>
      <text x="12" y="138" fontSize="10" fill="#10B981" fontWeight="bold" fontFamily="Arial">
        {isEnlarged ? "Diminished" : "Enlarged"}
      </text>
    </g>
  );
}

/**
 * Draw the MirrorFormula box showing the equation and custom focal length relation
 */
export function MirrorFormula({ x = 550, y = 50, text = "" }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width="150"
        height="55"
        fill="#EFF6FF"
        stroke="#BFDBFE"
        strokeWidth="1"
        rx="6"
      />
      <text x="75" y="20" fontSize="12" fontWeight="bold" fill="#1E40AF" fontFamily="Arial" textAnchor="middle">
        1/f = 1/v + 1/u
      </text>
      <text x="75" y="40" fontSize="11" fill="#1E40AF" fontFamily="Arial" textAnchor="middle">
        {text}
      </text>
    </g>
  );
}