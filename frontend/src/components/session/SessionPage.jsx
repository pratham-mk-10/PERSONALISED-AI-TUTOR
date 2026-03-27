import { useEffect, useState } from "react";
import { startSession, submitQuiz, getContent, adaptDecision } from "../../services/api";
import SVGViewer from "./SVGViewer";
import QuizPanel from "./QuizPanel";

const SessionPage = () => {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [svg, setSvg] = useState("");
  const [explanation, setExplanation] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  // Start session
  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    setLoading(true);
    try {
      const res = await startSession("reflection");
      setSession(res.data);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Submit answers
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitQuiz({
        answers,
        sessionId: session?.sessionId,
      });

      const { passed, misconception_tag } = res.data;

      // Get content after assessment
      const contentRes = await getContent({
        topic: "reflection",
        misconception_tag,
        attempt: 1,
      });

      setSvg(contentRes.data.svg_code);
      setExplanation(contentRes.data.explanation);

      // Adaptation decision
      const adaptRes = await adaptDecision({
        passed,
        misconception_tag,
      });

      console.log("Next action:", adaptRes.data);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">

      {/* LEFT: CONTENT */}
      <div className="w-1/2 p-4 border-r">
        <SVGViewer svg={svg} />
        <p className="mt-4">{explanation}</p>
      </div>

      {/* RIGHT: QUIZ */}
      <div className="w-1/2 p-4">
        <QuizPanel
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
        />
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-blue-500 text-white"
        >
          Submit
        </button>
      </div>

    </div>
  );
};

export default SessionPage;