import { useEffect, useState } from "react";
import {
  startSession,
  submitQuiz,
  getContent,
  adaptDecision,
  getFeedback,
} from "../../services/api";

import SVGViewer from "./SVGViewer";
import QuizPanel from "./QuizPanel";

const SessionPage = () => {
  const [stage, setStage] = useState("diagnostic");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [svg, setSvg] = useState("");
  const [explanation, setExplanation] = useState("");

  const [feedbackSVG, setFeedbackSVG] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const [misTag, setMisTag] = useState(null);
  const [attempt, setAttempt] = useState(1);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    setLoading(true);
    const res = await startSession("reflection");

    setSessionId(res.data.sessionId);
    setQuestions(res.data.questions);
    setStage("diagnostic");

    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await submitQuiz({ sessionId, answers });
    const { passed, misconception_tag } = res.data;

    setMisTag(misconception_tag);

    const feedbackRes = await getFeedback(misconception_tag);
    setFeedbackSVG(feedbackRes.data.svg_overlay);

    setShowFeedback(true);
    setStage("feedback");

    setTimeout(async () => {
      setShowFeedback(false);

      const contentRes = await getContent({
        topic: "reflection",
        misconception_tag,
        attempt,
      });

      setSvg(contentRes.data.svg_code);
      setExplanation(contentRes.data.explanation);

      const adaptRes = await adaptDecision({
        passed,
        misconception_tag,
        attempt,
      });

      const action = adaptRes.data.next_action;

      if (action === "regenerate") {
        setAttempt((prev) => prev + 1);
        setStage("learning");
      }

      if (action === "next") {
        setAttempt(1);
        initSession();
      }

      if (action === "exit") {
        setStage("exit");
      }

      setLoading(false);
    }, 1200);
  };

  if (loading)
    return <div className="p-6 text-center">Loading...</div>;

  if (stage === "diagnostic" || stage === "quiz") {
    return (
      <QuizPanel
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        onSubmit={handleSubmit}
      />
    );
  }

  if (stage === "learning" || stage === "feedback") {
    return (
      <div className="flex h-screen">
        <div className="w-1/2 p-4 border-r">
          <SVGViewer
            svg={svg}
            feedbackSVG={feedbackSVG}
            showFeedback={showFeedback}
          />
          <p className="mt-4">{explanation}</p>
        </div>

        <div className="w-1/2 p-4 flex items-center justify-center">
          <button
            onClick={() => setStage("quiz")}
            className="px-6 py-3 bg-green-600 text-white rounded"
          >
            Take Quiz
          </button>
        </div>
      </div>
    );
  }

  if (stage === "exit") {
    return (
      <div className="p-6 text-center text-xl">
        Great effort! Try again later.
      </div>
    );
  }

  return null;
};

export default SessionPage;