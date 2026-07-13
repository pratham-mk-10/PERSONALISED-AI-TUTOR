// Factory for a single refraction intro part (1–6)
import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import RefractionDiagram from "../shared/RefractionDiagram";

export default function createRefractionPart({ partNumber, title, narration, showTryIt = false, tryButtonLabel }) {
  const PartAnimation = ({ onComplete: onPartComplete, onTryItClicked }) => (
    <AudioAnimationPlayer
      audioSteps={[{ progress: 1, text: narration }]}
      title={title}
      showTryIt={showTryIt}
      onComplete={onPartComplete}
      onTryItClicked={onTryItClicked}
      tryButtonLabel={tryButtonLabel || "Continue →"}
    >
      {({ progress }) => (
        <RefractionDiagram part={partNumber} partProgress={progress} />
      )}
    </AudioAnimationPlayer>
  );

  PartAnimation.displayName = `RefractionPart${partNumber}`;
  return PartAnimation;
}
