import React from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";

const SVG_W = 460;
const SVG_H = 320;
const CX = 230;
const CY = 220;

const PlaneNotSameFeedback = () => {
  return (
    <AnimationPlayer duration={10000} title="Fix same-plane misconception">
      {({ progress }) => {
        const phase = progress < 0.35 ? 0 : progress < 0.7 ? 1 : 2;

        return (
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <rect width="100%" height="100%" fill="#F8FAFF" rx="12" />

            <rect x="90" y="86" width="280" height="165" rx="12" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" />
            <line x1="120" y1={CY} x2="340" y2={CY} stroke="#1F2937" strokeWidth="4" />
            <line x1={CX} y1="100" x2={CX} y2={CY} stroke="#16A34A" strokeWidth="3" />
            <line x1="125" y1="136" x2={CX} y2={CY} stroke="#2563EB" strokeWidth="3" />

            {phase < 2 ? (
              <line x1={CX} y1={CY} x2="352" y2="112" stroke="#DC2626" strokeWidth="3" strokeDasharray="5 3" />
            ) : (
              <line x1={CX} y1={CY} x2="335" y2="136" stroke="#2563EB" strokeWidth="3" />
            )}

            <text x={CX} y="52" textAnchor="middle" fill={phase < 2 ? "#B91C1C" : "#166534"} fontSize="16" fontWeight="700">
              {phase < 2 ? "Wrong: reflected ray moved out of plane" : "Correct: all stay in one plane"}
            </text>

            <text x={CX} y="72" textAnchor="middle" fill="#4B5563" fontSize="12" fontWeight="600">
              Incident ray + reflected ray + normal must be coplanar.
            </text>

            <text x={CX} y="284" textAnchor="middle" fill="#374151" fontSize="13" fontWeight="600">
              Think of one sheet of paper. Draw all three on that same sheet.
            </text>
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default PlaneNotSameFeedback;
