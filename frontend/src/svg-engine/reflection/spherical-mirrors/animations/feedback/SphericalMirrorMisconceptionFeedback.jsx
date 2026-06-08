import React from "react";
import AnimationPlayer from "../../../../shared/AnimationPlayer";

const SVG_W = 760;
const SVG_H = 400; // Increased height to prevent overlap
const AXIS_Y = 150; // Shifted axis slightly up

const normalizeTag = (value) => String(value || "").trim().toLowerCase();

// Exact NCERT Definitions
const DEFINITIONS = {
  pole_confusion: "Pole (P): The centre of the reflecting surface of a spherical mirror. It lies on the surface of the mirror.",
  center_of_curvature_confusion: "Centre of Curvature (C): The centre of the hollow sphere of glass of which the mirror is a part.",
  radius_focal_relation_wrong: "Relation R = 2f: For spherical mirrors of small apertures, the radius of curvature is found to be equal to twice the focal length.",
  concave_convex_confusion: "Concave mirror: reflecting surface curved inwards. Convex mirror: reflecting surface curved outwards.",
  principal_axis_confusion: "Principal Axis: A straight line passing through the pole and the centre of curvature of a spherical mirror. This line is normal to the mirror at its pole.",
  focus_definition_wrong: "Principal Focus (F): A point on the principal axis where rays parallel to the principal axis meet (concave) or appear to come from (convex) after reflection.",
  general: "Spherical mirror: A mirror whose reflecting surface is a part of a hollow sphere of glass.",
};

// Physically correct geometry mapping
const R = 120;
const concave = { c: { x: 300, y: AXIS_Y }, p: { x: 420, y: AXIS_Y }, f: { x: 360, y: AXIS_Y } };
const convex = { c: { x: 460, y: AXIS_Y }, p: { x: 340, y: AXIS_Y }, f: { x: 400, y: AXIS_Y } };

// SVG Arc generators
const rightHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
const leftHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;
const concaveArc = rightHemisphere(concave.c.x, concave.c.y, R);
const convexArc = leftHemisphere(convex.c.x, convex.c.y, R);

const Axis = () => (
  <g>
    <line x1="40" y1={AXIS_Y} x2="720" y2={AXIS_Y} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6 5" />
    <text x="725" y={AXIS_Y + 4} fontSize="10" fill="#6B7280">Principal axis</text>
  </g>
);

const MarkerDefs = () => (
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#F59E0B" />
    </marker>
    <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#EF4444" />
    </marker>
    <marker id="dimArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#374151" />
    </marker>
  </defs>
);

const FeedbackBox = ({ tag, definition }) => (
  <g>
    {/* Box moved down to y=290 to clear the mirror arcs */}
    <rect x="50" y="290" width="660" height="70" rx="10" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.2" />
    <text x="64" y="316" fontSize="13" fill="#1F2937" fontWeight="700">Targeted misconception:</text>
    <text x="220" y="316" fontSize="13" fill="#B91C1C" fontWeight="700">{tag}</text>
    <text x="64" y="340" fontSize="13" fill="#15803D" fontWeight="700">NCERT Definition: </text>
    <text x="184" y="340" fontSize="12.5" fill="#166534">{definition}</text>
  </g>
);

// --- VISUALIZERS ---

const PoleVisualizer = ({ phase }) => {
  const currentPx = phase === 0 ? concave.c.x : concave.p.x;
  return (
    <g>
      <Axis />
      <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <circle cx={concave.c.x} cy={concave.c.y} r="4" fill="#7C3AED" />
      <text x={concave.c.x - 14} y={concave.c.y + 14} fontSize="12" fill="#7C3AED" fontWeight="700">C</text>
      
      <circle cx={currentPx} cy={AXIS_Y} r="6" fill={phase === 0 ? "#B91C1C" : "#DC2626"} />
      <text x={currentPx + 10} y={AXIS_Y - 10} fontSize="14" fill={phase === 0 ? "#B91C1C" : "#DC2626"} fontWeight="800">P</text>
      
      {phase === 0 && (
        <text x="360" y="30" fontSize="16" fill="#B91C1C" fontWeight="700" textAnchor="middle">
          Wrong: Pole is NOT the center of the sphere!
        </text>
      )}
      {phase > 0 && (
        <text x="360" y="30" fontSize="16" fill="#15803D" fontWeight="700" textAnchor="middle">
          Correct: Pole lies exactly on the mirror surface.
        </text>
      )}
    </g>
  );
};

