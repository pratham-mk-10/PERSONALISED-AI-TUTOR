import React from "react";
import LongFormLesson from "../shared/LongFormLesson";
import LensFormulaDiagram from "../shared/LensFormulaDiagram";
import { LENS_FORMULA_STEPS } from "../shared/refractionNarrations";

export default function LensFormulaAnimation({ onContinue }) {
  return (
    <LongFormLesson
      title="Watch: Lens Formula & Power — Full Lesson"
      steps={LENS_FORMULA_STEPS}
      onContinue={onContinue}
      tryButtonLabel="Take Quiz →"
    >
      {({ part, partProgress }) => <LensFormulaDiagram part={part} partProgress={partProgress} />}
    </LongFormLesson>
  );
}
