// ============================================================
// NumericalChallenge.jsx
// Generic shell for every "Numerical Problems" subtopic (find v,
// find f, find u, find m/height, mirror identification, combined).
// All physics-specific behavior (which formula, which fields, how
// a wrong answer is diagnosed and mapped to a red/green visual) is
// delegated to a `config` object from numericalSubtopics.js -- this
// file only owns the UI flow: fast path -> (optional bonus check /
// breakdown-on-wrong) -> feedback -> next problem, plus attempt
// logging via the shared /submit-numeric-answer backend route.
//
// No LLM anywhere in this file: correctness checks and diagnosis
// are config functions running deterministic arithmetic against
// MirrorPhysicsEngine's output. The only network call is
// submitNumericAnswerLog, used purely for cross-session logging and
// (from the 2nd wrong attempt on a tag) an escalated explanation.
// ============================================================

import React, { useState } from "react";
import DynamicMirrorFeedback from "../../../components/quiz/DynamicMirrorFeedback";
import { useSessionStore } from "../../../state/sessionStore";
import { submitNumericAnswerLog } from "../../../services/api";
import { computeCorrectResult, STATIC_EXPLANATIONS } from "./numericalSubtopics";

const NumericalChallenge = ({ config }) => {
  const user = useSessionStore((s) => s.user);
  const studentId = user?.id || user?.name || "guest-student";

  const problems = config.problems;

  const [problemIndex, setProblemIndex] = useState(0);
  const [phase, setPhase] = useState("fastPath"); // fastPath | correct | bonusCheck | breakdown | feedback
  const [fastPathInput, setFastPathInput] = useState("");
  const [studentValue, setStudentValue] = useState(null);
  const [breakdownValues, setBreakdownValues] = useState({});
  const [diagnosis, setDiagnosis] = useState(null);
  const [explanationText, setExplanationText] = useState("");
  const [attemptCountByTag, setAttemptCountByTag] = useState({});
  const [inputError, setInputError] = useState("");
  const [correctBanner, setCorrectBanner] = useState(null);

  const problem = problems[problemIndex];
  const correct = computeCorrectResult(problem);

  const logAttempt = (tag, submittedValue) => {
    if (!tag) return;
    const newCount = (attemptCountByTag[tag] || 0) + 1;
    setAttemptCountByTag((prev) => ({ ...prev, [tag]: newCount }));
    setExplanationText(STATIC_EXPLANATIONS[tag] || "");

    submitNumericAnswerLog({
      studentId,
      topic: config.topicTitle,
      misconceptionTag: tag,
      attemptNumber: newCount,
      questionText: config.buildWordProblem(problem),
      studentAnswer: String(submittedValue),
      correctAnswer: String(correct.v),
    })
      .then((res) => {
        if (newCount >= 2 && res?.explanation) setExplanationText(res.explanation);
      })
      .catch(() => {});
  };

  const resetInputs = () => {
    setFastPathInput("");
    setBreakdownValues({});
    setInputError("");
    setDiagnosis(null);
    setExplanationText("");
    setCorrectBanner(null);
  };

  const goToNext = () => {
    resetInputs();
    setStudentValue(null);
    setPhase("fastPath");
    setProblemIndex((i) => (i + 1 < problems.length ? i + 1 : i));
  };

  const tryAgainSameProblem = () => {
    resetInputs();
    setStudentValue(null);
    setPhase("fastPath");
  };

  const handleFastPathSubmit = (choiceValue) => {
    let value = choiceValue;
    if (config.fastPathType === "numeric") {
      const parsed = Number(fastPathInput);
      if (!Number.isFinite(parsed)) {
        setInputError("Enter a number (you can include a - sign).");
        return;
      }
      value = parsed;
    }
    setInputError("");
    setStudentValue(value);

    const isCorrect = config.checkFastPath(correct, value, problem);
    if (isCorrect) {
      setCorrectBanner(config.correctBannerText(correct, problem));
      if (config.bonusCheck) {
        setPhase("bonusCheck");
      } else {
        setPhase("correct");
      }
    } else {
      setPhase("breakdown");
    }
  };

  const handleBonusCheck = (value) => {
    const diag = config.bonusCheck.evaluate(correct, value, problem);
    if (diag === null) {
      goToNext();
      return;
    }
    setDiagnosis(diag);
    setCorrectBanner(null);
    setPhase("feedback");
    logAttempt(diag.tag, studentValue);
  };

  const handleBreakdownSubmit = () => {
    const values = {};
    for (const field of config.breakdownFields) {
      const parsed = Number(breakdownValues[field.key]);
      if (!Number.isFinite(parsed)) {
        setInputError("Enter every field as a number (with sign).");
        return;
      }
      values[field.key] = parsed;
    }
    setInputError("");
    const diag = config.diagnoseBreakdown(correct, values, studentValue, problem);
    setDiagnosis(diag);
    setPhase("feedback");
    logAttempt(diag.tag, studentValue);
  };

  const isLastProblem = problemIndex + 1 >= problems.length;
  const showVisual = diagnosis && diagnosis.flawedModel && problem.mirrorType !== "plane";

  return (
    <div style={styles.wrapper}>
      <p style={styles.progress}>Problem {problemIndex + 1} of {problems.length}</p>
      <p style={styles.problemText}>{config.buildWordProblem(problem)}</p>

      {phase === "fastPath" && config.fastPathType === "numeric" && (
        <div style={styles.inputRow}>
          <label style={styles.label}>{config.fastPathLabel}</label>
          <input
            type="number"
            step="any"
            value={fastPathInput}
            onChange={(e) => setFastPathInput(e.target.value)}
            style={styles.numberInput}
            placeholder={config.fastPathPlaceholder}
          />
          <button style={styles.btnPrimary} onClick={() => handleFastPathSubmit()}>Submit</button>
        </div>
      )}
      {phase === "fastPath" && config.fastPathType === "choice" && (
        <div style={styles.feedbackBlock}>
          <p style={styles.label}>{config.fastPathLabel}</p>
          <div style={styles.choiceRow}>
            {config.fastPathChoices.map((c) => (
              <button key={String(c.value)} style={styles.btnSecondary} onClick={() => handleFastPathSubmit(c.value)}>{c.label}</button>
            ))}
          </div>
        </div>
      )}
      {inputError && phase === "fastPath" && <p style={styles.error}>{inputError}</p>}

      {phase === "correct" && (
        <div style={styles.feedbackBlock}>
          <p style={styles.correctBanner}>{correctBanner}</p>
          <button style={styles.btnPrimary} onClick={goToNext} disabled={isLastProblem}>
            {isLastProblem ? "That was the last problem" : "Next Problem →"}
          </button>
        </div>
      )}

      {phase === "bonusCheck" && (
        <div style={styles.feedbackBlock}>
          <p style={styles.correctBanner}>{correctBanner}</p>
          <p style={styles.label}>{config.bonusCheck.question}</p>
          <div style={styles.choiceRow}>
            {config.bonusCheck.choices.map((c) => (
              <button key={String(c.value)} style={styles.btnSecondary} onClick={() => handleBonusCheck(c.value)}>{c.label}</button>
            ))}
          </div>
        </div>
      )}

      {phase === "breakdown" && (
        <div style={styles.feedbackBlock}>
          <p style={styles.hintText}>
            Let's see exactly where this went sideways — walk me through your substitution.
          </p>
          {config.breakdownFields.map((field) => (
            <div style={styles.inputRow} key={field.key}>
              <label style={styles.label}>{field.label}</label>
              <input
                type="number"
                step="any"
                value={breakdownValues[field.key] || ""}
                onChange={(e) => setBreakdownValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                style={styles.numberInput}
                placeholder={field.placeholder}
              />
            </div>
          ))}
          {inputError && <p style={styles.error}>{inputError}</p>}
          <button style={styles.btnPrimary} onClick={handleBreakdownSubmit}>Show me what went wrong</button>
        </div>
      )}

      {phase === "feedback" && diagnosis && (
        <div style={styles.feedbackBlock}>
          <p style={styles.hintText}>{config.brokenFieldSentence(diagnosis, correct, problem)}</p>
          {explanationText && <p style={styles.explanationText}>{explanationText}</p>}
          {showVisual && (
            <DynamicMirrorFeedback
              mirrorType={problem.mirrorType}
              focalLength={problem.f}
              initialObjectDistance={problem.u}
              objectHeight={problem.h}
              flawedModel={diagnosis.flawedModel}
            />
          )}
          <div style={styles.choiceRow}>
            <button style={styles.btnSecondary} onClick={tryAgainSameProblem}>Try Again</button>
            {!isLastProblem && (
              <button style={styles.btnPrimary} onClick={goToNext}>Next Problem →</button>
            )}
          </div>
          {isLastProblem && (
            <p style={styles.correctBanner}>🎉 That was the last problem in this set.</p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "12px", padding: "16px", fontFamily: "Arial, sans-serif" },
  progress: { fontSize: "13px", color: "#93C5FD", fontWeight: 600, margin: 0 },
  problemText: { fontSize: "15px", color: "#F8FAFC", lineHeight: 1.6, margin: "0 0 4px 0" },
  inputRow: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" },
  label: { fontSize: "14px", color: "#D1D5DB", margin: 0 },
  numberInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#0F172A", color: "#F8FAFC", fontSize: "14px", width: "120px" },
  btnPrimary: { background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", color: "#FFFFFF", padding: "10px 20px", border: "none", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  btnSecondary: { background: "transparent", color: "#93C5FD", padding: "10px 20px", border: "1px solid #3B82F6", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  choiceRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  error: { color: "#F87171", fontSize: "13px", margin: 0 },
  feedbackBlock: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "6px" },
  hintText: { fontSize: "14px", color: "#FCD34D", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "8px", padding: "10px 14px", margin: 0 },
  explanationText: { fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6, margin: 0 },
  correctBanner: { fontSize: "14px", color: "#34D399", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "10px 14px", margin: 0 },
};

export default NumericalChallenge;
