import React, { useState } from "react";

export default function NameEntry({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Personalised AI Tutor</h1>
        <p style={styles.subtitle}>Enter your name to begin</p>
        <input
          style={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
        />
        <button style={styles.button} type="submit" disabled={!name.trim()}>
          Start
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B0F19",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "320px",
    padding: "40px 32px",
    borderRadius: "20px",
    backgroundColor: "#1E293B",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    textAlign: "center",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#FFFFFF",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#94A3B8",
    margin: "0 0 8px 0",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "#0B0F19",
    color: "#FFFFFF",
    fontSize: "15px",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "9999px",
    border: "none",
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
  },
};