const CenterOfCurvatureVisualizer = ({ phase }) => {
  return (
    <g>
      <Axis />
      {phase > 0 && (
        <circle cx={concave.c.x} cy={concave.c.y} r={R} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="6 6" />
      )}
      <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <circle cx={concave.p.x} cy={concave.p.y} r="4" fill="#DC2626" />
      <text x={concave.p.x + 8} y={concave.p.y + 12} fontSize="12" fill="#DC2626" fontWeight="700">P</text>
      
      {phase === 0 && (
        <text x="360" y="24" fontSize="16" fill="#B91C1C" fontWeight="700" textAnchor="middle">
          Where is the Centre of Curvature?
        </text>
      )}
      {phase > 0 && (
        <text x="360" y="24" fontSize="16" fill="#15803D" fontWeight="700" textAnchor="middle">
          It is the geometric center of the hollow sphere.
        </text>
      )}
      
      {phase === 2 && (
        <g>
          <circle cx={concave.c.x} cy={concave.c.y} r="6" fill="#7C3AED" />
          <text x={concave.c.x - 14} y={concave.c.y + 18} fontSize="14" fill="#7C3AED" fontWeight="800">C</text>
          <line x1={concave.c.x} y1={concave.c.y} x2={concave.c.x + R * 0.707} y2={concave.c.y - R * 0.707} stroke="#7C3AED" strokeWidth="1.5" markerEnd="url(#dimArrow)" />
          <text x={concave.c.x + 20} y={concave.c.y - 40} fontSize="12" fill="#7C3AED" fontWeight="700">Radius of sphere</text>
        </g>
      )}
    </g>
  );
};

const RadiusFocalVisualizer = ({ phase }) => {
  return (
    <g>
      <Axis />
      <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      
      <circle cx={concave.p.x} cy={concave.p.y} r="4" fill="#DC2626" />
      <circle cx={concave.f.x} cy={concave.f.y} r="4" fill="#16A34A" />
      <circle cx={concave.c.x} cy={concave.c.y} r="4" fill="#7C3AED" />
      
      <text x={concave.p.x + 8} y={concave.p.y - 10} fontSize="12" fill="#DC2626" fontWeight="700">P</text>
      <text x={concave.f.x - 4} y={concave.f.y - 10} fontSize="12" fill="#16A34A" fontWeight="700">F</text>
      <text x={concave.c.x - 4} y={concave.c.y - 10} fontSize="12" fill="#7C3AED" fontWeight="700">C</text>

      {/* Moved text up to y=20 so it avoids mirror */}
      {phase > 1 && (
        <text x="360" y="24" fontSize="20" fill="#15803D" fontWeight="800" textAnchor="middle">R = f + f = 2f</text>
      )}

      {/* Two distinct 'f' segments to show composition of R */}
      {phase > 0 && (
        <g>
          {/* Segment 1: P to F */}
          <line x1={concave.f.x} y1="185" x2={concave.p.x} y2="185" stroke="#16A34A" strokeWidth="2" markerStart="url(#dimArrow)" markerEnd="url(#dimArrow)" />
          <text x={(concave.f.x + concave.p.x)/2} y="179" fontSize="13" fill="#16A34A" fontWeight="700" textAnchor="middle">f</text>
          
          {/* Segment 2: F to C */}
          <line x1={concave.c.x} y1="185" x2={concave.f.x} y2="185" stroke="#16A34A" strokeWidth="2" markerStart="url(#dimArrow)" markerEnd="url(#dimArrow)" />
          <text x={(concave.c.x + concave.f.x)/2} y="179" fontSize="13" fill="#16A34A" fontWeight="700" textAnchor="middle">f</text>
        </g>
      )}
      
      {phase > 1 && (
        <g>
          {/* Full R dimension */}
          <line x1={concave.c.x} y1="210" x2={concave.p.x} y2="210" stroke="#7C3AED" strokeWidth="2" markerStart="url(#dimArrow)" markerEnd="url(#dimArrow)" />
          <text x={(concave.c.x + concave.p.x)/2} y="226" fontSize="14" fill="#7C3AED" fontWeight="700" textAnchor="middle">R</text>
        </g>
      )}
    </g>
  );
};

