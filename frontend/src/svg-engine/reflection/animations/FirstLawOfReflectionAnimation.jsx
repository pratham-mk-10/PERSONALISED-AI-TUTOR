// ============================================================
// SphericalMirrorBasicsAnimation.jsx
// WATCH stage — Foundations before image formation
// ============================================================

import React, { useRef, useEffect } from "react";
import AnimationPlayer from "../../shared/AnimationPlayer";
import { clamp } from "../../shared/PhysicsEngine";
import { Label } from "../../shared/SVGUtils";

const SVG_W = 420;
const SVG_H = 300;
const CX = 210;
const CY = 180;

const SphericalMirrorBasicsAnimation = () => {
  const audioRef = useRef(null);
  const lastStepRef = useRef(-1);

  const playAudio = (step) => {
    if (step === lastStepRef.current) return;
    lastStepRef.current = step;

    const audioFiles = {
      0: ["/audio/mirror.mp3"],
      1: ["/audio/mirror.mp3"],
      2: ["/audio/normal.mp3"],
      3: ["/audio/normal.mp3"],
      4: ["/audio/normal.mp3"],
      5: ["/audio/incident.mp3"],
      6: ["/audio/law.mp3"],
    };

    const [audioFile] = audioFiles[step] || [];

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(audioFile);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      lastStepRef.current = -1;
    };
  }, []);

  return (
    <AnimationPlayer duration={30000} title="Watch: Spherical Mirror Basics">

      {({ progress }) => {
        let step = 0;

        if (progress < 0.15) step = 0;
        else if (progress < 0.30) step = 1;
        else if (progress < 0.45) step = 2;
        else if (progress < 0.60) step = 3;
        else if (progress < 0.75) step = 4;
        else if (progress < 0.90) step = 5;
        else step = 6;

        playAudio(step);

        const mirrorOpacity = clamp(progress / 0.15, 0, 1);

        return (
          <svg width={SVG_W} height={SVG_H}>

            {/* Background */}
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {/* ================= SPHERE CONTEXT ================= */}
            {step === 0 && (
              <>
                <circle cx={CX} cy={CY} r={120} stroke="#D1D5DB" fill="none" />
                <path
                  d={`M${CX} ${CY - 120} Q${CX - 80} ${CY} ${CX} ${CY + 120}`}
                  stroke="#2563EB"
                  strokeWidth="3"
                  fill="none"
                />

                <Label
                  x={210}
                  y={40}
                  text="A spherical mirror is part of a sphere"
                  anchor="middle"
                  bold
                />
              </>
            )}

            {/* ================= TYPES ================= */}
            {step === 1 && (
              <>
                {/* Concave */}
                <path
                  d={`M${CX - 40} ${CY - 80} Q${CX - 80} ${CY} ${CX - 40} ${CY + 80}`}
                  stroke="#2563EB"
                  strokeWidth="3"
                />
                <Label x={150} y={260} text="Concave" />

                {/* Convex */}
                <path
                  d={`M${CX + 40} ${CY - 80} Q${CX + 80} ${CY} ${CX + 40} ${CY + 80}`}
                  stroke="#22C55E"
                  strokeWidth="3"
                />
                <Label x={260} y={260} text="Convex" />

                <Label
                  x={210}
                  y={40}
                  text="Mirrors can be concave or convex"
                  anchor="middle"
                  bold
                />
              </>
            )}

            {/* ================= POLE ================= */}
            {step >= 2 && (
              <>
                <path
                  d={`M${CX} ${CY - 80} Q${CX - 60} ${CY} ${CX} ${CY + 80}`}
                  stroke="#2563EB"
                  strokeWidth="3"
                />

                <circle cx={CX} cy={CY} r={4} fill="#EF4444" />
                <Label x={CX + 6} y={CY - 6} text="P" />
              </>
            )}

            {/* ================= CENTRE ================= */}
            {step >= 3 && (
              <>
                <circle cx={CX - 120} cy={CY} r={4} fill="#8B5CF6" />
                <Label x={CX - 130} y={CY - 6} text="C" />
              </>
            )}

            {/* ================= AXIS ================= */}
            {step >= 4 && (
              <line
                x1="40"
                y1={CY}
                x2="380"
                y2={CY}
                stroke="#6B7280"
                strokeDasharray="5"
              />
            )}

            {/* ================= FOCUS ================= */}
            {step >= 5 && (
              <>
                {/* Rays */}
                <line x1="80" y1="140" x2="150" y2="140" stroke="#F59E0B" />
                <line x1="80" y1="180" x2="150" y2="180" stroke="#F59E0B" />
                <line x1="80" y1="220" x2="150" y2="220" stroke="#F59E0B" />

                <line x1="150" y1="140" x2="120" y2="180" stroke="#F59E0B" />
                <line x1="150" y1="180" x2="120" y2="180" stroke="#F59E0B" />
                <line x1="150" y1="220" x2="120" y2="180" stroke="#F59E0B" />

                <circle cx={120} cy={CY} r={4} fill="#10B981" />
                <Label x={125} y={CY - 6} text="F" />
              </>
            )}

            {/* ================= R = 2f ================= */}
            {step === 6 && (
              <>
                <Label
                  x={210}
                  y={40}
                  text="F lies midway between P and C (R = 2f)"
                  anchor="middle"
                  bold
                />
              </>
            )}

          </svg>
        );
      }}

    </AnimationPlayer>
  );
};

export default SphericalMirrorBasicsAnimation;