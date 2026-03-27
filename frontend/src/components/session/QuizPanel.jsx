import MCQQuestion from "./MCQQuestion";

const QuizPanel = ({ questions, answers, setAnswers, onSubmit }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {questions.map((q, i) => (
        <MCQQuestion
          key={i}
          index={i}
          question={q}
          answers={answers}
          setAnswers={setAnswers}
        />
      ))}

      <button
        onClick={onSubmit}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default QuizPanel;