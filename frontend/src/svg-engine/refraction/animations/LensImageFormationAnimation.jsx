import React from "react";
import LongFormLesson from "../shared/LongFormLesson";
import LensImageDiagram from "../shared/LensImageDiagram";
import { LENS_IMAGE_STEPS } from "../shared/refractionNarrations";

export default function LensImageFormationAnimation({ onContinue }) {
  return (
    <LongFormLesson
      title="Watch: Image Formation by Lenses — Full Lesson"
      steps={LENS_IMAGE_STEPS}
      onContinue={onContinue}
      tryButtonLabel="Continue to Lens Formula →"
    >
      {({ part, partProgress }) => <LensImageDiagram part={part} partProgress={partProgress} />}
    </LongFormLesson>
  );
}
