// ============================================================
// PlaneMirrorApplicationsAnimation.jsx
// Show stage for the "Plane Mirror Applications" module: lateral
// inversion deep dive (AMBULANCE + symmetric letters), multiple
// images with two mirrors at an angle (verified via the standard
// alternating-reflection construction, not a schematic guess),
// kaleidoscope, and periscope.
//
// Multi-mirror image math (reflectAcrossLine / generateMultiMirrorImages)
// was verified via a standalone node script before being used here:
// for two mirrors at 90 deg, the recursion produces exactly 3 images
// and then cycles back to the original object position; at 60 deg it
// produces exactly 5 images before cycling back -- matching the
// Number of images = (360/theta) - 1 formula exactly for both cases.
// ============================================================

import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import { Label } from "../../shared/SVGUtils";

const SVG_W = 700;
const SVG_H = 380;

// Reflect a point across a line through the origin making `angleDeg` with
// the x-axis (standard 2D reflection matrix: R(2*phi)).
const reflectAcrossLine = (p, angleDeg) => {
  const phi = (angleDeg * Math.PI) / 180;
  const c2 = Math.cos(2 * phi);
  const s2 = Math.sin(2 * phi);
  return { x: p.x * c2 + p.y * s2, y: p.x * s2 - p.y * c2 };
};

// Alternately reflect the object across mirror A (angle 0) then mirror B
// (angle theta), which is the standard construction for the images formed
// by two plane mirrors meeting at theta. Terminates after `count` images.
const generateMultiMirrorImages = (thetaDeg, count, objAngleDeg, r) => {
  const objPhi = (objAngleDeg * Math.PI) / 180;
  let cur = { x: r * Math.cos(objPhi), y: r * Math.sin(objPhi) };
  let useA = true;
  const imgs = [];
  for (let i = 0; i < count; i++) {
    cur = reflectAcrossLine(cur, useA ? 0 : thetaDeg);
    imgs.push(cur);
    useA = !useA;
  }
  return imgs;
};

// ─── Scene 1: AMBULANCE / lateral inversion deep dive ──────────
const AmbulanceScene = () => {
  const mirrorX = 350;
  const wordX = 200;
  return (
    <g>
      <line x1={mirrorX} y1={70} x2={mirrorX} y2={310} stroke="#1F2937" strokeWidth={4} />
      <text x={wordX} y={200} fontSize={34} fontWeight="bold" fill="#16A34A" textAnchor="middle" fontFamily="Arial">AMBULANCE</text>
      <Label x={wordX} y={230} text="Written normally on the front of the vehicle" size={12} color="#16A34A" />
      <g transform={`translate(${wordX + (2 * mirrorX - wordX)},0) scale(-1,1)`}>
        <text x={wordX} y={200} fontSize={34} fontWeight="bold" fill="#DC2626" textAnchor="middle" fontFamily="Arial">AMBULANCE</text>
      </g>
      <Label x={2 * mirrorX - wordX} y={230} text="As it appears in a car's rear-view mirror ahead" size={12} color="#DC2626" />
      <Label x={SVG_W / 2} y={330} text="Written reversed on purpose -- so lateral inversion flips it back to normal in a mirror" size={13} color="#111827" bold />
    </g>
  );
};

// ─── Scene 2: Symmetric vs asymmetric letters ──────────────────
const SYMMETRIC_LETTERS = ["A", "H", "I", "M", "O", "T", "U"];
const SymmetricLettersScene = () => {
  const rowY = 130;
  const startX = 90;
  const gap = 75;
  return (
    <g>
      <Label x={SVG_W / 2} y={60} text="These letters look identical to their own mirror image:" size={13} color="#111827" bold />
      {SYMMETRIC_LETTERS.map((ch, i) => (
        <text key={ch} x={startX + i * gap} y={rowY} fontSize={30} fontWeight="bold" fill="#16A34A" textAnchor="middle" fontFamily="Arial">{ch}</text>
      ))}
      <line x1={40} y1={165} x2={SVG_W - 40} y2={165} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,4" />
      <Label x={SVG_W / 2} y={230} text="But an asymmetric letter clearly flips:" size={13} color="#111827" bold />
      <text x={280} y={300} fontSize={40} fontWeight="bold" fill="#16A34A" textAnchor="middle" fontFamily="Arial">R</text>
      <Label x={280} y={330} text="Normal R" size={12} color="#16A34A" />
      <g transform={`translate(${2 * 420},0) scale(-1,1)`}>
        <text x={420} y={300} fontSize={40} fontWeight="bold" fill="#DC2626" textAnchor="middle" fontFamily="Arial">R</text>
      </g>
      <Label x={420} y={330} text="Mirror image of R (backwards)" size={12} color="#DC2626" />
    </g>
  );
};

