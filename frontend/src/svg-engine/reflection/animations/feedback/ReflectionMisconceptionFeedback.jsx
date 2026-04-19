import React from "react";
import { Line, Label, Ray } from "../../../shared/SVGUtils";

const SVG_W = 460;
const SVG_H = 320;
const CX = 230;
const CY = 210;

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

  const renderAngleFromSurface = () => (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="320">
      <rect width="100%" height="100%" fill="#F8FBFF" rx="12" />
      <Line x1={70} y1={CY} x2={390} y2={CY} color="#374151" strokeWidth={4} />
      <Line x1={CX} y1={70} x2={CX} y2={CY} color="#16A34A" strokeWidth={2.5} />
      <Ray x1={110} y1={120} x2={CX} y2={CY} color="#2563EB" strokeWidth={3} id="incident-angle" />
      <Ray x1={CX} y1={CY} x2={355} y2={120} color="#2563EB" strokeWidth={3} id="reflected-angle" />
      <Line x1={CX - 50} y1={CY + 18} x2={CX + 70} y2={CY + 18} color="#DC2626" strokeWidth={3} />
      <Label x={CX} y={CY + 40} text="Wrong: measured from surface" color="#DC2626" size={13} anchor="middle" bold />
      <Label x={CX} y={52} text="Angles are measured from the NORMAL" color="#166534" size={14} anchor="middle" bold />
      <Label x={95} y={108} text="Incident ray" color="#1D4ED8" size={12} anchor="start" />
      <Label x={330} y={108} text="Reflected ray" color="#1D4ED8" size={12} anchor="start" />
      <Label x={CX + 8} y={CY - 6} text="Normal" color="#16A34A" size={12} anchor="start" />
    </svg>
  );

  const renderReflectionNotEqual = () => (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="320">
      <rect width="100%" height="100%" fill="#F8FBFF" rx="12" />
      <Line x1={70} y1={CY} x2={390} y2={CY} color="#374151" strokeWidth={4} />
      <Line x1={CX} y1={68} x2={CX} y2={CY} color="#16A34A" strokeWidth={2.5} />
      <Ray x1={115} y1={130} x2={CX} y2={CY} color="#2563EB" strokeWidth={3} id="incident-equal" />
      <Ray x1={CX} y1={CY} x2={345} y2={130} color="#2563EB" strokeWidth={3} id="reflected-equal" />
      <Label x={CX} y={92} text="i = r" color="#16A34A" size={22} anchor="middle" bold />
      <Label x={CX} y={CY + 42} text="The angles are equal" color="#166534" size={14} anchor="middle" bold />
      <Label x={CX} y={54} text="Do not treat i and r as different" color="#DC2626" size={14} anchor="middle" bold />
    </svg>
  );

  const renderNormalOrientationWrong = () => (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="320">
      <rect width="100%" height="100%" fill="#F8FBFF" rx="12" />
      <Line x1={70} y1={CY} x2={390} y2={CY} color="#374151" strokeWidth={4} />
      <Line x1={140} y1={138} x2={320} y2={138} color="#DC2626" strokeWidth={3} />
      <Label x={230} y={128} text="Wrong normal: parallel to mirror" color="#DC2626" size={14} anchor="middle" bold />
      <Line x1={CX} y1={76} x2={CX} y2={CY} color="#16A34A" strokeWidth={3} />
      <Label x={230} y={72} text="Correct normal: perpendicular" color="#166534" size={14} anchor="middle" bold />
      <Ray x1={110} y1={120} x2={CX} y2={CY} color="#2563EB" strokeWidth={3} id="incident-normal" />
      <Ray x1={CX} y1={CY} x2={340} y2={120} color="#2563EB" strokeWidth={3} id="reflected-normal" />
    </svg>
  );

  const renderPlaneNotSame = () => (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="320">
      <rect width="100%" height="100%" fill="#F8FBFF" rx="12" />
      <rect x="88" y="78" width="284" height="160" rx="12" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" />
      <Label x={230} y={104} text="One flat plane" color="#1D4ED8" size={16} anchor="middle" bold />
      <Line x1={120} y1={CY} x2={340} y2={CY} color="#374151" strokeWidth={4} />
      <Line x1={CX} y1={92} x2={CX} y2={CY} color="#16A34A" strokeWidth={3} />
      <Ray x1={112} y1={130} x2={CX} y2={CY} color="#2563EB" strokeWidth={3} id="incident-plane" />
      <Ray x1={CX} y1={CY} x2={348} y2={130} color="#2563EB" strokeWidth={3} id="reflected-plane" />
      <Label x={230} y={268} text="All rays + the normal stay on the same sheet" color="#166534" size={13} anchor="middle" bold />
      <Label x={230} y={52} text="Do not put any ray in a different plane" color="#DC2626" size={14} anchor="middle" bold />
    </svg>
  );

  let visual = renderAngleFromSurface();
  if (tag === "reflection_not_equal") visual = renderReflectionNotEqual();
  if (tag === "normal_orientation_wrong") visual = renderNormalOrientationWrong();
  if (tag === "plane_not_same" || tag === "second_law_reflection_plane") visual = renderPlaneNotSame();

  return (
    <div style={shellStyle}>
      {visual}
      <div style={captionStyle}>
        <strong style={{ color: "#1d4ed8" }}>Misconception focus:</strong> {helperText}
      </div>
    </div>
  );
};

export default ReflectionMisconceptionFeedback;