import React from "react";
import FirstLawOfReflectionAnimation from "../../svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import SecondLawOfReflectionAnimation from "../../svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import PlaneMirrorBasicsAnimation from "../../svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import SphericalMirrorDetailedAnimation from "../../svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorDetailedAnimation";
import SphericalMirrorMisconceptionFeedback from "../../svg-engine/reflection/spherical-mirrors/animations/feedback/SphericalMirrorMisconceptionFeedback";
import ReflectionMisconceptionFeedback from "../../svg-engine/reflection/animations/feedback/ReflectionMisconceptionFeedback";
import DynamicMirrorFeedback from "./DynamicMirrorFeedback";
import DynamicSVGRenderer from "../../svg-engine/dynamic/DynamicSVGRenderer";
import RefractionIntroAnimation from "../../svg-engine/refraction/animations/RefractionIntroAnimation";
import SnellsLawAnimation from "../../svg-engine/refraction/animations/SnellsLawAnimation";
import GlassSlabAnimation from "../../svg-engine/refraction/animations/GlassSlabAnimation";
import SphericalLensesAnimation from "../../svg-engine/refraction/animations/SphericalLensesAnimation";
import LensImageFormationAnimation from "../../svg-engine/refraction/animations/LensImageFormationAnimation";
import LensFormulaAnimation from "../../svg-engine/refraction/animations/LensFormulaAnimation";
import { generateVisualFix } from "../../services/api";

export const DYNAMIC_TAGS = [
  "ray_passes_through_center_of_curvature", 
  "ray_misses_focal_point", 
  "lens_optical_center_confusion",
  "lens_parallel_ray_wrong",
  "concave_lens_converge_myth",
  "concave_lens_parallel_ray_wrong",
  "tir_critical_angle_confusion",
  "mirror_formula_wrong",
  "lens_formula_wrong",
  "convex_real_image_myth",
  "convex_size_confusion",
  "real_virtual_confusion",
  "image_position_confusion",
  "image_size_confusion",
  "inverted_erect_confusion",
  "focus_infinity_confusion",
  "beyond_c_confusion",
  "parallel_ray_rule_wrong",
  "focus_ray_rule_wrong",
  "center_ray_rule_wrong",
  "sign_convention_confusion"
];

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

const resolveDynamicFeedbackProps = (tag) => {
  const normalized = String(tag || "").trim().toLowerCase();
  switch (normalized) {
    case "convex_real_image_myth":
      return {
        mirrorType: 'convex',
        initialObjectDistance: 150,
        flawedModel: { v: -100, hPrime: -40, isVirtual: false }
      };
    case "convex_size_confusion":
      return {
        mirrorType: 'convex',
        initialObjectDistance: 150,
        flawedModel: { v: 80, hPrime: 100, isVirtual: true }
      };
    case "real_virtual_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 150,
        flawedModel: { v: 100, hPrime: 60, isVirtual: true }
      };
    case "image_position_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 300,
        flawedModel: { v: -300, hPrime: -80, isVirtual: false }
      };
    case "image_size_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 150,
        flawedModel: { v: -300, hPrime: -30, isVirtual: false }
      };
    case "inverted_erect_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 150,
        flawedModel: { v: -300, hPrime: 80, isVirtual: false }
      };
    case "focus_infinity_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 100,
        flawedModel: { v: -200, hPrime: -60, isVirtual: false }
      };
    case "beyond_c_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 300,
        flawedModel: { v: -100, hPrime: -20, isVirtual: false }
      };
    case "parallel_ray_rule_wrong":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 200,
        flawedModel: { v: -100, hPrime: -30, isVirtual: false }
      };
    case "focus_ray_rule_wrong":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 200,
        flawedModel: { v: -100, hPrime: -30, isVirtual: false }
      };
    case "center_ray_rule_wrong":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 200,
        flawedModel: { v: -100, hPrime: -30, isVirtual: false }
      };
    case "sign_convention_confusion":
      return {
        mirrorType: 'concave',
        initialObjectDistance: 150,
        flawedModel: { v: 300, hPrime: -120, isVirtual: true }
      };
    default:
      return null;
  }
};

