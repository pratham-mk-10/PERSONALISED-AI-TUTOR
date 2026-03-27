const MCQQuestion = ({ question, index, answers, setAnswers }) => {
  const handleChange = (opt) => {
    setAnswers({
      ...answers,
      [index]: opt,
    });

    sessionStorage.setItem("answers", JSON.stringify({
      ...answers,
      [index]: opt,
    }));
  };

  return (
    <div className="mb-4">
      <p>{index + 1}. {question.question_text}</p>

      {question.options.map((opt, i) => (
        <label key={i} className="block">
          <input
            type="radio"
            name={`q-${index}`}
            checked={answers[index] === opt}
            onChange={() => handleChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
};

export default MCQQuestion;