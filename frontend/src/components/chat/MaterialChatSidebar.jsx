import React, { useState, useRef, useEffect, useCallback } from "react";
import SlideShowViewer from "./SlideShowViewer";
import { generateMaterialSlideDeck } from "../../services/api";

/**
 * MaterialChatSidebar — slide-out right-side drawer where students can upload
 * study materials, chat with the Material AI Tutor agent, and generate
 * NotebookLM-style Summary Slide Shows (Quick Overview vs Detailed Breakdown)
 * with embedded deterministic SVG physics simulations.
 *
 * Props:
 *  - isOpen        : boolean
 *  - onClose       : () => void
 *  - files         : Array<{ id, name, size, type, status, pageCount, materialId }>
 *  - onUploadFiles : (files: File[]) => void
 *  - onDeleteFile  : (fileObj: object) => void
 *  - messages      : Array<{ role, text, ts, materialsReferenced }>
 *  - onSend        : (text: string) => void
 *  - isTyping      : boolean
 */

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXT = ".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx";

const SUGGESTED_PROMPTS = [
  "⚡ Quick Slide Overview",
  "📚 Detailed Slide Breakdown",
  "📖 Summarize this material",
  "❓ Generate practice questions",
  "🧮 Explain the key formulas",
];

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(file) {
  const type = file.type || "";
  const name = file.name || "";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "📄";
  if (type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(name)) return "🖼️";
  if (type.includes("word") || name.endsWith(".docx")) return "📝";
  return "📎";
}

