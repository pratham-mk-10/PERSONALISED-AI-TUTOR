// ============================================================
// AnimationPlayer.jsx
// Reusable wrapper used by EVERY animation component.
// Handles progress state, play/pause, replay button,
// and the "Try it yourself" button that appears on completion.
//
// HOW TO USE:
// Wrap your SVG content inside <AnimationPlayer> and use the
// progress prop (0 to 1) to animate your elements.
//
// Example:
//   <AnimationPlayer duration={3000} onComplete={() => {}}>
//     {({ progress }) => (
//       <svg>
//         <line x1={0} y1={0} x2={progress * 200} y2={0} />
//       </svg>
//     )}
//   </AnimationPlayer>
// ============================================================

import React,{ useState, useEffect, useCallback, useRef } from "react";

const AnimationPlayer = ({
  children,          // render prop: ({ progress }) => JSX
  duration = 3000,   // total animation duration in ms
  onComplete,        // called when animation reaches end
  onTryItClicked,    // called when student clicks "Try it yourself"
  showTryIt = true,  // whether to show the Try It button after completion
  tryButtonLabel = "Try it yourself ->",
  title = "",        // optional title shown above SVG
}) => {

  const [progress, setProgress]     = useState(0);
  const [playing,  setPlaying]      = useState(true);
  const [done,     setDone]         = useState(false);
  const [showTry,  setShowTry]      = useState(false);
  const completeTimerRef = useRef(null);

  const finishAnimation = useCallback(() => {
    setPlaying(false);
    setDone(true);
    if (showTryIt) {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(() => setShowTry(true), 400);
    }
    if (onComplete) onComplete();
  }, [onComplete, showTryIt]);

  // ── ANIMATION LOOP ──────────────────────────────────────
  useEffect(() => {
    if (!playing) return;

    const frameInterval = 30; // ms per frame (~33 fps)
    const step = frameInterval / duration; // progress per frame

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 1) {
          clearInterval(interval);
          finishAnimation();
          return 1;
        }
        return next;
      });
    }, frameInterval);

    return () => clearInterval(interval);
  }, [playing, duration, finishAnimation]);

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  // ── REPLAY ──────────────────────────────────────────────
  const handleReplay = useCallback(() => {
    setProgress(0);
    setDone(false);
    setShowTry(false);
    setPlaying(true);
  }, []);

  const handleSkip = useCallback(() => {
    if (done) return;
    setProgress(1);
    finishAnimation();
  }, [done, finishAnimation]);

  const handleSeek = useCallback(
    (event) => {
      const next = Number(event.target.value) / 100;
      setProgress(next);
      if (next >= 1) {
        finishAnimation();
      } else {
        setDone(false);
        setShowTry(false);
      }
    },
    [finishAnimation]
  );

  // ── PAUSE / RESUME ──────────────────────────────────────
  const handlePauseResume = useCallback(() => {
    if (done) return;
    setPlaying((p) => !p);
  }, [done]);

  // ── TRY IT ──────────────────────────────────────────────
  const handleTryIt = useCallback(() => {
    if (onTryItClicked) onTryItClicked();
  }, [onTryItClicked]);

  return (
    <div style={styles.wrapper}>

      {/* Optional title */}
      {title && <p style={styles.title}>{title}</p>}

      {/* SVG content via render prop */}
      <div style={styles.svgWrapper}>
        {children({ progress })}
      </div>

      {/* Progress bar */}
      <div style={styles.progressBarBg}>
        <div style={{ ...styles.progressBarFill, width: `${progress * 100}%` }} />
      </div>

      {/* Seek slider */}
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={Math.round(progress * 100)}
        onChange={handleSeek}
        aria-label="Seek animation"
        style={styles.slider}
      />

      {/* Controls */}
      <div style={styles.controls}>

        {/* Pause / Resume — only while animating */}
        {!done && (
          <button onClick={handlePauseResume} style={styles.btnSecondary}>
            {playing ? "⏸ Pause" : "▶ Resume"}
          </button>
        )}

        {/* Replay — always available once started */}
        <button onClick={handleReplay} style={styles.btnSecondary}>
          🔁 Replay
        </button>

        {/* Skip to end */}
        {!done && (
          <button onClick={handleSkip} style={styles.btnSecondary}>
            ⏭ Skip
          </button>
        )}

        {/* Try it yourself — appears after animation completes */}
        {showTry && showTryIt && (
          <button onClick={handleTryIt} style={styles.btnPrimary}>
            {tryButtonLabel}
          </button>
        )}

      </div>

    </div>
  );
};

// ── STYLES ────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "15px",
    color: "#374151",
    margin: 0,
    fontWeight: "600",
  },
  svgWrapper: {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#FAFAFA",
  },
  progressBarBg: {
    width: "100%",
    maxWidth: "400px",
    height: "4px",
    background: "#E5E7EB",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "#2563EB",
    borderRadius: "2px",
    transition: "width 0.03s linear",
  },
  slider: {
    width: "100%",
    maxWidth: "400px",
    cursor: "pointer",
  },
  controls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btnSecondary: {
    padding: "8px 16px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    background: "#F9FAFB",
    color: "#374151",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
  },
  btnPrimary: {
    padding: "8px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    background: "#2563EB",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
  },
};

export default AnimationPlayer;