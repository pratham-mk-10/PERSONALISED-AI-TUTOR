import React from "react";
import AudioAnimationPlayer from "../shared/AudioAnimationPlayer";
import { Label } from "../shared/SVGUtils";

const SVG_W = 640;
const SVG_H = 360;

const AUDIO_STEPS = [
  { progress: 0.15, text: "Before we study reflection, let's start with the basics. Light is a form of energy that enables us to see things around us." },
  { progress: 0.32, text: "Objects that give out their own light are called LUMINOUS objects -- like the Sun, a burning candle, or an electric bulb. Objects that do not give out their own light, and are only seen because they reflect light from somewhere else, are called NON-LUMINOUS. The Moon is non-luminous -- it only shines because it reflects sunlight." },
  { progress: 0.5, text: "Materials behave differently with light. TRANSPARENT materials, like clear glass, let almost all light pass through -- you can see clearly through them. TRANSLUCENT materials, like frosted glass or butter paper, let some light pass through, but scatter it, so you can't see a sharp image. OPAQUE materials, like wood or metal, don't let light pass through at all." },
  { progress: 0.68, text: "Light travels in straight lines. This is called RECTILINEAR PROPAGATION. It's why opaque objects cast sharp shadows, and it's exactly how a pinhole camera forms an image -- light from each point of a scene travels in a straight line through the tiny hole." },
  { progress: 0.85, text: "A single straight line along which light travels is called a RAY. A bundle of many rays together is called a BEAM. A beam can be PARALLEL, like sunlight far from its source; CONVERGENT, if the rays are coming together toward a point; or DIVERGENT, if they are spreading apart from a point, like light from a bulb." },
  { progress: 1.0, text: "With these basics -- luminous and non-luminous objects, transparent, translucent, and opaque materials, rectilinear propagation, and rays and beams of light -- we're ready to study how light reflects off a mirror." },
];

const LuminousScene = () => (
  <g>
    <circle cx={140} cy={150} r={30} fill="#FBBF24" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 38;
      const y1 = 150 + Math.sin(rad) * 38;
      const x2 = 140 + Math.cos(rad) * 52;
      const y2 = 150 + Math.sin(rad) * 52;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth={2} />;
    })}
    <Label x={140} y={200} text="Sun: LUMINOUS (makes its own light)" size={12} color="#92400E" bold />

    <circle cx={460} cy={150} r={24} fill="#D1D5DB" />
    <path d="M 436 150 A 24 24 0 0 1 484 150" fill="#9CA3AF" opacity={0.6} />
    <Label x={460} y={200} text="Moon: NON-LUMINOUS (reflects sunlight)" size={12} color="#374151" bold />
  </g>
);

const MaterialScene = () => (
  <g>
    {[
      { x: 60, label: "Transparent", color: "#BFDBFE", stroke: "#3B82F6", raysThrough: 4 },
      { x: 280, label: "Translucent", color: "#E5E7EB", stroke: "#9CA3AF", raysThrough: 2 },
      { x: 500, label: "Opaque", color: "#4B5563", stroke: "#1F2937", raysThrough: 0 },
    ].map((m) => (
      <g key={m.label}>
        <rect x={m.x} y={90} width={70} height={140} fill={m.color} stroke={m.stroke} strokeWidth={2} opacity={0.85} />
        {Array.from({ length: 4 }).map((_, i) => {
          const y = 105 + i * 32;
          const passes = i < m.raysThrough;
          return (
            <g key={i}>
              <line x1={m.x - 40} y1={y} x2={m.x} y2={y} stroke="#F59E0B" strokeWidth={2} />
              {passes && <line x1={m.x + 70} y1={y} x2={m.x + 110} y2={y} stroke="#F59E0B" strokeWidth={2} strokeDasharray={m.label === "Translucent" ? "3,3" : "0"} />}
            </g>
          );
        })}
        <Label x={m.x + 35} y={250} text={m.label} size={13} color="#111827" bold />
      </g>
    ))}
  </g>
);

const PropagationScene = () => (
  <g>
    <circle cx={80} cy={150} r={10} fill="#F59E0B" />
    <rect x={220} y={110} width={16} height={80} fill="#374151" />
    <line x1={90} y1={140} x2={640} y2={140} stroke="#374151" strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />
    {[130, 150, 170].map((y, i) => (
      <line key={i} x1={90} y1={150} x2={y < 150 ? 220 : 220} y2={y} stroke="#FCD34D" strokeWidth={1.5} opacity={0.9} />
    ))}
    <line x1={80} y1={150} x2={218} y2={112} stroke="#F59E0B" strokeWidth={1.5} />
    <line x1={80} y1={150} x2={218} y2={188} stroke="#F59E0B" strokeWidth={1.5} />
    <path d="M 218 112 L 400 -20" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3,3" opacity={0} />
    {/* shadow region cast on a screen */}
    <line x1={550} y1={60} x2={550} y2={260} stroke="#111827" strokeWidth={3} />
    <line x1={80} y1={150} x2={550} y2={90} stroke="#F59E0B" strokeWidth={1.2} strokeDasharray="2,3" opacity={0.6} />
    <line x1={80} y1={150} x2={550} y2={230} stroke="#F59E0B" strokeWidth={1.2} strokeDasharray="2,3" opacity={0.6} />
    <rect x={547} y={90} width={6} height={140} fill="#4B5563" />
    <Label x={330} y={280} text="Straight-line travel -> sharp shadow behind the opaque object" size={12} color="#111827" bold />
  </g>
);

const RayBeamScene = () => (
  <g>
    <Label x={110} y={70} text="Parallel beam" size={12} color="#111827" bold />
    {[110, 140, 170].map((y, i) => (
      <line key={i} x1={40} y1={y} x2={180} y2={y} stroke="#2563EB" strokeWidth={2} markerEnd="url(#il-arrow)" />
    ))}

    <Label x={330} y={70} text="Convergent beam" size={12} color="#111827" bold />
    {[90, 140, 190].map((y, i) => (
      <line key={i} x1={260} y1={y} x2={400} y2={140} stroke="#16A34A" strokeWidth={2} markerEnd="url(#il-arrow-green)" />
    ))}

    <Label x={540} y={70} text="Divergent beam" size={12} color="#111827" bold />
    <circle cx={480} cy={140} r={4} fill="#DC2626" />
    {[90, 140, 190].map((y, i) => (
      <line key={i} x1={480} y1={140} x2={620} y2={y} stroke="#DC2626" strokeWidth={2} markerEnd="url(#il-arrow-red)" />
    ))}
    <defs>
      <marker id="il-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#2563EB" /></marker>
      <marker id="il-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#16A34A" /></marker>
      <marker id="il-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#DC2626" /></marker>
    </defs>
    <Label x={SVG_W / 2} y={260} text="A single line = a RAY. Many rays together = a BEAM." size={13} color="#111827" bold />
  </g>
);

const IntroToLightAnimation = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: What is Light?"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Continue to Quiz ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.15) step = 0;
        else if (progress < 0.32) step = 1;
        else if (progress < 0.5) step = 2;
        else if (progress < 0.68) step = 3;
        else if (progress < 0.85) step = 4;
        else step = 5;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />
            {step === 0 && (
              <Label x={SVG_W / 2} y={SVG_H / 2} text="Light: a form of energy that lets us see" size={16} color="#111827" bold />
            )}
            {step === 1 && <LuminousScene />}
            {step === 2 && <MaterialScene />}
            {step === 3 && <PropagationScene />}
            {(step === 4 || step === 5) && <RayBeamScene />}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default IntroToLightAnimation;
