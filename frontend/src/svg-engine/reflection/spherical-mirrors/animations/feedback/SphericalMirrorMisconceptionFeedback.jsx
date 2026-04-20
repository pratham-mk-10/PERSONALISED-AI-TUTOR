import React from "react";
import AnimationPlayer from "../../../../shared/AnimationPlayer";

const SVG_W = 760;
const SVG_H = 360;
const AXIS_Y = 230;

const normalizeTag = (value) => String(value || "").trim().toLowerCase();

const TAG_META = {
  concave_convex_confusion: {
    title: "Concave vs Convex",
    wrong: "Wrong: mirror type mixed up",
    fix: "Concave curves inward, convex bulges outward.",
  },
  pole_confusion: {
    title: "Pole (P)",
    wrong: "Wrong: P is not center of curvature",
    fix: "Pole is midpoint of mirror surface.",
  },
  center_of_curvature_confusion: {
    title: "Center of Curvature (C)",
    wrong: "Wrong: C on mirror surface",
    fix: "C is center of parent sphere on principal axis.",
  },
  principal_axis_confusion: {
    title: "Principal Axis",
    wrong: "Wrong: random reference line",
    fix: "Axis passes through P and C.",
  },
  focus_definition_wrong: {
    title: "Principal Focus (F)",
    wrong: "Wrong: focus position misconception",
    fix: "Parallel rays converge at F (concave) or appear from F (convex).",
  },
  focus_convex_confusion: {
    title: "Convex Focus",
    wrong: "Wrong: convex focus treated as real",
    fix: "Convex focus is virtual and behind mirror.",
  },
  radius_focal_relation_wrong: {
    title: "R and f Relation",
    wrong: "Wrong: relation used incorrectly",
    fix: "For spherical mirrors, R = 2f.",
  },
  sign_convention_confusion: {
    title: "Sign Convention",
    wrong: "Wrong: sign taken by intuition",
    fix: "Follow NCERT sign convention consistently from pole.",
  },
  left_right_sign_error: {
    title: "Direction and Sign",
    wrong: "Wrong: left/right sign swapped",
    fix: "Keep one fixed direction reference for all distances.",
  },
  parallel_ray_rule_wrong: {
    title: "Parallel Ray Rule",
    wrong: "Wrong reflection rule applied",
    fix: "Parallel ray reflects through focus (concave).",
  },
  focus_ray_rule_wrong: {
    title: "Focus Ray Rule",
    wrong: "Wrong reflected path",
    fix: "Ray through focus reflects parallel to axis.",
  },
  center_ray_rule_wrong: {
    title: "Center Ray Rule",
    wrong: "Wrong retracing behavior",
    fix: "Ray through C retraces its path in concave mirror.",
  },
  random_reflection: {
    title: "Reflection Law",
    wrong: "Wrong: random reflected ray",
    fix: "Use i = r with respect to normal.",
  },
  image_position_confusion: {
    title: "Image Position",
    wrong: "Wrong object-image location mapping",
    fix: "Use object position relative to F and C.",
  },
  real_virtual_confusion: {
    title: "Real vs Virtual",
    wrong: "Wrong image type",
    fix: "Real image forms by actual intersection; virtual by apparent intersection.",
  },
  image_size_confusion: {
    title: "Image Size",
    wrong: "Wrong size expectation",
    fix: "Image size depends on mirror type and object position.",
  },
  inverted_erect_confusion: {
    title: "Orientation",
    wrong: "Wrong orientation claim",
    fix: "Concave can invert; convex image is always erect.",
  },
  focus_infinity_confusion: {
    title: "Special Case",
    wrong: "Wrong behavior at focus",
    fix: "Object at F (concave) gives image at infinity.",
  },
  beyond_c_confusion: {
    title: "Object Beyond C",
    wrong: "Wrong image location",
    fix: "Beyond C gives image between C and F (concave).",
  },
  convex_real_image_myth: {
    title: "Convex Image Type",
    wrong: "Wrong: convex gives real image",
    fix: "Convex mirror gives only virtual, erect, diminished image.",
  },
  convex_size_confusion: {
    title: "Convex Size",
    wrong: "Wrong: convex magnifies",
    fix: "Convex image is always diminished.",
  },
  rearview_reason_wrong: {
    title: "Rear-view Mirror",
    wrong: "Wrong reason for convex use",
    fix: "Convex gives wide field of view with erect diminished image.",
  },
};

