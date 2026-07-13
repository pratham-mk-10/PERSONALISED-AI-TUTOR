// ============================================================
// RefractionIntroAnimation.jsx — ORCHESTRATOR
// Plays parts 1–6 sequentially, each in its own animation file.
// ============================================================

import React, { useState } from "react";
import RefractionPart1TwoMediums from "./RefractionPart1TwoMediums";
import RefractionPart2StrawExample from "./RefractionPart2StrawExample";
import RefractionPart3IncidentRay from "./RefractionPart3IncidentRay";
import RefractionPart4Normal from "./RefractionPart4Normal";
import RefractionPart5RefractedRay from "./RefractionPart5RefractedRay";
import RefractionPart6Angles from "./RefractionPart6Angles";

const PARTS = [
  RefractionPart1TwoMediums,
  RefractionPart2StrawExample,
  RefractionPart3IncidentRay,
  RefractionPart4Normal,
  RefractionPart5RefractedRay,
  RefractionPart6Angles,
];

const RefractionIntroAnimation = ({ onContinue }) => {
  const [partIndex, setPartIndex] = useState(0);
  const PartComponent = PARTS[partIndex];
  const isLast = partIndex === PARTS.length - 1;

  const handlePartComplete = () => {
    if (!isLast) {
      setPartIndex((i) => i + 1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
        {PARTS.map((_, i) => (
          <div
            key={i}
            style={{
              padding: "4px 10px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              background: i === partIndex ? "#2563EB" : i < partIndex ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.08)",
              color: i === partIndex ? "#FFF" : i < partIndex ? "#60A5FA" : "#94A3B8",
              border: i === partIndex ? "1px solid #2563EB" : "1px solid transparent",
            }}
          >
            Part {i + 1}
          </div>
        ))}
      </div>

      <PartComponent
        key={partIndex}
        onComplete={isLast ? undefined : handlePartComplete}
        onTryItClicked={isLast ? onContinue : undefined}
      />
    </div>
  );
};

export default RefractionIntroAnimation;
