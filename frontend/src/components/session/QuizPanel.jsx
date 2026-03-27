import MCQQuestion from "./MCQQuestion";

const QuizPanel = ({ questions, answers, setAnswers }) => {
  return (
    <div>
      {questions.map((q, index) => (
        <MCQQuestion
          key={index}
          question={q}
          index={index}
          answers={answers}
          setAnswers={setAnswers}
        />
      ))}
    </div>
  );
};

export default QuizPanel;