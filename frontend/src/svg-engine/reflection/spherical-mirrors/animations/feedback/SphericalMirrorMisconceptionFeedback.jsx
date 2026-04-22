import React from "react";
import AnimationPlayer from "../../../../shared/AnimationPlayer";
import { clamp, lerp } from "../../../../shared/PhysicsEngine";

const SVG_W = 760;
const SVG_H = 360;
const AXIS_Y = 220;

const normalizeTag = (value) => String(value || "").trim().toLowerCase();

const TAG_META = {
  concave_convex_confusion: {
    title: "Concave vs Convex",
    wrong: "Mixed up reflecting surfaces",
    fix: "Concave curves IN (cave), Convex bulges OUT.",
  },
  pole_confusion: {
    title: "Pole (P)",
    wrong: "Wrong: P is at the center of sphere",
    fix: "Pole is the midpoint of the MIRROR surface itself.",
  },
  center_of_curvature_confusion: {
    title: "Center of Curvature (C)",
    wrong: "Wrong: C is on the mirror",
    fix: "C is the center of the hollow sphere the mirror came from.",
  },
  principal_axis_confusion: {
    title: "Principal Axis",
    wrong: "Wrong: Any horizontal line",
    fix: "The axis MUST pass through both Pole (P) and Center (C).",
  },
  focus_definition_wrong: {
    title: "Principal Focus (F)",
    wrong: "Wrong position for F",
    fix: "F is exactly halfway between P and C.",
  },
  focus_convex_confusion: {
    title: "Convex Focus",
    wrong: "Virtual focus treated as real",
    fix: "For convex, rays diverge; only their extensions meet at F.",
  },
  sign_convention_confusion: {
    title: "Sign Convention",
    wrong: "Incorrect +/- directions",
    fix: "Direction of incident light is positive (+).",
  },
  left_right_sign_error: {
    title: "Left/Right Sign Error",
    wrong: "Swapped positive/negative direction",
    fix: "Distances measured in light direction are positive.",
  },
  parallel_ray_rule_wrong: {
    title: "Parallel Ray Rule",
    wrong: "Incorrect reflection path",
    fix: "A parallel ray must reflect through the Principal Focus (F).",
  },
  focus_ray_rule_wrong: {
    title: "Focus Ray Rule",
    wrong: "Incorrect reflected path",
    fix: "A ray through F reflects parallel to the Principal Axis.",
  },
  center_ray_rule_wrong: {
    title: "Center Ray Rule",
    wrong: "Ray didn't retrace path",
    fix: "A ray through Center (C) reflects back along the same path.",
  },
  radius_focal_relation_wrong: {
    title: "R and f Relation",
    wrong: "Confused R = f or random",
    fix: "The radius (PC) is always double the focal length (PF). R = 2f",
  },
};

const Ray = ({ x1, y1, x2, y2, color, id }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" markerEnd={`url(#arrow-${id})`} />
);

