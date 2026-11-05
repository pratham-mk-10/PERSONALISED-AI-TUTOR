import React, { useState } from "react";

/**
 * Floating Action Button (FAB) that opens the Material AI Tutor sidebar.
 *
 * Props:
 *  - onClick    : () => void — toggle the sidebar
 *  - isOpen     : boolean    — whether the sidebar is currently open
 *  - fileCount  : number     — number of uploaded files (shows badge)
 */
export default function ChatTriggerButton({ onClick, isOpen, fileCount = 0 }) {
  const [hovered, setHovered] = useState(false);

  // When the sidebar drawer is open, hide the floating trigger button
  // so the bottom chat input bar and Send button remain completely unobstructed.
  if (isOpen) {
    return null;
  }

  // ── Spark / brain icon (SVG) ──
  const icon = (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Chat bubble with a sparkle */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      {/* Sparkle inside */}
      <path d="M12 8v2m0 2v2m-2-3h4" />
    </svg>
  );

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Open Material AI Tutor"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 1100,
        width: "60px",
        height: "60px",
        borderRadius: "9999px",
        border: "none",
        background: isOpen
          ? "linear-gradient(135deg, #1D4ED8, #2563EB)"
          : "linear-gradient(135deg, #3B82F6, #1D4ED8)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 0 28px rgba(59, 130, 246, 0.7), 0 6px 20px rgba(0,0,0,0.35)"
          : "0 0 18px rgba(59, 130, 246, 0.4), 0 4px 14px rgba(0,0,0,0.25)",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Glow ring */}
      <span
        style={{
          position: "absolute",
          inset: "-4px",
          borderRadius: "9999px",
          border: "2px solid rgba(59, 130, 246, 0.35)",
          animation: "chatFabPulse 2.5s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {isOpen ? (
        /* Close (×) icon when sidebar is open */
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        icon
      )}

      {/* Badge for uploaded file count */}
      {fileCount > 0 && !isOpen && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            backgroundColor: "#EF4444",
            color: "#FFF",
            fontSize: "11px",
            fontWeight: 700,
            width: "22px",
            height: "22px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #0B0F19",
          }}
        >
          {fileCount > 9 ? "9+" : fileCount}
        </span>
      )}

      {/* Keyframe injection (only once) */}
      <style>{`
        @keyframes chatFabPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.35); }
        }
      `}</style>
    </button>
  );
}

