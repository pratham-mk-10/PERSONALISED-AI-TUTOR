// ============================================================
// SphericalMirrorImageFormationWatch.jsx
// WATCH stage: Animated demonstration of image formation
// Shows all 6 object positions with auto-play slider
// 
// Topics covered:
// - Mirror anatomy (P, C, F, R, f)
// - Object position effect on image
// - Ray diagram rules in action
// - Nature + size + position of image
// ============================================================

import React from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";
import { lerp, clamp } from "../../../shared/PhysicsEngine";
import {
  ConcaveMirrorArc,
  PrincipalAxis,
  FocalPoint,
  CentreOfCurvature,
  Pole,
  Arrow,
  RayLine,
  Label,
  DataBox,
  MirrorFormula,
} from "../../../shared/SVGUtils";

// ── CONSTANTS ────────────────────────────────────────────────
const SVG_W = 720;
const SVG_H = 500;

// Mirror properties (scaled to fit SVG)
const MIRROR_CENTER_X = 360;
const MIRROR_CENTER_Y = 250;
const RADIUS_OF_CURVATURE = 80; // pixels
const FOCAL_LENGTH = 40; // R/2
const SCALE = 2; // pixels per distance unit

// 6 key positions for the slider
const POSITIONS = [
  {
    label: "Object at ∞",
    u: 999,
    description: "Light from very far away",
    phase: 0,
  },
  {
    label: "Beyond C",
    u: 2.5 * RADIUS_OF_CURVATURE,
    description: "Object far from mirror",
    phase: 1 / 6,
  },
  {
    label: "At C",
    u: RADIUS_OF_CURVATURE,
    description: "Object at centre of curvature",
    phase: 2 / 6,
  },
  {
    label: "Between C & F",
    u: 1.5 * FOCAL_LENGTH,
    description: "Object between C and F",
    phase: 3 / 6,
  },
  {
    label: "At F",
    u: FOCAL_LENGTH + 2, // slightly past F to avoid infinity
    description: "Object at focal point",
    phase: 4 / 6,
  },
  {
    label: "Between F & P",
    u: FOCAL_LENGTH * 0.6,
    description: "Object between F and pole (shaving mirror)",
    phase: 5 / 6,
  },
];

const AUDIO_STEPS = [
  { progress: 0.08, text: "Every spherical mirror has key landmarks: the Pole, Focal point, and Centre of Curvature." },
  { progress: 0.18, text: "Any two standard rays determine the image. Ray one goes parallel and reflects through the focus." },
  { progress: 0.30, text: "When the object is at infinity, the light rays arrive parallel and the image forms at the Focus." },
  { progress: 0.42, text: "When the object is beyond C, the image forms between C and F. It is real, inverted, and smaller." },
  { progress: 0.54, text: "When the object is exactly at C, the image also forms at C, and is exactly the same size." },
  { progress: 0.64, text: "When the object is between C and F, the image forms beyond C. The image is now magnified." },
  { progress: 0.76, text: "If the object is placed exactly at the focal point, the reflected rays are parallel, so the image forms at infinity." },
  { progress: 0.88, text: "If the object is between the Focus and the Pole, a virtual, erect, and magnified image forms behind the mirror." },
  { progress: 1.0,  text: "In summary, as the object moves closer to the mirror, the image generally moves further away and grows larger." }
];