// ─── Scene 3: Multiple images with two mirrors at an angle ─────
const MultiMirrorPanel = ({ theta, count, cx, label }) => {
  const cy = 200;
  const scale = 70;
  const mirrorLen = 110;
  const toScreen = (p) => ({ x: cx + p.x * scale, y: cy - p.y * scale });
  const objAngle = theta / 2;
  const objMath = { x: Math.cos((objAngle * Math.PI) / 180) * 0.6, y: Math.sin((objAngle * Math.PI) / 180) * 0.6 };
  const obj = toScreen(objMath);
  const images = generateMultiMirrorImages(theta, count, objAngle, 0.6).map(toScreen);
  const mirrorAEnd = toScreen({ x: (mirrorLen / scale), y: 0 });
  const mirrorBEnd = toScreen({ x: Math.cos((theta * Math.PI) / 180) * (mirrorLen / scale), y: Math.sin((theta * Math.PI) / 180) * (mirrorLen / scale) });

  return (
    <g>
      <line x1={cx} y1={cy} x2={mirrorAEnd.x} y2={mirrorAEnd.y} stroke="#1F2937" strokeWidth={4} />
      <line x1={cx} y1={cy} x2={mirrorBEnd.x} y2={mirrorBEnd.y} stroke="#1F2937" strokeWidth={4} />
      <circle cx={obj.x} cy={obj.y} r={6} fill="#16A34A" />
      <Label x={obj.x} y={obj.y - 12} text="Object" size={10} color="#16A34A" />
      {images.map((im, i) => (
        <g key={i}>
          <circle cx={im.x} cy={im.y} r={5} fill="#DC2626" opacity={0.85} />
          <Label x={im.x} y={im.y - 10} text={`I${i + 1}`} size={9} color="#DC2626" />
        </g>
      ))}
      <Label x={cx} y={cy + 130} text={`${theta}deg -> (360/${theta}) - 1 = ${count} images`} size={12} color="#111827" bold />
      <Label x={cx} y={cy + 148} text={label} size={11} color="#374151" />
    </g>
  );
};

const MultiMirrorScene = () => (
  <g>
    <Label x={SVG_W / 2} y={30} text="Number of images = (360deg / theta) - 1" size={14} color="#111827" bold />
    <MultiMirrorPanel theta={90} count={3} cx={190} label="Two mirrors at 90deg" />
    <MultiMirrorPanel theta={60} count={5} cx={510} label="Two mirrors at 60deg" />
  </g>
);

// ─── Scene 4: Kaleidoscope (reuses the 60deg multi-image math) ─
const KaleidoscopeScene = () => {
  const cx = SVG_W / 2, cy = 190, scale = 90, mirrorLen = 140;
  const toScreen = (p) => ({ x: cx + p.x * scale, y: cy - p.y * scale });
  const objAngle = 30;
  const objMath = { x: Math.cos((objAngle * Math.PI) / 180) * 0.5, y: Math.sin((objAngle * Math.PI) / 180) * 0.5 };
  const obj = toScreen(objMath);
  const images = generateMultiMirrorImages(60, 5, objAngle, 0.5).map(toScreen);
  const colors = ["#DC2626", "#F59E0B", "#16A34A", "#2563EB", "#7C3AED"];
  const mirrorAEnd = toScreen({ x: mirrorLen / scale, y: 0 });
  const mirrorBEnd = toScreen({ x: Math.cos((60 * Math.PI) / 180) * (mirrorLen / scale), y: Math.sin((60 * Math.PI) / 180) * (mirrorLen / scale) });
  return (
    <g>
      <line x1={cx} y1={cy} x2={mirrorAEnd.x} y2={mirrorAEnd.y} stroke="#1F2937" strokeWidth={4} />
      <line x1={cx} y1={cy} x2={mirrorBEnd.x} y2={mirrorBEnd.y} stroke="#1F2937" strokeWidth={4} />
      <polygon points={`${obj.x},${obj.y - 10} ${obj.x + 8},${obj.y + 6} ${obj.x - 8},${obj.y + 6}`} fill="#DC2626" />
      {images.map((im, i) => (
        <polygon key={i} points={`${im.x},${im.y - 10} ${im.x + 8},${im.y + 6} ${im.x - 8},${im.y + 6}`} fill={colors[i]} opacity={0.85} />
      ))}
      <Label x={SVG_W / 2} y={340} text="A kaleidoscope is just two mirrors at 60deg -- the same 5-image formula, applied to a colorful bead instead of a face" size={12} color="#111827" bold />
    </g>
  );
};

