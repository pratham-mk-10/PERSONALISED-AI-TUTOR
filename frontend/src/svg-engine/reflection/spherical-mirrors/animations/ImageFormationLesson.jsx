import React, { useMemo, useState } from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";
import { clamp, lerp } from "../../../shared/PhysicsEngine";
import { Label, PrincipalAxis, ObjectArrow, ImageArrow } from "../../../shared/SVGUtils";
import { getMirrorCaseData } from "./MirrorPhysicsEngine";

const SVG_W = 800;
const SVG_H = 500;

const ImageFormationLesson = ({ caseId = "concave-beyond-c", onTryItClicked }) => {
  const data = useMemo(() => getMirrorCaseData(caseId), [caseId]);
  
  const {
    title, resultLines, mirrorType, poleX, AXIS_Y, F_X, C_X, objX, objTopY, h, v, imgX, imgTopY, imgHeight, isVirtualImage, u,
    r1IncStart, r1Hit, r1RefEnd, r1VirtualEnd,
    r2IncStart, r2Hit, r2RefEnd, r2VirtualEnd
  } = data;

const STEP_AUDIO_FILES = {
  1: "/audio/setup_mirror.wav", // Fallback generated dummy files
  2: "/audio/place_object.wav",
  3: "/audio/ray1.wav",
  4: "/audio/ray2.wav",
  5: "/audio/image_forms.wav"
};

const STEP_ORDER = [1, 2, 3, 4, 5];
const DEFAULT_STEP_DURATIONS_MS = {
  1: 4000, // Show mirror, P, F, C
  2: 3000, // Show object
  3: 7000, // Draw Ray 1 (Inc -> Ref)
  4: 7000, // Draw Ray 2 (Inc -> Ref)
  5: 6000  // Show image and text box
};
const AUDIO_END_PADDING_MS = 200;

const normalizeBetween = (value, start, end) => {
  if (end <= start) return 0;
  return clamp((value - start) / (end - start), 0, 1);
};

const DefinitionCard = ({ title, lines }) => {
  return (
    <g>
      <rect x="50" y="380" width="700" height="100" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
      <text x="70" y="410" fontSize="14" fontWeight="700" fill="#1E40AF">{title}</text>
      {lines.map((line, idx) => (
        <text key={idx} x="70" y={440 + idx * 22} fontSize="13" fill="#1E3A8A">
          • {line}
        </text>
      ))}
    </g>
  );
};

  const [stepDurationsMs, setStepDurationsMs] = useState(DEFAULT_STEP_DURATIONS_MS);

  const totalDurationMs = useMemo(() => {
    return STEP_ORDER.reduce((acc, step) => acc + (stepDurationsMs[step] || 0), 0);
  }, [stepDurationsMs]);

  const stepRanges = useMemo(() => {
    let elapsed = 0;
    const ranges = {};
    STEP_ORDER.forEach((step) => {
      const stepDuration = stepDurationsMs[step];
      const start = elapsed / totalDurationMs;
      elapsed += stepDuration;
      const end = elapsed / totalDurationMs;
      ranges[step] = { start, end };
    });
    return ranges;
  }, [stepDurationsMs, totalDurationMs]);

  return (
    <AnimationPlayer
      duration={totalDurationMs}
      title="Watch: Image Formation (Case 1: Beyond C)"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {
        let step = 5;
        for (const candidateStep of STEP_ORDER) {
          if (progress < stepRanges[candidateStep].end) {
            step = candidateStep;
            break;
          }
        }

        const setupPhase = normalizeBetween(progress, stepRanges[1].start, stepRanges[1].end);
        const objectPhase = normalizeBetween(progress, stepRanges[2].start, stepRanges[2].end);
        
        const ray1Total = normalizeBetween(progress, stepRanges[3].start, stepRanges[3].end);
        const ray1Inc = clamp(ray1Total * 2, 0, 1);
        const ray1Ref = clamp((ray1Total - 0.5) * 2, 0, 1);

        const ray2Total = normalizeBetween(progress, stepRanges[4].start, stepRanges[4].end);
        const ray2Inc = clamp(ray2Total * 2, 0, 1);
        const ray2Ref = clamp((ray2Total - 0.5) * 2, 0, 1);

        const imagePhase = normalizeBetween(progress, stepRanges[5].start, stepRanges[5].end);

        // Interpolations
        const currR1Inc = {
          x: lerp(r1IncStart.x, r1IncStart.y, r1Hit.x, r1Hit.y, ray1Inc).x,
          y: lerp(r1IncStart.x, r1IncStart.y, r1Hit.x, r1Hit.y, ray1Inc).y
        };
        const currR1Ref = {
          x: lerp(r1Hit.x, r1Hit.y, r1RefEnd.x, r1RefEnd.y, ray1Ref).x,
          y: lerp(r1Hit.x, r1Hit.y, r1RefEnd.x, r1RefEnd.y, ray1Ref).y
        };

        const currR2Inc = {
          x: lerp(r2IncStart.x, r2IncStart.y, r2Hit.x, r2Hit.y, ray2Inc).x,
          y: lerp(r2IncStart.x, r2IncStart.y, r2Hit.x, r2Hit.y, ray2Inc).y
        };
        const currR2Ref = {
          x: lerp(r2Hit.x, r2Hit.y, r2RefEnd.x, r2RefEnd.y, ray2Ref).x,
          y: lerp(r2Hit.x, r2Hit.y, r2RefEnd.x, r2RefEnd.y, ray2Ref).y
        };

        return (
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block", background: "#F8FAFF" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />
            
            <defs>
              <marker id="inc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
              <marker id="ref-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
            </defs>

            <Label x={400} y={40} text={title} color="#111827" size={20} bold />

            {/* Step 1: Base Setup */}
            <g opacity={setupPhase > 0 ? 1 : 0}>
              <PrincipalAxis startX={50} endX={750} y={AXIS_Y} />
              
              {mirrorType === 'concave' ? (
                <>
                  <path d={`M ${poleX - 30} 50 Q ${poleX + 30} 250 ${poleX - 30} 450`} fill="none" stroke="#333" strokeWidth="4" />
                  <path d={`M ${poleX - 28} 60 L ${poleX - 18} 70 M ${poleX - 24} 100 L ${poleX - 14} 110 M ${poleX - 17} 140 L ${poleX - 7} 150 M ${poleX - 10} 180 L ${poleX} 190 M ${poleX - 5} 220 L ${poleX + 5} 230 M ${poleX - 2} 260 L ${poleX + 8} 270 M ${poleX - 8} 300 L ${poleX + 2} 310 M ${poleX - 15} 340 L ${poleX - 5} 350 M ${poleX - 22} 380 L ${poleX - 12} 390 M ${poleX - 28} 420 L ${poleX - 18} 430`} stroke="#888" strokeWidth="1" />
                </>
              ) : (
                <>
                  <path d={`M ${poleX + 30} 50 Q ${poleX - 30} 250 ${poleX + 30} 450`} fill="none" stroke="#333" strokeWidth="4" />
                  <path d={`M ${poleX + 28} 60 L ${poleX + 18} 70 M ${poleX + 24} 100 L ${poleX + 14} 110 M ${poleX + 17} 140 L ${poleX + 7} 150 M ${poleX + 10} 180 L ${poleX} 190 M ${poleX + 5} 220 L ${poleX - 5} 230 M ${poleX + 2} 260 L ${poleX - 8} 270 M ${poleX + 8} 300 L ${poleX - 2} 310 M ${poleX + 15} 340 L ${poleX + 5} 350 M ${poleX + 22} 380 L ${poleX + 12} 390 M ${poleX + 28} 420 L ${poleX + 18} 430`} stroke="#888" strokeWidth="1" />
                </>
              )}
              
              <circle cx={poleX} cy={AXIS_Y} r={4} fill="#DC2626" />
              <text x={poleX + (mirrorType === 'concave' ? 10 : -20)} y={AXIS_Y - 10} fontSize="14" fontWeight="bold">P</text>
              
              <circle cx={F_X} cy={AXIS_Y} r={4} fill="#16A34A" />
              <text x={F_X - 5} y={AXIS_Y + 20} fontSize="14" fontWeight="bold" fill="#16A34A">F</text>
              
              <circle cx={C_X} cy={AXIS_Y} r={4} fill="#7C3AED" />
              <text x={C_X - 5} y={AXIS_Y + 20} fontSize="14" fontWeight="bold" fill="#7C3AED">C</text>
            </g>

            {/* Step 2: Object */}
            {objectPhase > 0 && u !== -10000 && (
              <g opacity={objectPhase}>
                <ObjectArrow x={objX} axisY={AXIS_Y} height={h} color="#1F2937" label="Object" />
              </g>
            )}

            {/* Step 3: Ray 1 */}
            {ray1Inc > 0 && (
              <line x1={r1IncStart.x} y1={r1IncStart.y} x2={currR1Inc.x} y2={currR1Inc.y} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#inc-arrow)" />
            )}
            {ray1Ref > 0 && (
              <line x1={r1Hit.x} y1={r1Hit.y} x2={currR1Ref.x} y2={currR1Ref.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#ref-arrow)" />
            )}
            {ray1Ref === 1 && r1VirtualEnd && (
              <line x1={r1Hit.x} y1={r1Hit.y} x2={r1VirtualEnd.x} y2={r1VirtualEnd.y} stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
            )}

            {/* Step 4: Ray 2 */}
            {ray2Inc > 0 && (
              <line x1={r2IncStart.x} y1={r2IncStart.y} x2={currR2Inc.x} y2={currR2Inc.y} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#inc-arrow)" />
            )}
            {ray2Ref > 0 && (
              <line x1={r2Hit.x} y1={r2Hit.y} x2={currR2Ref.x} y2={currR2Ref.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#ref-arrow)" />
            )}
            {ray2Ref === 1 && r2VirtualEnd && (
              <line x1={r2Hit.x} y1={r2Hit.y} x2={r2VirtualEnd.x} y2={r2VirtualEnd.y} stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
            )}

            {/* Dynamic Explanations Box */}
            <g>
              <rect x="50" y="380" width="700" height="90" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
              <text x="70" y="410" fontSize="15" fontWeight="700" fill="#1E40AF">
                {step === 1 && "Mirror Anatomy: Pole (P), Focus (F), and Centre of Curvature (C)"}
                {step === 2 && (u === -10000 ? "Object placed at Infinity (Rays are parallel)" : "Object placed")}
                {step === 3 && "Ray 1 reflects."}
                {step === 4 && "Ray 2 reflects."}
                {step === 5 && resultLines[0]}
              </text>
              {step === 5 && (
                <text x="70" y="435" fontSize="14" fontWeight="600" fill="#15803D">
                  Nature of Image: {resultLines[1]}
                </text>
              )}
            </g>

            {/* Step 5: Image Formed */}
            {imagePhase > 0 && u !== -100 && (
              <g opacity={imagePhase}>
                {imgHeight > 0 && (
                  <ImageArrow x={imgX} axisY={AXIS_Y} height={imgHeight} inverted={!isVirtualImage} isVirtual={isVirtualImage} color="#9333EA" label="Image" />
                )}
              </g>
            )}

          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default ImageFormationLesson;
