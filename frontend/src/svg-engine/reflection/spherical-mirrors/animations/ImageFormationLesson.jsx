import React, { useMemo } from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";
import { clamp, lerp } from "../../../shared/PhysicsEngine";
import { Label, PrincipalAxis, ObjectArrow, ImageArrow } from "../../../shared/SVGUtils";
import { getMirrorCaseData } from "./MirrorPhysicsEngine";

const SVG_W = 800;
const SVG_H = 500;

const generateHatchPath = (poleX, mirrorType) => {
  let path = "";
  for (let y = 60; y <= 430; y += 15) {
    const t = (y - 50) / 400;
    // Bezier x(t) = (1-t)^2 x0 + 2t(1-t) x1 + t^2 x2
    let x0, x1;
    if (mirrorType === 'concave') {
      x0 = poleX - 30;
      x1 = poleX + 30;
    } else {
      x0 = poleX + 30;
      x1 = poleX - 30;
    }
    const curveX = Math.pow(1 - t, 2) * x0 + 2 * t * (1 - t) * x1 + Math.pow(t, 2) * x0;
    
    // Hatch goes from curveX to curveX + 12 (always pointing right, indicating the non-reflective back)
    path += `M ${curveX.toFixed(1)} ${y} L ${(curveX + 12).toFixed(1)} ${y + 10} `;
  }
  return path;
};

const getAudioSteps = (title) => [
  { progress: 0.20, text: `Let's draw the ray diagram for ${title.toLowerCase()}. First, we set up the mirror.` },
  { progress: 0.40, text: "Next, we place the object at the specified position." },
  { progress: 0.60, text: "We draw the first standard ray from the top of the object, which reflects according to the rules." },
  { progress: 0.80, text: "We draw the second standard ray. The point where the reflected rays intersect is where the image forms." },
  { progress: 1.0, text: "Finally, we determine the properties of the image based on its size, orientation, and position." }
];

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

const ImageFormationLesson = ({ caseId = "concave-beyond-c", onTryItClicked }) => {
  const data = useMemo(() => getMirrorCaseData(caseId), [caseId]);
  
  const {
    title, resultLines, mirrorType, poleX, AXIS_Y, F_X, C_X, objX, objTopY, h, v, imgX, imgTopY, imgHeight, isVirtualImage, u,
    r1IncStart, r1Hit, r1RefEnd, r1VirtualEnd,
    r2IncStart, r2Hit, r2RefEnd, r2VirtualEnd
  } = data;

  const audioSteps = useMemo(() => getAudioSteps(title), [title]);

  return (
    <AudioAnimationPlayer
      audioSteps={audioSteps}
      title={`Watch: Image Formation (${title})`}
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {
        let step = 5;
        if (progress < 0.20) step = 1;
        else if (progress < 0.40) step = 2;
        else if (progress < 0.60) step = 3;
        else if (progress < 0.80) step = 4;
        else step = 5;

        const setupPhase = normalizeBetween(progress, 0, 0.20);
        const objectPhase = normalizeBetween(progress, 0.20, 0.40);
        
        const r1Total = normalizeBetween(progress, 0.40, 0.60);
        const r1Inc = clamp(r1Total * 2, 0, 1);
        const r1Ref = clamp((r1Total - 0.5) * 2, 0, 1);

        const r2Total = normalizeBetween(progress, 0.60, 0.80);
        const r2Inc = clamp(r2Total * 2, 0, 1);
        const r2Ref = clamp((r2Total - 0.5) * 2, 0, 1);

        const imagePhase = normalizeBetween(progress, 0.80, 1.0);

        // Interpolations
        const currR1Inc = {
          x: lerp(r1IncStart.x, r1IncStart.y, r1Hit.x, r1Hit.y, r1Inc).x,
          y: lerp(r1IncStart.x, r1IncStart.y, r1Hit.x, r1Hit.y, r1Inc).y
        };
        const currR1Ref = {
          x: lerp(r1Hit.x, r1Hit.y, r1RefEnd.x, r1RefEnd.y, r1Ref).x,
          y: lerp(r1Hit.x, r1Hit.y, r1RefEnd.x, r1RefEnd.y, r1Ref).y
        };

        const currR2Inc = {
          x: lerp(r2IncStart.x, r2IncStart.y, r2Hit.x, r2Hit.y, r2Inc).x,
          y: lerp(r2IncStart.x, r2IncStart.y, r2Hit.x, r2Hit.y, r2Inc).y
        };
        const currR2Ref = {
          x: lerp(r2Hit.x, r2Hit.y, r2RefEnd.x, r2RefEnd.y, r2Ref).x,
          y: lerp(r2Hit.x, r2Hit.y, r2RefEnd.x, r2RefEnd.y, r2Ref).y
        };

        const currR1Virt = isVirtualImage ? {
          x: lerp(r1Hit.x, r1Hit.y, r1VirtualEnd.x, r1VirtualEnd.y, r1Ref).x,
          y: lerp(r1Hit.x, r1Hit.y, r1VirtualEnd.x, r1VirtualEnd.y, r1Ref).y
        } : null;

        const currR2Virt = isVirtualImage ? {
          x: lerp(r2Hit.x, r2Hit.y, r2VirtualEnd.x, r2VirtualEnd.y, r2Ref).x,
          y: lerp(r2Hit.x, r2Hit.y, r2VirtualEnd.x, r2VirtualEnd.y, r2Ref).y
        } : null;

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
                  <path d={generateHatchPath(poleX, 'concave')} stroke="#888" strokeWidth="1" />
                </>
              ) : (
                <>
                  <path d={`M ${poleX + 30} 50 Q ${poleX - 30} 250 ${poleX + 30} 450`} fill="none" stroke="#333" strokeWidth="4" />
                  <path d={generateHatchPath(poleX, 'convex')} stroke="#888" strokeWidth="1" />
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
            {r1Inc > 0 && (
              <line x1={r1IncStart.x} y1={r1IncStart.y} x2={currR1Inc.x} y2={currR1Inc.y} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#inc-arrow)" />
            )}
            {r1Ref > 0 && (
              <line x1={r1Hit.x} y1={r1Hit.y} x2={currR1Ref.x} y2={currR1Ref.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#ref-arrow)" />
            )}
            {r1Ref === 1 && r1VirtualEnd && (
              <line x1={r1Hit.x} y1={r1Hit.y} x2={currR1Virt.x} y2={currR1Virt.y} stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
            )}

            {/* Step 4: Ray 2 */}
            {r2Inc > 0 && (
              <line x1={r2IncStart.x} y1={r2IncStart.y} x2={currR2Inc.x} y2={currR2Inc.y} stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#inc-arrow)" />
            )}
            {r2Ref > 0 && (
              <line x1={r2Hit.x} y1={r2Hit.y} x2={currR2Ref.x} y2={currR2Ref.y} stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#ref-arrow)" />
            )}
            {r2Ref === 1 && r2VirtualEnd && (
              <line x1={r2Hit.x} y1={r2Hit.y} x2={currR2Virt.x} y2={currR2Virt.y} stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />
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
    </AudioAnimationPlayer>
  );
};

export default ImageFormationLesson;
