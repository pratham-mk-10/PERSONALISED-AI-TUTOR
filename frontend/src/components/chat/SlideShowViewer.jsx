import React, { useState, useEffect, useCallback } from "react";
import SlidePhysicsWidget from "./SlidePhysicsWidgetRegistry";
import SlidePodcastPlayer from "./SlidePodcastPlayer";

/**
 * SlideShowViewer — NotebookLM-style presentation viewer for study materials.
 * Supports:
 *  - Architecture B: Hybrid text notes + embedded deterministic SVG Physics Engine simulations
 *  - Architecture 2: Fullscale NotebookLM 2-Host AI Podcast Audio Engine (Dr. Sarah & Alex)
 *  - Dual display modes: Docked Expandable Panel vs Immersive Fullscreen Mode
 *  - Quick Overview vs Detailed Breakdown decks
 *  - Keyboard navigation (ArrowLeft, ArrowRight, F for fullscreen, Esc to close)
 *
 * Props:
 *  - deck        : SlideDeck object { deck_title, mode, source_filename, total_slides, slides: [...] }
 *  - isOpen      : boolean
 *  - initialMode : "panel" | "fullscreen" (default "panel")
 *  - onClose     : () => void
 *  - sessionId   : string (default "default")
 */

export default function SlideShowViewer({
  deck,
  isOpen,
  initialMode = "panel",
  onClose,
  sessionId = "default",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState(initialMode); // "panel" | "fullscreen"

  const slides = deck?.slides || [];
  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex] || null;

  // Sync initial mode
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode);
      setCurrentIndex(0);
    }
  }, [isOpen, initialMode]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleJumpTo = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "fullscreen" ? "panel" : "fullscreen"));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      } else if (e.key === "f" || e.key === "F") {
        // Toggle fullscreen
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleViewMode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, toggleViewMode]);

  if (!isOpen || !deck || totalSlides === 0 || !currentSlide) {
    return null;
  }

  const isFullscreen = viewMode === "fullscreen";
  const progressPercent = ((currentIndex + 1) / totalSlides) * 100;
  const isQuick = deck.mode === "quick";
  // For Quick Overview, remove check for similar from SVG & do not play videos/simulations
  const hasPhysicsWidget = !isQuick && Boolean(
    currentSlide.visual_widget && currentSlide.visual_widget.component_key
  );

  return (
    <div
      style={{
        ...styles.overlay,
        ...(isFullscreen ? styles.overlayFullscreen : styles.overlayPanel),
      }}
      role="dialog"
      aria-modal="true"
      aria-label="NotebookLM Study Slide Show"
    >
      {/* ── Top Header Bar ── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.deckBadge}>
            <span style={styles.deckBadgeIcon}>{isQuick ? "⚡" : "📚"}</span>
            <span>{isQuick ? "Quick Overview" : "Detailed Breakdown"}</span>
          </div>
          <div style={styles.titleWrap}>
            <h2 style={styles.deckTitle}>{deck.deck_title}</h2>
            <span style={styles.sourceTag}>
              📄 {deck.source_filename || "Study Notes"} · {totalSlides} slides
            </span>
          </div>
        </div>

        <div style={styles.headerRight}>
          {/* Slide counter */}
          <div style={styles.slideCounter}>
            Slide <strong>{currentIndex + 1}</strong> / {totalSlides}
          </div>

          {/* Fullscreen / Panel Toggle */}
          <button
            onClick={toggleViewMode}
            style={styles.iconBtn}
            title={isFullscreen ? "Switch to Docked Panel (F)" : "Switch to Fullscreen (F)"}
            aria-label="Toggle display mode"
          >
            {isFullscreen ? (
              /* Exit Fullscreen Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              /* Enter Fullscreen Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6m0 6v6h-6M9 21H3v-6M3 9V3h6" />
              </svg>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={styles.closeBtn}
            title="Close Slide Show (Esc)"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div style={styles.progressBarTrack}>
        <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
      </div>

      {/* ── Main Slide Stage ── */}
      <main style={styles.stage}>
        <div
          key={`slide-${currentSlide.slide_number}-${currentIndex}`}
          style={{
            ...styles.slideCard,
            ...(hasPhysicsWidget ? styles.slideCardSplit : styles.slideCardStandard),
          }}
        >
          {/* Left Column: Pedagogical Notes & Explanations */}
          <section style={styles.contentCol}>
            {/* Category / Accent Pill */}
            {currentSlide.accent_badge && (
              <div style={styles.accentBadge}>
                {currentSlide.accent_badge}
              </div>
            )}

            {/* Slide Title & Subtitle */}
            <h1 style={styles.slideTitle}>{currentSlide.title}</h1>
            {currentSlide.subtitle && (
              <p style={styles.slideSubtitle}>{currentSlide.subtitle}</p>
            )}

            {/* Formula spotlight if present */}
            {currentSlide.formula && (
              <div style={styles.formulaBox}>
                <span style={styles.formulaLabel}>Key Equation / Law:</span>
                <div style={styles.formulaContent}>{currentSlide.formula}</div>
              </div>
            )}

            {/* Bullets */}
            {currentSlide.bullets && currentSlide.bullets.length > 0 && (
              <ul style={styles.bulletList}>
                {currentSlide.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} style={styles.bulletItem}>
                    <span style={styles.bulletDot}>✦</span>
                    <span style={styles.bulletText}>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Key Takeaway Banner */}
            {currentSlide.key_takeaway && (
              <div style={styles.takeawayBanner}>
                <span style={styles.takeawayIcon}>💡</span>
                <span style={styles.takeawayText}>
                  <strong>Core Takeaway:</strong> {currentSlide.key_takeaway}
                </span>
              </div>
            )}
          </section>

          {/* Right Column: Embedded Deterministic Physics Simulation or Concept Card */}
          {hasPhysicsWidget ? (
            <aside style={styles.widgetCol}>
              <SlidePhysicsWidget
                componentKey={currentSlide.visual_widget.component_key}
                caption={currentSlide.visual_widget.caption}
              />
            </aside>
          ) : currentSlide.visual_widget && currentSlide.visual_widget.caption ? (
            <aside style={styles.conceptVisualCol}>
              <div style={styles.conceptVisualCard}>
                <div style={styles.conceptVisualIcon}>🔬</div>
                <h4 style={styles.conceptVisualTitle}>Concept Deep Dive</h4>
                <p style={styles.conceptVisualText}>
                  {currentSlide.visual_widget.caption}
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </main>

      {/* ── NotebookLM 2-Host AI Podcast Audio Engine (Architecture 2) ── */}
      <SlidePodcastPlayer
        sessionId={sessionId}
        deckMode={deck?.mode || "detailed"}
        currentSlide={currentSlide}
        currentIndex={currentIndex}
        totalSlides={totalSlides}
        onNextSlide={handleNext}
        isOpen={isOpen}
      />

      {/* ── Footer Navigation Bar ── */}
      <footer style={styles.footer}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            ...styles.navBtn,
            opacity: currentIndex === 0 ? 0.35 : 1,
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
          }}
          aria-label="Previous Slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Previous</span>
        </button>

        {/* Slide jump dots */}
        <div style={styles.dotsContainer}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleJumpTo(idx)}
              style={{
                ...styles.dot,
                width: idx === currentIndex ? "24px" : "8px",
                backgroundColor:
                  idx === currentIndex ? "#3B82F6" : "rgba(255, 255, 255, 0.2)",
              }}
              title={`Jump to slide ${idx + 1}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === totalSlides - 1}
          style={{
            ...styles.navBtn,
            ...styles.nextBtn,
            opacity: currentIndex === totalSlides - 1 ? 0.35 : 1,
            cursor: currentIndex === totalSlides - 1 ? "not-allowed" : "pointer",
          }}
          aria-label="Next Slide"
        >
          <span>Next</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Design Styles (Dark mode glassmorphism matching Personalised AI Tutor)
// ──────────────────────────────────────────────────────────────────────────────

const styles = {
  overlay: {
    backgroundColor: "#0B0F19",
    color: "#FFFFFF",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
    zIndex: 1200,
    boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.7)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  overlayFullscreen: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
  },

  overlayPanel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "680px",
    maxWidth: "100vw",
    height: "100vh",
    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
  },

  /* ── Header ── */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "#0F172A",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    overflow: "hidden",
  },
  deckBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 700,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60A5FA",
    flexShrink: 0,
  },
  deckBadgeIcon: {
    fontSize: "13px",
  },
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  deckTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#F8FAFC",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  sourceTag: {
    fontSize: "11px",
    color: "#94A3B8",
    marginTop: "2px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  slideCounter: {
    fontSize: "13px",
    color: "#CBD5E1",
    padding: "4px 10px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  iconBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#CBD5E1",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "color 0.15s",
  },

  /* ── Progress bar ── */
  progressBarTrack: {
    width: "100%",
    height: "3px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    flexShrink: 0,
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
    transition: "width 0.3s ease-out",
  },

  /* ── Stage ── */
  stage: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  slideCard: {
    width: "100%",
    maxWidth: "1100px",
    backgroundColor: "#131C31",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
  },
  slideCardStandard: {
    display: "flex",
    flexDirection: "column",
  },
  slideCardSplit: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "28px",
    alignItems: "start",
  },

  /* Left column */
  contentCol: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  accentBadge: {
    alignSelf: "flex-start",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    padding: "3px 10px",
    borderRadius: "6px",
    backgroundColor: "rgba(139, 92, 246, 0.18)",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    color: "#C4B5FD",
  },
  slideTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    color: "#F8FAFC",
    lineHeight: 1.25,
  },
  slideSubtitle: {
    margin: "-4px 0 0",
    fontSize: "14px",
    color: "#94A3B8",
    lineHeight: 1.4,
  },

  /* Formula spotlight */
  formulaBox: {
    marginTop: "6px",
    padding: "14px 18px",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    border: "1.5px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "12px",
  },
  formulaLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#60A5FA",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  formulaContent: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#FFFFFF",
    fontFamily: "monospace",
    letterSpacing: "0.5px",
  },

  /* Bullets */
  bulletList: {
    listStyle: "none",
    margin: "8px 0 0",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  bulletItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    lineHeight: 1.5,
  },
  bulletDot: {
    color: "#60A5FA",
    fontSize: "12px",
    marginTop: "3px",
    flexShrink: 0,
  },
  bulletText: {
    fontSize: "14px",
    color: "#E2E8F0",
  },

  /* Takeaway banner */
  takeawayBanner: {
    marginTop: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  takeawayIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  takeawayText: {
    fontSize: "13px",
    color: "#DCFCE7",
    lineHeight: 1.45,
  },

  /* Right column / widgets */
  widgetCol: {
    display: "flex",
    flexDirection: "column",
  },
  conceptVisualCol: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  conceptVisualCard: {
    padding: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px dashed rgba(255, 255, 255, 0.12)",
    borderRadius: "16px",
    textAlign: "center",
  },
  conceptVisualIcon: {
    fontSize: "36px",
    marginBottom: "8px",
  },
  conceptVisualTitle: {
    margin: "0 0 6px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#F8FAFC",
  },
  conceptVisualText: {
    margin: 0,
    fontSize: "13px",
    color: "#94A3B8",
    lineHeight: 1.5,
  },

  /* ── Future voice readiness bar ── */
  voiceBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 24px",
    backgroundColor: "#0D1424",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    flexShrink: 0,
  },
  voiceBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  narrationToggleBtn: {
    background: "none",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "5px 12px",
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.15s",
  },
  voiceReadyBadge: {
    fontSize: "11px",
    color: "#64748B",
  },
  voiceBarRight: {
    display: "flex",
    alignItems: "center",
  },
  audioPlaceholderBtn: {
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "8px",
    padding: "5px 12px",
    color: "#93C5FD",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  narrationScriptDrawer: {
    padding: "12px 24px",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    flexShrink: 0,
  },
  narrationScriptText: {
    margin: 0,
    fontSize: "13px",
    color: "#CBD5E1",
    lineHeight: 1.5,
  },

  /* ── Footer ── */
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px",
    backgroundColor: "#0F172A",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    flexShrink: 0,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.15s",
  },
  nextBtn: {
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    border: "none",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
  },
  dotsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dot: {
    height: "8px",
    borderRadius: "9999px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    padding: 0,
  },
};
