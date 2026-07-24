import React from "react";
import { clamp } from "../../shared/PhysicsEngine";

const W = 560;
const H = 400;

function ConvexLens({ x, y, op }) {
  return (
    <g opacity={op}>
      <path d={`M${x},${y - 90} Q${x + 28},${y} ${x},${y + 90} Q${x - 28},${y} ${x},${y - 90} Z`} fill="rgba(191,219,254,0.5)" stroke="#2563EB" strokeWidth="2" />
      <text x={x} y={y - 100} fill="#1D4ED8" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Convex</text>
    </g>
  );
}

function ConcaveLens({ x, y, op }) {
  return (
    <g opacity={op}>
      <path d={`M${x - 14},${y - 90} Q${x + 14},${y} ${x - 14},${y + 90} L${x + 14},${y + 90} Q${x - 14},${y} ${x + 14},${y - 90} Z`} fill="rgba(254,215,170,0.4)" stroke="#EA580C" strokeWidth="2" />
      <text x={x} y={y - 100} fill="#C2410C" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Concave</text>
    </g>
  );
}

export default function LensesDiagram({ part, partProgress = 0 }) {
  const p = clamp(partProgress, 0, 1);
  const axisY = 200;
  const labels = ["What is a Lens?", "Convex Lens", "Concave Lens", "Key Points O, F, 2F", "Summary"];

  const showConvex = part >= 2;
  const showConcave = part >= 3;
  const showMarks = part >= 4;

  const convexOp = part === 2 ? clamp(p / 0.5, 0, 1) : part > 2 ? 1 : 0;
  const concaveOp = part === 3 ? clamp(p / 0.5, 0, 1) : part > 3 ? 1 : 0;
  const marksOp = part >= 4 ? clamp(p / 0.5, 0, 1) : 0;

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#F8FAFF" />
      <line x1={40} y1={axisY} x2={W - 40} y2={axisY} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6,5" />
      <text x={W - 36} y={axisY - 6} fill="#6B7280" fontSize="10" fontFamily="Arial">Principal axis</text>

      {part === 1 && (
        <text x={W / 2} y={120} fill="#374151" fontSize="14" fontWeight="700" fontFamily="Arial" textAnchor="middle" opacity={clamp(p / 0.4, 0, 1)}>
          Lens = transparent medium with two curved surfaces
        </text>
      )}

      {showConvex && <ConvexLens x={180} y={axisY} op={convexOp} />}
      {showConcave && <ConcaveLens x={380} y={axisY} op={concaveOp} />}

      {showMarks && marksOp > 0 && (
        <g opacity={marksOp}>
          {[{ x: 180, f: 50, color: "#2563EB" }, { x: 380, f: -50, color: "#EA580C" }].map(({ x, f, color }) => (
            <g key={x}>
              <circle cx={x} cy={axisY} r={4} fill="#111827" />
              <text x={x + 6} y={axisY - 8} fill="#111827" fontSize="10" fontWeight="700" fontFamily="Arial">O</text>
              <circle cx={x + f} cy={axisY} r={4} fill={color} />
              <text x={x + f + (f > 0 ? 6 : -6)} y={axisY - 8} fill={color} fontSize="10" fontWeight="700" fontFamily="Arial" textAnchor={f > 0 ? "start" : "end"}>F</text>
              <circle cx={x + 2 * f} cy={axisY} r={3} fill={color} opacity="0.6" />
              <text x={x + 2 * f + (f > 0 ? 6 : -6)} y={axisY + 16} fill={color} fontSize="9" fontFamily="Arial" textAnchor={f > 0 ? "start" : "end"}>2F</text>
            </g>
          ))}
        </g>
      )}

      {part === 5 && (
        <g opacity={clamp(p / 0.5, 0, 1)}>
          <rect x={60} y={300} width={440} height={52} rx={8} fill="#EFF6FF" stroke="#BFDBFE" />
          <text x={W / 2} y={322} fill="#1E40AF" fontSize="11" fontWeight="700" fontFamily="Arial" textAnchor="middle">Convex: converging, f &gt; 0  |  Concave: diverging, f &lt; 0</text>
          <text x={W / 2} y={340} fill="#1E40AF" fontSize="10" fontFamily="Arial" textAnchor="middle">Ray through O passes undeviated</text>
        </g>
      )}

      <rect x={0} y={H - 52} width={W} height={52} fill="#EEF2FF" />
      <text x={W / 2} y={H - 28} fill="#1D4ED8" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Part {part}/5 — {labels[part - 1]}</text>
    </svg>
  );
}