const renderFeedbackContent = (tag, progress) => {
  const t = progress;

  switch (tag) {
    case "concave_convex_confusion":
      return (
        <g>
          <path d="M 240 120 A 100 100 0 0 1 240 320" fill="none" stroke="#2563EB" strokeWidth="5" />
          <text x="180" y="110" fontSize="14" fontWeight="bold" fill="#2563EB">CONCAVE (Inward)</text>
          <line x1="60" y1={AXIS_Y - 40} x2={lerp(60, 220, 205, AXIS_Y - 40, t).x} y2={AXIS_Y - 40} stroke="#F59E0B" strokeWidth="2" />
          {t > 0.6 && <line x1="205" y1={AXIS_Y - 40} x2={lerp(205, AXIS_Y - 40, 150, AXIS_Y, (t - 0.6) * 2.5).x} y2={lerp(205, AXIS_Y - 40, 150, AXIS_Y, (t - 0.6) * 2.5).y} stroke="#EF4444" strokeWidth="2" />}

          <path d="M 520 120 A 100 100 0 0 0 520 320" fill="none" stroke="#16A34A" strokeWidth="5" />
          <text x="500" y="110" fontSize="14" fontWeight="bold" fill="#16A34A">CONVEX (Outward)</text>
          <line x1="380" y1={AXIS_Y - 40} x2={lerp(380, AXIS_Y - 40, 420, AXIS_Y - 40, t).x} y2={AXIS_Y - 40} stroke="#F59E0B" strokeWidth="2" />
          {t > 0.6 && <line x1="420" y1={AXIS_Y - 40} x2={lerp(420, AXIS_Y - 40, 360, AXIS_Y - 80, (t - 0.6) * 2.5).x} y2={lerp(420, AXIS_Y - 40, 360, AXIS_Y - 80, (t - 0.6) * 2.5).y} stroke="#EF4444" strokeWidth="2" />}
        </g>
      );

    case "pole_confusion":
      const pCorrect = { x: 500, y: AXIS_Y };
      const pWrong = { x: 300, y: AXIS_Y }; 
      const pPos = t < 0.4 ? pWrong : lerp(pWrong.x, pWrong.y, pCorrect.x, pCorrect.y, (t - 0.4) * 2);
      return (
        <g>
          <path d="M 500 120 A 100 100 0 0 0 500 320" fill="none" stroke="#64748B" strokeWidth="3" strokeDasharray="4" />
          <path d="M 500 150 A 70 70 0 0 0 500 290" fill="none" stroke="#2563EB" strokeWidth="6" />
          <circle cx={pPos.x} cy={pPos.y} r="8" fill={t < 0.5 ? "#EF4444" : "#16A34A"} />
          <text x={pPos.x} y={pPos.y - 15} textAnchor="middle" fontSize="14" fontWeight="bold" fill={t < 0.5 ? "#EF4444" : "#16A34A"}>P</text>
        </g>
      );

    case "principal_axis_confusion":
      return (
        <g>
          <path d="M 550 120 A 150 150 0 0 0 550 320" fill="none" stroke="#2563EB" strokeWidth="4" />
          <circle cx="550" cy={AXIS_Y} r="5" fill="#334155" /> <text x="555" y={AXIS_Y - 10} fontSize="12">P</text>
          <circle cx="250" cy={AXIS_Y} r="5" fill="#7C3AED" /> <text x="245" y={AXIS_Y - 15} fontSize="12" fill="#7C3AED">C</text>
          <line x1="50" y1={AXIS_Y} x2="700" y2={AXIS_Y} stroke="#1D4ED8" strokeWidth="3" opacity={t} strokeDasharray={t < 0.8 ? "8 4" : "0"} />
          {t > 0.7 && <text x="100" y={AXIS_Y - 15} fontSize="14" fontWeight="bold" fill="#1D4ED8">The Principal Axis</text>}
        </g>
      );

    case "focus_definition_wrong":
      return (
        <g>
          <path d="M 550 120 A 150 150 0 0 0 550 320" fill="none" stroke="#2563EB" strokeWidth="4" />
          <circle cx="550" cy={AXIS_Y} r="5" fill="#334155" /> <text x="555" y={AXIS_Y - 10} fontSize="12">P</text>
          <circle cx="250" cy={AXIS_Y} r="5" fill="#7C3AED" /> <text x="245" y={AXIS_Y - 15} fontSize="12" fill="#7C3AED">C</text>
          <circle cx={lerp(550, AXIS_Y, 400, AXIS_Y, t).x} cy={AXIS_Y} r="7" fill="#16A34A" />
          <text x="400" y={AXIS_Y + 25} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#16A34A">F (Midpoint)</text>
        </g>
      );

    case "focus_convex_confusion":
      return (
        <g>
          <path d="M 300 120 A 100 100 0 0 1 300 320" fill="none" stroke="#16A34A" strokeWidth="5" />
          <line x1="50" y1={AXIS_Y - 50} x2={lerp(50, AXIS_Y - 50, 275, AXIS_Y - 50, t).x} y2={AXIS_Y - 50} stroke="#F59E0B" strokeWidth="2" />
          {t > 0.6 && (
            <g>
              <line x1="275" y1={AXIS_Y - 50} x2={350} y2={AXIS_Y - 100} stroke="#EF4444" strokeWidth="2" />
              <line x1="275" y1={AXIS_Y - 50} x2={400} y2={AXIS_Y} stroke="#94A3B8" strokeWidth="2" strokeDasharray="4,4" />
              <circle cx="400" cy={AXIS_Y} r="5" fill="#16A34A" />
              <text x="410" y={AXIS_Y + 20} fontSize="12" fill="#16A34A">Virtual Focus (F)</text>
            </g>
          )}
        </g>
      );

    case "sign_convention_confusion":
      return (
        <g>
          <path d="M 380 120 A 100 100 0 0 1 380 320" fill="none" stroke="#2563EB" strokeWidth="4" />
          <circle cx="380" cy={AXIS_Y} r="5" fill="#334155" />
          <Ray x1={380} y1={AXIS_Y} x2={380 + (t * 150)} y2={AXIS_Y} color="#16A34A" id="pos" />
          <Ray x1={380} y1={AXIS_Y} x2={380 - (t * 150)} y2={AXIS_Y} color="#DC2626" id="neg" />
          <text x={380 + 100} y={AXIS_Y - 20} fill="#16A34A" fontWeight="bold">Positive (+)</text>
          <text x={380 - 100} y={AXIS_Y - 20} fill="#DC2626" fontWeight="bold">Negative (-)</text>
        </g>
      );

    case "center_of_curvature_confusion":
      return (
        <g>
          <circle cx="300" cy={AXIS_Y} r="100" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="5,5" />
          <path d="M 400 150 A 100 100 0 0 1 400 290" fill="none" stroke="#2563EB" strokeWidth="6" />
          <circle cx="300" cy={AXIS_Y} r="6" fill="#7C3AED" />
          <text x="290" y={AXIS_Y - 15} fontSize="14" fontWeight="bold" fill="#7C3AED">C</text>
          <line x1="300" y1={AXIS_Y} x2="400" y2={AXIS_Y} stroke="#7C3AED" strokeWidth="2" strokeDasharray="4,4" opacity={t} />
          <text x="350" y={AXIS_Y + 20} textAnchor="middle" fontSize="12" fill="#7C3AED" opacity={t}>Radius (R)</text>
        </g>
      );

    case "radius_focal_relation_wrong":
      return (
        <g>
          <path d="M 550 120 A 150 150 0 0 0 550 320" fill="none" stroke="#2563EB" strokeWidth="4" />
          <circle cx="550" cy={AXIS_Y} r="4" fill="#334155" /> <text x="555" y={AXIS_Y - 10} fontSize="12">P</text>
          <circle cx="400" cy={AXIS_Y} r="5" fill="#16A34A" /> <text x="395" y={AXIS_Y - 15} fontSize="12" fontWeight="bold" fill="#16A34A">F</text>
          <circle cx="250" cy={AXIS_Y} r="5" fill="#7C3AED" /> <text x="245" y={AXIS_Y - 15} fontSize="12" fontWeight="bold" fill="#7C3AED">C</text>
          
          {/* Brackets */}
          <path d={`M 400 ${AXIS_Y + 20} L 400 ${AXIS_Y + 30} L 550 ${AXIS_Y + 30} L 550 ${AXIS_Y + 20}`} fill="none" stroke="#16A34A" strokeWidth="2" />
          <text x="475" y={AXIS_Y + 45} textAnchor="middle" fontSize="14" fill="#16A34A" fontWeight="bold">f</text>
          
          {t > 0.5 && (
            <g opacity={(t - 0.5) * 2}>
              <path d={`M 250 ${AXIS_Y + 50} L 250 ${AXIS_Y + 60} L 550 ${AXIS_Y + 60} L 550 ${AXIS_Y + 50}`} fill="none" stroke="#7C3AED" strokeWidth="2" />
              <text x="400" y={AXIS_Y + 75} textAnchor="middle" fontSize="14" fill="#7C3AED" fontWeight="bold">R = 2f</text>
            </g>
          )}
        </g>
      );

    case "parallel_ray_rule_wrong":
      return (
        <g>
          <path d="M 550 120 A 150 150 0 0 0 550 320" fill="none" stroke="#2563EB" strokeWidth="5" />
          <circle cx="400" cy={AXIS_Y} r="4" fill="#16A34A" /> <text x="395" y={AXIS_Y + 20} fontSize="12">F</text>
          <line x1="50" y1={AXIS_Y - 60} x2={lerp(50, AXIS_Y - 60, 420, AXIS_Y - 60, t).x} y2={AXIS_Y - 60} stroke="#F59E0B" strokeWidth="2.5" />
          {t > 0.6 && <line x1="420" y1={AXIS_Y - 60} x2={lerp(420, AXIS_Y - 60, 400, AXIS_Y, (t-0.6)*2.5).x} y2={lerp(420, AXIS_Y - 60, 400, AXIS_Y, (t-0.6)*2.5).y} stroke="#EF4444" strokeWidth="2.5" />}
        </g>
      );

    case "center_ray_rule_wrong":
      return (
        <g>
          <path d="M 550 120 A 150 150 0 0 0 550 320" fill="none" stroke="#2563EB" strokeWidth="5" />
          <circle cx="250" cy={AXIS_Y} r="4" fill="#7C3AED" /> <text x="245" y={AXIS_Y + 20} fontSize="12">C</text>
          <line x1="250" y1={AXIS_Y} x2={lerp(250, AXIS_Y, 550, AXIS_Y, t).x} y2={AXIS_Y} stroke="#F59E0B" strokeWidth="3" />
          {t > 0.8 && <line x1="550" y1={AXIS_Y} x2={lerp(550, AXIS_Y, 250, AXIS_Y, (t-0.8)*5).x} y2={AXIS_Y} stroke="#EF4444" strokeWidth="3" />}
        </g>
      );

    case "focus_ray_rule_wrong":
      return (
        <g>
          <path d="M 550 120 A 150 150 0 0 0 550 320" fill="none" stroke="#2563EB" strokeWidth="5" />
          <circle cx="400" cy={AXIS_Y} r="4" fill="#16A34A" /> <text x="395" y={AXIS_Y + 20} fontSize="12">F</text>
          <line x1="300" y1={AXIS_Y + 60} x2={lerp(300, AXIS_Y + 60, 420, AXIS_Y - 60, t).x} y2={lerp(300, AXIS_Y + 60, 420, AXIS_Y - 60, t).y} stroke="#F59E0B" strokeWidth="2.5" />
          {t > 0.6 && <line x1="420" y1={AXIS_Y - 60} x2={lerp(420, AXIS_Y - 60, 50, AXIS_Y - 60, (t-0.6)*2.5).x} y2={AXIS_Y - 60} stroke="#EF4444" strokeWidth="2.5" />}
        </g>
      );

    default:
      return (
        <g>
          <path d="M 520 120 A 110 110 0 0 1 520 340" fill="none" stroke="#2563EB" strokeWidth="6" opacity="0.4" />
          <line x1="140" y1="150" x2="520" y2={AXIS_Y} stroke="#F59E0B" strokeWidth="2.8" />
          <line x1="520" y1={AXIS_Y} x2={lerp(520, AXIS_Y, 400, AXIS_Y, t).x} y2={AXIS_Y} stroke="#EF4444" strokeWidth="3" />
          <circle cx="400" cy={AXIS_Y} r="6" fill="#16A34A" />
          <text x="400" y={AXIS_Y + 25} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#16A34A">Correct Path</text>
        </g>
      );
  }
};

