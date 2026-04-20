import React, { useEffect, useState } from "react";
import QuizCard from "./QuizCard";
import {
  getMisconceptionReason,
  getGeneratedQuestions,
  getMisconceptionQuiz,
  submitAnswers,
} from "../../services/api";
import { useSessionStore } from "../../state/sessionStore";
import QuizVisualCorrection from "./QuizVisualCorrection";


const QUESTION_HISTORY_KEY = "apt_seen_question_ids";

const TOPIC_CONTEXTS = {
  "laws-reflection": {
    title: "Laws of Reflection",
    videoTemplate: "ReflectionMisconceptionFeedback",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Focus on the full reflection lesson as one topic: the angle of incidence equals the angle of reflection, and the incident ray, reflected ray, and normal lie in the same plane. Use ray-diagram ideas and the lesson video examples, but do NOT include image formation by mirrors, spherical mirrors, mirror formula, magnification, refraction, lenses, or numerical problems.",
    lessonFocus:
      "Lesson video focus: one unified reflection topic covering both laws together, using plane-mirror ray diagrams, the normal, angle measurements from the normal, and the coplanarity rule.",
    taughtConcepts: [
      "angle of incidence is measured from the normal",
      "angle of reflection is measured from the normal",
      "angle of incidence equals angle of reflection",
      "incident ray, reflected ray and normal lie in the same plane",
      "basic ray-diagram reasoning for laws of reflection",
    ],
    untaughtConcepts: [
      "spherical mirror image formation",
      "mirror formula",
      "magnification formula",
      "refraction",
      "lenses",
    ],
  },
  "plane-mirror": {
    title: "Plane Mirror Basics",
    videoTemplate: "PlaneMirrorBasicsAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to plane mirror image characteristics, laws of reflection, and related Class 10 NCERT ideas.",
    taughtConcepts: [
      "image in a plane mirror is virtual and erect",
      "image size equals object size in a plane mirror",
      "image distance equals object distance from the mirror",
      "lateral inversion in plane mirror",
      "laws of reflection in plane mirror context",
    ],
    untaughtConcepts: [
      "spherical mirrors",
      "mirror formula",
      "magnification by spherical mirrors",
      "refraction",
      "lenses",
    ],
  },
  "spherical-mirror-basics": {
    title: "Spherical Mirror Basics",
    videoTemplate: "SphericalMirrorBasicsWatch",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to introductory spherical mirror ideas only: what spherical mirrors are, concave vs convex mirror identification, and basic terms such as pole, principal axis, centre of curvature, principal focus, and focal length. Do NOT include mirror formula, magnification calculations, detailed image-formation cases, sign convention, or advanced numericals.",
    lessonFocus:
      "Lesson video focus: spherical mirrors as a combined topic, including concave and convex mirrors, principal focus, centre of curvature, pole, focal length, and the common image-forming behavior of each mirror.",
    taughtConcepts: [
      "definition of spherical mirror",
      "difference between concave and convex mirrors",
      "pole, principal axis, centre of curvature",
      "principal focus and focal length basic meaning",
      "basic everyday uses of concave and convex mirrors",
    ],
    untaughtConcepts: [
      "mirror formula",
      "magnification formula",
      "sign convention",
      "complex image formation cases for different object positions",
      "numerical problems on spherical mirrors",
    ],
  },
  "refraction-intro": {
    title: "Introduction to Refraction",
    videoTemplate: "RefractionAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to refraction, refractive index, optical density, Snell's law, and rectangular glass slab refraction.",
    taughtConcepts: [
      "light bends at boundary of two media",
      "bending towards or away from normal based on optical density",
      "basic meaning of refractive index",
      "Snell law qualitative understanding",
      "lateral displacement in rectangular glass slab",
    ],
    untaughtConcepts: [
      "lens formula",
      "power of lens",
      "advanced lens numericals",
      "spherical mirror formula",
    ],
  },
};

const DEFAULT_TOPIC_CONTEXT = TOPIC_CONTEXTS["laws-reflection"];

