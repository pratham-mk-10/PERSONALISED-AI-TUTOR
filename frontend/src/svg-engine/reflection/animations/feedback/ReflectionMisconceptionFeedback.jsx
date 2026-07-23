import React from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";

// --- Math Helpers ---
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  // 0 degrees is Straight UP
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;
}

// --- Common UI Components ---
const SVG_W = 760;
const SVG_H = 360;
const MIRROR_Y = 280;
const CX = 380;

const BaseMirrorSystem = ({ tiltNormal = false }) => (
  <g>
    {/* Mirror Surface */}
    <rect x={180} y={MIRROR_Y} width={400} height={10} fill="#94A3B8" />
    <line x1={180} y1={MIRROR_Y} x2={580} y2={MIRROR_Y} stroke="#1E293B" strokeWidth="4" />
    {/* Dashes below mirror */}
    {Array.from({ length: 20 }).map((_, i) => (
      <line key={i} x1={190 + i * 20} y1={MIRROR_Y + 10} x2={180 + i * 20} y2={MIRROR_Y + 20} stroke="#94A3B8" strokeWidth="2" />
    ))}
    
    {/* Normal */}
    <line 
      x1={CX} 
      y1={MIRROR_Y} 
      x2={tiltNormal ? CX + 80 : CX} 
      y2={MIRROR_Y - 200} 
      stroke="#16A34A" 
      strokeWidth="2.5" 
      strokeDasharray="8 6" 
    />
    <text x={tiltNormal ? CX + 90 : CX} y={MIRROR_Y - 210} fill="#16A34A" fontSize="16" fontWeight="700" textAnchor="middle">
      Normal
    </text>
  </g>
);

