import React from "react";
import QuizPage from "../quiz/QuizPage";
import RefractionIntroAnimation from "../../svg-engine/refraction/animations/RefractionIntroAnimation";
import SnellsLawAnimation from "../../svg-engine/refraction/animations/SnellsLawAnimation";
import GlassSlabAnimation from "../../svg-engine/refraction/animations/GlassSlabAnimation";
import SphericalLensesAnimation from "../../svg-engine/refraction/animations/SphericalLensesAnimation";
import LensImageFormationAnimation from "../../svg-engine/refraction/animations/LensImageFormationAnimation";
import LensFormulaAnimation from "../../svg-engine/refraction/animations/LensFormulaAnimation";
import { REFRACTION_TOPICS, REFRACTION_TOPIC_ORDER } from "../../config/refractionTopics";

const ANIMATIONS = {
  "refraction-intro": RefractionIntroAnimation,
  "refraction-snells-law": SnellsLawAnimation,
  "refraction-glass-slab": GlassSlabAnimation,
  "refraction-lenses": SphericalLensesAnimation,
  "refraction-lens-images": LensImageFormationAnimation,
  "refraction-lens-formula": LensFormulaAnimation,
};

const TRY_LABELS = {
  "refraction-intro": "Continue to Laws of Refraction →",
  "refraction-snells-law": "Take Quiz →",
  "refraction-glass-slab": "Take Quiz →",
  "refraction-lenses": "Take Quiz →",
  "refraction-lens-images": "Take Quiz →",
  "refraction-lens-formula": "Take Quiz →",
};

function topicIdForStage(stage) {
  return Object.keys(REFRACTION_TOPICS).find((id) => {
    const t = REFRACTION_TOPICS[id];
    return t.tell === stage || t.show === stage || t.quiz === stage;
  });
}

export default function RefractionSession({ stage, setStage, setView, selectTopic, onAdvanceToNextTopic = null, styles }) {
  const topicId = topicIdForStage(stage);
  if (!topicId) return null;

  const topic = REFRACTION_TOPICS[topicId];
  const Animation = ANIMATIONS[topicId];

  if (stage === topic.tell) {
    return (
      <div style={{ ...styles.cardWide, maxWidth: "860px" }}>
        <h2 style={styles.h2}>{topic.title}</h2>
        <p style={styles.explanation}>{topic.tellSummary}</p>
        <div style={styles.lawBox}>
          <p style={styles.lawText}>{topic.formula}</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setStage(topic.show)}>
          Watch Full Lesson Animation →
        </button>
      </div>
    );
  }

  if (stage === topic.show) {
    const nextTopicId = REFRACTION_TOPIC_ORDER[REFRACTION_TOPIC_ORDER.indexOf(topicId) + 1];

    const onContinue = () => {
      if (topicId === "refraction-intro" && topic.nextTell && nextTopicId) {
        selectTopic(nextTopicId);
        setStage(topic.nextTell);
      } else {
        setStage(topic.quiz);
      }
    };

    return (
      <div style={styles.cardWide}>
        <Animation onContinue={onContinue} tryButtonLabel={TRY_LABELS[topicId]} />
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button style={styles.btnPrimary} onClick={() => setStage(topic.quiz)}>
            {TRY_LABELS[topicId]}
          </button>
          {topic.nextTell && nextTopicId && (
            <button
              style={styles.btnSecondary}
              onClick={() => {
                selectTopic(nextTopicId);
                setStage(topic.nextTell);
              }}
            >
              Skip Quiz → Next Topic
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === topic.quiz) {
    const nextTopicId = REFRACTION_TOPIC_ORDER[REFRACTION_TOPIC_ORDER.indexOf(topicId) + 1];

    return (
      <div style={styles.card}>
        <QuizPage onAdvanceToNextTopic={onAdvanceToNextTopic} />
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          {topic.nextTell && nextTopicId ? (
            <button
              style={styles.btnPrimary}
              onClick={() => {
                selectTopic(nextTopicId);
                setStage(topic.nextTell);
              }}
            >
              Next Topic →
            </button>
          ) : null}
          <button style={styles.btnSecondary} onClick={() => setView("dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export { topicIdForStage };
