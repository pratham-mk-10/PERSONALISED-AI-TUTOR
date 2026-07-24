import React from "react";
import LongFormLesson from "../shared/LongFormLesson";
import LensesDiagram from "../shared/LensesDiagram";
import { LENSES_STEPS } from "../shared/refractionNarrations";

export default function SphericalLensesAnimation({ onContinue }) {
  return (
    <LongFormLesson
      title="Watch: Spherical Lenses — Full Lesson"
      steps={LENSES_STEPS}
      onContinue={onContinue}
      tryButtonLabel="Continue to Image Formation →"
    >
      {({ part, partProgress }) => <LensesDiagram part={part} partProgress={partProgress} />}
    </LongFormLesson>
  );
}
