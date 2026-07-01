import React from "react";

const QuizCard = ({ question, questionKey, selected, onSelect, isDescriptive, onChangeText, textValue }) => {
  if (isDescriptive) {
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
        
        {question.rubric_items && Array.isArray(question.rubric_items) && (
          <div style={{ marginTop: "12px", padding: "14px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#60A5FA", fontSize: "14px", fontWeight: 700 }}>Grading Rubric Focus:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#9CA3AF", fontSize: "13px", lineHeight: "1.5" }}>
              {question.rubric_items.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "6px" }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#F8FAFC", fontWeight: 600, fontSize: "14px" }}>
            Write Your Explanation:
          </label>
          <textarea
            value={textValue || ""}
            onChange={(e) => onChangeText(questionKey, e.target.value)}
            placeholder="Provide a detailed explanation. We grade based on conceptual understanding and completeness, not keywords."
            style={{
              width: "100%",
              minHeight: "140px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#1E293B",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F8FAFC",
              fontFamily: "inherit",
              fontSize: "15px",
              lineHeight: "1.6",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#3B82F6"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </div>
      </div>
    );
  }

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