const parseQuestionToFeedbackProps = (questionText, selectedOptionText, correctOptionText, tag, topicId) => {
  if (!questionText) return null;
  
  // Enforce that parser fallback ONLY applies to the spherical mirror image formation topic,
  // OR when the question explicitly deals with image properties (size, nature, position).
  const isImageFormationTopic = topicId === "spherical-mirror-image-formation";
  const containsImageProperties = questionText.toLowerCase().includes("image") && 
    (questionText.toLowerCase().includes("nature") || 
     questionText.toLowerCase().includes("position") || 
     questionText.toLowerCase().includes("size") || 
     questionText.toLowerCase().includes("type of") ||
     questionText.toLowerCase().includes("formed"));

  if (!isImageFormationTopic && !containsImageProperties) {
    return null;
  }
  
  const qLower = questionText.toLowerCase();
  const selLower = (selectedOptionText || "").toLowerCase();
  
  // Try to determine mirror type (default to concave if in doubt)
  let mirrorType = "concave";
  if (qLower.includes("convex")) {
    mirrorType = "convex";
  }
  
  // Object distance parsing
  let initialObjectDistance = 150; // default (Between C and F)
  
  // 1. At Infinity
  if (qLower.includes("at infinity") || qLower.includes("from infinity")) {
    initialObjectDistance = 500;
  }
  // 2. Beyond C
  else if (qLower.includes("beyond c") || qLower.includes("beyond the centre") || qLower.includes("beyond center") || qLower.includes("beyond the center")) {
    initialObjectDistance = 300;
  }
  // 3. At C
  else if (qLower.includes("at the centre") || qLower.includes("at center") || qLower.includes("at c") || qLower.includes("radius of curvature")) {
    initialObjectDistance = 200;
  }
  // 4. Between C and F
  else if (qLower.includes("between c and f") || qLower.includes("between center and focus") || qLower.includes("between centre and focus")) {
    initialObjectDistance = 150;
  }
  // 5. At F
  else if (qLower.includes("at the focus") || qLower.includes("at focus") || qLower.includes("at f")) {
    initialObjectDistance = 100;
  }
  // 6. Between P and F
  else if (qLower.includes("between the pole") || qLower.includes("between p and f") || qLower.includes("between pole and focus") || qLower.includes("between the focus and the pole") || qLower.includes("between f and p") || qLower.includes("between f and pole") || qLower.includes("close to the mirror")) {
    initialObjectDistance = 50;
  }
  // Convex specific defaults if no position matched
  else if (mirrorType === "convex") {
    initialObjectDistance = 150; // Convex is always virtual, any distance works
  }
  
  // Parse student answer to build flawed model
  let isVirtual = false;
  let v = -200;
  let hPrime = -60;
  
  // 1. Determine if virtual vs real based on student's choice
  if (selLower.includes("virtual") || selLower.includes("behind")) {
    isVirtual = true;
    v = (mirrorType === "convex") ? 80 : 150; // Convex virtual image is closer
  } else {
    isVirtual = false;
    v = -250; // default real image distance
  }

  // 2. Map student's chosen position to exact v coordinates
  if (selLower.includes("beyond c") || selLower.includes("beyond center") || selLower.includes("beyond centre")) {
    v = -300;
  } else if (selLower.includes("at c") || selLower.includes("at center") || selLower.includes("at centre")) {
    v = -200;
  } else if (selLower.includes("between c and f") || selLower.includes("between center and focus") || selLower.includes("between centre and focus")) {
    v = -150;
  } else if (selLower.includes("at f") || selLower.includes("at focus")) {
    v = -100; // at F
  } else if (selLower.includes("at infinity") || selLower.includes("infinity")) {
    v = -500; // far away
  } else if (selLower.includes("behind") || selLower.includes("behind the mirror")) {
    v = 150;
  }
  
  // 3. Determine erect vs inverted
  if (selLower.includes("erect")) {
    hPrime = 60; // erect is upward
  } else {
    hPrime = -60; // inverted is downward
  }

  // 4. Adjust sizes based on size choice
  if (selLower.includes("diminished") || selLower.includes("smaller")) {
    hPrime = Math.sign(hPrime) * 25;
  } else if (selLower.includes("magnified") || selLower.includes("enlarged") || selLower.includes("highly magnified")) {
    hPrime = Math.sign(hPrime) * 100;
  } else if (selLower.includes("same size")) {
    hPrime = Math.sign(hPrime) * 60;
  }
  
  return {
    mirrorType,
    initialObjectDistance,
    flawedModel: { v, hPrime, isVirtual }
  };
};

