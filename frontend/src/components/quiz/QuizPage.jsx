import React, { useEffect, useState } from "react";
import QuizCard from "./QuizCard";
import {
  getMisconceptionReason,
  getGeneratedQuestions,
  submitAnswers,
} from "../../services/api";
import { useSessionStore } from "../../state/sessionStore";


const QUESTION_HISTORY_KEY = "apt_seen_question_ids";

const TOPIC_CONTEXTS = {
  "laws-reflection": {
    title: "Laws of Reflection",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Strictly limit to ONLY the two laws of reflection: (1) angle of incidence equals angle of reflection (i = r), and (2) incident ray, reflected ray, and normal lie in the same plane. Do NOT include image formation by mirrors, spherical mirrors, mirror formula, magnification, refraction, lenses, or numerical problems.",
  },
  "First-law-of-reflection": {
    title: "First Law of Reflection",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Strictly limit to ONLY the first law of reflection: angle of incidence equals angle of reflection (i = r). Do NOT include second law details, image formation by mirrors, spherical mirrors, mirror formula, magnification, refraction, lenses, or numerical problems.",
  },
  "Second-law-of-reflection": {
    title: "Second Law of Reflection",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Strictly limit to ONLY the second law of reflection: incident ray, reflected ray, and normal lie in the same plane. Do NOT include first law computations, image formation by mirrors, spherical mirrors, mirror formula, magnification, refraction, lenses, or numerical problems.",
  },
  "plane-mirror": {
    title: "Plane Mirror Basics",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to plane mirror image characteristics, laws of reflection, and related Class 10 NCERT ideas.",
  },
  "refraction-intro": {
    title: "Introduction to Refraction",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to refraction, refractive index, optical density, Snell's law, and rectangular glass slab refraction.",
  },
};

const DEFAULT_TOPIC_CONTEXT = TOPIC_CONTEXTS["laws-reflection"];


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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [report, setReport] = useState(null);

  // 🔹 Load questions
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    setCurrentIndex(0);

    const seenIds = loadQuestionHistory();
    const quizTopicContext = getQuizTopicContext(currentTopicId);
    const personalization = getPersonalization(currentTopicId, progress);
    const studentId = user?.id || user?.name || "guest-student";

    try {
      const data = await getGeneratedQuestions({
        topic: quizTopicContext.title,
        difficulty: personalization.difficulty,
        syllabusScope: quizTopicContext.syllabusScope,
        tutorContext: personalization.tutorContext,
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

    try {
      const quizTopicContext = getQuizTopicContext(currentTopicId);
      const studentId = user?.id || user?.name || "guest-student";

      const formatted = questions.map(q => ({
        question_id: q.id,
        question_text: q.question_text,
        selected: answers[q._key],
        correct: q.correct,
        difficulty: q.difficulty,
        misconception_map: q.misconception_map || {},
        topic: q.topic || quizTopicContext.title,
      }));

      const res = await submitAnswers({ answers: formatted, topic: quizTopicContext.title, studentId });
      let reason = {
        reason: res.reason,
        focus_area: res.focus_area,
      };

      if (!reason.reason) {
        reason = await getMisconceptionReason(
          res.main_misconception,
          quizTopicContext.title
        );
      }

      const total = questions.length;
      const correctCount = questions.reduce((count, q) => {
        return count + (answers[q._key] === q.correct ? 1 : 0);
      }, 0);

      const detailedResults = questions.map((q, idx) => {
        const selectedIndex = answers[q._key];
        const correctIndex = q.correct;
        const isCorrect = selectedIndex === correctIndex;

        const matchedFeedback = (Array.isArray(res.question_feedback) ? res.question_feedback : []).find(
          (item) => item?.question_id !== undefined && item?.question_id === q.id
        );

        return {
          index: idx + 1,
          questionText: q.question_text,
          options: Array.isArray(q.options) ? q.options : [],
          selectedIndex,
          correctIndex,
          isCorrect,
          reason: matchedFeedback?.reason || (isCorrect ? "Correct answer." : "Review this concept once more."),
          focusArea: matchedFeedback?.focus_area || null,
        };
      });

      setReport({
        total,
        correctCount,
        wrongCount: total - correctCount,
        accuracy: Math.round((correctCount / total) * 100),
        reason: reason.reason || "Let's review this concept and try again.",
        focusArea: reason.focus_area || "N/A",
        questionFeedback: Array.isArray(res.question_feedback) ? res.question_feedback : [],
        detailedResults,
        dbSyncWarning: res.db_sync_warning || null,
      });
    } catch (err) {
      setError(err?.message || "Unable to submit answers");
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
                  <p style={{ margin: "8px 0 0", color: "#374151" }}>
                    <strong>Why wrong:</strong> {item.reason}
                    {item.focusArea ? ` | Focus: ${item.focusArea}` : ""}
                  </p>
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
      <h1>🧠 AI Tutor Quiz</h1>
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
          style={{ padding: "10px 16px", cursor: "pointer" }}
        >
          Previous
        </button>

        {!isLast ? (
          <button
            onClick={handleNext}
            disabled={selectedForCurrent === undefined}
            style={{ padding: "10px 16px", cursor: "pointer" }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            style={{ padding: "10px 16px", cursor: "pointer" }}
          >
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;