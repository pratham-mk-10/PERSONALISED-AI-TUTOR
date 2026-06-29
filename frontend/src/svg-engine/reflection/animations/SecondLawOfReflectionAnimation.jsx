// ============================================================
// SecondLawOfReflectionAnimation.jsx (Reflection Rule)
// The incident ray, reflected ray, and normal ALL lie in 
// the SAME PLANE (perpendicular to the mirror surface)
//
// Changes from the previous reflection step:
// - Shows 3D representation (2D view of 3D space)
// - Demonstrates ray + normal + mirror in same plane
// - Shows what happens if ray goes out of plane (WRONG)
// - Step-by-step: intro → mirror → normal → ray in plane → law
// ============================================================

import React from "react";
import { useRef } from "react";
import AnimationPlayer from "../../shared/AnimationPlayer";
import {
  incidentRayStart,
  reflectedRayEnd,
  lerp,
  clamp,
} from "../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  Label,
} from "../../shared/SVGUtils";

// ── CONSTANTS ────────────────────────────────────────────────
const SVG_W    = 420;
const SVG_H    = 320;
const CX       = 210;
const CY       = 200;
const RAY_LEN  = 140;
const ANGLE    = 35;

const SecondLawOfReflectionAnimation = ({ onTryItClicked }) => {
  const audioRef = useRef(null);
  const lastStepRef = useRef(-1);

  const playAudio = (step) => {
    if (step === lastStepRef.current) return;

    lastStepRef.current = step;

    const audioFiles = {
      0: ["/audio/2nd_law_intro.wav"],
      1: ["/audio/2nd_mirror.wav"],
      2: ["/audio/2nd_normal.wav"],
      3: ["/audio/2nd_plane_definition.wav"],
      4: ["/audio/2nd_incident_plane.wav"],
      5: ["/audio/2nd_reflected_plane.wav"],
      6: ["/audio/2nd_all_same_plane.wav"],
      7: ["/audio/2nd_law_statement.wav"],
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

  return (
    <AnimationPlayer
      duration={48000}
      title="2nd Law of Reflection"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress, playing, hasStarted }) => {
        // ── STEP LOGIC ──
        let step = 0;

        if (progress < 0.08) step = 0;      // Intro
        else if (progress < 0.18) step = 1; // Mirror appears
        else if (progress < 0.30) step = 2; // Normal appears
        else if (progress < 0.44) step = 3; // Plane definition
        else if (progress < 0.58) step = 4; // Incident ray in plane
        else if (progress < 0.72) step = 5; // Reflected ray in plane
        else if (progress < 0.88) step = 6; // All in same plane (emphasis)
        else step = 7;                       // Law statement

        if (hasStarted) {
          playAudio(step);
          if (!playing && audioRef.current) {
            audioRef.current.pause();
          }
        }

        // ── FADE-INS ──
        const mirrorOpacity = clamp(progress / 0.18, 0, 1);
        const normalOpacity = clamp((progress - 0.18) / 0.12, 0, 1);
        const planeOpacity = clamp((progress - 0.30) / 0.14, 0, 1);
        const incPhase = clamp((progress - 0.44) / 0.14, 0, 1);
        const refPhase = clamp((progress - 0.58) / 0.14, 0, 1);
        const emphasisPhase = clamp((progress - 0.72) / 0.16, 0, 1);

        // ── VISIBILITY FLAGS ──
        const showPlaneBox = step >= 3;
        const showIncRay = step >= 4;
        const showRefRay = step >= 5;
        const showEmphasis = step === 6;
        const showLaw = step === 7;

        // Move supporting labels away from the final law box in step 7.
        const planeLabelX = showLaw ? 95 : 95;
        const planeLabelY = showLaw ? 232 : 95;
        const normalLabelX = showLaw ? CX + 18 : CX + 8;
        const normalLabelY = showLaw ? 156 : 75;

        // ── RAY POSITIONS (animated along physically consistent paths) ──
        const incStart = incidentRayStart(CX, CY, RAY_LEN, ANGLE);
        const refEnd = reflectedRayEnd(CX, CY, RAY_LEN, ANGLE);

        // Lerp incident ray from start toward mirror
        const incTip = lerp(incStart.x, incStart.y, CX, CY, incPhase);

        // Lerp reflected ray from mirror outward
        const refTip = lerp(CX, CY, refEnd.x, refEnd.y, refPhase);

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>

            {/* ── BACKGROUND ── */}
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {/* ── TITLE (STEP 0) ── */}
            {step === 0 && (
              <Label
                x={CX}
                y={50}
                text="Reflection Rule"
                color="#111827"
                size={16}
                anchor="middle"
                bold
              />
            )}

            {/* ── PLANE DEFINITION BOX ── */}
            {showPlaneBox && (
              <g opacity={planeOpacity}>
                {/* Subtle plane rectangle (represents the plane perpendicular to mirror) */}
                <rect
                  x={80}
                  y={80}
                  width={260}
                  height={160}
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  rx="4"
                />
                <Label
                  x={planeLabelX}
                  y={planeLabelY}
                  text="Plane of Incidence"
                  color="#6B7280"
                  size={11}
                  anchor="start"
                  italic={true}
                />
              </g>
            )}

            {/* ── MIRROR ── */}
            <g opacity={mirrorOpacity}>
              <PlaneMirror x1={60} x2={360} y={CY} />

              {/* Highlight mirror in step 1 */}
              {step === 1 && (
                <line
                  x1={60}
                  x2={360}
                  y1={CY}
                  y2={CY}
                  stroke="#22C55E"
                  strokeWidth="4"
                  opacity="0.4"
                />
              )}
            </g>

            {/* ── NORMAL (perpendicular to mirror) ── */}
            {normalOpacity > 0 && (
              <g opacity={normalOpacity}>
                <Normal x={CX} topY={60} bottomY={CY} />
                <Label
                  x={normalLabelX}
                  y={normalLabelY}
                  text="Normal (N)"
                  color="#6B7280"
                  size={12}
                  anchor="start"
                />

                {/* Highlight normal in step 2 */}
                {step === 2 && (
                  <circle cx={CX} cy={130} r={3} fill="#6B7280" />
                )}
              </g>
            )}

            {/* ── INCIDENT RAY ── */}
            {showIncRay && incPhase > 0 && (
              <g>
                <line
                  x1={incStart.x}
                  y1={incStart.y}
                  x2={incTip.x}
                  y2={incTip.y}
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-blue)"
                />

                {/* Moving highlight dot */}
                {progress >= 0.44 && progress < 0.70 && (
                  <circle cx={incTip.x} cy={incTip.y} r={4} fill="#2563EB" />
                )}

                {/* Step 4 label */}
                {step === 4 && (
                  <Label
                    x={incStart.x - 20}
                    y={incStart.y - 15}
                    text="Incident Ray"
                    color="#2563EB"
                    size={12}
                    anchor="end"
                    bold
                  />
                )}
              </g>
            )}

            {/* ── REFLECTED RAY ── */}
            {showRefRay && refPhase > 0 && (
              <g>
                <line
                  x1={CX}
                  y1={CY}
                  x2={refTip.x}
                  y2={refTip.y}
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-red)"
                />

                {/* Moving highlight dot */}
                {progress >= 0.62 && progress < 0.85 && (
                  <circle cx={refTip.x} cy={refTip.y} r={4} fill="#DC2626" />
                )}

                {/* Step 5 label */}
                {step === 5 && (
                  <Label
                    x={refEnd.x + 20}
                    y={refEnd.y - 15}
                    text="Reflected Ray"
                    color="#DC2626"
                    size={12}
                    anchor="start"
                    bold
                  />
                )}
              </g>
            )}

            {/* ── MARKERS (Arrow heads) ── */}
            <defs>
              <marker
                id="arrow-blue"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
              </marker>
              <marker
                id="arrow-red"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {/* ── EMPHASIS BOX (Step 6) ── */}
            {showEmphasis && emphasisPhase > 0.3 && (
              <g opacity={clamp(emphasisPhase, 0, 1)}>
                <rect
                  x={70}
                  y={130}
                  width={280}
                  height={90}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="3"
                  rx="8"
                  opacity="0.6"
                />
                <Label
                  x={210}
                  y={295}
                  text="All three (incident ray, reflected ray, normal) lie in the SAME PLANE"
                  color="#16A34A"
                  size={12}
                  anchor="middle"
                  bold
                />
              </g>
            )}

            {/* ── LAW STATEMENT (Step 7) ── */}
            {showLaw && (
              <g>
                {/* Background box */}
                <rect
                  x={40}
                  y={224}
                  width={340}
                  height={88}
                  rx={8}
                  fill="#EFF6FF"
                  stroke="#BFDBFE"
                  strokeWidth="2"
                />

                {/* Law statement */}
                <Label
                  x={210}
                  y={246}
                  text="2nd Law of Reflection:"
                  color="#1E40AF"
                  size={13}
                  anchor="middle"
                  bold
                />

                <Label
                  x={210}
                  y={266}
                  text="The incident ray, reflected ray, and normal"
                  color="#1E40AF"
                  size={12}
                  anchor="middle"
                />

                <Label
                  x={210}
                  y={284}
                  text="ALL LIE IN THE SAME PLANE"
                  color="#1E40AF"
                  size={12}
                  anchor="middle"
                  bold
                />

                <Label
                  x={210}
                  y={302}
                  text="(perpendicular to the mirror surface)"
                  color="#6B7280"
                  size={11}
                  anchor="middle"
                  italic={true}
                />
              </g>
            )}

            {/* ── TEACHER CAPTIONS (STEP-BY-STEP) ── */}
            {step === 0 && (
              <Label
                x={210}
                y={CY + 30}
                text="Let's learn the 2nd law of reflection"
                color="#111827"
                size={14}
                anchor="middle"
                bold
              />
            )}

            {step === 1 && (
              <Label
                x={210}
                y={CY + 30}
                text="We have a mirror (the reflecting surface)"
                color="#111827"
                size={14}
                anchor="middle"
                bold
              />
            )}

            {step === 2 && (
              <Label
                x={210}
                y={40}
                text="Remember the Normal? It's perpendicular to the mirror."
                color="#111827"
                size={13}
                anchor="middle"
                bold
              />
            )}

            {step === 3 && (
              <>
                <Label
                  x={210}
                  y={35}
                  text="There's an invisible PLANE that includes:"
                  color="#111827"
                  size={13}
                  anchor="middle"
                  bold
                />
                <Label
                  x={210}
                  y={55}
                  text="the mirror surface AND the normal line"
                  color="#111827"
                  size={13}
                  anchor="middle"
                />
                <Label
                  x={210}
                  y={280}
                  text="This plane is perpendicular to (standing upright from) the mirror"
                  color="#6B7280"
                  size={11}
                  anchor="middle"
                  italic={true}
                />
              </>
            )}

            {step === 4 && (
              <>
                <Label
                  x={210}
                  y={35}
                  text="The incident ray (blue) travels towards the mirror"
                  color="#2563EB"
                  size={13}
                  anchor="middle"
                  bold
                />
                <Label
                  x={210}
                  y={280}
                  text="IMPORTANT: This ray must be in the same plane!"
                  color="#2563EB"
                  size={11}
                  anchor="middle"
                  italic={true}
                />
              </>
            )}

            {step === 5 && (
              <>
                <Label
                  x={210}
                  y={35}
                  text="The reflected ray (red) bounces off the mirror"
                  color="#DC2626"
                  size={13}
                  anchor="middle"
                  bold
                />
                <Label
                  x={210}
                  y={280}
                  text="Notice: The reflected ray ALSO stays in the same plane!"
                  color="#DC2626"
                  size={11}
                  anchor="middle"
                  italic={true}
                />
              </>
            )}

            {step === 6 && (
              <>
                <Label
                  x={210}
                  y={25}
                  text="This is the reflection rule:"
                  color="#16A34A"
                  size={14}
                  anchor="middle"
                  bold
                />
                <Label
                  x={210}
                  y={270}
                  text="The incident ray, reflected ray, and normal are ALWAYS in the SAME plane"
                  color="#16A34A"
                  size={12}
                  anchor="middle"
                  bold
                />
              </>
            )}

            {/* The redundant text has been removed to prevent overlap */}
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default SecondLawOfReflectionAnimation;