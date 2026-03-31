import React, { useEffect, useState } from "react";
import QuizCard from "./QuizCard";
import {
  getMisconceptionReason,
  getQuestions,
  submitAnswers,
} from "../../services/api";
import { useSessionStore } from "../../state/sessionStore";


const QUESTION_HISTORY_KEY = "apt_seen_question_ids";


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


const mapTopicIdToQuestionTopic = (topicId) => {
  if (!topicId) return null;
  const id = String(topicId).toLowerCase();
  if (id.includes("reflection") || id.includes("mirror")) return "reflection";
  if (id.includes("refraction")) return "refraction";
  return null;
};


const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const QuizPage = () => {
  const currentTopicId = useSessionStore((s) => s.currentTopicId);
  const user = useSessionStore((s) => s.user);
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
    const activeTopic = mapTopicIdToQuestionTopic(currentTopicId) || "reflection";
    const studentId = user?.id || user?.name || "guest-student";

    try {
      let data = await getQuestions({
        askedQuestionIds: seenIds,
        limit: 5,
        topic: activeTopic,
        studentId,
      });
      if (!data.questions || data.questions.length === 0) {
        saveQuestionHistory([]);
        data = await getQuestions({
          askedQuestionIds: [],
          limit: 5,
          topic: activeTopic,
          studentId,
        });
      }

      const nextQuestions = shuffle(data.questions || []);
      setQuestions(nextQuestions);

      const nextIds = [
        ...new Set([...seenIds, ...nextQuestions.map(q => q.id)])
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
    const unanswered = questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      const activeTopic = mapTopicIdToQuestionTopic(currentTopicId) || "reflection";
      const studentId = user?.id || user?.name || "guest-student";

      const formatted = questions.map(q => ({
        question_id: q.id,
        selected: answers[q.id],
        correct: q.correct,
        misconception_map: q.misconception_map || {},
        topic: q.topic || activeTopic,
      }));

      const res = await submitAnswers({ answers: formatted, topic: activeTopic, studentId });

      const reason = await getMisconceptionReason(
        res.main_misconception,
        activeTopic
      );

      const total = questions.length;
      const correctCount = questions.reduce((count, q) => {
        return count + (answers[q.id] === q.correct ? 1 : 0);
      }, 0);

      setReport({
        total,
        correctCount,
        wrongCount: total - correctCount,
        accuracy: Math.round((correctCount / total) * 100),
        reason: reason.reason || "Let's review this concept and try again.",
        focusArea: reason.focus_area || "N/A",
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
  const selectedForCurrent = answers[currentQuestion.id];
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
        key={currentQuestion.id}
        question={currentQuestion}
        index={currentIndex}
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