// New Cartesian Sign Convention for spherical mirrors. Every value shown
// here matches MirrorPhysicsEngine.calculateImage() exactly: u is always
// negative (object left of pole), concave f is negative, convex f is
// positive, real image v is negative, virtual image v is positive, erect
// h' is positive, inverted h' is negative -- this lesson must never drift
// from that authority.
import React from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";
import { Label } from "../../../shared/SVGUtils";

const SVG_W = 700;
const SVG_H = 380;
const AXIS_Y = 210;
const POLE_X = 400;

const AUDIO_STEPS = [
  { progress: 0.14, text: "To use the mirror formula correctly, every distance and height must be measured using one fixed set of rules -- the New Cartesian Sign Convention." },
  { progress: 0.3, text: "All distances are measured from the Pole, which is the origin. The object is always placed to the left of the pole." },
  { progress: 0.45, text: "The direction light actually travels -- left to right, toward the mirror -- is taken as positive. So the object distance, measured backward against that direction, is always negative." },
  { progress: 0.6, text: "This is why, for a concave mirror, the focus -- which sits in front of the mirror, on the same side as the object -- has a negative focal length. For a convex mirror, the focus sits behind the mirror, on the positive side, so its focal length is positive." },
  { progress: 0.75, text: "Heights follow the same idea, but vertically: heights measured upward, above the axis, are positive. Heights measured downward are negative." },
  { progress: 0.9, text: "A real image forms in front of the mirror, on the negative side, so its image distance v is negative. A virtual image forms behind the mirror, on the positive side, so v is positive." },
  { progress: 1.0, text: "And for height: an erect image has a positive height, the same side as the object. An inverted image has a negative height." },
];

const SignConventionLesson = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Sign Convention for Spherical Mirrors"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Continue to Mirror Formula ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.14) step = 0;
        else if (progress < 0.3) step = 1;
        else if (progress < 0.45) step = 2;
        else if (progress < 0.6) step = 3;
        else if (progress < 0.75) step = 4;
        else if (progress < 0.9) step = 5;
        else step = 6;

        const showAxis = step >= 1;
        const showZones = step >= 2;
        const showFocusZones = step === 3;
        const showHeightZones = step === 4;
        const showImageZones = step === 5;
        const showOrientationZones = step === 6;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {step === 0 && (
              <Label x={SVG_W / 2} y={SVG_H / 2} text="How do we keep +/- consistent for every mirror problem?" size={15} color="#111827" bold />
            )}

            {showAxis && (
              <g>
                <line x1={40} y1={AXIS_Y} x2={SVG_W - 40} y2={AXIS_Y} stroke="#374151" strokeWidth={2} />
                <circle cx={POLE_X} cy={AXIS_Y} r={4} fill="#111827" />
                <Label x={POLE_X} y={AXIS_Y + 22} text="P (origin)" size={12} color="#111827" bold />
              </g>
            )}

            {showZones && (
              <g>
                <rect x={POLE_X} y={AXIS_Y - 60} width={SVG_W - 40 - POLE_X} height={20} fill="#DCFCE7" opacity={0.7} />
                <rect x={40} y={AXIS_Y - 60} width={POLE_X - 40} height={20} fill="#FEE2E2" opacity={0.7} />
                <Label x={POLE_X + 90} y={AXIS_Y - 66} text="Positive (direction light travels)" size={11} color="#166534" bold />
                <Label x={POLE_X - 110} y={AXIS_Y - 66} text="Negative (object side)" size={11} color="#991B1B" bold />
                <line x1={POLE_X - 30} y1={AXIS_Y} x2={POLE_X - 100} y2={AXIS_Y} stroke="#DC2626" strokeWidth={2} markerEnd="url(#sc-arrow-red)" />
                <circle cx={POLE_X - 110} cy={AXIS_Y} r={5} fill="none" stroke="#374151" strokeWidth={2} />
                <Label x={POLE_X - 110} y={AXIS_Y + 22} text="Object (u is negative)" size={11} color="#991B1B" bold />
                <defs>
                  <marker id="sc-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
                  </marker>
                </defs>
              </g>
            )}

            {showFocusZones && (
              <g>
                <circle cx={POLE_X - 90} cy={AXIS_Y} r={4} fill="#DC2626" />
                <Label x={POLE_X - 90} y={AXIS_Y - 30} text="Concave: F here" size={11} color="#DC2626" bold />
                <Label x={POLE_X - 90} y={AXIS_Y + 22} text="f is NEGATIVE" size={11} color="#991B1B" bold />

                <circle cx={POLE_X + 90} cy={AXIS_Y} r={4} fill="#16A34A" />
                <Label x={POLE_X + 90} y={AXIS_Y - 30} text="Convex: F here" size={11} color="#16A34A" bold />
                <Label x={POLE_X + 90} y={AXIS_Y + 22} text="f is POSITIVE" size={11} color="#166534" bold />
              </g>
            )}

            {showHeightZones && (
              <g>
                <rect x={POLE_X - 20} y={30} width={40} height={AXIS_Y - 30} fill="#DCFCE7" opacity={0.5} />
                <rect x={POLE_X - 20} y={AXIS_Y} width={40} height={AXIS_Y - 30} fill="#FEE2E2" opacity={0.5} />
                <line x1={POLE_X} y1={AXIS_Y} x2={POLE_X} y2={40} stroke="#16A34A" strokeWidth={2} markerEnd="url(#sc-arrow-green)" />
                <Label x={POLE_X + 70} y={70} text="Upward = POSITIVE height" size={11} color="#166534" bold />
                <line x1={POLE_X} y1={AXIS_Y} x2={POLE_X} y2={AXIS_Y + 80} stroke="#DC2626" strokeWidth={2} />
                <Label x={POLE_X + 70} y={AXIS_Y + 60} text="Downward = NEGATIVE height" size={11} color="#991B1B" bold />
                <defs>
                  <marker id="sc-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#16A34A" />
                  </marker>
                </defs>
              </g>
            )}

            {showImageZones && (
              <g>
                <Label x={POLE_X - 90} y={AXIS_Y - 40} text="Real image (in front)" size={11} color="#991B1B" bold />
                <Label x={POLE_X - 90} y={AXIS_Y - 20} text="v is NEGATIVE" size={12} color="#991B1B" bold />
                <Label x={POLE_X + 90} y={AXIS_Y - 40} text="Virtual image (behind)" size={11} color="#166534" bold />
                <Label x={POLE_X + 90} y={AXIS_Y - 20} text="v is POSITIVE" size={12} color="#166534" bold />
              </g>
            )}

            {showOrientationZones && (
              <g>
                <rect x={POLE_X - 220} y={AXIS_Y - 70} width={440} height={110} rx={10} fill="#EFF6FF" stroke="#BFDBFE" />
                <Label x={POLE_X} y={AXIS_Y - 40} text="Erect image -> h' is POSITIVE" size={13} color="#166534" bold />
                <Label x={POLE_X} y={AXIS_Y - 16} text="Inverted image -> h' is NEGATIVE" size={13} color="#991B1B" bold />
                <Label x={POLE_X} y={AXIS_Y + 12} text="u is always negative. Everything else follows from" size={11} color="#374151" />
                <Label x={POLE_X} y={AXIS_Y + 30} text="where the point actually is, left/right and up/down of P." size={11} color="#374151" />
              </g>
            )}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default SignConventionLesson;
