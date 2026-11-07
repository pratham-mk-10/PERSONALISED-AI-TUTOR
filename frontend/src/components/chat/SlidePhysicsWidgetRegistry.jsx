import React, { Suspense, lazy } from "react";

// Lazy load animations to ensure light initial bundle size
const FirstLawOfReflectionAnimation = lazy(() =>
  import("../../svg-engine/reflection/animations/FirstLawOfReflectionAnimation")
);
const SecondLawOfReflectionAnimation = lazy(() =>
  import("../../svg-engine/reflection/animations/SecondLawOfReflectionAnimation")
);
const PlaneMirrorBasicsAnimation = lazy(() =>
  import("../../svg-engine/reflection/animations/PlaneMirrorBasicsAnimation")
);
const PlaneMirrorCharacteristicsAnimation = lazy(() =>
  import("../../svg-engine/reflection/animations/PlaneMirrorCharacteristicsAnimation")
);
const RealVsVirtualImagesAnimation = lazy(() =>
  import("../../svg-engine/reflection/animations/RealVsVirtualImagesAnimation")
);
const ImageFormationLesson = lazy(() =>
  import("../../svg-engine/reflection/spherical-mirrors/animations/ImageFormationLesson")
);
const MirrorFormulaLesson = lazy(() =>
  import("../../svg-engine/reflection/spherical-mirrors/animations/MirrorFormulaLesson")
);
const SignConventionLesson = lazy(() =>
  import("../../svg-engine/reflection/spherical-mirrors/animations/SignConventionLesson")
);
const GlassSlabAnimation = lazy(() =>
  import("../../svg-engine/refraction/animations/GlassSlabAnimation")
);
const SnellsLawAnimation = lazy(() =>
  import("../../svg-engine/refraction/animations/SnellsLawAnimation")
);
const LensFormulaAnimation = lazy(() =>
  import("../../svg-engine/refraction/animations/LensFormulaAnimation")
);
const SphericalLensesAnimation = lazy(() =>
  import("../../svg-engine/refraction/animations/SphericalLensesAnimation")
);

const WIDGET_MAP = {
  first_law_reflection: FirstLawOfReflectionAnimation,
  second_law_reflection: SecondLawOfReflectionAnimation,
  plane_mirror_basics: PlaneMirrorBasicsAnimation,
  plane_mirror_characteristics: PlaneMirrorCharacteristicsAnimation,
  real_vs_virtual: RealVsVirtualImagesAnimation,
  spherical_mirror_formation: ImageFormationLesson,
  mirror_formula: MirrorFormulaLesson,
  sign_convention: SignConventionLesson,
  glass_slab: GlassSlabAnimation,
  snells_law: SnellsLawAnimation,
  lens_formula: LensFormulaAnimation,
  spherical_lenses: SphericalLensesAnimation,
};

export default function SlidePhysicsWidget({ componentKey, caption }) {
  if (!componentKey || !WIDGET_MAP[componentKey]) {
    return null;
  }

  const Component = WIDGET_MAP[componentKey];

  return (
    <div style={styles.container}>
      <div style={styles.badgeRow}>
        <span style={styles.badgeIcon}>⚡</span>
        <span style={styles.badgeText}>Deterministic Physics Simulation</span>
      </div>

      <div style={styles.widgetWrapper}>
        <Suspense
          fallback={
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <span>Loading interactive physics model…</span>
            </div>
          }
        >
          <Component />
        </Suspense>
      </div>

      {caption && <p style={styles.caption}>{caption}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "16px",
    padding: "16px",
    marginTop: "8px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
    maxWidth: "100%",
    overflow: "hidden",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "12px",
    alignSelf: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "9999px",
    padding: "3px 10px",
  },
  badgeIcon: {
    fontSize: "12px",
  },
  badgeText: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#60A5FA",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  widgetWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: "260px",
    borderRadius: "12px",
    overflow: "auto",
    backgroundColor: "#F8FAFF",
  },
  caption: {
    margin: "10px 0 0",
    fontSize: "12px",
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    minHeight: "220px",
    color: "#64748B",
    fontSize: "13px",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "3px solid rgba(59, 130, 246, 0.2)",
    borderTopColor: "#3B82F6",
    borderRadius: "50%",
    animation: "spwSpin 0.8s linear infinite",
  },
};

