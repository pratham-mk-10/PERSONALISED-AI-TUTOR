import React from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";
import { clamp, lerp } from "../../../shared/PhysicsEngine";
import { Label } from "../../../shared/SVGUtils";

const SVG_W = 800;
const SVG_H = 420;
const AXIS_Y = 220;

const concave = {
  center: { x: 505, y: AXIS_Y },
  radius: 120,
  pole: { x: 625, y: AXIS_Y },
  focus: { x: 565, y: AXIS_Y },
};

const convex = {
  center: { x: 505, y: AXIS_Y },
  radius: 120,
  pole: { x: 385, y: AXIS_Y },
  focus: { x: 445, y: AXIS_Y },
};

const concaveHits = [
  { x: 594, y: 145 },
  { x: 625, y: AXIS_Y },
  { x: 594, y: 295 },
];

const convexHits = [
  { x: 416, y: 145 },
  { x: 385, y: AXIS_Y },
  { x: 416, y: 295 },
];

const rayRows = [145, AXIS_Y, 295];

const rightHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
const leftHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;

const MirrorPolishTicks = ({ cx, cy, r, side }) => {
  const ys = [-102, -84, -66, -48, -30, -12, 12, 30, 48, 66, 84, 102];
  const dir = side === "right" ? 1 : -1;

  return (
    <g stroke="#111827" strokeWidth="2" strokeLinecap="round">
      {ys.map((dy, idx) => {
        const edgeX = cx + dir * Math.sqrt(Math.max(0, r * r - dy * dy));
        const x1 = edgeX + dir * 2;
        const x2 = edgeX + dir * 8;
        const y1 = cy + dy - 3;
        const y2 = cy + dy + 3;
        return <line key={`tick-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
  );
};

const SphericalMirrorVideo = ({ onTryItClicked }) => {
  return (
    <AnimationPlayer
      duration={48000}
      title="Watch: Spherical Mirrors (Detailed)"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress }) => {
        let step = 0;

        if (progress < 0.08) step = 0;
        else if (progress < 0.18) step = 1;
        else if (progress < 0.30) step = 2;
        else if (progress < 0.44) step = 3;
        else if (progress < 0.58) step = 4;
        else if (progress < 0.72) step = 5;
        else if (progress < 0.88) step = 6;
        else step = 7;

        const concaveArc = rightHemisphere(concave.center.x, concave.center.y, concave.radius);
        const convexArc = leftHemisphere(convex.center.x, convex.center.y, convex.radius);

        const concaveMirrorOpacity = clamp(progress / 0.18, 0, 1);
        const concavePointsOpacity = clamp((progress - 0.18) / 0.12, 0, 1);
        const concaveIncPhase = clamp((progress - 0.30) / 0.14, 0, 1);
        const concaveRefPhase = clamp((progress - 0.44) / 0.14, 0, 1);

        const switchPhase = clamp((progress - 0.58) / 0.14, 0, 1);
        const convexMirrorOpacity = clamp((progress - 0.58) / 0.14, 0, 1);
        const convexRayPhase = clamp((progress - 0.72) / 0.16, 0, 1);

        const showConcave = step <= 5;
        const showConvex = step >= 5;
        const showSummary = step === 7;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            <line
              x1={40}
              y1={AXIS_Y}
              x2={760}
              y2={AXIS_Y}
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeDasharray="6,5"
            />
            <Label x={745} y={AXIS_Y - 8} text="Principal axis" color="#6B7280" size={11} anchor="end" />

            <defs>
              <marker id="arrow-inc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
              <marker id="arrow-ref" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
              </marker>
            </defs>

            {showConcave && (
              <g opacity={showConvex ? 1 - switchPhase : 1}>
                <circle
                  cx={concave.center.x}
                  cy={concave.center.y}
                  r={concave.radius}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  opacity={concaveMirrorOpacity}
                />

                <path d={concaveArc} fill="none" stroke="#2563EB" strokeWidth="6" opacity={concaveMirrorOpacity} />
                <MirrorPolishTicks cx={concave.center.x} cy={concave.center.y} r={concave.radius} side="right" />

                {step >= 1 && (
                  <>
                    <circle cx={concave.pole.x} cy={concave.pole.y} r="5" fill="#DC2626" opacity={concaveMirrorOpacity} />
                    <Label x={concave.pole.x - 14} y={concave.pole.y - 12} text="P" color="#DC2626" size={12} bold />
                  </>
                )}

                {step >= 2 && (
                  <g opacity={concavePointsOpacity}>
                    <circle cx={concave.focus.x} cy={concave.focus.y} r="5" fill="#16A34A" />
                    <circle cx={concave.center.x} cy={concave.center.y} r="5" fill="#7C3AED" />
                    <Label x={concave.focus.x - 8} y={concave.focus.y + 22} text="F" color="#16A34A" size={12} bold />
                    <Label x={concave.center.x - 10} y={concave.center.y + 22} text="C" color="#7C3AED" size={12} bold />
                    <Label x={620} y={96} text="R = PC and F lies midway (R = 2f)" color="#1E40AF" size={12} anchor="end" bold />
                  </g>
                )}

                {step >= 3 && (
                  <g>
                    {rayRows.map((y, idx) => {
                      const tip = lerp(80, y, concaveHits[idx].x - 3, y, concaveIncPhase);
                      return (
                        <line
                          key={`conc-inc-${idx}`}
                          x1={80}
                          y1={y}
                          x2={tip.x}
                          y2={tip.y}
                          stroke="#F59E0B"
                          strokeWidth="2.4"
                          markerEnd="url(#arrow-inc)"
                        />
                      );
                    })}
                  </g>
                )}

                {step >= 4 && (
                  <g>
                    {concaveHits.map((hit, idx) => {
                      const tip = lerp(hit.x, hit.y, concave.focus.x, concave.focus.y, concaveRefPhase);
                      return (
                        <line
                          key={`conc-ref-${idx}`}
                          x1={hit.x}
                          y1={hit.y}
                          x2={tip.x}
                          y2={tip.y}
                          stroke="#DC2626"
                          strokeWidth="2.4"
                          markerEnd="url(#arrow-ref)"
                        />
                      );
                    })}
                  </g>
                )}
              </g>
            )}

            {showConvex && (
              <g opacity={convexMirrorOpacity}>
                <circle
                  cx={convex.center.x}
                  cy={convex.center.y}
                  r={convex.radius}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <path d={convexArc} fill="none" stroke="#16A34A" strokeWidth="6" />
                <MirrorPolishTicks cx={convex.center.x} cy={convex.center.y} r={convex.radius} side="right" />

                <circle cx={convex.pole.x} cy={convex.pole.y} r="5" fill="#DC2626" />
                <circle cx={convex.focus.x} cy={convex.focus.y} r="5" fill="#16A34A" />
                <circle cx={convex.center.x} cy={convex.center.y} r="5" fill="#7C3AED" />
                <Label x={convex.pole.x - 16} y={convex.pole.y - 12} text="P" color="#DC2626" size={12} bold />
                <Label x={convex.focus.x - 8} y={convex.focus.y + 22} text="F" color="#16A34A" size={12} bold />
                <Label x={convex.center.x - 10} y={convex.center.y + 22} text="C" color="#7C3AED" size={12} bold />

                {step >= 6 && (
                  <g>
                    {rayRows.map((y, idx) => {
                      const incTip = lerp(80, y, convexHits[idx].x - 3, y, convexRayPhase);
                      const refTip = lerp(convexHits[idx].x, convexHits[idx].y, 700, y + (idx - 1) * 35, convexRayPhase);

                      return (
                        <g key={`convx-${idx}`}>
                          <line
                            x1={80}
                            y1={y}
                            x2={incTip.x}
                            y2={incTip.y}
                            stroke="#F59E0B"
                            strokeWidth="2.4"
                            markerEnd="url(#arrow-inc)"
                          />

                          <line
                            x1={convexHits[idx].x}
                            y1={convexHits[idx].y}
                            x2={refTip.x}
                            y2={refTip.y}
                            stroke="#DC2626"
                            strokeWidth="2.4"
                            markerEnd="url(#arrow-ref)"
                          />

                          <line
                            x1={convexHits[idx].x}
                            y1={convexHits[idx].y}
                            x2={445}
                            y2={AXIS_Y}
                            stroke="#94A3B8"
                            strokeWidth="1.5"
                            strokeDasharray="5,5"
                            opacity={convexRayPhase}
                          />
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            )}

            {step === 0 && (
              <>
                <Label x={400} y={52} text="Spherical Mirrors: Detailed Visual Build" color="#111827" size={20} bold />
                <Label x={400} y={84} text="Same pace as law-of-reflection watch mode" color="#6B7280" size={13} />
              </>
            )}

            {step === 1 && (
              <Label
                x={400}
                y={42}
                text="Step 1: Concave mirror surface and pole P"
                color="#111827"
                size={15}
                bold
              />
            )}

            {step === 2 && (
              <Label
                x={400}
                y={42}
                text="Step 2: Add C and F for concave mirror (R = 2f)"
                color="#111827"
                size={15}
                bold
              />
            )}

            {step === 3 && (
              <Label
                x={400}
                y={42}
                text="Step 3: Parallel incident rays approach the concave mirror"
                color="#111827"
                size={15}
                bold
              />
            )}

            {step === 4 && (
              <Label
                x={400}
                y={42}
                text="Step 4: Reflected rays converge to the real focus F"
                color="#111827"
                size={15}
                bold
              />
            )}

            {step === 5 && (
              <Label
                x={400}
                y={42}
                text="Step 5: Transition to convex mirror geometry"
                color="#111827"
                size={15}
                bold
              />
            )}

            {step === 6 && (
              <>
                <Label
                  x={400}
                  y={42}
                  text="Step 6: Convex mirror makes reflected rays diverge"
                  color="#111827"
                  size={15}
                  bold
                />
                <Label
                  x={400}
                  y={392}
                  text="Dotted gray back extensions meet at virtual focus F behind the mirror"
                  color="#6B7280"
                  size={12}
                />
              </>
            )}

            {showSummary && (
              <g>
                <rect
                  x={150}
                  y={276}
                  width={500}
                  height={118}
                  rx={10}
                  fill="#EFF6FF"
                  stroke="#BFDBFE"
                  strokeWidth="2"
                />
                <Label x={400} y={304} text="Spherical Mirror Summary" color="#1E40AF" size={16} bold />
                <Label x={400} y={328} text="Concave: parallel rays converge at real focus F" color="#1E40AF" size={13} />
                <Label x={400} y={348} text="Convex: reflected rays diverge; extensions meet at virtual F" color="#1E40AF" size={13} />
                <Label x={400} y={368} text="In both mirrors, F lies midway between P and C (R = 2f)" color="#1E40AF" size={13} />
              </g>
            )}
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default SphericalMirrorVideo;
