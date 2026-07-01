import React, { useState, useEffect, useRef } from "react";
import QuizCard from "../components/quiz/QuizCard";
import QuizVisualCorrection from "../components/quiz/QuizVisualCorrection";
import { getDescriptiveQuestions, evalDescriptiveAnswer, getMisconceptionReason } from "../services/api";

const TOPIC_CONTEXTS = {
  "laws-reflection": { title: "Laws of Reflection", dbKey: "laws_of_reflection" },
  "plane-mirror": { title: "Plane Mirror Basics", dbKey: "plane_mirror" },
  "spherical-mirror-basics": { title: "Spherical Mirror Basics", dbKey: "spherical_mirror_basics" },
  "spherical-mirror-rules": { title: "Ray Tracing Rules of Spherical Mirrors", dbKey: "spherical_mirror_rules" },
  "spherical-mirror-image-formation": { title: "Image Formation by Spherical Mirrors", dbKey: "spherical_mirror_image_formation" },
  "refraction-intro": { title: "Introduction to Refraction", dbKey: "refraction" }
};

const resolveVisualTemplateByTag = (tag) => {
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
  return TAG_TO_VISUAL_TEMPLATE[tag] || null;
};

const renderFormattedText = (text) => {
  if (!text) return "";
  const parts = String(text).split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} style={{ color: "#F8FAFC" }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const DescriptiveSandbox = () => {
  const [selectedTopic, setSelectedTopic] = useState("laws-reflection");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [openTraceIndex, setOpenTraceIndex] = useState(null);
  const [currentPlayingKey, setCurrentPlayingKey] = useState(null);
  const [loadingTts, setLoadingTts] = useState(null);
  const audioInstanceRef = useRef(null);

  useEffect(() => {
    loadSandboxQuestions();
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
    };
  }, [selectedTopic]);

  const loadSandboxQuestions = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    setCurrentIndex(0);
    setAnswers({});
    setOpenTraceIndex(null);

    try {
      const topicContext = TOPIC_CONTEXTS[selectedTopic];
      const data = await getDescriptiveQuestions(topicContext.dbKey);
      const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
      if (!rawQuestions.length) {
        throw new Error(`No descriptive questions found in database for topic key '${topicContext.dbKey}'`);
      }
      
      const nextQuestions = rawQuestions.map((q, idx) => ({
        ...q,
        _key: `sandbox-desc-${q.id ?? idx}`,
        isDescriptive: true,
      }));
      setQuestions(nextQuestions);
    } catch (err) {
      setQuestions([]);
      setError(err?.message || "Failed to load questions from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = (qid, text) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: text
    }));
  };

  const handlePlaySpeech = (text, key) => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current = null;
      if (currentPlayingKey === key || loadingTts === key) {
        setCurrentPlayingKey(null);
        setLoadingTts(null);
        return;
      }
    }

    const cleanText = text
      .replace(/\*\*|__/g, "")
      .replace(/[*#-]/g, "")
      .trim();

    setLoadingTts(key);
    const url = `http://localhost:8000/api/tts?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(url);
    audioInstanceRef.current = audio;

    audio.oncanplaythrough = () => {
      setLoadingTts(null);
      setCurrentPlayingKey(key);
      audio.play().catch(e => {
        console.error("TTS playback failed:", e);
        setCurrentPlayingKey(null);
      });
    };

    audio.onerror = () => {
      setLoadingTts(null);
      setCurrentPlayingKey(null);
      audioInstanceRef.current = null;
    };

    audio.onended = () => {
      setCurrentPlayingKey(null);
      audioInstanceRef.current = null;
    };
  };

  const handleSubmit = async () => {
    setError("");
    const unanswered = questions.filter(q => !answers[q._key] || !answers[q._key].trim());
    if (unanswered.length > 0) {
      setError("Please write answers for all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const studentId = "sandbox-tester-student";

      const evaluationPromises = questions.map(async (q) => {
        const studentAnswer = answers[q._key];
        const res = await evalDescriptiveAnswer({
          studentId,
          questionId: q.id,
          studentAnswer,
        });
        return {
          questionId: q.id,
          questionText: q.question_text,
          studentAnswer,
          rubricItems: q.rubric_items || [],
          evaluation: res.evaluation || res,
        };
      });

      const results = await Promise.all(evaluationPromises);

      let totalUnderstanding = 0;
      let totalCompleteness = 0;
      let totalKeywords = 0;
      let totalWeighted = 0;
      let tagCounts = {};

      results.forEach(r => {
        const scores = r.evaluation.scores || {};
        const und = scores.understanding ?? 0;
        const comp = scores.completeness ?? 0;
        const kw = scores.keywords ?? 0;

        totalUnderstanding += und;
        totalCompleteness += comp;
        totalKeywords += kw;

        const weighted = (und * 0.70) + (comp * 0.25) + (kw * 0.05);
        totalWeighted += weighted;

        const tag = r.evaluation.misconception_tag;
        if (tag && tag !== "none" && tag !== "NOVEL_UNTAGGED_ERROR") {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });

      const avgUnderstanding = Math.round((totalUnderstanding / questions.length) * 10) / 10;
      const avgCompleteness = Math.round((totalCompleteness / questions.length) * 10) / 10;
      const avgKeywords = Math.round((totalKeywords / questions.length) * 10) / 10;
      const avgWeighted = Math.round((totalWeighted / questions.length) * 10) / 10;

      let mainMisconception = "none";
      let maxCount = 0;
      Object.entries(tagCounts).forEach(([tag, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mainMisconception = tag;
        }
      });

      let misconceptionExplanation = null;
      if (mainMisconception !== "none") {
        try {
          const conceptReason = await getMisconceptionReason(mainMisconception, TOPIC_CONTEXTS[selectedTopic].title);
          misconceptionExplanation = conceptReason.reason;
        } catch {
          misconceptionExplanation = `Identified misconception: ${mainMisconception}`;
        }
      }

      setReport({
        type: "descriptive",
        total: questions.length,
        avgUnderstanding,
        avgCompleteness,
        avgKeywords,
        avgWeighted,
        mainMisconception,
        misconceptionExplanation,
        detailedResults: results.map((r, idx) => ({
          index: idx + 1,
          questionText: r.questionText,
          studentAnswer: r.studentAnswer,
          rubricItems: r.rubricItems,
          scores: r.evaluation.scores || {},
          feedback: r.evaluation.feedback || "Good effort.",
          reasoningTrace: r.evaluation.reasoning_trace || [],
          contradictedSpan: r.evaluation.contradicted_span,
          misconceptionTag: r.evaluation.misconception_tag,
        })),
      });
    } catch (err) {
      setError(err?.message || "Evaluation API request failed.");
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
    setOpenTraceIndex(null);
  };

  // --- RENDERING VIEWS ---

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "rgba(30, 41, 59, 0.4)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 style={{ color: "#60A5FA", marginBottom: "16px" }}>Loading Database Descriptive Questions...</h3>
        <div style={{ width: "36px", height: "36px", border: "4px solid rgba(59, 130, 246, 0.2)", borderTop: "4px solid #3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- REPORT VIEW (MATCHES REAL QUIZPAGE) ---
  if (report) {
    return (
      <div style={{ padding: "24px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 style={{ color: "#F8FAFC", marginBottom: "4px" }}>Sandbox Quiz Report (Descriptive)</h2>
        <p style={{ color: "#9CA3AF", marginTop: 0, fontSize: "14px" }}>Topic: {TOPIC_CONTEXTS[selectedTopic].title}</p>

        {/* Meters */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginTop: "24px",
          marginBottom: "24px"
        }}>
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Weighted Final Score</span>
            <h2 style={{ fontSize: "28px", color: "#10B981", margin: "8px 0" }}>{report.avgWeighted} <span style={{ fontSize: "16px", color: "#9CA3AF" }}>/ 10</span></h2>
            <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${report.avgWeighted * 10}%`, background: "#10B981" }}></div>
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Understanding & Correctness (70%)</span>
            <h2 style={{ fontSize: "24px", color: "#60A5FA", margin: "8px 0" }}>{report.avgUnderstanding} <span style={{ fontSize: "14px", color: "#9CA3AF" }}>/ 10</span></h2>
            <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${report.avgUnderstanding * 10}%`, background: "#60A5FA" }}></div>
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Completeness & Rubric (25%)</span>
            <h2 style={{ fontSize: "24px", color: "#A78BFA", margin: "8px 0" }}>{report.avgCompleteness} <span style={{ fontSize: "14px", color: "#9CA3AF" }}>/ 10</span></h2>
            <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${report.avgCompleteness * 10}%`, background: "#A78BFA" }}></div>
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Terminology & Keywords (5%)</span>
            <h2 style={{ fontSize: "24px", color: "#FBBF24", margin: "8px 0" }}>{report.avgKeywords} <span style={{ fontSize: "14px", color: "#9CA3AF" }}>/ 10</span></h2>
            <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${report.avgKeywords * 10}%`, background: "#FBBF24" }}></div>
            </div>
          </div>
        </div>

        {report.misconceptionExplanation && (
          <div style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            marginBottom: "24px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ marginTop: 0, color: "#34D399", fontSize: "16px" }}>Concept Summary Nudge</h3>
              <button
                onClick={() => handlePlaySpeech(report.misconceptionExplanation, "misconception")}
                style={currentPlayingKey === "misconception" ? styles.audioBtnActive : loadingTts === "misconception" ? styles.audioBtnLoading : styles.audioBtn}
                disabled={loadingTts !== null && loadingTts !== "misconception"}
              >
                {currentPlayingKey === "misconception" ? "⏸ Stop Audio" : loadingTts === "misconception" ? "⏳ Loading..." : "🔊 Listen Feedback"}
              </button>
            </div>
            <p style={{ margin: 0, color: "#D1D5DB", lineHeight: 1.6 }}>{renderFormattedText(report.misconceptionExplanation)}</p>
          </div>
        )}

        {report.mainMisconception && report.mainMisconception !== "none" && (
          <QuizVisualCorrection
            svgComponent={resolveVisualTemplateByTag(report.mainMisconception) || "SphericalMirrorMisconceptionFeedback"}
            svgVariant={report.mainMisconception}
            misconceptionTag={report.mainMisconception}
            explanation={report.misconceptionExplanation || "Let's review this concept."}
          />
        )}

        {/* Detailed Breakdown */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ color: "#F8FAFC", marginBottom: "16px" }}>Detailed Responses Review</h3>
          {report.detailedResults.map((item, idx) => {
            const itemWeighted = Math.round(((item.scores.understanding * 0.70) + (item.scores.completeness * 0.25) + (item.scores.keywords * 0.05)) * 10) / 10;
            const isTraceOpen = openTraceIndex === idx;

            return (
              <div key={idx} style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(30, 41, 59, 0.3)",
                border: "1px solid rgba(255,255,255,0.04)",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <span style={{ color: "#60A5FA", fontWeight: 700, fontSize: "14px" }}>Question {item.index}</span>
                    <h4 style={{ color: "#F8FAFC", margin: "6px 0 12px 0", fontSize: "16px" }}>{item.questionText}</h4>
                  </div>
                  <div style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <span style={{ color: "#34D399", fontWeight: "bold" }}>Score: {itemWeighted} / 10</span>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <strong style={{ color: "#9CA3AF", fontSize: "13px" }}>Your Written Answer:</strong>
                  <p style={{
                    margin: "6px 0",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.2)",
                    color: "#E5E7EB",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    borderLeft: "4px solid #3B82F6"
                  }}>
                    "{item.studentAnswer}"
                  </p>
                </div>

                {item.contradictedSpan && (
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#FCA5A5",
                    fontSize: "13px",
                    marginBottom: "16px"
                  }}>
                    <strong>Flagged Concept Error:</strong> "{item.contradictedSpan}"
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#9CA3AF", fontSize: "13px" }}>AI Tutor Feedback:</strong>
                    <button
                      onClick={() => handlePlaySpeech(item.feedback, `feedback-${idx}`)}
                      style={currentPlayingKey === `feedback-${idx}` ? styles.audioBtnActive : loadingTts === `feedback-${idx}` ? styles.audioBtnLoading : styles.audioBtn}
                      disabled={loadingTts !== null && loadingTts !== `feedback-${idx}`}
                    >
                      {currentPlayingKey === `feedback-${idx}` ? "⏸ Stop Audio" : loadingTts === `feedback-${idx}` ? "⏳ Loading..." : "🔊 Play"}
                    </button>
                  </div>
                  <p style={{ margin: "6px 0", color: "#D1D5DB", fontSize: "14px", lineHeight: "1.6" }}>
                    {renderFormattedText(item.feedback)}
                  </p>
                </div>

                {item.reasoningTrace && item.reasoningTrace.length > 0 && (
                  <div>
                    <button
                      onClick={() => setOpenTraceIndex(isTraceOpen ? null : idx)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)",
                        color: "#9CA3AF",
                        border: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600
                      }}
                    >
                      {isTraceOpen ? "Hide AI Grading Steps" : "Show AI Grading Steps (CoT)"}
                    </button>
                    {isTraceOpen && (
                      <div style={{
                        marginTop: "12px",
                        padding: "14px",
                        borderRadius: "8px",
                        background: "rgba(15, 23, 42, 0.4)",
                        border: "1px solid rgba(255,255,255,0.02)"
                      }}>
                        <h5 style={{ margin: "0 0 8px 0", color: "#60A5FA", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Chain of Thought Trace</h5>
                        <ul style={{ margin: 0, paddingLeft: "18px", color: "#9CA3AF", fontSize: "13px", lineHeight: "1.6" }}>
                          {item.reasoningTrace.map((step, sIdx) => (
                            <li key={sIdx} style={{ marginBottom: "6px" }}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button onClick={restartSameQuiz} style={{
            padding: "12px 24px",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
            color: "#FFFFFF",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
          }}>
            Practice Again
          </button>
          <button onClick={loadSandboxQuestions} style={{
            padding: "12px 24px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "#D1D5DB",
            fontWeight: "bold",
            cursor: "pointer"
          }}>
            Reload Questions
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ QUESTIONS VIEW ---
  const currentQuestion = questions[currentIndex] || null;
  const selectedForCurrent = currentQuestion ? answers[currentQuestion._key] : undefined;
  const isLast = questions.length > 0 ? currentIndex === questions.length - 1 : false;

  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      margin: "0 auto 40px auto",
      padding: "24px",
      borderRadius: "16px",
      background: "#1E293B",
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
      position: "relative",
      minHeight: "300px",
      color: "white"
    }}>
      {submitting && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11, 15, 25, 0.8)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "12px", backdropFilter: "blur(6px)" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid rgba(16, 185, 129, 0.2)", borderTop: "4px solid #10B981", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <h2 style={{ color: "#34D399", marginTop: "24px", marginBottom: "8px" }}>Evaluating your answers...</h2>
          <p style={{ color: "#D1D5DB", textAlign: "center", maxWidth: "350px", lineHeight: "1.6" }}>
            The AI is analyzing your conceptual understanding to generate personalized feedback.
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ color: "#10B981", margin: 0, fontWeight: "bold" }}>Descriptive Quiz Testing Sandbox</h2>
        
        {/* Topic filter dropdown */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            outline: "none",
            fontSize: "13px"
          }}
        >
          {Object.entries(TOPIC_CONTEXTS).map(([key, context]) => (
            <option key={key} value={key}>{context.title}</option>
          ))}
        </select>
      </div>

      {!questions.length ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <p style={{ color: "#9CA3AF" }}>No questions loaded for this topic yet.</p>
          <button onClick={loadSandboxQuestions} style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "8px", border: "none", background: "#3B82F6", color: "#fff", fontWeight: "bold" }}>
            Reload Questions
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: "#94A3B8", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
            Question {currentIndex + 1} of {questions.length}
          </p>

          {error && (
            <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: "16px" }}>{error}</p>
          )}

          <QuizCard
            key={currentQuestion?._key || currentIndex}
            question={currentQuestion}
            index={currentIndex}
            questionKey={currentQuestion?._key}
            isDescriptive={true}
            textValue={currentQuestion ? (answers[currentQuestion._key] || "") : ""}
            onChangeText={handleChangeText}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{
                padding: "12px 24px",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.02)",
                background: currentIndex === 0 ? "rgba(255,255,255,0.02)" : "rgba(30, 41, 59, 0.8)",
                color: currentIndex === 0 ? "#6B7280" : "#F8FAFC",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Previous
            </button>

            {!isLast ? (
              <button
                onClick={handleNext}
                disabled={!selectedForCurrent || !selectedForCurrent.trim()}
                style={{
                  padding: "12px 24px",
                  cursor: (!selectedForCurrent || !selectedForCurrent.trim()) ? "not-allowed" : "pointer",
                  borderRadius: "999px",
                  border: "none",
                  background: (!selectedForCurrent || !selectedForCurrent.trim()) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                  color: (!selectedForCurrent || !selectedForCurrent.trim()) ? "#6B7280" : "#FFFFFF",
                  fontWeight: 600,
                  boxShadow: (!selectedForCurrent || !selectedForCurrent.trim()) ? "none" : "0 4px 14px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.2s"
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={(!selectedForCurrent || !selectedForCurrent.trim()) || submitting}
                style={{
                  padding: "12px 24px",
                  cursor:
                    (!selectedForCurrent || !selectedForCurrent.trim()) || submitting
                      ? "not-allowed"
                      : "pointer",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: 700,
                  color: "#ffffff",
                  background:
                    (!selectedForCurrent || !selectedForCurrent.trim())
                      ? "#4b5563"
                      : submitting
                        ? "linear-gradient(90deg, #4b5563, #6b7280)"
                        : "linear-gradient(90deg, #10B981, #059669)",
                  boxShadow:
                    (!selectedForCurrent || !selectedForCurrent.trim()) || submitting
                      ? "none"
                      : "0 10px 20px rgba(16, 185, 129, 0.3)",
                  transform: submitting ? "scale(0.97)" : "scale(1)",
                  transition: "all 0.18s ease-out",
                }}
              >
                {submitting ? "Evaluating..." : "Finish Sandbox Quiz"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  audioBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #3B82F6",
    background: "#EFF6FF",
    color: "#1D4ED8",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  audioBtnActive: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #DC2626",
    background: "#FEF2F2",
    color: "#991B1B",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  audioBtnLoading: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #D1D5DB",
    background: "#F3F4F6",
    color: "#6B7280",
    cursor: "not-allowed",
    transition: "all 0.15s ease",
  }
};

export default DescriptiveSandbox;
