import React from "react";
import FirstLawOfReflectionAnimation from "../../svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import SecondLawOfReflectionAnimation from "../../svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import PlaneMirrorBasicsAnimation from "../../svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import SphericalMirrorBasicsWatch from "../../svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorBasicsWatch";
import SphericalMirrorDetailedAnimation from "../../svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorDetailedAnimation";
import ReflectionMisconceptionFeedback from "../../svg-engine/reflection/animations/feedback/ReflectionMisconceptionFeedback";

const styles = {
  shell: {
    marginTop: "16px",
    padding: "14px",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    background: "#f8fbff",
  },
  title: {
    margin: "0 0 10px",
    color: "#1e3a8a",
    fontWeight: 700,
  },
};

const QuizVisualCorrection = ({
  svgComponent,
  svgVariant,
  misconceptionTag,
  explanation,
}) => {
  const tag = String(svgVariant || misconceptionTag || "").trim();
  const noOp = () => {};

  if (!svgComponent && !tag) {
    return null;
  }

  const renderByTemplate = () => {
    switch (svgComponent) {
      case "ReflectionMisconceptionFeedback":
        return (
          <ReflectionMisconceptionFeedback
            misconceptionTag={tag}
            explanation={explanation}
          />
        );
      case "PlaneMirrorBasicsAnimation":
        return <PlaneMirrorBasicsAnimation onContinue={noOp} />;
      case "SphericalMirrorBasicsWatch":
        return <SphericalMirrorBasicsWatch onTryItClicked={noOp} />;
      case "SphericalMirrorDetailedAnimation":
        return <SphericalMirrorDetailedAnimation />;
      case "SecondLawOfReflectionAnimation":
        return <SecondLawOfReflectionAnimation onTryItClicked={noOp} />;
      case "FirstLawOfReflectionAnimation":
        return <FirstLawOfReflectionAnimation onTryItClicked={noOp} />;
      default:
        return (
          <ReflectionMisconceptionFeedback
            misconceptionTag={tag}
            explanation={explanation}
          />
        );
    }
  };

  return (
    <div style={styles.shell}>
      <h3 style={styles.title}>Visual Correction</h3>
      {renderByTemplate()}
    </div>
  );
};

export default QuizVisualCorrection;