const TAG_TO_VISUAL_TEMPLATE = {
  angle_from_surface: "ReflectionMisconceptionFeedback",
  reflection_not_equal: "ReflectionMisconceptionFeedback",
  normal_orientation_wrong: "ReflectionMisconceptionFeedback",
  plane_not_same: "ReflectionMisconceptionFeedback",
  first_law_reflection_angle: "ReflectionMisconceptionFeedback",
  second_law_reflection_plane: "ReflectionMisconceptionFeedback",
  image_real_confusion: "PlaneMirrorBasicsAnimation",
  size_mismatch: "PlaneMirrorBasicsAnimation",
  distance_confusion: "PlaneMirrorBasicsAnimation",
  lateral_inversion_confusion: "PlaneMirrorBasicsAnimation",
  plane_mirror_image_properties: "PlaneMirrorBasicsAnimation",
  concave_convex_confusion: "SphericalMirrorMisconceptionFeedback",
  pole_confusion: "SphericalMirrorMisconceptionFeedback",
  center_of_curvature_confusion: "SphericalMirrorMisconceptionFeedback",
  principal_axis_confusion: "SphericalMirrorMisconceptionFeedback",
  focus_definition_wrong: "SphericalMirrorMisconceptionFeedback",
  focus_convex_confusion: "SphericalMirrorMisconceptionFeedback",
  radius_focal_relation_wrong: "SphericalMirrorMisconceptionFeedback",
  sign_convention_confusion: "SphericalMirrorMisconceptionFeedback",
  left_right_sign_error: "SphericalMirrorMisconceptionFeedback",
  parallel_ray_rule_wrong: "SphericalMirrorMisconceptionFeedback",
  focus_ray_rule_wrong: "SphericalMirrorMisconceptionFeedback",
  center_ray_rule_wrong: "SphericalMirrorMisconceptionFeedback",
  random_reflection: "SphericalMirrorMisconceptionFeedback",
  image_position_confusion: "SphericalMirrorMisconceptionFeedback",
  real_virtual_confusion: "SphericalMirrorMisconceptionFeedback",
  image_size_confusion: "SphericalMirrorMisconceptionFeedback",
  inverted_erect_confusion: "SphericalMirrorMisconceptionFeedback",
  focus_infinity_confusion: "SphericalMirrorMisconceptionFeedback",
  beyond_c_confusion: "SphericalMirrorMisconceptionFeedback",
  convex_real_image_myth: "SphericalMirrorMisconceptionFeedback",
  convex_size_confusion: "SphericalMirrorMisconceptionFeedback",
  rearview_reason_wrong: "SphericalMirrorMisconceptionFeedback",
};

const resolveVisualTemplateByTag = (tag) => {
  const key = String(tag || "").trim();
  return TAG_TO_VISUAL_TEMPLATE[key] || null;
};