function renderFormattedMessage(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const parts = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={`${lIdx}-${match.index}`} style={{ fontWeight: 600, color: "#F8FAFC" }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={`${lIdx}-${match.index}`}
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "1px 5px",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#93C5FD",
              fontFamily: "monospace",
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <div key={lIdx} style={{ minHeight: line.trim() ? "auto" : "8px" }}>
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}

export default function MaterialChatSidebar({
  isOpen,
  onClose,
  files = [],
  onUploadFiles,
  onDeleteFile,
  messages = [],
  onSend,
  isTyping = false,
  sessionId = "default",
}) {
  const [inputText, setInputText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [decksByMode, setDecksByMode] = useState({ quick: null, detailed: null });
  const [activeMode, setActiveMode] = useState("quick");
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [deckError, setDeckError] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerMode, setViewerMode] = useState("panel"); // "panel" | "fullscreen"

  const activeDeck = decksByMode[activeMode] || decksByMode.quick || decksByMode.detailed || null;

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleGenerateSlides = useCallback(
    async (mode = "quick") => {
      setIsGeneratingDeck(true);
      setDeckError(null);
      setActiveMode(mode);
      try {
        const readyMaterialIds = files
          .filter((f) => f.materialId)
          .map((f) => f.materialId);

        const deck = await generateMaterialSlideDeck({
          sessionId,
          mode,
          materialIds: readyMaterialIds.length > 0 ? readyMaterialIds : null,
        });

        setDecksByMode((prev) => ({ ...prev, [mode]: deck }));
        setActiveMode(mode);
        setViewerMode("panel");
        setIsViewerOpen(true);
      } catch (err) {
        console.error("Slide deck generation error:", err);
        setDeckError(err.message || "Failed to generate slide show");
      } finally {
        setIsGeneratingDeck(false);
      }
    },
    [files, sessionId]
  );

  const openViewer = useCallback((mode = "panel", slideDeckMode = null) => {
    if (slideDeckMode) {
      setActiveMode(slideDeckMode);
    }
    setViewerMode(mode);
    setIsViewerOpen(true);
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // ── File handling ──
  const addFiles = useCallback(
    (incoming) => {
      const valid = Array.from(incoming).filter((f) => {
        const ext = f.name ? f.name.toLowerCase() : "";
        return (
          ACCEPTED_TYPES.includes(f.type) ||
          ext.endsWith(".docx") ||
          ext.endsWith(".txt") ||
          ext.endsWith(".pdf")
        );
      });
      if (valid.length === 0) return;

      if (onUploadFiles) {
        onUploadFiles(valid);
      }
    },
    [onUploadFiles]
  );

  const removeFile = useCallback(
    (fileObj) => {
      if (onDeleteFile) {
        onDeleteFile(fileObj);
      }
    },
    [onDeleteFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  // ── Send ──
  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Check for slide trigger prompts
    const lower = trimmed.toLowerCase();
    if (lower.includes("quick slide") || lower.includes("quick overview deck")) {
      handleGenerateSlides("quick");
    } else if (lower.includes("detailed slide") || lower.includes("detailed breakdown deck")) {
      handleGenerateSlides("detailed");
    } else if (lower.includes("slide show") || lower.includes("slideshow") || lower.includes("slides")) {
      handleGenerateSlides("quick");
    }

    onSend(trimmed);
    setInputText("");
  }, [inputText, onSend, handleGenerateSlides]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Render ──
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={styles.backdrop}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          ...styles.drawer,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* ─── Header ─── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.agentAvatar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <div style={styles.headerTitle}>AI Material Tutor</div>
              <div style={styles.headerBadge}>Gemini 2.5 Flash</div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ─── Upload Zone ─── */}
        <div
          style={{
            ...styles.uploadZone,
            borderColor: dragOver ? "#3B82F6" : "rgba(255,255,255,0.08)",
            backgroundColor: dragOver
              ? "rgba(59, 130, 246, 0.08)"
              : "rgba(255,255,255,0.02)",
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXT}
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span style={styles.uploadIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          <span style={styles.uploadLabel}>
            {dragOver ? "Drop files here" : "Upload study materials"}
          </span>
          <span style={styles.uploadHint}>PDF, Images, TXT, DOCX</span>
        </div>

        {/* ─── File Chips ─── */}
        {files.length > 0 && (
          <div style={styles.fileChips}>
            {files.map((file, idx) => (
              <div key={file.id || `${file.name}-${idx}`} style={styles.fileChip}>
                <span style={styles.fileChipIcon}>{fileIcon(file)}</span>
                <span style={styles.fileChipName} title={file.name}>
                  {file.name && file.name.length > 18
                    ? file.name.slice(0, 16) + "…"
                    : file.name}
                </span>
                {file.status === "uploading" ? (
                  <span style={styles.fileUploadingBadge}>Uploading…</span>
                ) : (
                  <span style={styles.fileChipSize}>
                    {file.pageCount ? `${file.pageCount}p · ` : ""}
                    {formatFileSize(file.size)}
                  </span>
                )}
                <button
                  style={styles.fileChipRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ─── NotebookLM Artifact Bar: Slide Show Generator ─── */}
        {files.length > 0 && (
          <div style={styles.slideActionBanner}>
            <div style={styles.slideActionHeader}>
              <span style={styles.notebookBadge}>✨ NotebookLM Generator</span>
              <span style={styles.slideActionSub}>Interactive Physics Deck</span>
            </div>
            <div style={styles.slideActionButtons}>
              <button
                style={{
                  ...styles.actionPillBtn,
                  opacity: isGeneratingDeck ? 0.6 : 1,
                }}
                disabled={isGeneratingDeck}
                onClick={() => handleGenerateSlides("quick")}
                title="Concise high-impact slide overview of formulas and laws"
              >
                <span>⚡</span> Quick Overview
              </button>
              <button
                style={{
                  ...styles.actionPillBtn,
                  ...styles.actionPillDetailed,
                  opacity: isGeneratingDeck ? 0.6 : 1,
                }}
                disabled={isGeneratingDeck}
                onClick={() => handleGenerateSlides("detailed")}
                title="Exhaustive step-by-step breakdown across all cases"
              >
                <span>📚</span> Detailed Breakdown
              </button>
            </div>
          </div>
        )}

        {/* ─── Chat Stream ─── */}
        <div style={styles.chatStream}>
          {/* Slide Deck Generation State Card */}
          {isGeneratingDeck && (
            <div style={styles.generatingDeckCard}>
              <div style={styles.generatingSpinner} />
              <div>
                <div style={styles.generatingDeckTitle}>Designing Slide Show…</div>
                <div style={styles.generatingDeckSub}>
                  Structuring study notes & connecting deterministic physics simulations
                </div>
              </div>
            </div>
          )}

          {/* Slide Deck Error Card */}
          {deckError && (
            <div style={styles.deckErrorCard}>
              <span>⚠️ {deckError}</span>
            </div>
          )}

          {/* Active Generated Slide Deck Card */}
          {activeDeck && !isGeneratingDeck && (
            <div style={styles.readyDeckCard}>
              <div style={styles.readyDeckHeader}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {decksByMode.quick && (
                    <button
                      onClick={() => setActiveMode("quick")}
                      style={{
                        ...styles.readyDeckBadge,
                        opacity: activeMode === "quick" ? 1 : 0.5,
                        cursor: "pointer",
                        border: activeMode === "quick" ? "1px solid #3B82F6" : "1px solid transparent",
                      }}
                    >
                      ⚡ Quick ({decksByMode.quick.total_slides}p)
                    </button>
                  )}
                  {decksByMode.detailed && (
                    <button
                      onClick={() => setActiveMode("detailed")}
                      style={{
                        ...styles.readyDeckBadge,
                        backgroundColor: "rgba(139, 92, 246, 0.15)",
                        color: "#C4B5FD",
                        opacity: activeMode === "detailed" ? 1 : 0.5,
                        cursor: "pointer",
                        border: activeMode === "detailed" ? "1px solid #8B5CF6" : "1px solid transparent",
                      }}
                    >
                      📚 Detailed ({decksByMode.detailed.total_slides}p)
                    </button>
                  )}
                  {!decksByMode.quick && !decksByMode.detailed && (
                    <span style={styles.readyDeckBadge}>
                      {activeDeck.mode === "quick" ? "⚡ Quick Overview" : "📚 Detailed Breakdown"}
                    </span>
                  )}
                </div>
                <span style={styles.readyDeckCount}>
                  {activeDeck.total_slides} slides ready
                </span>
              </div>
              <h4 style={styles.readyDeckTitle}>{activeDeck.deck_title}</h4>
              <p style={styles.readyDeckText}>
                {activeDeck.mode === "quick"
                  ? "Concise high-yield formula & law summary."
                  : "Comprehensive step-by-step breakdown with interactive physics simulations."}
              </p>
              <div style={styles.readyDeckActions}>
                <button
                  onClick={() => openViewer("panel")}
                  style={styles.openPanelBtn}
                >
                  🗖 Open in Panel
                </button>
                <button
                  onClick={() => openViewer("fullscreen")}
                  style={styles.openFullscreenBtn}
                >
                  ⛶ Fullscreen Mode
                </button>
              </div>
            </div>
          )}
          {/* Welcome / empty state */}
          {messages.length === 0 && (
            <div style={styles.welcomeWrap}>
              <div style={styles.welcomeIcon}>✨</div>
              <p style={styles.welcomeText}>
                Upload your notes, textbook pages or diagrams and ask me
                anything about them!
              </p>

              {/* Suggested prompt chips */}
              <div style={styles.promptChips}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    style={styles.promptChip}
                    onClick={() => onSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                style={{
                  ...styles.msgRow,
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...(isUser ? styles.userBubble : styles.agentBubble),
                  }}
                >
                  {isUser ? msg.text : renderFormattedMessage(msg.text)}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
              <div style={styles.agentBubble}>
                <span style={styles.typingDots}>
                  <span className="mcsDot" style={{ ...styles.dot, animationDelay: "0s" }} />
                  <span className="mcsDot" style={{ ...styles.dot, animationDelay: "0.15s" }} />
                  <span className="mcsDot" style={{ ...styles.dot, animationDelay: "0.3s" }} />
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ─── Input Bar ─── */}
        <div style={styles.inputBar}>
          <button
            style={styles.attachBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49" />
            </svg>
          </button>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your materials…"
            rows={1}
            style={styles.textInput}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: inputText.trim() ? 1 : 0.4,
            }}
            onClick={handleSend}
            disabled={!inputText.trim()}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ─── NotebookLM Presentation Viewer (Architecture B) ─── */}
      <SlideShowViewer
        deck={activeDeck}
        isOpen={isViewerOpen}
        initialMode={viewerMode}
        onClose={() => setIsViewerOpen(false)}
        sessionId={sessionId}
      />

      {/* Typing-dot keyframes */}
      <style>{`
        @keyframes mcsBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .mcsDot { animation: mcsBounce 1.2s ease-in-out infinite; }
      `}</style>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  Inline styles — matches the Dashboard.jsx dark design system
// ──────────────────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 440;

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 999,
  },

  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: `${DRAWER_WIDTH}px`,
    maxWidth: "100vw",
    height: "100vh",
    backgroundColor: "#0F172A",
    borderLeft: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#FFFFFF",
  },

  /* ── Header ── */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  agentAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "9999px",
    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#F8FAFC",
    lineHeight: 1.2,
  },
  headerBadge: {
    marginTop: "2px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#60A5FA",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    padding: "1px 8px",
    borderRadius: "9999px",
    display: "inline-block",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.15s",
  },

  /* ── Upload zone ── */
  uploadZone: {
    margin: "12px 16px 4px",
    padding: "16px",
    borderRadius: "12px",
    border: "2px dashed rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  uploadIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  uploadLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#CBD5E1",
  },
  uploadHint: {
    fontSize: "12px",
    color: "#64748B",
    marginLeft: "auto",
  },

  /* ── File chips ── */
  fileChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "8px 16px",
    flexShrink: 0,
    maxHeight: "100px",
    overflowY: "auto",
  },
  fileChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "9999px",
    padding: "5px 10px 5px 8px",
    fontSize: "12px",
    color: "#DBEAFE",
    maxWidth: "220px",
  },
  fileChipIcon: {
    fontSize: "14px",
    flexShrink: 0,
  },
  fileChipName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  fileChipSize: {
    color: "#64748B",
    flexShrink: 0,
    fontSize: "11px",
  },
  fileUploadingBadge: {
    color: "#60A5FA",
    fontSize: "11px",
    fontWeight: 500,
  },
  fileChipRemove: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1,
    padding: "0 2px",
    fontWeight: 700,
  },

  /* ── Chat stream ── */
  chatStream: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  /* Welcome state */
  welcomeWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    textAlign: "center",
    gap: "12px",
    padding: "24px 0",
  },
  welcomeIcon: {
    fontSize: "36px",
  },
  welcomeText: {
    fontSize: "14px",
    color: "#94A3B8",
    maxWidth: "280px",
    lineHeight: 1.5,
    margin: 0,
  },

  /* Suggested prompts */
  promptChips: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
  },
  promptChip: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "9999px",
    padding: "7px 14px",
    fontSize: "13px",
    color: "#CBD5E1",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },

  /* Bubbles */
  msgRow: {
    display: "flex",
    width: "100%",
  },
  userBubble: {
    maxWidth: "80%",
    padding: "10px 16px",
    borderRadius: "18px 18px 4px 18px",
    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
    color: "#FFFFFF",
    fontSize: "14px",
    lineHeight: 1.5,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  agentBubble: {
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    backgroundColor: "#1E293B",
    color: "#E2E8F0",
    fontSize: "14px",
    lineHeight: 1.5,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },

  /* Typing dots */
  typingDots: {
    display: "inline-flex",
    gap: "4px",
    alignItems: "center",
    height: "20px",
  },
  dot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "9999px",
    backgroundColor: "#60A5FA",
  },

  /* ── Input bar ── */
  inputBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    padding: "12px 16px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#0F172A",
    flexShrink: 0,
  },
  attachBtn: {
    background: "none",
    border: "none",
    color: "#64748B",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "color 0.15s",
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    resize: "none",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#F1F5F9",
    fontFamily: "inherit",
    outline: "none",
    lineHeight: 1.4,
    maxHeight: "100px",
    overflowY: "auto",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    border: "none",
    color: "#FFFFFF",
    width: "38px",
    height: "38px",
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.15s, transform 0.15s",
  },

  /* ── NotebookLM Slide Generation Bar ── */
  slideActionBanner: {
    margin: "4px 16px 8px",
    padding: "12px 14px",
    borderRadius: "14px",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
    flexShrink: 0,
  },
  slideActionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  notebookBadge: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#93C5FD",
    letterSpacing: "0.4px",
  },
  slideActionSub: {
    fontSize: "11px",
    color: "#64748B",
  },
  slideActionButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  actionPillBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.35)",
    color: "#DBEAFE",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  actionPillDetailed: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    color: "#EDE9FE",
  },

  /* ── Slide Deck Loading / Ready Cards ── */
  generatingDeckCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "14px",
    marginBottom: "8px",
  },
  generatingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(59, 130, 246, 0.2)",
    borderTopColor: "#3B82F6",
    borderRadius: "50%",
    animation: "spwSpin 0.8s linear infinite",
    flexShrink: 0,
  },
  generatingDeckTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#93C5FD",
  },
  generatingDeckSub: {
    fontSize: "11px",
    color: "#94A3B8",
    marginTop: "2px",
  },
  deckErrorCard: {
    padding: "10px 14px",
    borderRadius: "10px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "#FCA5A5",
    fontSize: "12px",
    marginBottom: "8px",
  },
  readyDeckCard: {
    padding: "14px 16px",
    backgroundColor: "#162036",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "14px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
    marginBottom: "10px",
  },
  readyDeckHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  readyDeckBadge: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#60A5FA",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    padding: "2px 8px",
    borderRadius: "9999px",
  },
  readyDeckCount: {
    fontSize: "11px",
    color: "#94A3B8",
  },
  readyDeckTitle: {
    margin: "0 0 4px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#F8FAFC",
  },
  readyDeckText: {
    margin: "0 0 12px",
    fontSize: "12px",
    color: "#94A3B8",
    lineHeight: 1.4,
  },
  readyDeckActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  openPanelBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#E2E8F0",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  openFullscreenBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    border: "none",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)",
  },
};
