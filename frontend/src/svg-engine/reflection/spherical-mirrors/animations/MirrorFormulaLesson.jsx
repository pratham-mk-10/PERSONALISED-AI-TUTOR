// Worked mirror-formula examples. Every displayed number is computed live
// via MirrorPhysicsEngine.calculateImage() -- the same authority the rest
// of the app uses -- rather than hand-typed, so the numbers shown here are
// guaranteed consistent with the sign convention taught in
// SignConventionLesson.jsx and with DynamicMirrorFeedback elsewhere.
import React from "react";
import AudioAnimationPlayer from "../../../shared/AudioAnimationPlayer";
import { Label, DataBox, MirrorFormula } from "../../../shared/SVGUtils";
import { MirrorPhysicsEngine } from "../MirrorPhysicsEngine";

const SVG_W = 700;
const SVG_H = 400;

// NCERT Example 9.1: convex mirror, R = 3.00 m, bus at u = 5.00 m.
const EX1 = MirrorPhysicsEngine.calculateImage("convex", 1.5, 5.0, 0);
// NCERT Example 9.2: concave mirror, f = 15 cm, object h = 4 cm at u = 25 cm.
const EX2 = MirrorPhysicsEngine.calculateImage("concave", 15, 25, 4);

const round2 = (n) => Math.round(n * 100) / 100;

const AUDIO_STEPS = [
  { progress: 0.15, text: "With the sign convention in hand, we can now use the mirror formula: one over v, plus one over u, equals one over f. It connects image distance, object distance, and focal length for any spherical mirror." },
  { progress: 0.3, text: "Magnification tells us the size and orientation of the image: m equals h prime over h, the image height over the object height, and it also equals minus v over u." },
  { progress: 0.45, text: "Read the sign of m: if m is positive, the image is virtual and erect. If m is negative, the image is real and inverted. And the size: if the size of m is greater than 1, the image is magnified; less than 1, diminished; exactly 1, the same size." },
  { progress: 0.65, text: "Example 9.1: a convex mirror with radius of curvature 3 point 0 0 metres, so f equals 1 point 5 metres, positive. A bus stands 5 metres away, so u is negative 5 metres. Solving the formula gives v equals positive 1 point 1 5 metres, and m equals positive 0 point 2 3. Positive v: virtual. Positive m: erect and diminished -- exactly what you expect from a convex mirror." },
  { progress: 0.85, text: "Example 9.2: a concave mirror of focal length 15 centimetres, f is negative 15. An object 4 centimetres tall stands 25 centimetres away, u is negative 25. Solving gives v equals negative 37 point 5 centimetres, and m equals negative 1 point 5, so the image height is negative 6 centimetres. Negative v: real. Negative m: inverted and magnified." },
  { progress: 1.0, text: "Notice both answers came from exactly the same formula and the exact same sign rules -- only the mirror type and the numbers changed." },
];

const MirrorFormulaLesson = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Mirror Formula and Magnification, Worked Examples"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Continue to Quiz ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.15) step = 0;
        else if (progress < 0.3) step = 1;
        else if (progress < 0.45) step = 2;
        else if (progress < 0.65) step = 3;
        else if (progress < 0.85) step = 4;
        else step = 5;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {step === 0 && (
              <g>
                <Label x={SVG_W / 2} y={140} text="How do we find EXACTLY where the image forms?" size={15} color="#111827" bold />
                <MirrorFormula x={SVG_W / 2 - 90} y={190} text="1/f = 1/v + 1/u" />
              </g>
            )}

            {step === 1 && (
              <g>
                <MirrorFormula x={SVG_W / 2 - 90} y={140} text="1/f = 1/v + 1/u" />
                <Label x={SVG_W / 2} y={210} text="m = h'/h = -v/u" size={18} color="#1E40AF" bold />
              </g>
            )}

            {step === 2 && (
              <g>
                <rect x={90} y={110} width={520} height={140} rx={10} fill="#EFF6FF" stroke="#BFDBFE" />
                <Label x={SVG_W / 2} y={140} text="m > 0  ->  virtual, erect" size={14} color="#166534" bold />
                <Label x={SVG_W / 2} y={165} text="m < 0  ->  real, inverted" size={14} color="#991B1B" bold />
                <Label x={SVG_W / 2} y={195} text="|m| > 1 magnified   |m| < 1 diminished   |m| = 1 same size" size={13} color="#374151" />
                <Label x={SVG_W / 2} y={225} text="Plane mirror: m = +1 always. Convex mirror: m always +ve, |m| < 1." size={12} color="#6B7280" />
              </g>
            )}

            {step === 3 && (
              <g>
                <Label x={SVG_W / 2} y={40} text="NCERT Example 9.1: Convex mirror, R = 3.00 m, bus at u = 5.00 m" size={13} color="#111827" bold />
                <Label x={SVG_W / 2} y={62} text="f = R/2 = +1.50 m (convex, positive)   u = -5.00 m" size={12} color="#374151" />
                <DataBox x={220} y={100} u={EX1.u} v={round2(EX1.v)} f={EX1.f} m={round2(EX1.m)} isReal={!EX1.isVirtual} isEnlarged={Math.abs(EX1.m) > 1} isErect={EX1.m > 0} />
                <Label x={SVG_W / 2} y={310} text={`v = ${round2(EX1.v)} m (positive -> virtual)     m = ${round2(EX1.m)} (positive -> erect, diminished)`} size={13} color="#166534" bold />
              </g>
            )}

            {step === 4 && (
              <g>
                <Label x={SVG_W / 2} y={40} text="NCERT Example 9.2: Concave mirror, f = 15 cm, h = 4 cm, u = 25 cm" size={13} color="#111827" bold />
                <Label x={SVG_W / 2} y={62} text="f = -15 cm (concave, negative)   u = -25 cm" size={12} color="#374151" />
                <DataBox x={220} y={100} u={EX2.u} v={EX2.v} f={EX2.f} m={EX2.m} isReal={!EX2.isVirtual} isEnlarged={Math.abs(EX2.m) > 1} isErect={EX2.hPrime > 0} />
                <Label x={SVG_W / 2} y={310} text={`v = ${EX2.v} cm (negative -> real)     m = ${EX2.m}, h' = ${EX2.hPrime} cm (negative -> inverted, magnified)`} size={13} color="#991B1B" bold />
              </g>
            )}

            {step === 5 && (
              <g>
                <rect x={70} y={120} width={560} height={140} rx={10} fill="#ECFDF3" stroke="#86EFAC" />
                <Label x={SVG_W / 2} y={150} text="Same formula, same sign rules, every time:" size={14} color="#166534" bold />
                <Label x={SVG_W / 2} y={178} text="1) Assign signs to u, f (and h if given)" size={12} color="#111827" />
                <Label x={SVG_W / 2} y={200} text="2) Substitute into 1/f = 1/v + 1/u, solve for v" size={12} color="#111827" />
                <Label x={SVG_W / 2} y={222} text="3) m = -v/u, then h' = m x h if needed" size={12} color="#111827" />
                <Label x={SVG_W / 2} y={244} text="4) Read the signs of v and m to describe the image" size={12} color="#111827" />
              </g>
            )}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default MirrorFormulaLesson;
