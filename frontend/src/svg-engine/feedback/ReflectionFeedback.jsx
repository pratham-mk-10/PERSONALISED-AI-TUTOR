export default function ReflectionFeedback({ misconceptionTag }) {
  const config = {
    angle_from_surface: {
      message:
        "You measured the angle from the mirror surface. Always measure from the normal.",
    },

    reflection_not_equal: {
      message:
        "Angle of incidence is ALWAYS equal to angle of reflection.",
    },

    normal_orientation_wrong: {
      message:
        "The normal must be perpendicular to the mirror surface.",
    },

    plane_not_same: {
      message:
        "Incident ray, reflected ray and normal must lie in the same plane.",
    },
  };

  const data = config[misconceptionTag];
  if (!data) return null;

  return (
    <div style={{ padding: 20, border: "2px solid red", borderRadius: 8 }}>
      <p>{data.message}</p>
    </div>
  );
}