const drawConcave = () => (
  <path d="M 520 120 A 110 110 0 0 1 520 340" fill="none" stroke="#2563EB" strokeWidth="6" />
);

const drawConvex = () => (
  <path d="M 240 120 A 110 110 0 0 0 240 340" fill="none" stroke="#16A34A" strokeWidth="6" />
);

const SphericalMirrorMisconceptionFeedback = ({ misconceptionTag, explanation }) => {
  const tag = normalizeTag(misconceptionTag);
  const meta = TAG_META[tag] || {
    title: "Spherical Mirror Concept",
    wrong: "Wrong conceptual mapping",
    fix: "Re-check the mirror diagram with P, F, C and reflection rules.",
  };

  return (
    <AnimationPlayer duration={9000} title="Spherical mirror visual correction">
      {({ progress }) => {
        const phase = progress < 0.4 ? 0 : progress < 0.75 ? 1 : 2;

        return (
          <svg width="100%" height="340" viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <rect width="100%" height="100%" fill="#F8FBFF" rx="12" />

            <line x1="60" y1={AXIS_Y} x2="700" y2={AXIS_Y} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6 5" />
            <text x="705" y={AXIS_Y + 4} fontSize="10" fill="#6B7280">Principal axis</text>

            {drawConcave()}
            {drawConvex()}

            <circle cx="520" cy={AXIS_Y} r="4" fill="#DC2626" />
            <text x="508" y={AXIS_Y - 10} fontSize="12" fill="#DC2626" fontWeight="700">P</text>
            <circle cx="460" cy={AXIS_Y} r="4" fill="#16A34A" />
            <text x="452" y={AXIS_Y - 10} fontSize="12" fill="#16A34A" fontWeight="700">F</text>
            <circle cx="410" cy={AXIS_Y} r="4" fill="#7C3AED" />
            <text x="402" y={AXIS_Y - 10} fontSize="12" fill="#7C3AED" fontWeight="700">C</text>

            <line x1="140" y1="150" x2="520" y2={AXIS_Y} stroke="#2563EB" strokeWidth="2.8" />
            {phase < 2 ? (
              <line x1="520" y1={AXIS_Y} x2="650" y2="290" stroke="#DC2626" strokeWidth="2.8" strokeDasharray="6 4" />
            ) : (
              <line x1="520" y1={AXIS_Y} x2="460" y2={AXIS_Y} stroke="#16A34A" strokeWidth="3" />
            )}

            <text x="380" y="40" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0F172A">
              {meta.title}
            </text>

            <text x="380" y="66" textAnchor="middle" fontSize="13" fontWeight="700" fill={phase < 2 ? "#B91C1C" : "#166534"}>
              {phase < 2 ? meta.wrong : meta.fix}
            </text>

            <rect x="66" y="280" width="628" height="58" rx="10" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.2" />
            <text x="80" y="304" fontSize="12" fill="#1F2937" fontWeight="700">Targeted misconception:</text>
            <text x="240" y="304" fontSize="12" fill="#1D4ED8" fontWeight="700">{tag || "general_concept_gap"}</text>
            <text x="80" y="324" fontSize="12" fill="#374151">
              {(explanation || meta.fix).slice(0, 110)}
              {(explanation || meta.fix).length > 110 ? "..." : ""}
            </text>
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default SphericalMirrorMisconceptionFeedback;
