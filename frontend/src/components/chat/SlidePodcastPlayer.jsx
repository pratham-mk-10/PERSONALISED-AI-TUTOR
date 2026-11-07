import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSlidePodcastAudioUrl, fetchSlidePodcastTiming } from "../../services/api";

/**
 * SlidePodcastPlayer — NotebookLM-Style 2-Host AI Podcast Audio Engine.
 * Features:
 *  - Architecture 2: Dr. Sarah (Instructor) + Alex (Inquisitive Co-Host)
 *  - Fixed Indian English Default voices (en-IN-NeerjaNeural & en-IN-PrabhatNeural)
 *  - Synchronized active speaker highlight with animated audio bars
 *  - Live dialogue subtitle display
 *  - Deck-level continuous autoplay across slides
 *  - Predictive lookahead pre-buffering of next slide's audio
 *  - Robust browser speechSynthesis fallback
 */
export default function SlidePodcastPlayer({
  sessionId = "default",
  deckMode = "detailed",
  currentSlide,
  currentIndex,
  totalSlides,
  onNextSlide,
  isOpen,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timingData, setTimingData] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState("host_1");
  const [activeTurnText, setActiveTurnText] = useState("");

  const audioRef = useRef(null);
  const prebufferRef = useRef(null);

  // Stop audio and cleanup
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
  }, []);

  // Whenever slide index changes or viewer closes, reset audio
  useEffect(() => {
    stopAudio();
  }, [currentIndex, isOpen, stopAudio]);

  // Fetch timing and speaker boundaries when slide changes
  useEffect(() => {
    let isMounted = true;
    async function loadTiming() {
      try {
        const data = await fetchSlidePodcastTiming(sessionId, currentIndex, deckMode);
        if (isMounted && data) {
          setTimingData(data);
          setDuration(data.total_duration || 20);
          if (data.turn_boundaries && data.turn_boundaries.length > 0) {
            setActiveSpeaker(data.turn_boundaries[0].speaker);
            setActiveTurnText(data.turn_boundaries[0].text);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch podcast timing:", err);
      }
    }
    if (isOpen) {
      loadTiming();
    }
    return () => {
      isMounted = false;
    };
  }, [sessionId, currentIndex, deckMode, isOpen]);

  // Predictive lookahead prebuffering for next slide
  useEffect(() => {
    if (isPlaying && currentIndex < totalSlides - 1) {
      const nextUrl = getSlidePodcastAudioUrl(sessionId, currentIndex + 1, deckMode);
      const preAudio = new Audio();
      preAudio.preload = "auto";
      preAudio.src = nextUrl;
      prebufferRef.current = preAudio;
    }
    return () => {
      if (prebufferRef.current) {
        prebufferRef.current.src = "";
        prebufferRef.current = null;
      }
    };
  }, [isPlaying, currentIndex, totalSlides, sessionId, deckMode]);

  // Track active speaker based on current audio time
  const updateActiveSpeaker = useCallback((timeSec) => {
    setCurrentTime(timeSec);
    if (!timingData?.turn_boundaries) return;

    const currentTurn = timingData.turn_boundaries.find(
      (tb) => timeSec >= tb.start_sec && timeSec < tb.end_sec
    );

    if (currentTurn) {
      setActiveSpeaker(currentTurn.speaker);
      setActiveTurnText(currentTurn.text);
    }
  }, [timingData]);

  // Fallback synthesis using browser speechSynthesis if backend stream fails
  const playBrowserFallback = useCallback((dialogueTurns) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    window.speechSynthesis.cancel();
    let turnIndex = 0;

    const speakNextTurn = () => {
      if (turnIndex >= dialogueTurns.length) {
        setIsPlaying(false);
        // Auto-advance
        if (currentIndex < totalSlides - 1) {
          onNextSlide?.();
        }
        return;
      }

      const turn = dialogueTurns[turnIndex];
      setActiveSpeaker(turn.speaker);
      setActiveTurnText(turn.text);

      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = 1.0;
      // Slight pitch variation for Dr. Sarah vs Alex
      utterance.pitch = turn.speaker === "host_1" ? 1.05 : 0.95;

      utterance.onend = () => {
        turnIndex++;
        speakNextTurn();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    setIsPlaying(true);
    setIsLoading(false);
    speakNextTurn();
  }, [currentIndex, totalSlides, onNextSlide]);

  // Main Play / Pause toggle
  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);

    try {
      const audioUrl = getSlidePodcastAudioUrl(sessionId, currentIndex, deckMode);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.ontimeupdate = () => {
        updateActiveSpeaker(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
        // Continuous autoplay to next slide
        if (currentIndex < totalSlides - 1) {
          onNextSlide?.();
        }
      };

      audio.onerror = (e) => {
        console.warn("Backend podcast audio stream interrupted, falling back to speech synthesis:", e);
        const fallbackDialogue = currentSlide?.podcast_dialogue || [
          { speaker: "host_1", speaker_name: "Dr. Sarah", text: currentSlide?.narration_script || "" },
          { speaker: "host_2", speaker_name: "Alex", text: `What is the key takeaway for ${currentSlide?.title || "this slide"}?` },
          { speaker: "host_1", speaker_name: "Dr. Sarah", text: currentSlide?.key_takeaway || "" },
        ];
        playBrowserFallback(fallbackDialogue);
      };

      await audio.play();
    } catch (err) {
      console.warn("Audio play exception:", err);
      const fallbackDialogue = currentSlide?.podcast_dialogue || [
        { speaker: "host_1", speaker_name: "Dr. Sarah", text: currentSlide?.narration_script || "" },
        { speaker: "host_2", speaker_name: "Alex", text: `What should we look out for on ${currentSlide?.title || "this slide"}?` },
        { speaker: "host_1", speaker_name: "Dr. Sarah", text: currentSlide?.key_takeaway || "" },
      ];
      playBrowserFallback(fallbackDialogue);
    }
  }, [
    isPlaying,
    stopAudio,
    sessionId,
    currentIndex,
    deckMode,
    updateActiveSpeaker,
    totalSlides,
    onNextSlide,
    currentSlide,
    playBrowserFallback,
  ]);

  if (!currentSlide) return null;

  const isSarah = activeSpeaker === "host_1";
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div style={styles.container} role="region" aria-label="NotebookLM 2-Host Podcast">
      {/* ── Top Bar: Dual Hosts & Live Waveform ── */}
      <div style={styles.topRow}>
        {/* Host 1: Dr. Sarah */}
        <div style={{ ...styles.hostCard, ...(isSarah && isPlaying ? styles.hostCardActive : {}) }}>
          <div style={styles.avatarWrap}>
            <span style={styles.avatarIcon}>👩‍🏫</span>
            {isSarah && isPlaying && <span style={styles.speakingIndicator}>●</span>}
          </div>
          <div style={styles.hostInfo}>
            <span style={styles.hostRole}>Lead Instructor</span>
            <strong style={styles.hostName}>Dr. Sarah</strong>
          </div>
          {isSarah && isPlaying && (
            <div style={styles.waveformBars}>
              <span style={{ ...styles.bar, animationDelay: "0ms" }} />
              <span style={{ ...styles.bar, animationDelay: "150ms" }} />
              <span style={{ ...styles.bar, animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Play / Pause Primary Action */}
        <div style={styles.centerControl}>
          <button
            onClick={togglePlay}
            disabled={isLoading}
            style={{
              ...styles.playBtn,
              ...(isPlaying ? styles.playBtnActive : {}),
            }}
            title={isPlaying ? "Pause 2-Host Podcast (Space)" : "Listen to 2-Host Podcast"}
          >
            {isLoading ? (
              <span style={styles.spinner} />
            ) : isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <span style={styles.playLabel}>
            {isLoading ? "Buffering Voices…" : isPlaying ? "Pause Podcast" : "Play 2-Host Podcast"}
          </span>
        </div>

        {/* Host 2: Alex */}
        <div style={{ ...styles.hostCard, ...(!isSarah && isPlaying ? styles.hostCardActive : {}) }}>
          {/* Waveform on left for Host 2 */}
          {!isSarah && isPlaying && (
            <div style={styles.waveformBars}>
              <span style={{ ...styles.bar, animationDelay: "0ms" }} />
              <span style={{ ...styles.bar, animationDelay: "150ms" }} />
              <span style={{ ...styles.bar, animationDelay: "300ms" }} />
            </div>
          )}
          <div style={{ ...styles.hostInfo, textAlign: "right" }}>
            <span style={styles.hostRole}>Inquisitive Co-Host</span>
            <strong style={styles.hostName}>Alex</strong>
          </div>
          <div style={styles.avatarWrap}>
            <span style={styles.avatarIcon}>👨‍🎓</span>
            {!isSarah && isPlaying && <span style={styles.speakingIndicator}>●</span>}
          </div>
        </div>
      </div>

      {/* ── Slide Audio Scrubber / Progress ── */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
      </div>

      {/* ── Dynamic Dialogue Transcript Bubble ── */}
      <div style={styles.transcriptWrap}>
        <div style={styles.transcriptSpeakerTag}>
          <span style={styles.speakerDot}>{isSarah ? "🟣" : "🔵"}</span>
          <span style={styles.speakerNameText}>
            {isSarah ? "Dr. Sarah" : "Alex"}:
          </span>
        </div>
        <p style={styles.transcriptText}>
          {activeTurnText || currentSlide.narration_script || "Click 'Play 2-Host Podcast' to begin audio overview."}
        </p>
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes equalizerPulse {
          0% { height: 4px; opacity: 0.5; }
          50% { height: 16px; opacity: 1; }
          100% { height: 8px; opacity: 0.7; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderTop: "1px solid rgba(59, 130, 246, 0.2)",
    padding: "12px 24px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderRadius: "0 0 16px 16px",
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  hostCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 14px",
    borderRadius: "24px",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "all 0.25s ease",
    minWidth: "170px",
  },
  hostCardActive: {
    backgroundColor: "rgba(37, 99, 235, 0.2)",
    borderColor: "rgba(96, 165, 250, 0.5)",
    boxShadow: "0 0 16px rgba(59, 130, 246, 0.25)",
  },
  avatarWrap: {
    position: "relative",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: "18px",
  },
  speakingIndicator: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    color: "#22C55E",
    fontSize: "10px",
  },
  hostInfo: {
    display: "flex",
    flexDirection: "column",
  },
  hostRole: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#94A3B8",
    fontWeight: 600,
  },
  hostName: {
    fontSize: "13px",
    color: "#F8FAFC",
  },
  waveformBars: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    height: "16px",
    padding: "0 4px",
  },
  bar: {
    width: "3px",
    height: "14px",
    backgroundColor: "#60A5FA",
    borderRadius: "2px",
    animation: "equalizerPulse 0.8s ease-in-out infinite alternate",
  },
  centerControl: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  playBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
    transition: "transform 0.15s ease, background 0.2s ease",
  },
  playBtnActive: {
    background: "linear-gradient(135deg, #059669, #10B981)",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
  },
  playLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#CBD5E1",
    letterSpacing: "0.2px",
  },
  progressTrack: {
    width: "100%",
    height: "3px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3B82F6, #10B981)",
    transition: "width 0.2s linear",
  },
  transcriptWrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 14px",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  transcriptSpeakerTag: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
    paddingTop: "1px",
  },
  speakerDot: {
    fontSize: "10px",
  },
  speakerNameText: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#93C5FD",
  },
  transcriptText: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.45,
    color: "#E2E8F0",
    fontStyle: "normal",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#FFFFFF",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
};
