import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import { Label, Line } from "../../shared/SVGUtils";

const SVG_W = 480;
const SVG_H = 320;

// ── Panel A: Real image -- two rays actually converge at a point ──
const REAL_CX = 130;
const REAL_SRC_Y = 90;
const REAL_MEET = { x: REAL_CX, y: 190 };
const REAL_RAYS_START = [
  { x: REAL_CX - 70, y: REAL_SRC_Y },
  { x: REAL_CX + 70, y: REAL_SRC_Y },
];

// ── Panel B: Virtual image -- two rays diverge; backward extensions meet ──
const VIRT_CX = 350;
const VIRT_ORIGIN = { x: VIRT_CX, y: 190 };
const VIRT_RAYS_END = [
  { x: VIRT_CX - 70, y: 90 },
  { x: VIRT_CX + 70, y: 90 },
];
const VIRT_APPARENT = { x: VIRT_CX, y: 260 }; // where backward extensions meet

const AUDIO_STEPS = [
  { progress: 0.15, text: "Before we study mirrors in detail, there are two words you will hear constantly: REAL and VIRTUAL. Let's understand exactly what they mean." },
  { progress: 0.35, text: "A REAL image forms when light rays actually travel to a point and cross each other there. Because real light physically reaches that point, you can place a screen there and catch the image on it -- like a cinema projector throwing a picture onto a screen." },
  { progress: 0.5, text: "Real images, in every case you will study this chapter, are inverted -- upside down compared to the object." },
  { progress: 0.7, text: "A VIRTUAL image is different. The rays never actually meet. They spread apart, but if you trace them backward, in the direction they seem to be coming from, those backward lines meet at a point." },
  { progress: 0.85, text: "Since no real light reaches that point, you can never catch a virtual image on a screen. Your own plane mirror image is a perfect example -- erect, and only visible by looking into the mirror." },
  { progress: 1.0, text: "So: real means light actually meets there and can be captured on a screen, and is inverted. Virtual means light only appears to meet there, cannot be captured, and is erect. Keep this distinction in mind for everything that follows." },
];

const RealVsVirtualImagesAnimation = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Real vs Virtual Images"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Continue to Spherical Mirrors ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.15) step = 0;
        else if (progress < 0.35) step = 1;
        else if (progress < 0.5) step = 2;
        else if (progress < 0.7) step = 3;
        else if (progress < 0.85) step = 4;
        else step = 5;

        const showReal = step >= 1;
        const showRealInverted = step >= 2;
        const showVirtual = step >= 3;
        const showVirtualDashed = step >= 3;
        const showVirtualLabel = step >= 4;
        const showSummary = step === 5;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {showReal && (
              <g>
                <Label x={REAL_CX} y={40} text="REAL" size={14} color="#166534" bold />
                {REAL_RAYS_START.map((p, i) => (
                  <g key={i}>
                    <line x1={p.x} y1={p.y} x2={REAL_MEET.x} y2={REAL_MEET.y} stroke="#16A34A" strokeWidth={2} />
                    {/* Rays continue past the meeting point, diverging again -- exactly how light behaves after actually crossing at a real focus */}
                    <line
                      x1={REAL_MEET.x} y1={REAL_MEET.y}
                      x2={REAL_MEET.x + (REAL_MEET.x - p.x) * 0.5} y2={REAL_MEET.y + 55}
                      stroke="#16A34A" strokeWidth={1.5} strokeDasharray="0"
                      markerEnd="url(#rvi-arrow-green)"
                    />
                  </g>
                ))}
                <circle cx={REAL_MEET.x} cy={REAL_MEET.y} r={4} fill="#166534" />
                <Label x={REAL_CX} y={REAL_MEET.y - 12} text="rays actually cross here" size={11} color="#166534" />

                {showRealInverted && (
                  <g>
                    {/* Screen at the meeting point, catching an inverted image */}
                    <line x1={REAL_CX - 45} y1={REAL_MEET.y} x2={REAL_CX + 45} y2={REAL_MEET.y} stroke="#9CA3AF" strokeWidth={3} />
                    <line x1={REAL_CX} y1={REAL_MEET.y} x2={REAL_CX} y2={REAL_MEET.y + 45} stroke="#166534" strokeWidth={3} markerEnd="url(#rvi-arrow-green)" />
                    <Label x={REAL_CX} y={REAL_MEET.y + 60} text="Screen: image caught, INVERTED" size={11} color="#166534" bold />
                  </g>
                )}
              </g>
            )}

            {showVirtual && (
              <g>
                <Label x={VIRT_CX} y={40} text="VIRTUAL" size={14} color="#B91C1C" bold />
                {VIRT_RAYS_END.map((p, i) => (
                  <g key={i}>
                    <line x1={VIRT_ORIGIN.x} y1={VIRT_ORIGIN.y} x2={p.x} y2={p.y} stroke="#DC2626" strokeWidth={2} markerEnd="url(#rvi-arrow-red)" />
                    {showVirtualDashed && (
                      <Line x1={VIRT_ORIGIN.x} y1={VIRT_ORIGIN.y} x2={VIRT_APPARENT.x + (VIRT_APPARENT.x - p.x) * 0} y2={VIRT_APPARENT.y} color="#FCA5A5" strokeWidth={1.5} dashed />
                    )}
                  </g>
                ))}
                {showVirtualDashed && (
                  <g>
                    <circle cx={VIRT_APPARENT.x} cy={VIRT_APPARENT.y} r={4} fill="#B91C1C" />
                    <line x1={VIRT_APPARENT.x} y1={VIRT_APPARENT.y} x2={VIRT_APPARENT.x} y2={VIRT_APPARENT.y - 45} stroke="#DC2626" strokeWidth={3} strokeDasharray="4,3" markerEnd="url(#rvi-arrow-red)" />
                  </g>
                )}
                {showVirtualLabel && (
                  <Label x={VIRT_CX} y={VIRT_APPARENT.y + 20} text="No screen here -- rays only APPEAR to come from this point" size={11} color="#B91C1C" bold />
                )}
              </g>
            )}

            <defs>
              <marker id="rvi-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#16A34A" />
              </marker>
              <marker id="rvi-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {showSummary && (
              <g>
                <rect x={30} y={SVG_H - 50} width={SVG_W - 60} height={40} rx={8} fill="#EFF6FF" stroke="#BFDBFE" />
                <Label x={SVG_W / 2} y={SVG_H - 32} text="Real: light meets, screen catches it, inverted" size={12} color="#166534" bold />
                <Label x={SVG_W / 2} y={SVG_H - 16} text="Virtual: light only appears to meet, no screen, erect" size={12} color="#B91C1C" bold />
              </g>
            )}

            {step === 0 && (
              <Label x={SVG_W / 2} y={SVG_H / 2} text="What do 'real' and 'virtual' actually mean?" size={15} color="#111827" bold />
            )}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default RealVsVirtualImagesAnimation;
