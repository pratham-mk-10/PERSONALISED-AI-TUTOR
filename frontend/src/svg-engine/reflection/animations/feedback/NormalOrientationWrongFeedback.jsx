import React from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";

const SVG_W = 440;
const SVG_H = 300;
const CX = 220;
const CY = 210;

const NormalOrientationWrongFeedback = () => {
  return (
    <AnimationPlayer duration={9000} title="Fix normal orientation">
      {({ progress }) => {
        const phase = progress < 0.4 ? 0 : progress < 0.75 ? 1 : 2;

        return (
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <rect width="100%" height="100%" fill="#F8FAFF" rx="12" />

            <line x1="70" y1={CY} x2="370" y2={CY} stroke="#1F2937" strokeWidth="4" />
            
            <line x1="120" y1="120" x2={CX} y2={CY} stroke="#2563EB" strokeWidth="3" />
            <line x1={CX} y1={CY} x2="320" y2="120" stroke="#2563EB" strokeWidth="3" />

            {phase < 1 && (
              <>
                <line x1={CX} y1={CY} x2={CX - 80} y2={CY - 100} stroke="#DC2626" strokeWidth="3" strokeDasharray="6 4" opacity={0.6} />
                <line x1={CX} y1={CY} x2={CX + 90} y2={CY - 60} stroke="#DC2626" strokeWidth="3" strokeDasharray="6 4" opacity={0.6} />
                <line x1={CX} y1={CY} x2={CX - 120} y2={CY - 30} stroke="#DC2626" strokeWidth="3" strokeDasharray="6 4" opacity={0.6} />
                
                <text x={CX} y={80} textAnchor="middle" fill="#B91C1C" fontSize="13" fontWeight="700">
                  Wrong: Normal is not just any arbitrary line
                </text>
              </>
            )}

            {phase >= 1 && (
              <>
                <path d={`M ${CX} ${CY - 15} L ${CX + 15} ${CY - 15} L ${CX + 15} ${CY}`} fill="none" stroke="#16A34A" strokeWidth="2" opacity={0.7} />
                <line x1={CX} y1="70" x2={CX} y2={CY} stroke="#16A34A" strokeWidth="3" strokeDasharray="6 4" />
                <text x="235" y="90" fill="#166534" fontSize="13" fontWeight="700">
                  Correct normal (perpendicular)
                </text>
              </>
            )}

            <text x={CX} y={40} textAnchor="middle" fill={phase < 1 ? "#B91C1C" : "#166534"} fontSize="16" fontWeight="700">
              {phase < 1 ? "Normal is not drawn at random angles" : "Normal is always perpendicular to the mirror"}
            </text>

            <text x={CX} y={270} textAnchor="middle" fill="#374151" fontSize="13" fontWeight="600">
              Draw the normal exactly at 90 degrees to the mirror at the point of incidence.
            </text>
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default NormalOrientationWrongFeedback;
