import React from "react";
import { clamp } from "../../shared/PhysicsEngine";
import { snellsLaw } from "../../shared/PhysicsEngine";

const W = 560;
const H = 400;
const SL = 200; // slab left
const SR = 360; // slab right
const ST = 110; // slab top
const SB = 290; // slab bottom
const CX = (SL + SR) / 2;

const I_DEG = 40;
const R_DEG = Math.round(snellsLaw(1.0, 1.5, I_DEG)); // ~25°
const I_RAD = (I_DEG * Math.PI) / 180;
const R_RAD = (R_DEG * Math.PI) / 180;

// Top entry point
const EX = CX - 40;
const EY = ST;
const IX1 = EX - 120 * Math.sin(I_RAD);
const IY1 = EY - 120 * Math.cos(I_RAD);

// Inside slab: travel to bottom
const insideLen = (SB - EY) / Math.cos(R_RAD);
const BX = EX + insideLen * Math.sin(R_RAD);
const BY = SB;

// Emergent (parallel to incident, shifted)
const shiftX = BX - IX1;
const EX2 = BX + 120 * Math.sin(I_RAD);
const EY2 = BY + 120 * Math.cos(I_RAD);

export default function GlassSlabDiagram({ part, partProgress = 0 }) {
  const p = clamp(partProgress, 0, 1);

  const slabOp = part >= 1 ? (part === 1 ? clamp(p / 0.5, 0, 1) : 1) : 0;
  const incPhase = part >= 2 ? (part === 2 ? clamp(p / 0.7, 0, 1) : 1) : 0;
  const insidePhase = part >= 3 ? (part === 3 ? clamp(p / 0.7, 0, 1) : 1) : 0;
  const exitPhase = part >= 4 ? (part === 4 ? clamp(p / 0.7, 0, 1) : 1) : 0;
  const dispOp = part >= 5 ? clamp(p / 0.5, 0, 1) : 0;

  const iTipX = IX1 + (EX - IX1) * incPhase;
  const iTipY = IY1 + (EY - IY1) * incPhase;
  const inTipX = EX + (BX - EX) * insidePhase;
  const inTipY = EY + (BY - EY) * insidePhase;
  const eTipX = BX + (EX2 - BX) * exitPhase;
  const eTipY = BY + (EY2 - BY) * exitPhase;

  const labels = ["Glass Slab Setup", "Refraction at Top", "Ray Inside Glass", "Refraction at Bottom", "Lateral Displacement"];

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#F8FAFF" />
      <text x={18} y={28} fill="#1D4ED8" fontSize="14" fontWeight="800" fontFamily="Arial">AIR</text>
      <text x={18} y={SB + 24} fill="#1D4ED8" fontSize="14" fontWeight="800" fontFamily="Arial">AIR</text>

      {slabOp > 0 && (
        <g opacity={slabOp}>
          <rect x={SL} y={ST} width={SR - SL} height={SB - ST} fill="rgba(186,230,253,0.45)" stroke="#0284C7" strokeWidth="2" />
          <text x={SL + 12} y={ST + 22} fill="#0369A1" fontSize="12" fontWeight="700" fontFamily="Arial">GLASS (n≈1.5)</text>
          <line x1={SL} y1={ST} x2={SR} y2={ST} stroke="#0284C7" strokeWidth="2" />
          <line x1={SL} y1={SB} x2={SR} y2={SB} stroke="#0284C7" strokeWidth="2" />
        </g>
      )}

      {incPhase > 0 && (
        <line x1={IX1} y1={IY1} x2={iTipX} y2={iTipY} stroke="#2563EB" strokeWidth="3" markerEnd={incPhase >= 0.98 ? "url(#gs-b)" : undefined} />
      )}
      {insidePhase > 0 && (
        <line x1={EX} y1={EY} x2={inTipX} y2={inTipY} stroke="#7C3AED" strokeWidth="3" />
      )}
      {exitPhase > 0 && (
        <line x1={BX} y1={BY} x2={eTipX} y2={eTipY} stroke="#0D9488" strokeWidth="3" markerEnd={exitPhase >= 0.98 ? "url(#gs-t)" : undefined} />
      )}

      {dispOp > 0 && exitPhase >= 1 && (
        <g opacity={dispOp}>
          <line x1={IX1} y1={IY1} x2={IX1 + shiftX} y2={IY1} stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6,4" />
          <text x={IX1 + shiftX / 2} y={IY1 - 10} fill="#DC2626" fontSize="11" fontWeight="700" fontFamily="Arial" textAnchor="middle">Lateral displacement</text>
          <text x={EX2 + 20} y={EY2} fill="#065F46" fontSize="11" fontWeight="700" fontFamily="Arial">Emergent ∥ Incident</text>
        </g>
      )}

      <defs>
        <marker id="gs-b" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#2563EB" /></marker>
        <marker id="gs-t" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#0D9488" /></marker>
      </defs>

      <rect x={0} y={H - 52} width={W} height={52} fill="#EEF2FF" />
      <text x={W / 2} y={H - 28} fill="#1D4ED8" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Part {part}/5 — {labels[part - 1]}</text>
      <text x={W / 2} y={H - 12} fill="#4B5563" fontSize="10" fontFamily="Arial" textAnchor="middle">Parallel surfaces → emergent ray parallel to incident</text>
    </svg>
  );
}
