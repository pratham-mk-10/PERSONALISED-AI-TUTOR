import React from "react";
import AngleFromSurfaceFeedback from "./AngleFromSurfaceFeedback";
import ReflectionNotEqualFeedback from "./ReflectionNotEqualFeedback";
import NormalOrientationWrongFeedback from "./NormalOrientationWrongFeedback";
import PlaneNotSameFeedback from "./PlaneNotSameFeedback";

const normalizeTag = (value) => String(value || "").trim().toLowerCase();

const shellStyle = {
  marginTop: "16px",
  padding: "14px",
  borderRadius: "12px",
  background: "#f8fbff",
  border: "1px solid #dbeafe",
};

const captionStyle = {
  marginTop: "12px",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#fff",
  border: "1px solid #e5e7eb",
  color: "#1f2937",
  lineHeight: 1.55,
};

const ReflectionMisconceptionFeedback = ({ misconceptionTag, explanation }) => {
  const tag = normalizeTag(misconceptionTag);

  const fallbackTextByTag = {
    angle_from_surface: "Measure both angles from the normal, not from the mirror surface.",
    reflection_not_equal: "Angle of incidence and angle of reflection are equal: i = r.",
    normal_orientation_wrong: "The normal must be perpendicular to the mirror at the point of incidence.",
    plane_not_same: "Incident ray, reflected ray, and normal must all lie in the same plane.",
    first_law_reflection_angle: "Angle of incidence and angle of reflection are equal and measured from the normal.",
    second_law_reflection_plane: "All three elements must lie in the same plane.",
  };

  const helperText = explanation || fallbackTextByTag[tag] || "Review the highlighted concept carefully.";

  const renderVisual = () => {
    if (tag === "reflection_not_equal" || tag === "first_law_reflection_angle") {
      return <ReflectionNotEqualFeedback />;
    }
    if (tag === "normal_orientation_wrong") {
      return <NormalOrientationWrongFeedback />;
    }
    if (tag === "plane_not_same" || tag === "second_law_reflection_plane") {
      return <PlaneNotSameFeedback />;
    }
    return <AngleFromSurfaceFeedback />;
  };

  return (
    <div style={shellStyle}>
      {renderVisual()}
      <div style={captionStyle}>
        <strong style={{ color: "#1d4ed8" }}>Misconception focus:</strong> {helperText}
      </div>
    </div>
  );
};

export default ReflectionMisconceptionFeedback;