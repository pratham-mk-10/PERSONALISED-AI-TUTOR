import React from "react";
import { clamp } from "../../shared/PhysicsEngine";

const W = 560;
const H = 400;

export default function LensFormulaDiagram({ part, partProgress = 0 }) {
  const p = clamp(partProgress, 0, 1);
  const labels = ["Lens Formula", "Sign Convention", "Magnification", "Power of Lens"];

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#F8FAFF" />

      {part === 1 && (
        <g opacity={clamp(p / 0.5, 0, 1)}>
          <rect x={120} y={100} width={320} height={80} rx={12} fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
          <text x={W / 2} y={140} fill="#1E40AF" fontSize="22" fontWeight="900" fontFamily="Arial" textAnchor="middle">1/v − 1/u = 1/f</text>
          <text x={W / 2} y={165} fill="#1E40AF" fontSize="12" fontFamily="Arial" textAnchor="middle">Lens Formula (NCERT)</text>
        </g>
      )}

      {part === 2 && (
        <g opacity={clamp(p / 0.5, 0, 1)}>
          {[
            ["u (object distance)", "always negative (object left of lens)", "#DC2626"],
            ["f (convex lens)", "positive", "#2563EB"],
            ["f (concave lens)", "negative", "#EA580C"],
            ["v (real image)", "positive", "#059669"],
            ["v (virtual image)", "negative", "#7C3AED"],
          ].map(([t, d, c], i) => (
            <g key={t}>
              <text x={80} y={90 + i * 36} fill={c} fontSize="12" fontWeight="700" fontFamily="Arial">{t}</text>
              <text x={80} y={106 + i * 36} fill="#4B5563" fontSize="11" fontFamily="Arial">{d}</text>
            </g>
          ))}
        </g>
      )}

      {part === 3 && (
        <g opacity={clamp(p / 0.5, 0, 1)}>
          <rect x={100} y={110} width={360} height={70} rx={10} fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <text x={W / 2} y={142} fill="#78350F" fontSize="18" fontWeight="800" fontFamily="Arial" textAnchor="middle">m = h'/h = v/u</text>
          <text x={W / 2} y={168} fill="#92400E" fontSize="11" fontFamily="Arial" textAnchor="middle">m &lt; 0 → inverted  |  |m| &gt; 1 → magnified</text>
        </g>
      )}

      {part === 4 && (
        <g opacity={clamp(p / 0.5, 0, 1)}>
          <rect x={100} y={100} width={360} height={90} rx={10} fill="#ECFDF5" stroke="#059669" strokeWidth="2" />
          <text x={W / 2} y={135} fill="#064E3B" fontSize="20" fontWeight="900" fontFamily="Arial" textAnchor="middle">P = 1/f  (f in metres)</text>
          <text x={W / 2} y={158} fill="#065F46" fontSize="12" fontFamily="Arial" textAnchor="middle">Unit: dioptre (D)  |  1 D = 1 m⁻¹</text>
          <text x={W / 2} y={178} fill="#065F46" fontSize="11" fontFamily="Arial" textAnchor="middle">P_total = P₁ + P₂  (lenses in contact)</text>
        </g>
      )}

      <rect x={0} y={H - 52} width={W} height={52} fill="#EEF2FF" />
      <text x={W / 2} y={H - 28} fill="#1D4ED8" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Part {part}/4 — {labels[part - 1]}</text>
    </svg>
  );
}
