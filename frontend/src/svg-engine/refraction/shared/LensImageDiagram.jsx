import React from "react";
import { clamp } from "../../shared/PhysicsEngine";

const W = 560;
const H = 400;

export default function LensImageDiagram({ part, partProgress = 0 }) {
  const p = clamp(partProgress, 0, 1);
  const axisY = 220;
  const lensX = 280;
  const labels = ["Ray Rules", "Convex: Real Image", "Convex: Virtual Image", "Concave: Always Virtual"];

  const lensOp = part >= 1 ? 1 : 0;
  const raysOp = part >= 1 ? (part === 1 ? clamp(p / 0.6, 0, 1) : 1) : 0;
  const imgOp = part >= 2 ? (part === 2 ? clamp(p / 0.6, 0, 1) : part === 3 ? clamp(p / 0.6, 0, 1) : 1) : 0;

  const isConvexCase = part === 2 || part === 3;
  const isConcave = part === 4;

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#F8FAFF" />
      <line x1={30} y1={axisY} x2={W - 30} y2={axisY} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6,5" />

      {lensOp > 0 && (
        <path d={`M${lensX},${axisY - 80} Q${lensX + 22},${axisY} ${lensX},${axisY + 80} Q${lensX - 22},${axisY} ${lensX},${axisY - 80} Z`}
          fill="rgba(191,219,254,0.45)" stroke="#2563EB" strokeWidth="2" />
      )}

      <circle cx={lensX + 55} cy={axisY} r={3} fill="#2563EB" />
      <text x={lensX + 62} y={axisY - 6} fill="#2563EB" fontSize="10" fontWeight="700" fontFamily="Arial">F</text>

      {raysOp > 0 && (
        <g opacity={raysOp}>
          <line x1={120} y1={axisY - 50} x2={lensX} y2={axisY - 50} stroke="#F59E0B" strokeWidth="2" />
          <line x1={lensX} y1={axisY - 50} x2={lensX + 55} y2={axisY} stroke="#F59E0B" strokeWidth="2" />
          <line x1={120} y1={axisY - 50} x2={lensX} y2={axisY} stroke="#DC2626" strokeWidth="2" strokeDasharray="5,4" />
          <rect x={100} y={axisY - 70} width={12} height={40} fill="#78350F" rx={2} />
          <text x={106} y={axisY + 20} fill="#78350F" fontSize="10" fontFamily="Arial" textAnchor="middle">Object</text>
        </g>
      )}

      {imgOp > 0 && part === 2 && (
        <g opacity={imgOp}>
          <line x1={lensX + 55} y1={axisY} x2={420} y2={axisY + 35} stroke="#0D9488" strokeWidth="2" />
          <rect x={410} y={axisY + 20} width={10} height={30} fill="#0D9488" rx={1} />
          <text x={425} y={axisY + 38} fill="#065F46" fontSize="10" fontWeight="700" fontFamily="Arial">Real, inverted</text>
        </g>
      )}

      {imgOp > 0 && part === 3 && (
        <g opacity={imgOp}>
          <line x1={lensX + 55} y1={axisY} x2={180} y2={axisY - 80} stroke="#7C3AED" strokeWidth="2" strokeDasharray="6,4" />
          <rect x={165} y={axisY - 95} width={10} height={28} fill="#7C3AED" rx={1} opacity="0.7" />
          <text x={150} y={axisY - 100} fill="#5B21B6" fontSize="10" fontWeight="700" fontFamily="Arial">Virtual, magnified</text>
        </g>
      )}

      {part === 4 && (
        <g opacity={clamp(p / 0.6, 0, 1)}>
          <path d={`M${lensX - 12},${axisY - 70} Q${lensX + 12},${axisY} ${lensX - 12},${axisY + 70} L${lensX + 12},${axisY + 70} Q${lensX - 12},${axisY} ${lensX + 12},${axisY - 70} Z`}
            fill="rgba(254,215,170,0.4)" stroke="#EA580C" strokeWidth="2" />
          <text x={lensX} y={axisY + 100} fill="#C2410C" fontSize="11" fontWeight="700" fontFamily="Arial" textAnchor="middle">Concave: always virtual, erect, diminished</text>
        </g>
      )}

      <rect x={0} y={H - 52} width={W} height={52} fill="#EEF2FF" />
      <text x={W / 2} y={H - 28} fill="#1D4ED8" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Part {part}/4 — {labels[part - 1]}</text>
    </svg>
  );
}
