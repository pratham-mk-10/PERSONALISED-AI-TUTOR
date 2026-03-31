import React from "react";

const QuizCard = ({ question, index, selected, onSelect }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "15px"
    }}>
      <h3>Q{index + 1}. {question.question_text}</h3>

      {question.options.map((opt, i) => (
        <div key={i} style={{ marginTop: "8px" }}>
          <label>
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={selected === i}
              onChange={() => onSelect(question.id, i)}
            />
            {" "}{opt}
          </label>
        </div>
      ))}
    </div>
  );
};

export default QuizCard;