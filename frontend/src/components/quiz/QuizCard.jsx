import React from "react";

const QuizCard = ({ question, questionKey, selected, onSelect }) => {
  return (
    <div style={{
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
      backgroundColor: "rgba(30, 41, 59, 0.4)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
    }}>
      <h3 style={{ marginTop: 0, color: "#F8FAFC", fontSize: "18px", lineHeight: "1.5" }}>
        {question.question_text}
      </h3>

      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <div
              key={i}
              onClick={() => onSelect(questionKey, i)}
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                cursor: "pointer",
                backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "#1E293B",
                border: isSelected ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.02)",
                color: isSelected ? "#60A5FA" : "#D1D5DB",
                fontWeight: isSelected ? 600 : 500,
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none"
              }}
            >
              <span style={{ marginRight: "12px", color: isSelected ? "#3B82F6" : "#6B7280", fontWeight: "bold" }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizCard;