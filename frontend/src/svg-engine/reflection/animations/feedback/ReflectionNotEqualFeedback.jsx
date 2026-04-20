import React from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";

const SVG_W = 440;
const SVG_H = 300;
const CX = 220;
const CY = 210;

const ReflectionNotEqualFeedback = () => {
  return (
    <AnimationPlayer duration={9000} title="Fix i = r misconception">
      {({ progress }) => {
        const phase = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

        const incidentX = 120;
        const incidentY = 120;
        const reflectedWrongX = 320;
        const reflectedWrongY = 150;
        const reflectedCorrectX = 320;
        const reflectedCorrectY = 120;

        return (
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <rect width="100%" height="100%" fill="#F8FAFF" rx="12" />

            <line x1="70" y1={CY} x2="370" y2={CY} stroke="#1F2937" strokeWidth="4" />
            <line x1={CX} y1="60" x2={CX} y2={CY} stroke="#16A34A" strokeWidth="3" />

            <line x1={incidentX} y1={incidentY} x2={CX} y2={CY} stroke="#2563EB" strokeWidth="3" />

            {phase < 2 ? (
              <line x1={CX} y1={CY} x2={reflectedWrongX} y2={reflectedWrongY} stroke="#DC2626" strokeWidth="3" />
            ) : (
              <line x1={CX} y1={CY} x2={reflectedCorrectX} y2={reflectedCorrectY} stroke="#2563EB" strokeWidth="3" />
            )}

            <text x={220} y={40} textAnchor="middle" fill={phase < 2 ? "#B91C1C" : "#166534"} fontSize="16" fontWeight="700">
              {phase < 2 ? "Wrong: i and r are different" : "Correct: i = r"}
            </text>

            <text x={220} y={270} textAnchor="middle" fill="#374151" fontSize="13" fontWeight="600">
              Angle of incidence always equals angle of reflection.
            </text>
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default ReflectionNotEqualFeedback;
