import React from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";
import { Label } from "../../../shared/SVGUtils";

const SVG_W = 700;
const SVG_H = 380;
const AXIS_Y = 210;
const MIRROR_X = 500;
const RADIUS = 160;
const FOCAL = 80;
const POLE = { x: MIRROR_X, y: AXIS_Y };
const FOCUS = { x: MIRROR_X - FOCAL, y: AXIS_Y };

const concaveArc = `M ${MIRROR_X - 6} ${AXIS_Y - 90} Q ${MIRROR_X + 30} ${AXIS_Y} ${MIRROR_X - 6} ${AXIS_Y + 90}`;
const convexArc = `M ${MIRROR_X - 6} ${AXIS_Y - 90} Q ${MIRROR_X - 42} ${AXIS_Y} ${MIRROR_X - 6} ${AXIS_Y + 90}`;

// Concave, object between F and P -> virtual, erect, magnified (the same
// case already taught in Image Formation as "concave-between-p-f").
const ShavingMirrorScene = () => (
  <g>
    <path d={concaveArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    <line x1={FOCUS.x} y1={AXIS_Y - 100} x2={FOCUS.x} y2={AXIS_Y + 100} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,4" />
    <Label x={FOCUS.x} y={AXIS_Y - 110} text="F" size={11} color="#16A34A" bold />
    {/* Face, placed between F and P */}
    <circle cx={FOCUS.x + 30} cy={AXIS_Y - 15} r={16} fill="none" stroke="#374151" strokeWidth={2} />
    <Label x={FOCUS.x + 30} y={AXIS_Y + 40} text="Face (between F and P)" size={11} color="#374151" />
    {/* Magnified virtual image, behind the mirror */}
    <circle cx={MIRROR_X + 55} cy={AXIS_Y - 30} r={30} fill="none" stroke="#DC2626" strokeWidth={2} strokeDasharray="4,3" />
    <Label x={MIRROR_X + 55} y={AXIS_Y + 15} text="Magnified, erect, virtual image" size={11} color="#DC2626" />
    <Label x={MIRROR_X - 100} y={AXIS_Y + 120} text="A concave mirror held close (object between F and P) always magnifies" size={12} color="#111827" bold />
  </g>
);

// Concave, bulb AT the focus F -> reflected rays emerge parallel (the
// reverse of Rule 2: source at F, reflects parallel to the axis).
const HeadlightScene = () => (
  <g>
    <path d={concaveArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    <circle cx={FOCUS.x} cy={AXIS_Y} r={5} fill="#F59E0B" />
    <Label x={FOCUS.x} y={AXIS_Y + 20} text="Bulb at F" size={11} color="#F59E0B" bold />
    {[-50, -20, 10, 40].map((off, i) => (
      <line key={i} x1={FOCUS.x} y1={AXIS_Y} x2={MIRROR_X - 6} y2={AXIS_Y + off} stroke="#FCD34D" strokeWidth={1.5} />
    ))}
    {[-50, -20, 10, 40].map((off, i) => (
      <line key={i} x1={MIRROR_X - 6} y1={AXIS_Y + off} x2={40} y2={AXIS_Y + off} stroke="#EF4444" strokeWidth={2} markerEnd="url(#uses-arrow-red)" />
    ))}
    <Label x={MIRROR_X - 250} y={AXIS_Y + 120} text="A bulb placed exactly AT the focus sends out a concentrated parallel beam" size={12} color="#111827" bold />
  </g>
);

// Concave facing the sun, parallel rays converge AT the focus (Rule 1).
const SolarCookerScene = () => (
  <g>
    <path d={concaveArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    {[-70, -35, 0, 35, 70].map((off, i) => (
      <line key={i} x1={30} y1={AXIS_Y + off} x2={MIRROR_X - 6} y2={AXIS_Y + off} stroke="#FCD34D" strokeWidth={1.5} markerEnd="url(#uses-arrow-orange)" />
    ))}
    {[-70, -35, 0, 35, 70].map((off, i) => (
      <line key={i} x1={MIRROR_X - 6} y1={AXIS_Y + off} x2={FOCUS.x} y2={AXIS_Y} stroke="#EF4444" strokeWidth={1.5} />
    ))}
    <circle cx={FOCUS.x} cy={AXIS_Y} r={7} fill="#DC2626" />
    <Label x={FOCUS.x} y={AXIS_Y - 20} text="F: heat concentrates here" size={11} color="#DC2626" bold />
    <Label x={MIRROR_X - 250} y={AXIS_Y + 120} text="Sunlight arrives as parallel rays (object at infinity) and converges exactly at F" size={12} color="#111827" bold />
  </g>
);

// Convex mirror -> always virtual, erect, diminished, for any object
// position -- the diminished image fits more of the scene into the mirror,
// giving a wider field of view than a plane mirror of the same size.
const RearViewScene = () => (
  <g>
    <path d={convexArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    <line x1={FOCUS.x} y1={AXIS_Y - 100} x2={FOCUS.x} y2={AXIS_Y + 100} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,4" />
    <Label x={FOCUS.x} y={AXIS_Y - 110} text="F (virtual)" size={11} color="#16A34A" bold />
    {/* Two wide-apart objects, both visible diminished behind the mirror */}
    <circle cx={80} cy={AXIS_Y - 60} r={12} fill="none" stroke="#16A34A" strokeWidth={2} />
    <circle cx={80} cy={AXIS_Y + 60} r={12} fill="none" stroke="#2563EB" strokeWidth={2} />
    <Label x={80} y={AXIS_Y + 90} text="Two wide-apart cars behind you" size={11} color="#374151" />
    <circle cx={MIRROR_X + 25} cy={AXIS_Y - 18} r={4} fill="none" stroke="#16A34A" strokeWidth={1.5} strokeDasharray="2,2" />
    <circle cx={MIRROR_X + 25} cy={AXIS_Y + 18} r={4} fill="none" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="2,2" />
    <Label x={MIRROR_X + 60} y={AXIS_Y + 45} text="Both fit, diminished, in the mirror" size={11} color="#DC2626" />
    <Label x={MIRROR_X - 250} y={AXIS_Y + 120} text="Convex mirrors ALWAYS give a virtual, erect, diminished image -- more scene fits in, wider field of view" size={12} color="#111827" bold />
  </g>
);

// ENT doctor's head mirror -- same case as ShavingMirrorScene (light source
// between F and P on a concave mirror -> magnified, concentrated reflection),
// just re-skinned: the "object" is a small lamp, and the concentrated
// reflection is directed onto the ear/nose/throat instead of a face.
const ENTMirrorScene = () => (
  <g>
    <path d={concaveArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    <line x1={FOCUS.x} y1={AXIS_Y - 100} x2={FOCUS.x} y2={AXIS_Y + 100} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,4" />
    <Label x={FOCUS.x} y={AXIS_Y - 110} text="F" size={11} color="#16A34A" bold />
    {/* Lamp, placed between F and P -- same case as the shaving mirror */}
    <circle cx={FOCUS.x + 30} cy={AXIS_Y - 15} r={10} fill="#F59E0B" />
    <Label x={FOCUS.x + 30} y={AXIS_Y + 30} text="Lamp (between F and P)" size={11} color="#374151" />
    <circle cx={MIRROR_X + 55} cy={AXIS_Y - 30} r={24} fill="none" stroke="#DC2626" strokeWidth={2} strokeDasharray="4,3" />
    <Label x={MIRROR_X - 40} y={AXIS_Y + 90} text="Concentrated light directed into the ear, nose, or throat" size={11} color="#DC2626" />
    <Label x={MIRROR_X - 220} y={AXIS_Y + 120} text="An ENT doctor's head mirror is concave, for exactly the same reason as the shaving mirror above" size={12} color="#111827" bold />
  </g>
);

// Reflecting telescope -- same case as SolarCookerScene (parallel rays from
// an object at infinity converge at F), just re-skinned: starlight instead
// of sunlight.
const TelescopeScene = () => (
  <g>
    <path d={concaveArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    {[-70, -35, 0, 35, 70].map((off, i) => (
      <line key={i} x1={30} y1={AXIS_Y + off} x2={MIRROR_X - 6} y2={AXIS_Y + off} stroke="#93C5FD" strokeWidth={1.5} markerEnd="url(#uses-arrow-blue)" />
    ))}
    {[-70, -35, 0, 35, 70].map((off, i) => (
      <line key={i} x1={MIRROR_X - 6} y1={AXIS_Y + off} x2={FOCUS.x} y2={AXIS_Y} stroke="#EF4444" strokeWidth={1.5} />
    ))}
    <circle cx={FOCUS.x} cy={AXIS_Y} r={7} fill="#DC2626" />
    <Label x={FOCUS.x} y={AXIS_Y - 20} text="F: starlight collected here" size={11} color="#DC2626" bold />
    <Label x={MIRROR_X - 230} y={AXIS_Y + 120} text="A large concave mirror in a reflecting telescope collects faint, effectively-parallel starlight and converges it at F -- the same rule as the solar cooker, just scaled up" size={12} color="#111827" bold />
  </g>
);

// Wide-field convex applications -- same case as RearViewScene (convex ->
// always virtual, erect, diminished -> wider field of view), just re-skinned
// with a label naming the other real-world contexts that use this identical
// physics, instead of building 3 near-duplicate scenes.
const WideFieldConvexScene = () => (
  <g>
    <path d={convexArc} fill="none" stroke="#1F2937" strokeWidth={5} />
    <line x1={FOCUS.x} y1={AXIS_Y - 100} x2={FOCUS.x} y2={AXIS_Y + 100} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,4" />
    <Label x={FOCUS.x} y={AXIS_Y - 110} text="F (virtual)" size={11} color="#16A34A" bold />
    <circle cx={80} cy={AXIS_Y - 60} r={12} fill="none" stroke="#16A34A" strokeWidth={2} />
    <circle cx={80} cy={AXIS_Y + 60} r={12} fill="none" stroke="#2563EB" strokeWidth={2} />
    <Label x={80} y={AXIS_Y + 90} text="A wide area needs watching" size={11} color="#374151" />
    <circle cx={MIRROR_X + 25} cy={AXIS_Y - 18} r={4} fill="none" stroke="#16A34A" strokeWidth={1.5} strokeDasharray="2,2" />
    <circle cx={MIRROR_X + 25} cy={AXIS_Y + 18} r={4} fill="none" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="2,2" />
    <Label x={MIRROR_X - 250} y={AXIS_Y + 120} text="The same physics used in car mirrors also covers road-safety mirrors at blind curves, shop security mirrors, and small ATM mirrors -- all convex, all trading image size for field of view" size={12} color="#111827" bold />
  </g>
);

const AUDIO_STEPS = [
  { progress: 0.12, text: "You already know how concave and convex mirrors form images. Now let's see why each one is chosen for specific everyday devices." },
  { progress: 0.25, text: "A shaving or makeup mirror is concave. Held close, with your face between the focus and the pole, it gives a magnified, erect, virtual image -- exactly the case you've already studied. The same idea is used in a dentist's small mirror to see a magnified view of a tooth." },
  { progress: 0.37, text: "Torches, headlights, and searchlights use a concave mirror with the bulb placed exactly at the focus. Reversing the rule you learned -- a ray through the focus reflects parallel to the axis -- every ray leaving the bulb comes out as a strong, concentrated, parallel beam." },
  { progress: 0.5, text: "A solar furnace or solar cooker also uses a concave mirror, but faces the sun. Sunlight arrives as parallel rays -- the object is effectively at infinity -- and by the same rule you learned, all of it converges exactly at the focus, concentrating heat there." },
  { progress: 0.62, text: "Rear-view and side mirrors on vehicles use a convex mirror. A convex mirror always forms a virtual, erect, diminished image, no matter how far the object is. Because everything appears smaller, a much wider area behind the vehicle fits into the same mirror -- a wider field of view than a plane mirror of the same size." },
  { progress: 0.75, text: "An ENT doctor's head mirror is also concave, and works exactly like the shaving mirror: a lamp placed between the focus and the pole reflects as a concentrated beam, which the doctor directs into the ear, nose, or throat." },
  { progress: 0.87, text: "Reflecting telescopes use a large concave mirror the same way a solar cooker does -- faint starlight arrives as effectively parallel rays and converges at the focus, just scaled up to collect much fainter light from much farther away." },
  { progress: 1.0, text: "That same wider-field-of-view convex mirror isn't only for cars: road-safety mirrors at blind curves, shop security mirrors, and small ATM mirrors all use the exact same physics." },
];

const SphericalMirrorUsesAnimation = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Uses of Concave and Convex Mirrors"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Continue to Quiz ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.12) step = 0;
        else if (progress < 0.25) step = 1;
        else if (progress < 0.37) step = 2;
        else if (progress < 0.5) step = 3;
        else if (progress < 0.62) step = 4;
        else if (progress < 0.75) step = 5;
        else if (progress < 0.87) step = 6;
        else step = 7;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />
            <defs>
              <marker id="uses-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
              <marker id="uses-arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
              <marker id="uses-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#93C5FD" />
              </marker>
            </defs>

            {step === 0 && (
              <Label x={SVG_W / 2} y={SVG_H / 2} text="Why do we use concave mirrors here, and convex there?" size={15} color="#111827" bold />
            )}
            {step === 1 && <ShavingMirrorScene />}
            {step === 2 && <HeadlightScene />}
            {step === 3 && <SolarCookerScene />}
            {step === 4 && <RearViewScene />}
            {step === 5 && <ENTMirrorScene />}
            {step === 6 && <TelescopeScene />}
            {step === 7 && <WideFieldConvexScene />}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default SphericalMirrorUsesAnimation;
