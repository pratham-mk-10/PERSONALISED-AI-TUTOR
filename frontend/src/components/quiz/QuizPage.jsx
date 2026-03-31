import React, { useEffect, useState } from "react";
import QuizCard from "./QuizCard";
import { getQuestions, submitAnswers } from "../../services/api";

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Load questions
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await getQuestions();
    setQuestions(data.questions || []);
    setAnswers({});
    setLoading(false);
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
    const formatted = questions.map(q => ({
      question_id: q.id,
      selected: answers[q.id],
      correct: q.correct,
      misconception_tags: q.misconception_tags
    }));

    const res = await submitAnswers(formatted);

    alert("Main misconception: " + res.main_misconception);

    setQuestions(res.questions || []);
    setAnswers({});
  };

  if (loading) return <h2>Loading questions...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🧠 AI Tutor Quiz</h1>

      {questions.map((q, i) => (
        <QuizCard
          key={q.id}
          question={q}
          index={i}
          selected={answers[q.id]}
          onSelect={handleSelect}
        />
      ))}

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginTop: "20px",
          cursor: "pointer"
        }}
      >
        Submit Answers
      </button>
    </div>
  );
};

export default QuizPage;