const SphericalMirrorMisconceptionFeedback = ({ misconceptionTag, explanation }) => {
  const tag = normalizeTag(misconceptionTag);
  const meta = TAG_META[tag] || {
    title: "Spherical Mirror Concept",
    wrong: "Wrong conceptual mapping",
    fix: "Review the diagram with P, F, and C.",
  };

  return (
    <AnimationPlayer duration={6000} title="Visual Correction: Spherical Mirrors">
      {({ progress }) => {
        const isFixPhase = progress > 0.5;

        return (
          <svg width="100%" height="340" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ background: "#F8FAFF", borderRadius: "12px" }}>
            <rect width="100%" height="100%" fill="#F8FAFF" />

            <defs>
              <marker id="arrow-pos" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0,0 L0,10 L10,5 z" fill="#16A34A" />
              </marker>
              <marker id="arrow-neg" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0,0 L0,10 L10,5 z" fill="#DC2626" />
              </marker>
              <marker id="arrow-ray" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0,0 L0,10 L10,5 z" fill="#EF4444" />
              </marker>
            </defs>

            <line x1="40" y1={AXIS_Y} x2="720" y2={AXIS_Y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 4" />

            <text x={SVG_W / 2} y="40" textAnchor="middle" fontSize="20" fontWeight="800" fill="#1E293B">
              {meta.title}
            </text>

            <g transform="translate(0, 10)">
              {renderFeedbackContent(tag, progress)}
            </g>

            {/* Status Card */}
            <rect x="180" y="55" width="400" height="30" rx="15" fill={isFixPhase ? "#DCFCE7" : "#FEE2E2"} />
            <text x={SVG_W / 2} y="75" textAnchor="middle" fontSize="14" fontWeight="bold" fill={isFixPhase ? "#166534" : "#991B1B"}>
              {isFixPhase ? `CORRECTION: ${meta.fix}` : `MISCONCEPTION: ${meta.wrong}`}
            </text>

            {/* Explanation box at bottom */}
            <foreignObject x="50" y="295" width="660" height="60">
              <div style={{ 
                fontFamily: "Arial", 
                fontSize: "12px", 
                color: "#475569", 
                textAlign: "center",
                padding: "8px",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "8px",
                border: "1px solid #E2E8F0"
              }}>
                <b>Explanation:</b> {explanation || "Focus on the relationship between points P, F, and C."}
              </div>
            </foreignObject>
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default SphericalMirrorMisconceptionFeedback;
