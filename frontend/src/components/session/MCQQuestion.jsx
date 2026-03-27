const MCQQuestion = ({ question, index, answers, setAnswers }) => {
  const handleChange = (option) => {
    setAnswers({
      ...answers,
      [index]: option,
    });
  };

  return (
    <div className="mb-4">
      <p className="font-semibold">
        {index + 1}. {question.question_text}
      </p>

      {question.options.map((opt, i) => (
        <div key={i}>
          <label>
            <input
              type="radio"
              name={`q-${index}`}
              value={opt}
              checked={answers[index] === opt}
              onChange={() => handleChange(opt)}
            />
            {opt}
          </label>
        </div>
      ))}
    </div>
  );
};

export default MCQQuestion;