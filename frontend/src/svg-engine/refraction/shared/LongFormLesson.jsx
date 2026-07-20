// One continuous audio-synced lesson — single Start, no per-part restarts
import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import { clamp } from "../../shared/PhysicsEngine";

export default function LongFormLesson({
  title,
  steps,
  children,
  onContinue,
  tryButtonLabel = "Continue →",
}) {
  return (
    <AudioAnimationPlayer
      audioSteps={steps}
      title={title}
      showTryIt={!!onContinue}
      onTryItClicked={onContinue}
      tryButtonLabel={tryButtonLabel}
    >
      {({ progress }) => {
        let stepIdx = 0;
        for (let i = 0; i < steps.length; i += 1) {
          if (progress <= steps[i].progress) {
            stepIdx = i;
            break;
          }
          stepIdx = i;
        }
        const start = stepIdx === 0 ? 0 : steps[stepIdx - 1].progress;
        const end = steps[stepIdx].progress;
        const partProgress = end > start ? clamp((progress - start) / (end - start), 0, 1) : 1;
        const part = steps[stepIdx].part ?? stepIdx + 1;

        return children({ progress, part, partProgress, stepIdx, totalSteps: steps.length });
      }}
    </AudioAnimationPlayer>
  );
}
