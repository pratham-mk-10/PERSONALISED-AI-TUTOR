import React, { useEffect, useState } from "react";

const DynamicSVGRenderer = ({ parameters, explanation, topicId = "" }) => {
  const [animationClass, setAnimationClass] = useState("");
  const isRefraction = topicId.includes("refraction");

  useEffect(() => {
    // Trigger CSS animation after a short delay
    const timer = setTimeout(() => {
      setAnimationClass("draw-path");
    }, 100);
    return () => clearTimeout(timer);
  }, [parameters]);

  if (!parameters) return null;

  const { student_incorrect_trajectory, physics_correct_trajectory } = parameters;

  // Helper to convert trajectory array to SVG path 'd' string
  const toPath = (points) => {
    if (!points || points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  };

  const studentPath = toPath(student_incorrect_trajectory);
  const correctPath = toPath(physics_correct_trajectory);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 800 400"
        style={{ width: "100%", height: "100%", backgroundColor: "#f8f9fa", borderRadius: "12px" }}
      >
        <defs>
          <style>
            {`
              .draw-path {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: draw 2s ease-in-out forwards;
              }
              @keyframes draw {
                to {
                  stroke-dashoffset: 0;
                }
              }
            `}
          </style>
          
          {/* Simple background grid and elements for context */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Principal Axis */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Interface / Mirror line at X=400 */}
        <line x1="400" y1="0" x2="400" y2="400" stroke="#333" strokeWidth="4" />

        {/* Incorrect Student Ray (Red) */}
        {studentPath && (
          <path
            d={studentPath}
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            className={animationClass}
          />
        )}

        {/* Correct Physics Ray (Green) */}
        {correctPath && (
          <path
            d={correctPath}
            stroke="#22c55e"
            strokeWidth="4"
            fill="none"
            className={animationClass}
            style={{ animationDelay: "1s" }} // Draw correct path after student path
          />
        )}
        
        {/* Labels */}
        <text x="410" y="30" fill="#333" fontSize="16" fontWeight="bold">
          {isRefraction ? "Interface / Boundary" : "Mirror / Lens"}
        </text>
        {!isRefraction && (
          <>
            <text x="200" y="220" fill="#666" fontSize="14">C</text>
            <text x="300" y="220" fill="#666" fontSize="14">F</text>
          </>
        )}
      </svg>
      
      {explanation && (
        <div style={{ marginTop: "16px", padding: "16px", background: "rgba(34, 197, 94, 0.1)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.2)", color: "#22c55e", fontSize: "16px" }}>
          {explanation}
        </div>
      )}
    </div>
  );
};

export default DynamicSVGRenderer;