const loadQuestionHistory = () => {
  try {
    const raw = sessionStorage.getItem(QUESTION_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};


const saveQuestionHistory = (ids) => {
  try {
    sessionStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
};


const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const questionKey = (question, fallbackIndex = 0) => {
  if (question?.id !== undefined && question?.id !== null) {
    return `id-${question.id}`;
  }
  const text = String(question?.question_text || "").slice(0, 24);
  return `gen-${fallbackIndex}-${text}`;
};

const getQuizTopicContext = (topicId) => {
  if (topicId && TOPIC_CONTEXTS[topicId]) {
    return TOPIC_CONTEXTS[topicId];
  }
  return DEFAULT_TOPIC_CONTEXT;
};

const getPersonalization = (topicId, progress) => {
  const topicProgress = progress?.[topicId] || {};
  const mastery = Number(topicProgress?.mastery ?? 0);

  let difficulty = "easy";

  if (mastery >= 70) {
    difficulty = "hard";
  } else if (mastery >= 40) {
    difficulty = "medium";
  }

  const tutorContext =
    topicProgress?.misconception && String(topicProgress.misconception).trim()
      ? `Primary misconception observed: ${topicProgress.misconception}`
      : "No prior misconception data for this topic.";

  return {
    difficulty,
    tutorContext,
  };
};

const QuizPage = () => {
  const currentTopicId = useSessionStore((s) => s.currentTopicId);
  const user = useSessionStore((s) => s.user);
  const progress = useSessionStore((s) => s.progress);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingRemedial, setLoadingRemedial] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [activeVisualByQuestion, setActiveVisualByQuestion] = useState({});
  const [quizMode, setQuizMode] = useState("regular");

  // 🔹 Load questions
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    setCurrentIndex(0);
    setActiveVisualByQuestion({});
    setQuizMode("regular");

    const seenIds = loadQuestionHistory();
    const quizTopicContext = getQuizTopicContext(currentTopicId);
    const personalization = getPersonalization(currentTopicId, progress);
    const studentId = user?.id || user?.name || "guest-student";
    const tutorContext = [quizTopicContext.lessonFocus, personalization.tutorContext]
      .filter(Boolean)
      .join(" ");

    try {
      const data = await getGeneratedQuestions({
        topic: quizTopicContext.title,
        difficulty: personalization.difficulty,
        syllabusScope: quizTopicContext.syllabusScope,
        tutorContext,
        videoTemplate: quizTopicContext.videoTemplate,
        taughtConcepts: quizTopicContext.taughtConcepts,
        untaughtConcepts: quizTopicContext.untaughtConcepts,
      });

      const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
      const nextQuestions = shuffle(rawQuestions).map((q, idx) => ({
        ...q,
        options: Array.isArray(q?.options) ? q.options : [],
        _key: questionKey(q, idx),
      }));
      setQuestions(nextQuestions);

      const nextIds = [
        ...new Set([...seenIds, ...nextQuestions.map(q => q.id).filter((id) => id !== undefined && id !== null)])
      ].slice(-50);
      saveQuestionHistory(nextIds);

      setAnswers({});
    } catch (err) {
      setQuestions([]);
      setError(err?.message || "Unable to load questions");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Select answer
  const handleSelect = (qid, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: optionIndex
    }));
  };

  // 🔹 Submit answers
  const handleSubmit = async () => {
    setError("");
    const unanswered = questions.filter(q => answers[q._key] === undefined);
    if (unanswered.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const quizTopicContext = getQuizTopicContext(currentTopicId);
      const studentId = user?.id || user?.name || "guest-student";

      const formatted = questions.map(q => ({
        question_id: q.id ?? q._key,
        question_text: q.question_text,
        selected: answers[q._key],
        correct: q.correct,
        difficulty: q.difficulty,
        misconception_map: q.misconception_map || {},
        topic: q.topic || quizTopicContext.title,
      }));

      const total = questions.length;
      const correctCount = questions.reduce((count, q) => {
        return count + (answers[q._key] === q.correct ? 1 : 0);
      }, 0);

      let res = null;
      let reason = {
        reason: "Let's review this concept and try again.",
        focus_area: "N/A",
      };
      let dbSyncWarning = null;

      try {
        res = await submitAnswers({ answers: formatted, topic: quizTopicContext.title, studentId });
        reason = {
          reason: res.reason,
          focus_area: res.focus_area,
        };

        if (!reason.reason) {
          reason = await getMisconceptionReason(
            res.main_misconception,
            quizTopicContext.title
          );
        }
      } catch (submitErr) {
        dbSyncWarning = submitErr?.message || "Could not submit this attempt right now.";
      }

      const questionFeedback = Array.isArray(res?.question_feedback) ? res.question_feedback : [];
      const questionFeedbackById = new Map(
        questionFeedback
          .filter((item) => item?.question_id !== undefined && item?.question_id !== null)
          .map((item) => [String(item.question_id), item])
      );

      const mainMisconception = res?.main_misconception || "none";
      const misconceptionExplanation = res?.misconception_explanation || null;

      const detailedResults = questions.map((q, idx) => {
        const selectedIndex = answers[q._key];
        const correctIndex = q.correct;
        const isCorrect = selectedIndex === correctIndex;
        const questionId = String(q.id ?? q._key);

        const matchedFeedback = questionFeedbackById.get(questionId);
        const localMisconceptionTag = !isCorrect
          ? ((q.misconception_map || {})[String(selectedIndex)]
            || (q.misconception_map || {})[selectedIndex]
            || null)
          : null;
        const focusArea = matchedFeedback?.focus_area || localMisconceptionTag || null;

        const selectedFeedback = matchedFeedback;

        return {
          index: idx + 1,
          questionText: q.question_text,
          options: Array.isArray(q.options) ? q.options : [],
          selectedIndex,
          correctIndex,
          isCorrect,
          reason: selectedFeedback?.reason || (isCorrect ? "Correct answer." : "Review this concept once more."),
          focusArea,
          svgComponent: selectedFeedback?.svg_component || null,
          svgVariant: selectedFeedback?.svg_variant || focusArea || null,
        };
      });

      setReport({
        total,
        correctCount,
        wrongCount: total - correctCount,
        accuracy: Math.round((correctCount / total) * 100),
        reason: reason.reason || "Let's review this concept and try again.",
        focusArea: reason.focus_area || "N/A",
        mainMisconception,
        misconceptionExplanation,
        svgComponent: res?.svg_component || null,
        svgVariant: res?.svg_variant || null,
        questionFeedback,
        detailedResults,
        dbSyncWarning: res?.db_sync_warning || dbSyncWarning,
      });
    } catch (err) {
      setError(err?.message || "Unable to process quiz results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const restartSameQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setReport(null);
    setError("");
    setActiveVisualByQuestion({});
  };

  const startMisconceptionQuiz = async () => {
    if (!report?.detailedResults?.length) {
      return;
    }

    const quizTopicContext = getQuizTopicContext(currentTopicId);
    const studentId = user?.id || user?.name || "guest-student";
    const wrongItems = report.detailedResults.filter((item) => !item.isCorrect);
    const misconceptionTags = [
      ...new Set(
        wrongItems
          .map((item) => String(item.focusArea || "").trim())
          .filter(Boolean)
      ),
    ];
    const wrongQuestionTexts = wrongItems
      .map((item) => String(item.questionText || "").trim())
      .filter(Boolean);

    if (!misconceptionTags.length) {
      setError("No misconception tags were found for remedial quiz generation.");
      return;
    }

    setLoadingRemedial(true);
    setError("");

    try {
      const data = await getMisconceptionQuiz({
        topic: quizTopicContext.title,
        studentId,
        misconceptionTags,
        wrongQuestionTexts,
        questionCount: Math.max(2, Math.min(wrongItems.length + 1, 6)),
      });

      const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
      const nextQuestions = shuffle(rawQuestions).map((q, idx) => ({
        ...q,
        options: Array.isArray(q?.options) ? q.options : [],
        _key: questionKey(q, idx),
      }));

      if (!nextQuestions.length) {
        setError("Could not generate misconception-focused quiz right now.");
        return;
      }

      setQuestions(nextQuestions);
      setAnswers({});
      setCurrentIndex(0);
      setReport(null);
      setActiveVisualByQuestion({});
      setQuizMode("misconception");
    } catch (err) {
      setError(err?.message || "Unable to start misconception quiz");
    } finally {
      setLoadingRemedial(false);
    }
  };

  if (loading) return <h2>Loading questions...</h2>;

  if (report) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Quiz Report</h1>
        <p style={{ fontWeight: 700, marginTop: "10px" }}>
          Score: {report.correctCount}/{report.total} ({report.accuracy}%)
        </p>
        <p>Correct: {report.correctCount}</p>
        <p>Incorrect: {report.wrongCount}</p>

        {report.misconceptionExplanation && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              borderRadius: "10px",
              background: "#e8fff2",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Misconception Explanation</h3>
            <p style={{ margin: 0 }}>{report.misconceptionExplanation}</p>
          </div>
        )}

        {report.mainMisconception && report.mainMisconception !== "none" && (
          <QuizVisualCorrection
            svgComponent={report.svgComponent}
            svgVariant={report.svgVariant}
            misconceptionTag={report.mainMisconception}
            explanation={report.misconceptionExplanation || report.reason}
          />
        )}

        <div style={{ marginTop: "18px", padding: "14px", border: "1px solid #dbe4ff", borderRadius: "10px", background: "#f6f9ff" }}>
          <h3 style={{ marginTop: 0 }}>Personalized Feedback</h3>
          <p style={{ marginBottom: "8px" }}>{report.reason}</p>
          <p style={{ margin: 0 }}>
            <strong>Focus Area:</strong> {report.focusArea}
          </p>
        </div>

        {report.dbSyncWarning && (
          <div style={{ marginTop: "12px", padding: "10px 12px", border: "1px solid #f5c2c7", borderRadius: "8px", background: "#fff5f5", color: "#842029" }}>
            Could not sync this attempt to database right now. Quiz result is shown locally.
          </div>
        )}

        {!!report.detailedResults?.length && (
          <div style={{ marginTop: "14px", padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#ffffff" }}>
            <h3 style={{ marginTop: 0 }}>Answer Review</h3>
            <p style={{ marginTop: 0, color: "#4b5563" }}>
              Green = correct option, Red = your wrong selected option.
            </p>

            {report.detailedResults.map((item, idx) => (
              <div
                key={`review-${idx}`}
                style={{
                  marginTop: idx === 0 ? 0 : "12px",
                  paddingTop: idx === 0 ? 0 : "12px",
                  borderTop: idx === 0 ? "none" : "1px solid #eef2ff",
                }}
              >
                <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
                  Question {item.index}
                </p>
                <p style={{ margin: "0 0 8px", color: "#111827" }}>{item.questionText}</p>

                <div style={{ display: "grid", gap: "6px" }}>
                  {item.options.map((opt, optionIdx) => {
                    const isSelected = optionIdx === item.selectedIndex;
                    const isCorrectOption = optionIdx === item.correctIndex;

                    let background = "#f9fafb";
                    let border = "1px solid #e5e7eb";
                    let color = "#111827";

                    if (isCorrectOption) {
                      background = "#ecfdf3";
                      border = "1px solid #86efac";
                      color = "#166534";
                    }

                    if (isSelected && !isCorrectOption) {
                      background = "#fef2f2";
                      border = "1px solid #fca5a5";
                      color = "#991b1b";
                    }

                    return (
                      <div
                        key={`opt-${item.index}-${optionIdx}`}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border,
                          background,
                          color,
                          fontWeight: isSelected || isCorrectOption ? 700 : 500,
                        }}
                      >
                        {opt}
                        {isSelected ? " (Your answer)" : ""}
                        {isCorrectOption ? " (Correct)" : ""}
                      </div>
                    );
                  })}
                </div>

                {!item.isCorrect && (
                  <div style={{ marginTop: "8px" }}>
                    <p style={{ margin: "0 0 8px", color: "#374151" }}>
                      <strong>Why wrong:</strong> {item.reason}
                      {item.focusArea ? ` | Focus: ${item.focusArea}` : ""}
                    </p>
                    <button
                      onClick={() => {
                        setActiveVisualByQuestion((prev) => ({
                          ...prev,
                          [item.index]: !prev[item.index],
                        }));
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        border: "1px solid #c7d2fe",
                        background: "#eef2ff",
                        color: "#3730a3",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {activeVisualByQuestion[item.index] ? "Hide Visual Fix" : "See Visual Fix"}
                    </button>

                    {activeVisualByQuestion[item.index] && (
                      <QuizVisualCorrection
                        svgComponent={
                          item.svgComponent
                          || resolveVisualTemplateByTag(item.focusArea)
                          || report.svgComponent
                          || "ReflectionMisconceptionFeedback"
                        }
                        svgVariant={item.svgVariant || item.focusArea || report.mainMisconception}
                        misconceptionTag={item.focusArea || report.mainMisconception}
                        explanation={item.reason || report.misconceptionExplanation || report.reason}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!!report.questionFeedback?.length && (
          <div style={{ marginTop: "14px", padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#ffffff" }}>
            <h3 style={{ marginTop: 0 }}>Per-Question Feedback</h3>
            {report.questionFeedback.map((item, idx) => (
              <div key={`${item.question_id || "q"}-${idx}`} style={{ marginTop: idx === 0 ? 0 : "10px", paddingTop: idx === 0 ? 0 : "10px", borderTop: idx === 0 ? "none" : "1px solid #eef2ff" }}>
                <p style={{ margin: "0 0 6px", fontWeight: 700 }}>Question {idx + 1}</p>
                <p style={{ margin: "0 0 6px", color: "#111827" }}>{item.question_text}</p>
                <p style={{ margin: "0 0 6px" }}>{item.reason}</p>
                <p style={{ margin: 0 }}><strong>Focus:</strong> {item.focus_area}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={restartSameQuiz} style={{ padding: "10px 16px", cursor: "pointer" }}>
            Retry Same Quiz
          </button>
          {report.wrongCount > 0 && (
            <button
              onClick={startMisconceptionQuiz}
              disabled={loadingRemedial}
              style={{
                padding: "10px 16px",
                cursor: loadingRemedial ? "not-allowed" : "pointer",
                border: "1px solid #c7d2fe",
                borderRadius: "8px",
                background: loadingRemedial ? "#e5e7eb" : "#eef2ff",
                color: "#3730a3",
                fontWeight: 700,
              }}
            >
              {loadingRemedial ? "Preparing Misconception Quiz..." : "Take Misconception Quiz"}
            </button>
          )}
          <button onClick={loadQuestions} style={{ padding: "10px 16px", cursor: "pointer" }}>
            Start New Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>AI Tutor Quiz</h1>
        {error ? (
          <p style={{ color: "#b00020", fontWeight: 600 }}>{error}</p>
        ) : (
          <p>No questions available right now.</p>
        )}
        <button onClick={loadQuestions} style={{ padding: "10px 16px", cursor: "pointer" }}>
          Reload Questions
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedForCurrent = answers[currentQuestion._key];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{quizMode === "misconception" ? "🎯 Misconception Quiz" : "🧠 AI Tutor Quiz"}</h1>
      {quizMode === "misconception" && (
        <p style={{ marginTop: "4px", color: "#374151", fontWeight: 600 }}>
          This round targets only the misconceptions from your previous attempt.
        </p>
      )}
      <p style={{ color: "#4b587c", fontWeight: 600 }}>
        Question {currentIndex + 1} of {questions.length}
      </p>

      {error && (
        <p style={{ color: "#b00020", fontWeight: 600 }}>
          {error}
        </p>
      )}

      <QuizCard
        key={currentQuestion._key}
        question={currentQuestion}
        index={currentIndex}
        questionKey={currentQuestion._key}
        selected={selectedForCurrent}
        onSelect={handleSelect}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{
            padding: "10px 16px",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            background: currentIndex === 0 ? "#f3f4f6" : "#ffffff",
            fontWeight: 600,
          }}
        >
          Previous
        </button>

        {!isLast ? (
          <button
            onClick={handleNext}
            disabled={selectedForCurrent === undefined}
            style={{
              padding: "10px 16px",
              cursor: selectedForCurrent === undefined ? "not-allowed" : "pointer",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              background: selectedForCurrent === undefined ? "#f3f4f6" : "#eef2ff",
              fontWeight: 600,
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selectedForCurrent === undefined || submitting}
            style={{
              padding: "10px 20px",
              cursor:
                selectedForCurrent === undefined || submitting
                  ? "not-allowed"
                  : "pointer",
              borderRadius: "999px",
              border: "none",
              fontWeight: 700,
              color: "#ffffff",
              background:
                selectedForCurrent === undefined
                  ? "#9ca3af"
                  : submitting
                  ? "linear-gradient(90deg, #4b5563, #6b7280)"
                  : "linear-gradient(90deg, #4f46e5, #6366f1)",
              boxShadow:
                selectedForCurrent === undefined || submitting
                  ? "0 4px 10px rgba(156, 163, 175, 0.5)"
                  : "0 10px 20px rgba(79, 70, 229, 0.4)",
              transform: submitting ? "scale(0.97)" : "scale(1)",
              transition: "all 0.18s ease-out",
            }}
          >
            {submitting ? "Checking answers..." : "Finish Quiz"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;