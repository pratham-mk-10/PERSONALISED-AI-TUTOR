// ============================================================
// FirstLawOfReflectionAnimation.jsx
// Animation for the reflection rule: Angle of Incidence = Angle of Reflection
// ============================================================

import React, { useRef, useEffect } from "react";
import AnimationPlayer from "../../shared/AnimationPlayer";
import {
  incidentRayStart,
  reflectedRayEnd,
  describeArc,
  lerp,
  clamp,
} from "../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  AngleArc,
  Label,
} from "../../shared/SVGUtils";

// ── CONSTANTS ────────────────────────────────────────────────
const SVG_W    = 420;
const SVG_H    = 300;
const CX       = 210;
const CY       = 220;
const RAY_LEN  = 160;
const ANGLE    = 35;
const ARC_R    = 45;

const FirstLawOfReflectionAnimation = ({ onTryItClicked }) => {
  const audioRef = useRef(null);
  const lastStepRef = useRef(-1);
  const incStart  = incidentRayStart(CX, CY, RAY_LEN, ANGLE);
  const refEnd    = reflectedRayEnd(CX, CY, RAY_LEN, ANGLE);

  const playAudio = (step) => {
    if (step === lastStepRef.current) return;

    lastStepRef.current = step;

    const audioFiles = {
      0: ["/audio/mirror.wav"],
      1: ["/audio/normal.wav"],
      2: ["/audio/incident.wav"],
      3: ["/audio/AngleOfIncidence.wav"],
      4: ["/audio/reflected.wav"],
      5: ["/audio/AngleOfReflection.wav"],
      6: ["/audio/law.wav"],
    };

    const [audioFile, fallbackFile] = audioFiles[step] || [];

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioFile);
    audioRef.current = audio;

    audio.onerror = () => {
      if (!fallbackFile) return;

      const fallbackAudio = new Audio(fallbackFile);
      audioRef.current = fallbackAudio;
      fallbackAudio.play().catch(() => {});
    };

    audio.play().catch(() => {});
  };

  // Stop any playing audio when this animation unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      lastStepRef.current = -1;
    };
  }, []);

  return (
    <AnimationPlayer
      duration={42000}
      title="Watch: Reflection Rule"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress, playing, hasStarted }) => {
        let step = 0;

        if (progress < 0.10) step = 0;
        else if (progress < 0.22) step = 1;
        else if (progress < 0.40) step = 2;
        else if (progress < 0.56) step = 3;
        else if (progress < 0.74) step = 4;
        else if (progress < 0.94) step = 5;
        else step = 6;

        if (hasStarted) {
          playAudio(step);
          if (!playing && audioRef.current) {
            audioRef.current.pause();
          }
        }

        // ── PHASES ──
        const mirrorOpacity = clamp(progress / 0.10, 0, 1);

        const incPhase = clamp((progress - 0.22) / 0.18, 0, 1);
        const refPhase = clamp((progress - 0.56) / 0.20, 0, 1);

        const showIncArc = step >= 3;
        const showRefArc = step >= 5;
        const showLaw = step === 6;

        const incTip = lerp(incStart.x, incStart.y, CX, CY, incPhase);
        const refTip = lerp(CX, CY, refEnd.x, refEnd.y, refPhase);

        // ── ARC PATHS ──
        const incArcPath = describeArc(CX, CY, ARC_R, -ANGLE, 0);
        const refArcPath = describeArc(CX, CY, ARC_R, 0, ANGLE);

        const incLabelX = CX - ARC_R * 1.4 * Math.sin((ANGLE / 2) * Math.PI / 180);
        const incLabelY = CY - ARC_R * 1.2 * Math.cos((ANGLE / 2) * Math.PI / 180);
        const refLabelX = CX + ARC_R * 1.4 * Math.sin((ANGLE / 2) * Math.PI / 180);
        const refLabelY = CY - ARC_R * 1.2 * Math.cos((ANGLE / 2) * Math.PI / 180);

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>

            {/* ── BACKGROUND ── */}
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {/* ── MIRROR + NORMAL ── */}
            <g opacity={mirrorOpacity}>
              <PlaneMirror x1={60} x2={360} y={CY} />

              {/* Highlight mirror during explanation */}
              
              {step === 0 && (
                <line
                  x1={60} x2={360}
                  y1={CY} y2={CY}
                  stroke="#22C55E"
                  strokeWidth="4"
                  opacity="0.4"
                />
              )}

              <Normal x={CX} topY={60} bottomY={CY} />
              <Label x={CX + 8} y={75} text="Normal" color="#6B7280" size={12} anchor="start" />
            </g>

            {/* ── INCIDENT RAY ── */}
            {incPhase > 0 && (
              <g>
                <line
                  x1={incStart.x} y1={incStart.y}
                  x2={incTip.x}   y2={incTip.y}
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-blue)"
                />

                {/* moving highlight dot */}
                {progress >= 0.4 && progress < 0.65 && (
                  <circle cx={incTip.x} cy={incTip.y} r={4} fill="#2563EB" />
                )}
              </g>
            )}

            {/* ── REFLECTED RAY ── */}
            {refPhase > 0 && (
              <>
                <line
                  x1={CX} y1={CY}
                  x2={refTip.x} y2={refTip.y}
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-red)"
                />

                {/* moving highlight dot */}
                {progress >= 0.65 && progress < 0.85 && (
                  <circle cx={refTip.x} cy={refTip.y} r={4} fill="#DC2626" />
                )}
              </>
            )}

            {/* ── MARKERS ── */}
            <defs>
              <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
              </marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {/* ── ANGLES + LABELS ── */}
            {showIncArc && (
              <>
                <AngleArc
                  pathD={incArcPath}
                  color="#2563EB"
                  label="i"
                  labelX={incLabelX - 6}
                  labelY={incLabelY}
                />
              </>
            )}

            {showRefArc && (
              <>
                <AngleArc
                  pathD={refArcPath}
                  color="#DC2626"
                  label="r"
                  labelX={refLabelX + 6}
                  labelY={refLabelY}
                />
              </>
            )}

            {showLaw && (
              <>
                <rect x={90} y={55} width={240} height={28} rx={6} fill="#EFF6FF" stroke="#BFDBFE" />
                <Label
                  x={210}
                  y={29}
                  text="∠i = ∠r  (both from Normal)"
                  color="#1E40AF"
                  size={12}
                  bold
                />
              </>
            )}

            {/* ── TEACHER CAPTIONS ── */}
            {step === 0 && (
              <Label
                x={210}
                y={CY + 25}
                text="This is a mirror (reflecting surface)"
                color="#111827"
                size={14}
                anchor="middle"
                bold
              />
            )}
            {step === 1 && (
              <Label
                x={210} y={40}
                text="This dotted line is called the Normal"
                color="#111827"
                size={14}
                anchor="middle"
                bold
              />
            )}

            {step === 2 && (
              <Label
                x={210} y={40}
                text="This blue line is the Incident Ray"
                color="#2563EB"
                size={14}
                anchor="middle"
                bold
              />
            )}

            {step === 3 && (
              <>
                <Label
                  x={210}
                  y={30}
                  text="The angle made by the incident ray with the normal"
                  color="#2563EB"
                  size={12}
                  anchor="middle"
                  bold
                />
                <Label
                  x={210}
                  y={48}
                  text="is called the angle of incidence."
                  color="#2563EB"
                  size={12}
                  anchor="middle"
                  bold
                />
              </>
            )}

            {step === 4 && (
              <Label
                x={210} y={40}
                text="This red line is the Reflected Ray"
                color="#DC2626"
                size={14}
                anchor="middle"
                bold
              />
            )}

            {step === 5 && (
              <>
                <Label
                  x={210}
                  y={30}
                  text="The angle made by the reflected ray with the normal"
                  color="#DC2626"
                  size={12}
                  anchor="middle"
                  bold
                />
                <Label
                  x={210}
                  y={48}
                  text="is called the angle of reflection."
                  color="#DC2626"
                  size={12}
                  anchor="middle"
                  bold
                />
              </>
            )}

            {step === 6 && (
              <Label
                x={210}
                y={50}
                text="The angle of incidence equals the angle of reflection (∠i = ∠r)"
                color="#1E40AF"
                size={14}
                anchor="middle"
                bold
              />
            )}
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default FirstLawOfReflectionAnimation;
