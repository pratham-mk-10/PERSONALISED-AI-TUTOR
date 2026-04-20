import React, { useRef, useEffect } from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";
import {
  incidentRayStart,
  describeArc,
  lerp,
  clamp,
} from "../../../shared/PhysicsEngine";
import {
  Normal,
  PlaneMirror,
  AngleArc,
  Label,
} from "../../../shared/SVGUtils";

const SVG_W = 420;
const SVG_H = 300;
const CX = 210;
const CY = 220;
const RAY_LEN = 160;
const ANGLE = 35;
const ARC_R = 45;

const AngleFromSurfaceFeedback = ({ attempt = 2 }) => {

  const incStart = incidentRayStart(CX, CY, RAY_LEN, ANGLE);

  return (
    <AnimationPlayer duration={12000} title="Fix the mistake">

      {({ progress }) => {

        let step = 0;

        if (progress < 0.3) step = 0;        // show wrong
        else if (progress < 0.6) step = 1;   // highlight wrong
        else step = 2;                       // show correct

        const wrongArc = describeArc(CX, CY, ARC_R, -90, -90 + ANGLE);
        const correctArc = describeArc(CX, CY, ARC_R, -ANGLE, 0);

        const incPhase = clamp(progress / 0.5, 0, 1);
        const incTip = lerp(incStart.x, incStart.y, CX, CY, incPhase);

        return (
          <svg width={SVG_W} height={SVG_H}>

            <rect width="100%" height="100%" fill="#F8FAFF" />

            {/* Mirror */}
            <PlaneMirror x1={60} x2={360} y={CY} />

            {/* Normal */}
            <Normal x={CX} topY={60} bottomY={CY} />

            {/* Incident Ray */}
            <line
              x1={incStart.x}
              y1={incStart.y}
              x2={incTip.x}
              y2={incTip.y}
              stroke="#2563EB"
              strokeWidth="2.5"
            />

            {/* STEP 0: WRONG ANGLE */}
            {step === 0 && (
              <>
                <AngleArc
                  pathD={wrongArc}
                  color="#DC2626"
                  label="Measured from surface ❌"
                  labelX={150}
                  labelY={200}
                />

                <Label
                  x={210}
                  y={40}
                  text="You are measuring the angle from the mirror surface"
                  anchor="middle"
                  bold
                />
              </>
            )}

            {/* STEP 1: EMPHASIZE ERROR */}
            {step === 1 && (
              <>
                <AngleArc
                  pathD={wrongArc}
                  color="#DC2626"
                  label="WRONG"
                  labelX={150}
                  labelY={200}
                />

                <Label
                  x={210}
                  y={40}
                  text="This is incorrect ❌"
                  color="#DC2626"
                  anchor="middle"
                  bold
                />
              </>
            )}

            {/* STEP 2: CORRECT */}
            {step === 2 && (
              <>
                <AngleArc
                  pathD={correctArc}
                  color="#16A34A"
                  label="From Normal ✅"
                  labelX={260}
                  labelY={180}
                />

                <Label
                  x={210}
                  y={40}
                  text="Angles must be measured from the Normal"
                  color="#16A34A"
                  anchor="middle"
                  bold
                />
              </>
            )}

          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default AngleFromSurfaceFeedback;