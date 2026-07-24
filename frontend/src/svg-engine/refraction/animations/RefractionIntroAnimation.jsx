// ============================================================
// RefractionIntroAnimation — ONE long-form continuous lesson
// Parts 1–6 in a single audio-synced player
// ============================================================

import React from "react";
import LongFormLesson from "../shared/LongFormLesson";
import RefractionDiagram from "../shared/RefractionDiagram";
import { INTRO_STEPS } from "../shared/refractionNarrations";

const RefractionIntroAnimation = ({ onContinue }) => (
  <LongFormLesson
    title="Watch: Introduction to Refraction — Full Lesson"
    steps={INTRO_STEPS}
    onContinue={onContinue}
    tryButtonLabel="Continue to Laws of Refraction →"
  >
    {({ part, partProgress }) => (
      <RefractionDiagram part={part} partProgress={partProgress} />
    )}
  </LongFormLesson>
);

export default RefractionIntroAnimation;