// ─── Scene 5: Periscope (two mirrors at 45deg, ray bent twice) ─
const PeriscopeScene = () => {
  const tubeX1 = 260, tubeX2 = 340;
  const topY = 60, bottomY = 320;
  return (
    <g>
      <line x1={tubeX1} y1={topY} x2={tubeX1} y2={bottomY} stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="4,4" />
      <line x1={tubeX2} y1={topY} x2={tubeX2} y2={bottomY} stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="4,4" />
      {/* Top mirror at 45deg */}
      <line x1={tubeX1 - 15} y1={topY + 10} x2={tubeX2 + 15} y2={topY + 50} stroke="#1F2937" strokeWidth={4} />
      {/* Bottom mirror at 45deg */}
      <line x1={tubeX1 - 15} y1={bottomY - 50} x2={tubeX2 + 15} y2={bottomY - 10} stroke="#1F2937" strokeWidth={4} />
      {/* Ray: comes in horizontally, hits top mirror, bends 90deg down the tube, hits bottom mirror, bends 90deg out horizontally */}
      <line x1={40} y1={topY + 30} x2={tubeX1 + 8} y2={topY + 30} stroke="#F59E0B" strokeWidth={2.5} markerEnd="url(#pma-arrow)" />
      <line x1={tubeX1 + 8} y1={topY + 30} x2={tubeX1 + 8} y2={bottomY - 30} stroke="#F59E0B" strokeWidth={2.5} markerEnd="url(#pma-arrow)" />
      <line x1={tubeX1 + 8} y1={bottomY - 30} x2={SVG_W - 40} y2={bottomY - 30} stroke="#F59E0B" strokeWidth={2.5} markerEnd="url(#pma-arrow)" />
      <Label x={SVG_W / 2} y={30} text="Periscope: two mirrors at 45deg" size={14} color="#111827" bold />
      <Label x={SVG_W / 2} y={355} text="Each 45deg mirror bends the ray 90deg -- used in submarines to see above the water" size={12} color="#111827" bold />
    </g>
  );
};

const AUDIO_STEPS = [
  { progress: 0.1, text: "Plane mirrors show up in some fun, unexpected places once you understand lateral inversion. Let's explore them." },
  { progress: 0.3, text: "Ambulances write AMBULANCE reversed on the front, on purpose -- so that when a car ahead sees it in their rear-view mirror, lateral inversion flips it back to read normally." },
  { progress: 0.48, text: "Some letters like A, H, I, M, O, T, and U are symmetric left-to-right, so they look identical to their own mirror image. An asymmetric letter like R clearly flips backwards instead." },
  { progress: 0.68, text: "If you place two plane mirrors at an angle theta, you don't just see one reflection -- you see multiple images, following the formula: number of images equals 360 over theta, minus 1. At 90 degrees that's 3 images; at 60 degrees, 5." },
  { progress: 0.85, text: "A kaleidoscope is exactly this idea: two mirrors at 60 degrees, so a small colorful bead multiplies into a 6-fold symmetric pattern." },
  { progress: 1.0, text: "A periscope uses two plane mirrors at 45 degrees, each one bending the light ray a clean 90 degrees, letting a submarine crew see above the surface." },
];

const PlaneMirrorApplicationsAnimation = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Plane Mirror Applications"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Continue to Quiz ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.2) step = 0;
        else if (progress < 0.4) step = 1;
        else if (progress < 0.58) step = 2;
        else if (progress < 0.77) step = 3;
        else if (progress < 0.92) step = 4;
        else step = 5;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />
            <defs>
              <marker id="pma-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
            </defs>

            {step === 0 && (
              <Label x={SVG_W / 2} y={SVG_H / 2} text="Beyond the basics: applications of plane mirrors" size={16} color="#111827" bold />
            )}
            {step === 1 && <AmbulanceScene />}
            {step === 2 && <SymmetricLettersScene />}
            {step === 3 && <MultiMirrorScene />}
            {step === 4 && <KaleidoscopeScene />}
            {step === 5 && <PeriscopeScene />}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default PlaneMirrorApplicationsAnimation;
