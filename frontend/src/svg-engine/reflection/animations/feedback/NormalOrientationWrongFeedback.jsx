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
            <line x1="130" y1="140" x2="310" y2="140" stroke={phase < 2 ? "#DC2626" : "#D1D5DB"} strokeWidth="3" strokeDasharray="6 4" />
            <text x="220" y="130" textAnchor="middle" fill="#B91C1C" fontSize="12" fontWeight="700">
              Wrong normal (parallel)
            </text>

            {phase >= 1 && (
              <>
                <line x1={CX} y1="70" x2={CX} y2={CY} stroke="#16A34A" strokeWidth="3" />
                <text x="235" y="84" fill="#166534" fontSize="12" fontWeight="700">
                  Correct normal (perpendicular)
                </text>
              </>
            )}

            <line x1="120" y1="120" x2={CX} y2={CY} stroke="#2563EB" strokeWidth="3" />
            <line x1={CX} y1={CY} x2="320" y2="120" stroke="#2563EB" strokeWidth="3" />

            <text x={220} y={40} textAnchor="middle" fill={phase < 2 ? "#B91C1C" : "#166534"} fontSize="16" fontWeight="700">
              {phase < 2 ? "Normal is not parallel to mirror" : "Normal is always perpendicular"}
            </text>

            <text x={220} y={270} textAnchor="middle" fill="#374151" fontSize="13" fontWeight="600">
              Draw the normal at 90 degrees to the mirror at incidence point.
            </text>
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default NormalOrientationWrongFeedback;