const SphericalMirrorImageFormationWatch = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Image Formation by Spherical Mirrors"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {
        // ── STEP PROGRESSION ──────────────────────────────────
        let step = 0;
        if (progress < 0.08) step = 0; // Mirror anatomy
        else if (progress < 0.18) step = 1; // Ray rules
        else if (progress < 0.30) step = 2; // At ∞
        else if (progress < 0.42) step = 3; // Beyond C
        else if (progress < 0.54) step = 4; // At C
        else if (progress < 0.64) step = 5; // Between C & F
        else if (progress < 0.76) step = 6; // At F
        else if (progress < 0.88) step = 7; // Between F & P
        else step = 8; // Summary

        // ── MIRROR ANATOMY PHASE (step 0-1) ──────────────────
        const anatomyFade = clamp(1 - Math.abs(step - 0.5) / 1.5, 0, 1);
        const rayRulesFade = clamp(1 - Math.abs(step - 1) / 1.5, 0, 1);

        // ── POSITION SLIDER (step 2-7) ───────────────────────
        let positionIndex = Math.min(Math.floor((progress - 0.18) / 0.12), 5);
        if (step < 2) positionIndex = 0;
        if (step > 7) positionIndex = 5;

        const currentPos = POSITIONS[positionIndex];
        const { u, description } = currentPos;

        // ── CALCULATE IMAGE DISTANCE ─────────────────────────
        // Mirror formula: 1/f = 1/u + 1/v
        // Solving for v: v = (u * f) / (u - f)
        const f = FOCAL_LENGTH;
        let v = (u * f) / (u - f);

        // Clamp v for visualization (if at F, v approaches infinity)
        if (Math.abs(u - f) < 5) v = 400; // off-screen

        // ── MAGNIFICATION ────────────────────────────────────
        // m = -v/u
        const m = -v / u;
        const isReal = v > 0;
        const isErect = m > 0;
        const isEnlarged = Math.abs(m) > 1;

        // ── OBJECT & IMAGE POSITIONS ─────────────────────────
        const objectX = MIRROR_CENTER_X - u * SCALE;
        const imageX = MIRROR_CENTER_X - v * SCALE;

        // Object height (constant)
        const objectHeight = 60;
        const imageHeight = Math.abs(m) * objectHeight;

        // Y positions (on principal axis)
        const objectY = MIRROR_CENTER_Y;
        const imageY = isErect ? MIRROR_CENTER_Y : MIRROR_CENTER_Y;

        // ── RAY PATHS (only for steps 2-7) ───────────────────
        const showRays = step >= 2 && step <= 7;

        // Ray 1: Parallel → through F
        const ray1Start = { x: objectX, y: objectY - objectHeight / 2 };
        const ray1Mirror = { x: MIRROR_CENTER_X, y: MIRROR_CENTER_Y };
        const ray1End = { x: MIRROR_CENTER_X - f * SCALE, y: MIRROR_CENTER_Y };

        // Ray 2: Through F → becomes parallel
        const ray2Start = { x: objectX, y: objectY - objectHeight / 2 };
        const ray2Through = { x: MIRROR_CENTER_X - f * SCALE, y: MIRROR_CENTER_Y };
        const ray2End = { x: 500, y: objectY - objectHeight / 2 };

        // Ray 3: Through C → bounces back
        const ray3Start = { x: objectX, y: objectY - objectHeight / 2 };
        const ray3Through = { x: MIRROR_CENTER_X - RADIUS_OF_CURVATURE * SCALE, y: MIRROR_CENTER_Y };
        const ray3End = imageX > MIRROR_CENTER_X
          ? { x: 600, y: objectY - objectHeight / 2 }
          : { x: imageX, y: imageY + (isErect ? imageHeight / 2 : -imageHeight / 2) };

        // ── CAPTIONS ──────────────────────────────────────────
        let caption = "";
        let subcaption = "";

        if (step === 0) {
          caption = "Mirror Anatomy";
          subcaption = "Every mirror has key landmarks: Pole (P), Focal point (F), Centre of Curvature (C)";
        } else if (step === 1) {
          caption = "Ray Diagram Rules";
          subcaption = "Any 2 rays determine the image. Ray 1: parallel → F. Ray 2: through F → parallel. Ray 3: through C → straight back.";
        } else if (step >= 2 && step <= 7) {
          caption = currentPos.label;
          subcaption = description;
        } else if (step === 8) {
          caption = "Summary: Object position determines image";
          subcaption = "As object moves, image responds nonlinearly (mirror formula).";
        }

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            {/* ── BACKGROUND ── */}
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {/* ── MIRROR ANATOMY (fade in/out) ── */}
            <g opacity={anatomyFade}>
              {/* Concave mirror arc */}
              <ConcaveMirrorArc
                centerX={MIRROR_CENTER_X}
                centerY={MIRROR_CENTER_Y}
                radius={RADIUS_OF_CURVATURE}
                color="#3B82F6"
              />

              {/* Principal axis */}
              <PrincipalAxis
                startX={100}
                endX={550}
                y={MIRROR_CENTER_Y}
              />

              {/* Landmarks */}
              <Pole x={MIRROR_CENTER_X} y={MIRROR_CENTER_Y} />
              <FocalPoint
                x={MIRROR_CENTER_X - FOCAL_LENGTH * SCALE}
                y={MIRROR_CENTER_Y}
                label="F"
              />
              <CentreOfCurvature
                x={MIRROR_CENTER_X - RADIUS_OF_CURVATURE * SCALE}
                y={MIRROR_CENTER_Y}
                label="C"
              />

              {/* Formula box */}
              <MirrorFormula
                x={550}
                y={50}
                text={`f = R/2 = ${FOCAL_LENGTH}`}
              />
            </g>

            {/* ── RAY RULES (fade in/out) ── */}
            {rayRulesFade > 0 && (
              <g opacity={rayRulesFade}>
                <text x={360} y={80} textAnchor="middle" fontSize="14" fontWeight="500" fill="#1F2937">
                  Ray 1: Parallel → F
                </text>
                <RayLine
                  x1={100}
                  y1={MIRROR_CENTER_Y - 30}
                  x2={MIRROR_CENTER_X - FOCAL_LENGTH * SCALE}
                  y2={MIRROR_CENTER_Y}
                  color="#F97316"
                  label="Ray 1"
                />

                <text x={360} y={150} textAnchor="middle" fontSize="14" fontWeight="500" fill="#1F2937">
                  Ray 2: Through F → Parallel
                </text>
                <RayLine
                  x1={100}
                  y1={MIRROR_CENTER_Y + 30}
                  x2={500}
                  y2={MIRROR_CENTER_Y + 30}
                  color="#A855F7"
                  label="Ray 2"
                />

                <text x={360} y={220} textAnchor="middle" fontSize="14" fontWeight="500" fill="#1F2937">
                  Ray 3: Through C → Straight back
                </text>
                <RayLine
                  x1={100}
                  y1={MIRROR_CENTER_Y - 60}
                  x2={MIRROR_CENTER_X - RADIUS_OF_CURVATURE * SCALE}
                  y2={MIRROR_CENTER_Y}
                  color="#14B8A6"
                  label="Ray 3"
                />
              </g>
            )}

            {/* ── OBJECT & IMAGE ARROWS (steps 2-7) ── */}
            {showRays && (
              <>
                {/* Object arrow (red) */}
                <Arrow
                  x={objectX}
                  y={objectY}
                  height={objectHeight}
                  color="#EF4444"
                  label="Object"
                  direction="up"
                />

                {/* Image arrow (green) */}
                {!isEnlarged || Math.abs(v) < 200 ? (
                  <Arrow
                    x={imageX}
                    y={imageY + (isErect ? 0 : imageHeight)}
                    height={imageHeight}
                    color="#22C55E"
                    label="Image"
                    direction={isErect ? "up" : "down"}
                  />
                ) : (
                  <text
                    x={imageX}
                    y={MIRROR_CENTER_Y - 80}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#22C55E"
                  >
                    (Image beyond screen)
                  </text>
                )}

                {/* RAY PATHS ── */}
                {/* Ray 1: Parallel → through F */}
                <line
                  x1={ray1Start.x}
                  y1={ray1Start.y}
                  x2={ray1Mirror.x}
                  y2={ray1Mirror.y}
                  stroke="#F97316"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <line
                  x1={ray1Mirror.x}
                  y1={ray1Mirror.y}
                  x2={ray1End.x}
                  y2={ray1End.y}
                  stroke="#F97316"
                  strokeWidth="2"
                  markerEnd="url(#arrow-orange)"
                />

                {/* Ray 2: Through F → parallel */}
                <line
                  x1={ray2Start.x}
                  y1={ray2Start.y}
                  x2={ray2Through.x}
                  y2={ray2Through.y}
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <line
                  x1={ray2Through.x}
                  y1={ray2Through.y}
                  x2={ray2End.x}
                  y2={ray2End.y}
                  stroke="#A855F7"
                  strokeWidth="2"
                  markerEnd="url(#arrow-purple)"
                />

                {/* Ray 3: Through C → straight back */}
                <line
                  x1={ray3Start.x}
                  y1={ray3Start.y}
                  x2={ray3Through.x}
                  y2={ray3Through.y}
                  stroke="#14B8A6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <line
                  x1={ray3Through.x}
                  y1={ray3Through.y}
                  x2={ray3End.x}
                  y2={ray3End.y}
                  stroke="#14B8A6"
                  strokeWidth="2"
                  markerEnd="url(#arrow-teal)"
                />

                {/* DATA BOX (right panel) */}
                <DataBox
                  x={550}
                  y={120}
                  u={u}
                  v={v}
                  f={FOCAL_LENGTH}
                  m={m}
                  isReal={isReal}
                  isEnlarged={isEnlarged}
                  isErect={isErect}
                />
              </>
            )}

            {/* ── MARKERS ── */}
            <defs>
              <marker
                id="arrow-orange"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#F97316" />
              </marker>
              <marker
                id="arrow-purple"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#A855F7" />
              </marker>
              <marker
                id="arrow-teal"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="#14B8A6" />
              </marker>
            </defs>

            {/* ── CAPTIONS ── */}
            <g>
              <rect x={40} y={420} width={640} height={60} rx={8} fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" />
              <text
                x={360}
                y={445}
                textAnchor="middle"
                fontSize="16"
                fontWeight="600"
                fill="#1E40AF"
              >
                {caption}
              </text>
              <text
                x={360}
                y={468}
                textAnchor="middle"
                fontSize="13"
                fill="#1E3A8A"
              >
                {subcaption}
              </text>
            </g>
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default SphericalMirrorImageFormationWatch;