const Ray = ({ angle, color, label, isDotted = false }) => {
  const pt = polarToCartesian(CX, MIRROR_Y, 220, angle);
  const midPt = polarToCartesian(CX, MIRROR_Y, 110, angle);
  
  // Arrow head pointing IN if angle < 0 (incident), OUT if angle > 0 (reflected)
  const isIncident = angle < 0;
  const arrowAngle = isIncident ? angle : angle + 180;
  
  const arrowL = polarToCartesian(midPt.x, midPt.y, 15, arrowAngle - 30);
  const arrowR = polarToCartesian(midPt.x, midPt.y, 15, arrowAngle + 30);

  return (
    <g>
      <line 
        x1={CX} 
        y1={MIRROR_Y} 
        x2={pt.x} 
        y2={pt.y} 
        stroke={color} 
        strokeWidth="4" 
        strokeDasharray={isDotted ? "6 6" : "none"}
      />
      {/* Arrow */}
      {!isDotted && (
        <polygon 
          points={`${midPt.x},${midPt.y} ${arrowL.x},${arrowL.y} ${arrowR.x},${arrowR.y}`} 
          fill={color} 
        />
      )}
      {/* Label */}
      {label && (
        <text 
          x={pt.x + (angle < 0 ? -30 : 30)} 
          y={pt.y - 10} 
          fill={color} 
          fontSize="16" 
          fontWeight="700" 
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

// --- Custom Visualizers ---

const ReflectionNotEqualVisualizer = ({ step }) => {
  const iAngle = -45;
  const rWrong = 75; // Much wider than i
  const rCorrect = 45;
  const arcRadius = 70;

  return (
    <g>
      <BaseMirrorSystem />
      
      {/* Incident Ray */}
      <Ray angle={iAngle} color="#2563EB" label="Incident Ray" />
      <path d={describeArc(CX, MIRROR_Y, arcRadius, iAngle, 0)} fill="none" stroke="#2563EB" strokeWidth="3" />
      <text x={CX - 30} y={MIRROR_Y - 85} fill="#2563EB" fontSize="18" fontWeight="800">i = 45°</text>

      {step === 0 && (
        <g>
          <Ray angle={rWrong} color="#DC2626" label="Reflected Ray" />
          <path d={describeArc(CX, MIRROR_Y, arcRadius, 0, rWrong)} fill="none" stroke="#DC2626" strokeWidth="3" strokeDasharray="4 4" />
          <text x={CX + 45} y={MIRROR_Y - 55} fill="#DC2626" fontSize="18" fontWeight="800">r = 75°</text>
          
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            Misconception: Reflected at a random angle
          </text>
        </g>
      )}

      {step === 1 && (
        <g>
          <Ray angle={rWrong} color="#DC2626" label="Reflected Ray" />
          <path d={describeArc(CX, MIRROR_Y, arcRadius, 0, rWrong)} fill="none" stroke="#DC2626" strokeWidth="5" />
          <text x={CX + 45} y={MIRROR_Y - 55} fill="#DC2626" fontSize="18" fontWeight="800">r = 75°</text>
          
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            This is incorrect! ∠i and ∠r cannot be different. ❌
          </text>
        </g>
      )}

      {step === 2 && (
        <g>
          <Ray angle={rCorrect} color="#16A34A" label="Reflected Ray" />
          <path d={describeArc(CX, MIRROR_Y, arcRadius, 0, rCorrect)} fill="none" stroke="#16A34A" strokeWidth="3" />
          <text x={CX + 30} y={MIRROR_Y - 85} fill="#16A34A" fontSize="18" fontWeight="800">r = 45°</text>
          
          <text x={CX} y={60} fill="#16A34A" fontSize="22" fontWeight="800" textAnchor="middle">
            Correct: Angle of Incidence ALWAYS equals Angle of Reflection ✅
          </text>
        </g>
      )}
    </g>
  );
};

const AngleFromSurfaceVisualizer = ({ step }) => {
  const iAngle = -50; 
  const arcRadius = 80;

  return (
    <g>
      <BaseMirrorSystem />
      <Ray angle={iAngle} color="#2563EB" label="Incident Ray" />
      
      {step === 0 && (
        <g>
          <path d={describeArc(CX, MIRROR_Y, arcRadius, -90, iAngle)} fill="none" stroke="#DC2626" strokeWidth="4" />
          <text x={CX - 120} y={MIRROR_Y - 30} fill="#DC2626" fontSize="18" fontWeight="800">Measured here</text>
          
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            Misconception: Angle is measured from the mirror surface
          </text>
        </g>
      )}

      {step === 1 && (
        <g>
          <path d={describeArc(CX, MIRROR_Y, arcRadius, -90, iAngle)} fill="none" stroke="#DC2626" strokeWidth="6" />
          <text x={CX - 120} y={MIRROR_Y - 30} fill="#DC2626" fontSize="18" fontWeight="800">WRONG ❌</text>
          
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            This is incorrect! Never measure from the surface.
          </text>
        </g>
      )}

      {step === 2 && (
        <g>
          <path d={describeArc(CX, MIRROR_Y, arcRadius, iAngle, 0)} fill="none" stroke="#16A34A" strokeWidth="4" />
          <text x={CX - 35} y={MIRROR_Y - 95} fill="#16A34A" fontSize="18" fontWeight="800">∠i</text>
          
          <text x={CX} y={60} fill="#16A34A" fontSize="22" fontWeight="800" textAnchor="middle">
            Correct: Angles MUST be measured from the Normal ✅
          </text>
        </g>
      )}
    </g>
  );
};

const NormalOrientationVisualizer = ({ step }) => {
  const iAngle = -45;

  return (
    <g>
      <BaseMirrorSystem tiltNormal={step === 0 || step === 1} />
      <Ray angle={iAngle} color="#2563EB" label="Incident Ray" />
      
      {step === 0 && (
        <g>
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            Misconception: The Normal can be drawn at any random angle
          </text>
          <path d={describeArc(CX, MIRROR_Y, 40, -90, 20)} fill="none" stroke="#DC2626" strokeWidth="3" />
        </g>
      )}

      {step === 1 && (
        <g>
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            This is incorrect! The Normal is not just any dashed line. ❌
          </text>
          <path d={describeArc(CX, MIRROR_Y, 40, -90, 20)} fill="none" stroke="#DC2626" strokeWidth="5" />
          <text x={CX + 50} y={MIRROR_Y - 25} fill="#DC2626" fontSize="16" fontWeight="800">Not 90°!</text>
        </g>
      )}

      {step === 2 && (
        <g>
          <text x={CX} y={60} fill="#16A34A" fontSize="22" fontWeight="800" textAnchor="middle">
            Correct: The Normal is exactly Perpendicular (90°) to the mirror surface ✅
          </text>
          <rect x={CX} y={MIRROR_Y - 25} width={25} height={25} fill="none" stroke="#16A34A" strokeWidth="3" />
          <circle cx={CX + 12.5} cy={MIRROR_Y - 12.5} r={3} fill="#16A34A" />
        </g>
      )}
    </g>
  );
};

const PlaneNotSameVisualizer = ({ step }) => {
  const iAngle = -45;
  const rCorrect = 45;
  
  return (
    <g>
      <polygon points="100,320 660,320 710,60 150,60" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="3" />
      <text x={600} y={80} fill="#60A5FA" fontSize="18" fontWeight="700" fontStyle="italic">Plane of Incidence (The Page)</text>

      <BaseMirrorSystem />
      <Ray angle={iAngle} color="#2563EB" label="Incident Ray" />

      {step === 0 && (
        <g>
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            Misconception: Reflected ray pops OUT of the surface
          </text>
          <line x1={CX} y1={MIRROR_Y} x2={CX + 180} y2={MIRROR_Y + 60} stroke="#DC2626" strokeWidth="4" />
          <polygon points={`${CX + 180},${MIRROR_Y + 60} ${CX + 160},${MIRROR_Y + 45} ${CX + 170},${MIRROR_Y + 70}`} fill="#DC2626" />
        </g>
      )}

      {step === 1 && (
        <g>
          <text x={CX} y={60} fill="#DC2626" fontSize="22" fontWeight="800" textAnchor="middle">
            This is incorrect! Light doesn't jump out of the plane. ❌
          </text>
          <line x1={CX} y1={MIRROR_Y} x2={CX + 180} y2={MIRROR_Y + 60} stroke="#DC2626" strokeWidth="7" />
          <polygon points={`${CX + 180},${MIRROR_Y + 60} ${CX + 160},${MIRROR_Y + 45} ${CX + 170},${MIRROR_Y + 70}`} fill="#DC2626" />
          <text x={CX + 190} y={MIRROR_Y + 80} fill="#DC2626" fontSize="18" fontWeight="800">Pops out of page!</text>
        </g>
      )}

      {step === 2 && (
        <g>
          <text x={CX} y={60} fill="#16A34A" fontSize="22" fontWeight="800" textAnchor="middle">
            Correct: Incident ray, Normal, & Reflected ray lie on the SAME plane ✅
          </text>
          <Ray angle={rCorrect} color="#16A34A" label="Reflected Ray" />
        </g>
      )}
    </g>
  );
};

// --- Main Orchestrator ---

const normalizeTag = (tag) => String(tag || "").trim().toLowerCase();

const ReflectionMisconceptionFeedback = ({ misconceptionTag }) => {
  const tag = normalizeTag(misconceptionTag);

  const configByTag = {
    reflection_not_equal: {
      Definition: "First Law of Reflection: The angle of incidence (∠i) is exactly equal to the angle of reflection (∠r).",
      Visualizer: ReflectionNotEqualVisualizer,
      AudioSteps: [
        { progress: 0.45, text: "Wait, look at this. The reflected ray is shooting off at a completely random angle. This is a common misconception." },
        { progress: 0.7, text: "This is incorrect! The angle of incidence and the angle of reflection cannot be different." },
        { progress: 1.0, text: "Remember the first law of reflection: The Angle of Incidence ALWAYS equals the Angle of Reflection." }
      ]
    },
    first_law_reflection_angle: {
      Definition: "First Law of Reflection: The angle of incidence (∠i) is exactly equal to the angle of reflection (∠r).",
      Visualizer: ReflectionNotEqualVisualizer,
      AudioSteps: [
        { progress: 0.45, text: "Wait, look at this. The reflected ray is shooting off at a completely random angle. This is a common misconception." },
        { progress: 0.7, text: "This is incorrect! The angle of incidence and the angle of reflection cannot be different." },
        { progress: 1.0, text: "Remember the first law of reflection: The Angle of Incidence ALWAYS equals the Angle of Reflection." }
      ]
    },
    angle_from_surface: {
      Definition: "Angles are always measured between the Ray and the Normal, NEVER from the mirror surface.",
      Visualizer: AngleFromSurfaceVisualizer,
      AudioSteps: [
        { progress: 0.45, text: "Watch out. Here, the angle is being measured directly from the mirror surface." },
        { progress: 0.7, text: "This is incorrect! You must never measure angles from the physical surface of the mirror." },
        { progress: 1.0, text: "Correct. Angles must always be measured starting from the Normal line." }
      ]
    },
    normal_orientation_wrong: {
      Definition: "The Normal is an imaginary line drawn exactly perpendicular (at 90°) to the mirror surface at the point of incidence.",
      Visualizer: NormalOrientationVisualizer,
      AudioSteps: [
        { progress: 0.45, text: "Look closely at the dotted line. It is drawn at a random, tilted angle. This is a mistake." },
        { progress: 0.7, text: "This is incorrect. The Normal is not just any dashed line you can draw freely." },
        { progress: 1.0, text: "The Normal must be drawn exactly perpendicular, making a ninety degree angle to the mirror surface." }
      ]
    },
    plane_not_same: {
      Definition: "Second Law of Reflection: The incident ray, reflected ray, and the normal all lie in the exact same plane.",
      Visualizer: PlaneNotSameVisualizer,
      AudioSteps: [
        { progress: 0.45, text: "Notice how the reflected ray seems to pop out of the page towards you. This is a very common misconception." },
        { progress: 0.7, text: "This is incorrect! Light doesn't jump out of the plane during normal reflection." },
        { progress: 1.0, text: "Remember the second law: The incident ray, normal, and reflected ray all lie flat on the exact same plane." }
      ]
    },
    second_law_reflection_plane: {
      Definition: "Second Law of Reflection: The incident ray, reflected ray, and the normal all lie in the exact same plane.",
      Visualizer: PlaneNotSameVisualizer,
      AudioSteps: [
        { progress: 0.45, text: "Notice how the reflected ray seems to pop out of the page towards you. This is a very common misconception." },
        { progress: 0.7, text: "This is incorrect! Light doesn't jump out of the plane during normal reflection." },
        { progress: 1.0, text: "Remember the second law: The incident ray, normal, and reflected ray all lie flat on the exact same plane." }
      ]
    },
  };

  const config = configByTag[tag] || configByTag["reflection_not_equal"];
  const Visualizer = config.Visualizer;

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ 
        background: "#ffffff", 
        border: "1px solid #e5e7eb", 
        borderRadius: "16px", 
        overflow: "hidden", 
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
      }}>
        <AudioAnimationPlayer audioSteps={config.AudioSteps} showTryIt={false}>
          {({ progress }) => {
            let step = 0;
            if (progress < 0.45) step = 0;       
            else if (progress < 0.7) step = 1;   
            else step = 2;                       
            
            return (
              <svg
                width="100%"
                height={SVG_H}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                style={{ background: "#F8FAFF", display: "block" }}
              >
                <Visualizer step={step} />
              </svg>
            );
          }}
        </AudioAnimationPlayer>
      </div>

      <div style={{
        marginTop: "12px",
        padding: "16px 20px",
        borderRadius: "12px",
        background: "#F0FDF4",
        border: "1px solid #BBF7D0",
      }}>
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#166534", fontWeight: 700 }}>
          Targeted misconception: <span style={{ color: "#DC2626" }}>{tag}</span>
        </p>
        <p style={{ margin: 0, fontSize: "15px", color: "#14532D", lineHeight: 1.5 }}>
          <strong>NCERT Definition:</strong> {config.Definition}
        </p>
      </div>
    </div>
  );
};

export default ReflectionMisconceptionFeedback;