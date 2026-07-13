// Composite refraction ray diagram — layers stack as parts progress (1→6)
import React from "react";
import { clamp } from "../../shared/PhysicsEngine";
import {
  W, H, CX, SY, I_DEG, R_DEG,
  IX1, IY1, RX2, RY2, NY_TOP, NY_BOT,
  INC_ARC, REF_ARC, I_LX, I_LY, R_LX, R_LY,
  CAPTIONS,
} from "./refractionConstants";

/**
 * @param {number} part        — current part 1..6
 * @param {number} partProgress — 0..1 progress within that part's audio
 */
export default function RefractionDiagram({ part, partProgress = 0, showCaption = true }) {
  const p = clamp(partProgress, 0, 1);
  const cap = CAPTIONS[part - 1];

  // Part 1 — mediums fade in
  const mediumOp = part >= 1 ? (part === 1 ? clamp(p / 0.45, 0, 1) : 1) : 0;

  // Part 2 — straw only during part 2
  const strawOp = part === 2 ? clamp(p < 0.85 ? p / 0.2 : (1 - p) / 0.15, 0, 1) : 0;

  // Part 3 — incident ray draws
  const incPhase = part >= 3 ? (part === 3 ? clamp(p / 0.72, 0, 1) : 1) : 0;
  const iTipX = IX1 + (CX - IX1) * incPhase;
  const iTipY = IY1 + (SY - IY1) * incPhase;
  const incLabelOp = part >= 3 ? (part === 3 ? clamp((p - 0.74) / 0.2, 0, 1) : 1) : 0;

  // Part 4 — normal
  const normFade = part >= 4 ? (part === 4 ? clamp(p / 0.55, 0, 1) : 1) : 0;
  const normLabelOp = part >= 4 ? (part === 4 ? clamp((p - 0.55) / 0.3, 0, 1) : 1) : 0;

  // Part 5 — refracted ray
  const refPhase = part >= 5 ? (part === 5 ? clamp(p / 0.72, 0, 1) : 1) : 0;
  const rTipX = CX + (RX2 - CX) * refPhase;
  const rTipY = SY + (RY2 - SY) * refPhase;
  const refLabelOp = part >= 5 ? (part === 5 ? clamp((p - 0.74) / 0.2, 0, 1) : 1) : 0;
  const bendCallout = part === 5 && p > 0.35 && p < 0.75;

  // Part 6 — angle arcs
  const arcIOp = part >= 6 ? clamp(p / 0.28, 0, 1) : 0;
  const arcILblOp = part >= 6 ? clamp((p - 0.3) / 0.15, 0, 1) : 0;
  const arcROp = part >= 6 ? clamp((p - 0.38) / 0.25, 0, 1) : 0;
  const arcRLblOp = part >= 6 ? clamp((p - 0.65) / 0.15, 0, 1) : 0;
  const cmpOp = part >= 6 ? clamp((p - 0.68) / 0.15, 0, 1) : 0;
  const banOp = part >= 6 ? clamp((p - 0.82) / 0.15, 0, 1) : 0;

  const stSX = CX - 45, stSY = SY - 72;
  const stAX = CX + 26, stAY = SY + 72;
  const stBX = CX - 45, stBY = SY + 72;

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <defs>
        <marker id="rf-b" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#2563EB" />
        </marker>
        <marker id="rf-t" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#0D9488" />
        </marker>
        <linearGradient id="rf-air" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="rf-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#075985" stopOpacity="0.22" />
        </linearGradient>
        <filter id="rf-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill="#F8FAFF" />

      {/* PART 1+ — mediums (always visible once part 1 starts) */}
      {mediumOp > 0 && (
        <g opacity={mediumOp}>
          <rect x={0} y={0} width={W} height={SY} fill="url(#rf-air)" />
          <rect x={0} y={SY} width={W} height={H - SY} fill="url(#rf-water)" />
          {[28, 58, 88, 118].map((dy) => (
            <path
              key={dy}
              d={`M0,${SY + dy} Q${W / 4},${SY + dy - 5} ${W / 2},${SY + dy} Q${(3 * W) / 4},${SY + dy + 5} ${W},${SY + dy}`}
              fill="none" stroke="#BAE6FD" strokeWidth="1.1" opacity="0.55"
            />
          ))}
          <line x1={0} y1={SY} x2={W} y2={SY} stroke="#0284C7" strokeWidth="2.4" />
          <text x={18} y={SY - 52} fill="#1D4ED8" fontSize="15" fontWeight="800" fontFamily="Arial, sans-serif">AIR</text>
          <text x={18} y={SY - 32} fill="#2563EB" fontSize="12" fontFamily="Arial">n₁ = 1.00  (light: faster)</text>
          <text x={18} y={SY + 32} fill="#0369A1" fontSize="15" fontWeight="800" fontFamily="Arial, sans-serif">WATER</text>
          <text x={18} y={SY + 52} fill="#0284C7" fontSize="12" fontFamily="Arial">n₂ = 1.33  (light: slower)</text>
        </g>
      )}

      {/* PART 2 — straw */}
      {strawOp > 0 && (
        <g opacity={strawOp}>
          <rect x={CX - 54} y={SY - 80} width={88} height={160}
            fill="rgba(186,230,253,0.10)" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,4" rx={6} />
          <line x1={CX - 52} y1={SY} x2={CX + 32} y2={SY} stroke="#0284C7" strokeWidth="1" opacity="0.55" />
          <line x1={stSX} y1={stSY} x2={CX} y2={SY} stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
          <line x1={CX} y1={SY} x2={stAX} y2={stAY} stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
          <line x1={CX} y1={SY} x2={stBX} y2={stBY} stroke="#F59E0B" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="6,5" opacity="0.38" />
          <text x={stAX + 9} y={stAY} fill="#78350F" fontSize="11" fontWeight="700" fontFamily="Arial">Actual</text>
          <text x={stBX - 7} y={stBY + 2} fill="#92400E" fontSize="11" fontWeight="700" fontFamily="Arial" textAnchor="end">Apparent</text>
          <rect x={CX - 100} y={SY - 120} width={200} height={30} rx={7} fill="#FEF9C3" stroke="#F59E0B" strokeWidth="1.5" />
          <text x={CX} y={SY - 99} fill="#92400E" fontSize="13" fontWeight="800" fontFamily="Arial" textAnchor="middle">
            Straw appears BENT! → Refraction
          </text>
        </g>
      )}

      {/* PART 3+ — incident ray */}
      {incPhase > 0 && (
        <g>
          <line x1={IX1} y1={IY1} x2={iTipX} y2={iTipY}
            stroke="#2563EB" strokeWidth="3"
            markerEnd={incPhase >= 0.98 ? "url(#rf-b)" : undefined}
            filter="url(#rf-glow)" />
          {incPhase < 0.98 && <circle cx={iTipX} cy={iTipY} r={5} fill="#2563EB" />}
          <text x={IX1 - 10} y={IY1 + 5} fill="#2563EB" fontSize="13" fontWeight="700"
            fontFamily="Arial" textAnchor="end" opacity={incLabelOp}>Incident Ray</text>
        </g>
      )}

      {/* PART 4+ — normal */}
      {normFade > 0 && (
        <g opacity={normFade}>
          <line x1={CX} y1={NY_TOP} x2={CX} y2={NY_BOT}
            stroke="#6B7280" strokeWidth="1.8" strokeDasharray="8,6" />
        </g>
      )}
      {normLabelOp > 0 && (
        <g opacity={normLabelOp}>
          <text x={CX + 8} y={NY_TOP + 18} fill="#6B7280" fontSize="12" fontFamily="Arial" fontWeight="700">Normal (N)</text>
          <circle cx={CX} cy={SY} r={6} fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <text x={CX + 10} y={SY - 10} fill="#B45309" fontSize="12" fontWeight="700" fontFamily="Arial">P</text>
        </g>
      )}

      {/* PART 5+ — refracted ray */}
      {refPhase > 0 && (
        <g filter="url(#rf-glow)">
          <line x1={CX} y1={SY} x2={rTipX} y2={rTipY}
            stroke="#0D9488" strokeWidth="3"
            markerEnd={refPhase >= 0.98 ? "url(#rf-t)" : undefined} />
          {refPhase < 0.98 && <circle cx={rTipX} cy={rTipY} r={5} fill="#0D9488" />}
        </g>
      )}
      {refLabelOp > 0 && (
        <text x={RX2 + 10} y={RY2 - 6} fill="#0D9488" fontSize="13" fontWeight="700"
          fontFamily="Arial" opacity={refLabelOp}>Refracted Ray</text>
      )}
      {bendCallout && (
        <g opacity={clamp((p - 0.35) / 0.15, 0, 1)}>
          <rect x={CX + 20} y={SY + 20} width={174} height={28} rx={6} fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.4" />
          <text x={CX + 107} y={SY + 38} fill="#065F46" fontSize="12" fontWeight="700"
            fontFamily="Arial" textAnchor="middle">bends TOWARD normal  (r &lt; i)</text>
        </g>
      )}

      {/* PART 6 — angles */}
      {arcIOp > 0 && (
        <g opacity={arcIOp}>
          <path d={`${INC_ARC} L${CX},${SY} Z`} fill="#DBEAFE" opacity="0.6" />
          <path d={INC_ARC} fill="none" stroke="#1D4ED8" strokeWidth="2.4" />
          <text x={I_LX} y={I_LY} fill="#1D4ED8" fontSize="22" fontWeight="900"
            fontFamily="Arial, sans-serif" textAnchor="middle" dominantBaseline="middle">i</text>
        </g>
      )}
      {arcILblOp > 0 && (
        <text x={I_LX} y={I_LY + 22} fill="#1E40AF" fontSize="11" fontFamily="Arial"
          textAnchor="middle" opacity={arcILblOp}>= {I_DEG}°</text>
      )}
      {arcROp > 0 && (
        <g opacity={arcROp}>
          <path d={`${REF_ARC} L${CX},${SY} Z`} fill="#CCFBF1" opacity="0.6" />
          <path d={REF_ARC} fill="none" stroke="#0D9488" strokeWidth="2.4" />
          <text x={R_LX} y={R_LY} fill="#0D9488" fontSize="22" fontWeight="900"
            fontFamily="Arial, sans-serif" textAnchor="middle" dominantBaseline="middle">r</text>
        </g>
      )}
      {arcRLblOp > 0 && (
        <text x={R_LX} y={R_LY + 22} fill="#065F46" fontSize="11" fontFamily="Arial"
          textAnchor="middle" opacity={arcRLblOp}>= {R_DEG}°</text>
      )}
      {cmpOp > 0 && (
        <g opacity={cmpOp}>
          <rect x={W - 186} y={12} width={174} height={48} rx={8} fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <text x={W - 99} y={30} fill="#78350F" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">
            i ({I_DEG}°) &gt; r ({R_DEG}°)
          </text>
          <text x={W - 99} y={48} fill="#92400E" fontSize="11" fontFamily="Arial" textAnchor="middle">
            Bends TOWARD Normal ✓
          </text>
        </g>
      )}
      {banOp > 0 && (
        <g opacity={banOp}>
          <rect x={12} y={12} width={W - 210} height={48} rx={8} fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
          <text x={(W - 210) / 2 + 12} y={30} fill="#064E3B" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">
            REFRACTION: bending of light
          </text>
          <text x={(W - 210) / 2 + 12} y={48} fill="#064E3B" fontSize="11" fontFamily="Arial" textAnchor="middle">
            at the boundary of two mediums
          </text>
        </g>
      )}

      {/* Caption bar */}
      {showCaption && (
        <>
          <rect x={0} y={H - 62} width={W} height={62} fill="#EEF2FF" opacity="0.95" />
          <line x1={0} y1={H - 62} x2={W} y2={H - 62} stroke="#C7D2FE" strokeWidth="1.2" />
          <rect x={10} y={H - 55} width={60} height={18} rx={9} fill="#4F46E5" opacity="0.85" />
          <text x={40} y={H - 42} fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Arial" textAnchor="middle">
            Part {part} / 6
          </text>
          <text x={W / 2} y={H - 38} fill={cap.top.color} fontSize="13" fontWeight="700" fontFamily="Arial" textAnchor="middle">
            {cap.top.text}
          </text>
          <text x={W / 2} y={H - 18} fill={cap.bot.color} fontSize="11" fontFamily="Arial" textAnchor="middle">
            {cap.bot.text}
          </text>
        </>
      )}
    </svg>
  );
}
