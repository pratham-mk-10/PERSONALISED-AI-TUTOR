import React from "react";
import LongFormLesson from "../shared/LongFormLesson";
import GlassSlabDiagram from "../shared/GlassSlabDiagram";
import { GLASS_SLAB_STEPS } from "../shared/refractionNarrations";

export default function GlassSlabAnimation({ onContinue }) {
  return (
    <LongFormLesson
      title="Watch: Refraction Through Glass Slab — Full Lesson"
      steps={GLASS_SLAB_STEPS}
      onContinue={onContinue}
      tryButtonLabel="Continue to Spherical Lenses →"
    >
      {({ part, partProgress }) => <GlassSlabDiagram part={part} partProgress={partProgress} />}
    </LongFormLesson>
  );
}
