import React, { useState, useEffect, useRef } from "react";

const AudioSpeechSandbox = () => {
  const [step, setStep] = useState(0);
  const [voiceList, setVoiceList] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stepsText = [
    "Welcome to the Physics Audio Sandbox! Today we are learning how the Web Speech API can narrate lessons in real-time.",
    "A plane mirror is a flat reflecting surface. When a ray of light hits the mirror, it bounces back.",
    "Perpendicular to the mirror surface, we draw an imaginary line called the Normal at ninety degrees.",
    "The incoming light ray is called the Incident Ray, which makes an angle of incidence with the Normal.",
    "The outgoing ray that bounces away is the Reflected Ray, making an angle of reflection equal to the angle of incidence."
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setVoiceList(voices);
        // Default to a Google or high-quality English voice if possible
        const defaultVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) || voices.find(v => v.lang.startsWith("en"));
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoiceName) {
      const selectedVoice = voiceList.find(v => v.name === selectedVoiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div style={{
      background: "#1E293B",
      color: "#F8FAFC",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      maxWidth: "800px",
      margin: "20px auto",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "#60A5FA" }}>
        🎙️ Web Speech API Sandbox (Dynamic Voice Narration)
      </h3>
      <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "20px" }}>
        Test browser-native Text-to-Speech (TTS) for slide narrations. Adjust speech settings and click the steps below to hear the voice synchronize with the visual steps.
      </p>

      {/* Voice Configuration */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px", background: "rgba(15, 23, 42, 0.4)", padding: "16px", borderRadius: "8px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "#94A3B8", display: "block", marginBottom: "4px" }}>Voice</label>
          <select 
            value={selectedVoiceName} 
            onChange={(e) => setSelectedVoiceName(e.target.value)}
            style={{ width: "100%", padding: "6px", background: "#0F172A", border: "1px solid #334155", color: "white", borderRadius: "4px" }}
          >
            {voiceList.map((v, i) => (
              <option key={i} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#94A3B8", display: "block", marginBottom: "4px" }}>Speed ({rate}x)</label>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.05" 
            value={rate} 
            onChange={(e) => setRate(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#94A3B8", display: "block", marginBottom: "4px" }}>Pitch ({pitch})</label>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1" 
            value={pitch} 
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Interactive Step Navigator */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        {stepsText.map((text, i) => {
          const isActive = step === i;
          return (
            <div
              key={i}
              onClick={() => {
                setStep(i);
                speakText(text);
              }}
              style={{
                padding: "16px",
                borderRadius: "12px",
                cursor: "pointer",
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.15)" : "#0F172A",
                border: isActive ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.02)",
                color: isActive ? "#60A5FA" : "#D1D5DB",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold" }}>Step {i + 1}</span>
                {isActive && isSpeaking && <span style={{ fontSize: "12px", background: "#10B981", color: "white", padding: "2px 6px", borderRadius: "999px" }}>Speaking 🔊</span>}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: "14px" }}>{text}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={() => speakText(stepsText[step])}
          style={{ padding: "10px 16px", background: "#3B82F6", border: "none", color: "white", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          🔊 Play Current Step
        </button>
        <button 
          onClick={handleStop}
          style={{ padding: "10px 16px", background: "#EF4444", border: "none", color: "white", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          ⏹ Stop Speech
        </button>
      </div>
    </div>
  );
};

export default AudioSpeechSandbox;