const ConcaveConvexVisualizer = ({ phase }) => {
  const hitY1 = AXIS_Y - 50;
  const hitY2 = AXIS_Y + 50;
  const hitDx = Math.sqrt(R*R - 50*50); // approx 109
  
  if (phase === 0) {
    // Phase 1: Centered Concave
    const C = { x: 260, y: AXIS_Y };
    const F = { x: 320, y: AXIS_Y };
    const hitX = C.x + hitDx;

    return (
      <g>
        <Axis />
        <text x="380" y="30" fontSize="18" fill="#2563EB" fontWeight="800" textAnchor="middle">Concave Mirror: Reflects INWARDS</text>
        <path d={rightHemisphere(C.x, C.y, R)} fill="none" stroke="#2563EB" strokeWidth="6" />
        <circle cx={F.x} cy={F.y} r="4" fill="#16A34A" />
        <text x={F.x - 4} y={F.y + 16} fontSize="12" fill="#16A34A" fontWeight="700">F</text>
        
        {/* Incident Rays */}
        <line x1="40" y1={hitY1} x2={hitX} y2={hitY1} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <line x1="40" y1={hitY2} x2={hitX} y2={hitY2} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
        
        {/* Reflected Rays */}
        <line x1={hitX} y1={hitY1} x2={F.x} y2={F.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
        <line x1={hitX} y1={hitY2} x2={F.x} y2={F.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
      </g>
    );
  }

  if (phase === 1) {
    // Phase 2: Centered Convex
    const C = { x: 500, y: AXIS_Y };
    const F = { x: 440, y: AXIS_Y };
    const hitX = C.x - hitDx;

    return (
      <g>
        <Axis />
        <text x="380" y="30" fontSize="18" fill="#16A34A" fontWeight="800" textAnchor="middle">Convex Mirror: Reflects OUTWARDS</text>
        <path d={leftHemisphere(C.x, C.y, R)} fill="none" stroke="#16A34A" strokeWidth="6" />
        <circle cx={F.x} cy={F.y} r="4" fill="#16A34A" />
        <text x={F.x - 4} y={F.y + 16} fontSize="12" fill="#16A34A" fontWeight="700">Virtual F</text>
        
        {/* Incident Rays */}
        <line x1="40" y1={hitY1} x2={hitX} y2={hitY1} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <line x1="40" y1={hitY2} x2={hitX} y2={hitY2} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
        
        {/* Reflected Diverging Rays */}
        <line x1={hitX} y1={hitY1} x2={hitX - 60} y2={hitY1 - 50} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
        <line x1={hitX} y1={hitY2} x2={hitX - 60} y2={hitY2 + 50} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
        
        {/* Virtual Rays to F */}
        <line x1={hitX} y1={hitY1} x2={F.x} y2={F.y} stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5" />
        <line x1={hitX} y1={hitY2} x2={F.x} y2={F.y} stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5" />
      </g>
    );
  }

  // Phase 3: Side-by-Side
  const ccC = { x: 180, y: AXIS_Y };
  const ccF = { x: 240, y: AXIS_Y };
  const ccHitX = ccC.x + hitDx;

  const cvC = { x: 580, y: AXIS_Y };
  const cvF = { x: 520, y: AXIS_Y };
  const cvHitX = cvC.x - hitDx;

  return (
    <g>
      <Axis />
      <text x="240" y="30" fontSize="16" fill="#2563EB" fontWeight="700" textAnchor="middle">Concave: Converges</text>
      <text x="520" y="30" fontSize="16" fill="#16A34A" fontWeight="700" textAnchor="middle">Convex: Diverges</text>

      {/* Concave System */}
      <path d={rightHemisphere(ccC.x, ccC.y, R)} fill="none" stroke="#2563EB" strokeWidth="6" />
      <circle cx={ccF.x} cy={ccF.y} r="4" fill="#16A34A" />
      <text x={ccF.x - 4} y={ccF.y + 16} fontSize="12" fill="#16A34A" fontWeight="700">F</text>
      
      {/* Convex System */}
      <path d={leftHemisphere(cvC.x, cvC.y, R)} fill="none" stroke="#16A34A" strokeWidth="6" />
      <circle cx={cvF.x} cy={cvF.y} r="4" fill="#16A34A" />
      <text x={cvF.x - 4} y={cvF.y + 16} fontSize="12" fill="#16A34A" fontWeight="700">F</text>

      {/* Concave Rays */}
      <line x1="40" y1={hitY1} x2={ccHitX} y2={hitY1} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1="40" y1={hitY2} x2={ccHitX} y2={hitY2} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1={ccHitX} y1={hitY1} x2={ccF.x} y2={ccF.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
      <line x1={ccHitX} y1={hitY2} x2={ccF.x} y2={ccF.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
      
      {/* Convex Rays */}
      <line x1="330" y1={hitY1} x2={cvHitX} y2={hitY1} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1="330" y1={hitY2} x2={cvHitX} y2={hitY2} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1={cvHitX} y1={hitY1} x2={cvHitX - 40} y2={hitY1 - 33} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
      <line x1={cvHitX} y1={hitY2} x2={cvHitX - 40} y2={hitY2 + 33} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
      <line x1={cvHitX} y1={hitY1} x2={cvF.x} y2={cvF.y} stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5" />
      <line x1={cvHitX} y1={hitY2} x2={cvF.x} y2={cvF.y} stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5" />
    </g>
  );
};

const PrincipalAxisVisualizer = ({ phase }) => {
  return (
    <g>
      {/* Background Mirror */}
      <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <circle cx={concave.p.x} cy={concave.p.y} r="4" fill="#DC2626" />
      <circle cx={concave.c.x} cy={concave.c.y} r="4" fill="#7C3AED" />
      <text x={concave.p.x + 8} y={concave.p.y - 10} fontSize="14" fill="#DC2626" fontWeight="800">P</text>
      <text x={concave.c.x - 14} y={concave.c.y - 10} fontSize="14" fill="#7C3AED" fontWeight="800">C</text>

      {phase === 0 && (
        <g>
          {/* Wrong axis passing randomly */}
          <line x1="40" y1={AXIS_Y - 40} x2="720" y2={AXIS_Y + 20} stroke="#EF4444" strokeWidth="3" strokeDasharray="8 4" />
          <text x="360" y="30" fontSize="18" fill="#B91C1C" fontWeight="800" textAnchor="middle">
            Wrong: The Principal Axis is NOT just any line!
          </text>
        </g>
      )}
      
      {phase > 0 && (
        <g>
          {/* Correct axis passing through P and C */}
          <Axis />
          <line x1="40" y1={AXIS_Y} x2="720" y2={AXIS_Y} stroke="#15803D" strokeWidth="3" />
          <text x="360" y="30" fontSize="18" fill="#15803D" fontWeight="800" textAnchor="middle">
            Correct: It MUST pass straight through Pole (P) & Centre of Curvature (C).
          </text>
        </g>
      )}

      {phase === 2 && (
        <text x="360" y="60" fontSize="14" fill="#15803D" fontWeight="700" textAnchor="middle">
          (This line is normal to the mirror at its pole)
        </text>
      )}
    </g>
  );
};

const FocusDefinitionVisualizer = ({ phase }) => {
  const hitY1 = AXIS_Y - 60;
  const hitY2 = AXIS_Y + 60;
  const hitDx = Math.sqrt(R*R - 60*60); 
  const hitX = concave.c.x + hitDx;

  return (
    <g>
      <Axis />
      <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <circle cx={concave.f.x} cy={concave.f.y} r="4" fill="#16A34A" />
      <text x={concave.f.x - 4} y={concave.f.y + 16} fontSize="14" fill="#16A34A" fontWeight="800">F</text>
      
      {/* Incident Parallel Rays */}
      <line x1="40" y1={hitY1} x2={hitX} y2={hitY1} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1="40" y1={hitY2} x2={hitX} y2={hitY2} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrow)" />
      
      {phase === 0 && (
        <g>
          {/* Wrong reflection missing F */}
          <line x1={hitX} y1={hitY1} x2={hitX - 100} y2={hitY1 + 20} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
          <line x1={hitX} y1={hitY2} x2={hitX - 100} y2={hitY2 - 20} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
          <text x="360" y="30" fontSize="18" fill="#B91C1C" fontWeight="800" textAnchor="middle">
            Wrong: Parallel rays don't reflect randomly!
          </text>
        </g>
      )}

      {phase > 0 && (
        <g>
          {/* Correct reflection perfectly through F */}
          <line x1={hitX} y1={hitY1} x2={concave.f.x} y2={concave.f.y} stroke="#15803D" strokeWidth="3" markerEnd="url(#arrow)" />
          <line x1={hitX} y1={hitY2} x2={concave.f.x} y2={concave.f.y} stroke="#15803D" strokeWidth="3" markerEnd="url(#arrow)" />
          {/* Extend rays past F to show intersection */}
          <line x1={concave.f.x} y1={concave.f.y} x2={concave.f.x - (hitX - concave.f.x)} y2={concave.f.y - (hitY1 - concave.f.y)} stroke="#15803D" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={concave.f.x} y1={concave.f.y} x2={concave.f.x - (hitX - concave.f.x)} y2={concave.f.y - (hitY2 - concave.f.y)} stroke="#15803D" strokeWidth="2" strokeDasharray="4 4" />
          
          <text x="360" y="30" fontSize="18" fill="#15803D" fontWeight="800" textAnchor="middle">
            Correct: Rays parallel to the axis ALWAYS meet at Principal Focus (F).
          </text>
        </g>
      )}
      
      {phase === 2 && (
        <circle cx={concave.f.x} cy={concave.f.y} r="15" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="4 4">
          <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};

const DefaultVisualizer = ({ phase }) => (
  <g>
    <Axis />
    <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" />
    <circle cx={concave.p.x} cy={concave.p.y} r="4" fill="#DC2626" />
    <circle cx={concave.f.x} cy={concave.f.y} r="4" fill="#16A34A" />
    <circle cx={concave.c.x} cy={concave.c.y} r="4" fill="#7C3AED" />
    <text x={concave.p.x + 8} y={concave.p.y - 10} fontSize="12" fill="#DC2626" fontWeight="700">P</text>
    <text x={concave.f.x - 4} y={concave.f.y - 10} fontSize="12" fill="#16A34A" fontWeight="700">F</text>
    <text x={concave.c.x - 4} y={concave.c.y - 10} fontSize="12" fill="#7C3AED" fontWeight="700">C</text>
    <text x="360" y="60" fontSize="14" fill="#15803D" fontWeight="700" textAnchor="middle">
      Review standard mapping: P (surface), F (midpoint), C (center).
    </text>
  </g>
);

const SphericalMirrorMisconceptionFeedback = ({ misconceptionTag }) => {
  const tag = normalizeTag(misconceptionTag);
  
  let ActiveVisualizer = DefaultVisualizer;
  let activeDefinition = DEFINITIONS.general;
  
  if (tag === "pole_confusion") {
    ActiveVisualizer = PoleVisualizer;
    activeDefinition = DEFINITIONS.pole_confusion;
  } else if (tag === "center_of_curvature_confusion") {
    ActiveVisualizer = CenterOfCurvatureVisualizer;
    activeDefinition = DEFINITIONS.center_of_curvature_confusion;
  } else if (tag === "radius_focal_relation_wrong") {
    ActiveVisualizer = RadiusFocalVisualizer;
    activeDefinition = DEFINITIONS.radius_focal_relation_wrong;
  } else if (tag === "concave_convex_confusion") {
    ActiveVisualizer = ConcaveConvexVisualizer;
    activeDefinition = DEFINITIONS.concave_convex_confusion;
  } else if (tag === "principal_axis_confusion") {
    ActiveVisualizer = PrincipalAxisVisualizer;
    activeDefinition = DEFINITIONS.principal_axis_confusion;
  } else if (tag === "focus_definition_wrong") {
    ActiveVisualizer = FocusDefinitionVisualizer;
    activeDefinition = DEFINITIONS.focus_definition_wrong;
  }

  // Passing showTryIt={false} so the try it yourself button is hidden
  return (
    <AnimationPlayer duration={9000} title="Spherical mirror visual correction" showTryIt={false}>
      {({ progress }) => {
        const phase = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

        return (
          <svg width="100%" height="400" viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <rect width="100%" height="100%" fill="#F8FBFF" rx="12" />
            <MarkerDefs />
            
            <ActiveVisualizer phase={phase} />
            
            <FeedbackBox 
              tag={tag || "general_concept_gap"} 
              definition={activeDefinition}
            />
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default SphericalMirrorMisconceptionFeedback;
