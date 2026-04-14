import React from "react";
import AnimationPlayer from "../../shared/AnimationPlayer";
import {
  incidentRayStart,
  reflectedRayEnd,
  describeArc,
  lerp,
  clamp,
} from "../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  AngleArc,
  Label,
} from "../../shared/SVGUtils";

const SVG_W = 430;
const SVG_H = 320;
const CX = 215;
const CY = 225;
const RAY_LEN = 165;
const ANGLE = 35;
const ARC_R = 44;

const PlaneMirrorBasicsAnimation = ({ onContinue }) => {
  const incStart = incidentRayStart(CX, CY, RAY_LEN, ANGLE);
  const refEnd = reflectedRayEnd(CX, CY, RAY_LEN, ANGLE);

  return (
    <AnimationPlayer
      duration={52000}
      title="Watch: Plane Mirror Basics"
      onTryItClicked={onContinue}
      showTryIt={true}
      tryButtonLabel="Continue to Laws of Reflection ->"
    >
      {({ progress }) => {
        let step = 0;

        if (progress < 0.1) step = 0;
        else if (progress < 0.2) step = 1;
        else if (progress < 0.32) step = 2;
        else if (progress < 0.44) step = 3;
        else if (progress < 0.56) step = 4;
        else if (progress < 0.68) step = 5;
        else if (progress < 0.8) step = 6;
        else if (progress < 0.9) step = 7;
        else step = 8;

        const mirrorOpacity = clamp(progress / 0.12, 0, 1);
        const normalOpacity = clamp((progress - 0.18) / 0.12, 0, 1);
        const incPhase = clamp((progress - 0.3) / 0.14, 0, 1);
        const refPhase = clamp((progress - 0.44) / 0.14, 0, 1);

        const showIncArc = step >= 5;
        const showRefArc = step >= 6;
        const showSummary = step >= 8;

        const incTip = lerp(incStart.x, incStart.y, CX, CY, incPhase);
        const refTip = lerp(CX, CY, refEnd.x, refEnd.y, refPhase);

        const incidenceArcPath = describeArc(CX, CY, ARC_R, -ANGLE, 0);
        const reflectionArcPath = describeArc(CX, CY, ARC_R, 0, ANGLE);

        const incLabelX = CX - ARC_R * 1.3 * Math.sin((ANGLE / 2) * Math.PI / 180);
        const incLabelY = CY - ARC_R * 1.18 * Math.cos((ANGLE / 2) * Math.PI / 180);
        const refLabelX = CX + ARC_R * 1.3 * Math.sin((ANGLE / 2) * Math.PI / 180);
        const refLabelY = CY - ARC_R * 1.18 * Math.cos((ANGLE / 2) * Math.PI / 180);

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            <g opacity={mirrorOpacity}>
              <PlaneMirror x1={65} x2={365} y={CY} />
              <Label
                x={215}
                y={CY + 25}
                text="Plane mirror: a smooth flat reflecting surface"
                size={13}
                color="#111827"
                bold={step === 0 || step === 1}
              />
              <circle cx={CX} cy={CY} r={step >= 1 ? 3 : 0} fill="#111827" />
              {step >= 1 && (
                <Label
                  x={CX + 12}
                  y={CY - 8}
                  text="Point of incidence (P)"
                  size={12}
                  color="#374151"
                  anchor="start"
                />
              )}
            </g>

            {normalOpacity > 0 && (
              <g opacity={normalOpacity}>
                <Normal x={CX} topY={60} bottomY={CY} />
                <Label
                  x={CX + 10}
                  y={76}
                  text="Normal (N): 90 deg to mirror"
                  size={12}
                  anchor="start"
                  color="#6B7280"
                  bold={step === 2}
                />
              </g>
            )}

            {incPhase > 0 && (
              <g>
                <line
                  x1={incStart.x}
                  y1={incStart.y}
                  x2={incTip.x}
                  y2={incTip.y}
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-blue-basics)"
                />
                {step === 3 && (
                  <Label
                    x={incStart.x - 8}
                    y={incStart.y - 12}
                    text="Incident ray"
                    color="#2563EB"
                    size={12}
                    anchor="end"
                    bold
                  />
                )}
              </g>
            )}

            {refPhase > 0 && (
              <g>
                <line
                  x1={CX}
                  y1={CY}
                  x2={refTip.x}
                  y2={refTip.y}
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-red-basics)"
                />
                {step === 4 && (
                  <Label
                    x={refEnd.x + 12}
                    y={refEnd.y - 12}
                    text="Reflected ray"
                    color="#DC2626"
                    size={12}
                    anchor="start"
                    bold
                  />
                )}
              </g>
            )}

            <defs>
              <marker id="arrow-blue-basics" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
              </marker>
              <marker id="arrow-red-basics" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {showIncArc && (
              <AngleArc
                pathD={incidenceArcPath}
                color="#2563EB"
                label="i"
                labelX={incLabelX - 6}
                labelY={incLabelY}
              />
            )}

            {showRefArc && (
              <AngleArc
                pathD={reflectionArcPath}
                color="#DC2626"
                label="r"
                labelX={refLabelX + 6}
                labelY={refLabelY}
              />
            )}

            {step === 5 && (
              <>
                <Label
                  x={215}
                  y={34}
                  text="Angle of incidence (i): between incident ray and normal"
                  color="#2563EB"
                  size={12}
                  bold
                />
                <Label
                  x={215}
                  y={52}
                  text="Always measure from the normal, not from mirror surface"
                  color="#374151"
                  size={12}
                />
              </>
            )}

            {step === 6 && (
              <>
                <Label
                  x={215}
                  y={34}
                  text="Angle of reflection (r): between reflected ray and normal"
                  color="#DC2626"
                  size={12}
                  bold
                />
                <Label
                  x={215}
                  y={52}
                  text="At P, light bounces back from the mirror"
                  color="#374151"
                  size={12}
                />
              </>
            )}

            {step === 7 && (
              <>
                <rect x={58} y={36} width={314} height={54} rx={8} fill="#EFF6FF" stroke="#BFDBFE" />
                <Label
                  x={215}
                  y={58}
                  text="How we represent in diagrams:"
                  color="#1E40AF"
                  size={13}
                  bold
                />
                <Label
                  x={215}
                  y={78}
                  text="Mirror, Normal (N), Incident ray, Reflected ray, Angles i and r"
                  color="#1E40AF"
                  size={12}
                />
              </>
            )}

            {showSummary && (
              <g>
                <rect x={45} y={26} width={340} height={72} rx={10} fill="#ECFDF3" stroke="#86EFAC" />
                <Label
                  x={215}
                  y={50}
                  text="Plane Mirror Basics Complete"
                  color="#166534"
                  size={14}
                  bold
                />
                <Label
                  x={215}
                  y={70}
                  text="Next: Learn the 1st and 2nd Laws of Reflection"
                  color="#166534"
                  size={12}
                />
                <Label
                  x={215}
                  y={90}
                  text="(i = r, and all rays with normal are in same plane)"
                  color="#166534"
                  size={11}
                />
              </g>
            )}

            {step === 0 && (
              <Label
                x={215}
                y={48}
                text="What is a mirror?"
                color="#111827"
                size={15}
                bold
              />
            )}
            {step === 1 && (
              <Label
                x={215}
                y={48}
                text="Where light ray touches mirror is point of incidence"
                color="#111827"
                size={13}
                bold
              />
            )}
            {step === 2 && (
              <Label
                x={215}
                y={48}
                text="Normal is drawn exactly perpendicular to mirror at P"
                color="#111827"
                size={13}
                bold
              />
            )}
            {step === 3 && (
              <Label
                x={215}
                y={48}
                text="Incoming light toward mirror is called incident ray"
                color="#2563EB"
                size={13}
                bold
              />
            )}
            {step === 4 && (
              <Label
                x={215}
                y={48}
                text="Outgoing light after bounce is called reflected ray"
                color="#DC2626"
                size={13}
                bold
              />
            )}
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default PlaneMirrorBasicsAnimation;
