// ============================================================
// AudioAnimationPlayer.jsx
// An AnimationPlayer where the Timeline is driven by Audio.
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";

const AudioAnimationPlayer = ({
  children,
  audioSteps,       // Array: { progress: 0.1, text: "..." }
  onComplete,
  onTryItClicked,
  showTryIt = true,
  tryButtonLabel = "Try it yourself ->",
  title = "",
}) => {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [showTry, setShowTry] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const completeTimerRef = useRef(null);

  // Derive start and end progress for the current step
  const getStepBounds = (stepIndex) => {
    if (stepIndex >= audioSteps.length) return { start: 1, end: 1 };
    const start = stepIndex === 0 ? 0 : audioSteps[stepIndex - 1].progress;
    const end = audioSteps[stepIndex].progress;
    return { start, end };
  };

  const finishAnimation = useCallback(() => {
    setPlaying(false);
    setDone(true);
    setProgress(1);
    if (showTryIt) {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(() => setShowTry(true), 400);
    }
    if (onComplete) onComplete();
  }, [onComplete, showTryIt]);

  const audioElementsRef = useRef([]);

  // Pre-fetch all audio elements to eliminate network latency
  useEffect(() => {
    let active = true;

    const fetchAudios = async () => {
      const audios = await Promise.all(audioSteps.map(async (step) => {
        if (!step.text) return null;
        try {
          const url = `http://localhost:8000/api/tts?text=${encodeURIComponent(step.text)}`;
          const res = await fetch(url);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio();
          audio.preload = "auto";
          // Wait for metadata to be loaded so duration is definitely known
          await new Promise((resolve) => {
            audio.onloadedmetadata = () => {
              // Fix for Chromium returning Infinity duration for blobs
              if (audio.duration === Infinity) {
                audio.currentTime = 1e101;
                audio.ontimeupdate = () => {
                  audio.ontimeupdate = null;
                  audio.currentTime = 0;
                  resolve();
                };
              } else {
                resolve();
              }
            };
            audio.onerror = resolve; // don't hang if it fails
            audio.src = blobUrl;
            audio.load();
          });
          return audio;
        } catch (e) {
          console.error("Failed to fetch TTS:", e);
          return null;
        }
      }));

      if (active) {
        audioElementsRef.current = audios;
        setAudioReady(true);
      }
    };

    fetchAudios();

    return () => {
      active = false;
      audioElementsRef.current.forEach(a => {
        if (a) {
          a.pause();
          a.removeAttribute('src');
        }
      });
    };
  }, [audioSteps]);

  // Load and play audio for the current step
  useEffect(() => {
    if (!hasStarted || done) return;

    if (currentStep >= audioSteps.length) {
      finishAnimation();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = audioElementsRef.current[currentStep];
    
    if (audio) {
      audioRef.current = audio;
      audio.currentTime = 0; // reset for replays

      audio.onended = () => {
        // Snap progress to the exact end boundary
        const { end } = getStepBounds(currentStep);
        setProgress(end);
        setCurrentStep((prev) => prev + 1);
      };

      if (playing) {
        audio.play().catch(err => console.error("Audio play failed:", err));
      }
    } else {
      // If there's no text for this step (e.g., silent pause), 
      // just wait 1 second and move on (fallback).
      const timer = setTimeout(() => {
        const { end } = getStepBounds(currentStep);
        setProgress(end);
        setCurrentStep((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentStep, hasStarted, done, finishAnimation, audioSteps]);

  // Handle Play/Pause changes without reloading the audio
  useEffect(() => {
    if (audioRef.current) {
      if (playing && hasStarted && !done) {
        audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, hasStarted, done]);

  const lastSyncRef = useRef({ audioTime: 0, sysTime: 0 });

  // Update visual progress continuously while playing
  const updateProgress = useCallback(() => {
    if (playing && audioRef.current && !done) {
      const audio = audioRef.current;
      if (audio.duration && audio.duration !== Infinity && audio.currentTime > 0) {
        let currentAudioTime = audio.currentTime;
        
        // Smooth interpolation for choppy audio.currentTime updates
        const now = performance.now();
        if (currentAudioTime === lastSyncRef.current.audioTime) {
          const elapsed = (now - lastSyncRef.current.sysTime) / 1000;
          currentAudioTime = Math.min(currentAudioTime + elapsed, audio.duration);
        } else {
          lastSyncRef.current = { audioTime: currentAudioTime, sysTime: now };
        }

        const { start, end } = getStepBounds(currentStep);
        const segmentRatio = currentAudioTime / audio.duration;
        const currentGlobalProgress = start + (end - start) * segmentRatio;
        setProgress(currentGlobalProgress);
      }
    }
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  }, [playing, currentStep, done]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [updateProgress]);

  // Controls
  const handleStart = useCallback(() => {
    if (!audioReady) return;
    setHasStarted(true);
    setPlaying(true);
  }, [audioReady]);

  const handlePauseResume = useCallback(() => {
    if (done) return;
    setPlaying((p) => !p);
  }, [done]);

  const handleReplay = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentStep(0);
    setProgress(0);
    setDone(false);
    setShowTry(false);
    setPlaying(true);
  }, []);

  const handleSkip = useCallback(() => {
    if (done) return;
    if (audioRef.current) audioRef.current.pause();
    setProgress(1);
    setCurrentStep(audioSteps.length);
    finishAnimation();
  }, [done, finishAnimation, audioSteps.length]);

  return (
    <div style={styles.wrapper}>
      {title && <p style={styles.title}>{title}</p>}

      <div style={{ ...styles.svgWrapper, position: "relative" }}>
        {children({ progress })}

        {!hasStarted && (
          <div style={styles.overlay}>
            <button onClick={handleStart} style={audioReady ? styles.startBtn : styles.startBtnLoading} disabled={!audioReady}>
              {audioReady ? "▶ Start Lesson" : "Loading Audio..."}
            </button>
          </div>
        )}
      </div>

      <div style={styles.progressBarBg}>
        <div style={{ ...styles.progressBarFill, width: `${progress * 100}%` }} />
      </div>

      <div style={styles.controls}>
        {!done && (
          <button onClick={handlePauseResume} style={styles.btnSecondary}>
            {playing ? "⏸ Pause" : "▶ Resume"}
          </button>
        )}
        <button onClick={handleReplay} style={styles.btnSecondary}>
          🔁 Replay
        </button>
        {!done && (
          <button onClick={handleSkip} style={styles.btnSecondary}>
            ⏭ Skip
          </button>
        )}
        {showTry && showTryIt && (
          <button onClick={onTryItClicked} style={styles.btnPrimary}>
            {tryButtonLabel}
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "12px", padding: "16px", fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "15px", color: "#374151", margin: 0, fontWeight: "600",
  },
  svgWrapper: {
    border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden",
    background: "#FAFAFA",
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(11, 15, 25, 0.7)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 10
  },
  startBtn: {
    padding: "12px 24px", fontSize: "18px", border: "none", borderRadius: "6px",
    background: "#2563EB", color: "#FFFFFF", cursor: "pointer",
    fontWeight: "bold", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
  },
  startBtnLoading: {
    padding: "12px 24px", fontSize: "18px", border: "none", borderRadius: "6px",
    background: "#9CA3AF", color: "#FFFFFF", cursor: "not-allowed",
    fontWeight: "bold", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
  },
  progressBarBg: {
    width: "100%", maxWidth: "400px", height: "4px",
    background: "#E5E7EB", borderRadius: "2px", overflow: "hidden",
  },
  progressBarFill: {
    height: "100%", background: "#2563EB", borderRadius: "2px",
    transition: "width 0.1s linear",
  },
  controls: {
    display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center",
  },
  btnSecondary: {
    padding: "8px 16px", fontSize: "14px", border: "1px solid #D1D5DB",
    borderRadius: "6px", background: "#F9FAFB", color: "#374151",
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  },
  btnPrimary: {
    padding: "8px 20px", fontSize: "14px", border: "none", borderRadius: "6px",
    background: "#2563EB", color: "#FFFFFF", cursor: "pointer", fontWeight: "bold",
  },
};

export default AudioAnimationPlayer;