const QuizVisualCorrection = ({
  svgComponent,
  svgVariant,
  animationParameters,
  misconceptionTag,
  explanation,
  questionText = "",
  selectedOptionText = "",
  correctOptionText = "",
  topicId = "",
  asyncData: propAsyncData = null,
}) => {
  const tag = String(svgVariant || misconceptionTag || "").trim();
  const noOp = () => {};

  const [asyncData, setAsyncData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // If the data was prefetched by the parent, use it immediately
    if (propAsyncData) {
      setAsyncData(propAsyncData);
      return;
    }

    if (DYNAMIC_TAGS.includes(tag) && !animationParameters && questionText) {
      let isMounted = true;
      setLoading(true);
      generateVisualFix({
        topic: topicId || "reflection_refraction",
        misconception_tag: tag,
        question_text: questionText,
        student_answer: selectedOptionText,
        correct_answer: correctOptionText
      })
      .then((data) => {
        if (isMounted) {
          setAsyncData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
      return () => { isMounted = false; };
    }
  }, [tag, topicId, questionText, selectedOptionText, correctOptionText, animationParameters, propAsyncData]);

  if (!svgComponent && !tag) {
    return null;
  }

  if (loading) {
    return (
      <div style={styles.shell}>
        <h3 style={styles.title}>Visual Correction</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #dbeafe', borderTop: '4px solid #1e3a8a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '16px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>Generating personalized visual correction...</p>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      </div>
    );
  }

  let dynamicProps = null;
  if (questionText) {
    dynamicProps = parseQuestionToFeedbackProps(questionText, selectedOptionText, correctOptionText, tag, topicId);
  }
  if (!dynamicProps && tag) {
    dynamicProps = resolveDynamicFeedbackProps(tag);
  }

  // Use async data if available, otherwise fallback to props
  const finalAnimParams = asyncData?.animation_parameters || animationParameters;
  const finalExplanation = asyncData?.explanation || explanation;
  const finalSvgComp = asyncData?.svg_component || svgComponent;

  const renderByTemplate = () => {
    // If we have dynamic animation parameters, render the new dynamic engine
    if (finalAnimParams || finalSvgComp === "DynamicSVGRenderer") {
      return (
        <DynamicSVGRenderer 
          parameters={finalAnimParams} 
          explanation={finalExplanation} 
          topicId={topicId}
        />
      );
    }

    if (dynamicProps) {
      return (
        <DynamicMirrorFeedback
          mirrorType={dynamicProps.mirrorType}
          initialObjectDistance={dynamicProps.initialObjectDistance}
          flawedModel={dynamicProps.flawedModel}
        />
      );
    }

    switch (finalSvgComp) {
      case "ReflectionMisconceptionFeedback":
        return (
          <ReflectionMisconceptionFeedback
            misconceptionTag={tag}
            explanation={finalExplanation}
          />
        );
      case "PlaneMirrorBasicsAnimation":
        return <PlaneMirrorBasicsAnimation onContinue={noOp} />;
      case "SphericalMirrorBasicsWatch":
        return <SphericalMirrorDetailedAnimation />;
      case "SphericalMirrorMisconceptionFeedback":
        return (
          <SphericalMirrorMisconceptionFeedback
            misconceptionTag={tag}
            explanation={finalExplanation}
          />
        );
      case "SphericalMirrorDetailedAnimation":
        return <SphericalMirrorDetailedAnimation />;
      case "SecondLawOfReflectionAnimation":
        return <SecondLawOfReflectionAnimation onTryItClicked={noOp} />;
      case "FirstLawOfReflectionAnimation":
        return <FirstLawOfReflectionAnimation onTryItClicked={noOp} />;
      case "RefractionIntroAnimation":
        return <RefractionIntroAnimation onContinue={noOp} />;
      case "SnellsLawAnimation":
        return <SnellsLawAnimation onContinue={noOp} />;
      case "GlassSlabAnimation":
        return <GlassSlabAnimation onContinue={noOp} />;
      case "SphericalLensesAnimation":
        return <SphericalLensesAnimation onContinue={noOp} />;
      case "LensImageFormationAnimation":
        return <LensImageFormationAnimation onContinue={noOp} />;
      case "LensFormulaAnimation":
        return <LensFormulaAnimation onContinue={noOp} />;
      default:
        return (
          <ReflectionMisconceptionFeedback
            misconceptionTag={tag}
            explanation={finalExplanation}
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
