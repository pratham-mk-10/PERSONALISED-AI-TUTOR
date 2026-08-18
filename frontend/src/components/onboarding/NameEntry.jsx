import React, { useState } from "react";
import { BASE_URL } from "../../services/api";

export default function NameEntry({ onSubmit }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      onSubmit({ name: data.username, student_id: data.student_id });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Personalised AI Tutor</h1>
        <p style={styles.subtitle}>{isLogin ? "Login to continue" : "Create an account"}</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoFocus
        />
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        
        <button style={styles.button} type="submit" disabled={!username.trim() || !password || loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={styles.toggleLink} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
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
  error: {
    color: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "13px",
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
  toggleText: {
    fontSize: "13px",
    color: "#94A3B8",
    marginTop: "8px",
  },
  toggleLink: {
    color: "#3B82F6",
    cursor: "pointer",
    fontWeight: 600,
  }
};

