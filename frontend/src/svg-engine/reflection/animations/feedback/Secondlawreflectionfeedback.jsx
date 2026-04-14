// ============================================================
// SecondLawReflectionFeedback.jsx
// RED/GREEN feedback overlay for 2nd Law misconceptions
// 
// Common misconceptions:
// 1. rays_not_coplanar - thinks rays can go out of plane
// 2. normal_not_in_plane - forgets normal is part of plane
// 3. plane_definition - doesn't understand what plane means
// ============================================================

import React from "react";
import { Label } from "../../../shared/SVGUtils";

const SVG_W = 420;
const SVG_H = 320;
const CX = 210;
const CY = 200;

const SecondLawReflectionFeedback = ({
  isCorrect,
  misconceptionTag,
  explanation,
}) => {
  // ── CORRECT ANSWER ──
  if (isCorrect) {
    return (
      <div style={{
        position: "relative",
        marginTop: "15px",
        padding: "16px",
        backgroundColor: "#F0FDF4",
        border: "2px solid #22C55E",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <div style={{
          fontSize: "20px",
          marginBottom: "8px"
        }}>
          ✅ Correct!
        </div>
        <div style={{
          fontSize: "14px",
          color: "#166534",
          fontWeight: "600"
        }}>
          You understand the 2nd Law! The incident ray, reflected ray, and normal
          are always in the same plane.
        </div>
      </div>
    );
  }

  // ── INCORRECT ANSWER WITH MISCONCEPTION FEEDBACK ──
  return (
    <div>
      {/* Red overlay SVG */}
      <svg width={SVG_W} height={SVG_H} style={{
        display: "block",
        border: "2px solid #DC2626",
        borderRadius: "8px",
        backgroundColor: "#FEF2F2",
        marginTop: "15px"
      }}>
        <rect width={SVG_W} height={SVG_H} fill="#FEF2F2" />

        {misconceptionTag === "rays_not_coplanar" && (
          <>
            {/* Show what WRONG looks like */}
            <g opacity="0.5">
              <line x1={150} y1={100} x2={CX} y2={CY} stroke="#2563EB" strokeWidth="2" />
              <line x1={CX} y1={CY} x2={320} y2={80} stroke="#DC2626" strokeWidth="2" />
              <circle cx={CX} cy={CY} r={5} fill="#000" />
            </g>

            {/* Red X over the wrong scenario */}
            <circle cx={CX} cy={150} r={60} fill="none" stroke="#DC2626" strokeWidth="3" />
            <line x1={CX - 40} y1={110} x2={CX + 40} y2={190} stroke="#DC2626" strokeWidth="3" />
            <line x1={CX + 40} y1={110} x2={CX - 40} y2={190} stroke="#DC2626" strokeWidth="3" />

            {/* Explanation box */}
            <rect x={50} y={240} width={320} height={60} rx={6} fill="#FEE2E2" stroke="#FECACA" strokeWidth="1" />
            <Label
              x={210}
              y={260}
              text="❌ WRONG: The rays are NOT in the same plane"
              color="#991B1B"
              size={12}
              anchor="middle"
              bold
            />
            <Label
              x={210}
              y={280}
              text="One ray is going out of the page - this violates the 2nd law"
              color="#991B1B"
              size={11}
              anchor="middle"
            />
          </>
        )}

        {misconceptionTag === "normal_not_in_plane" && (
          <>
            {/* Show mirror and normal separately */}
            <line x1={60} y1={CY} x2={360} y2={CY} stroke="#000" strokeWidth="2" />
            <circle cx={CX} cy={CY} r={4} fill="#000" />

            {/* Normal drawn wrong (not in plane) */}
            <g opacity="0.7">
              <line x1={CX} y1={60} x2={CX} y2={CY} stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx={CX} cy={75} r={3} fill="#9CA3AF" />
            </g>

            {/* Red X */}
            <circle cx={CX - 50} cy={110} r={40} fill="none" stroke="#DC2626" strokeWidth="3" />
            <line x1={CX - 90} y1={70} x2={CX - 10} y2={150} stroke="#DC2626" strokeWidth="3" />
            <line x1={CX - 10} y1={70} x2={CX - 90} y2={150} stroke="#DC2626" strokeWidth="3" />

            {/* Explanation box */}
            <rect x={50} y={240} width={320} height={60} rx={6} fill="#FEE2E2" stroke="#FECACA" strokeWidth="1" />
            <Label
              x={210}
              y={260}
              text="❌ WRONG: You forgot the NORMAL in the plane!"
              color="#991B1B"
              size={12}
              anchor="middle"
              bold
            />
            <Label
              x={210}
              y={280}
              text="The plane ALWAYS includes: mirror surface + normal + rays"
              color="#991B1B"
              size={11}
              anchor="middle"
            />
          </>
        )}

        {misconceptionTag === "plane_definition" && (
          <>
            {/* Show wrong understanding */}
            <rect x={100} y={100} width={200} height={100} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,5" />
            <Label x={210} y={155} text="Plane?" color="#6B7280" size={14} anchor="middle" italic={true} />

            {/* Red X */}
            <circle cx={210} cy={150} r={70} fill="none" stroke="#DC2626" strokeWidth="3" />
            <line x1={140} y1={80} x2={280} y2={220} stroke="#DC2626" strokeWidth="3" />
            <line x1={280} y1={80} x2={140} y2={220} stroke="#DC2626" strokeWidth="3" />

            {/* Explanation box */}
            <rect x={40} y={250} width={340} height={50} rx={6} fill="#FEE2E2" stroke="#FECACA" strokeWidth="1" />
            <Label
              x={210}
              y={270}
              text="❌ NOT JUST any plane! It's the plane containing the mirror normal"
              color="#991B1B"
              size={11}
              anchor="middle"
              bold
            />
            <Label
              x={210}
              y={288}
              text="and PERPENDICULAR to the mirror surface"
              color="#991B1B"
              size={11}
              anchor="middle"
            />
          </>
        )}
      </svg>

      {/* Explanation text below SVG */}
      {explanation && (
        <div style={{
          marginTop: "15px",
          padding: "14px",
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#7F1D1D",
          lineHeight: "1.6"
        }}>
          <strong style={{ color: "#991B1B" }}>📖 Let me explain:</strong>
          <p style={{ marginTop: "8px", marginBottom: "0" }}>
            {explanation}
          </p>
        </div>
      )}

      {/* Generic help if no explanation */}
      {!explanation && (
        <div style={{
          marginTop: "15px",
          padding: "14px",
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#7F1D1D",
          lineHeight: "1.6"
        }}>
          <strong style={{ color: "#991B1B" }}>💡 Hint:</strong>
          <p style={{ marginTop: "8px", marginBottom: "0" }}>
            Think about the plane as a sheet of paper. The mirror, the normal line,
            the incident ray, and the reflected ray are ALL drawn on this same sheet
            of paper. They can never go "above" or "below" the paper.
          </p>
        </div>
      )}
    </div>
  );
};

export default SecondLawReflectionFeedback;