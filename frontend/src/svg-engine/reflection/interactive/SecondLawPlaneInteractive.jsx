// ============================================================
// SecondLawPlaneInteractive.jsx (REDESIGNED)
// TRY STAGE: "SHEET OF PAPER" APPROACH
// 
// Concept: Show the plane as a PHYSICAL sheet of paper
// - Student can see all 3 rays/normal on the paper
// - Shows what happens when ray goes OUT of paper (WRONG)
// - Shows what happens when ray stays IN paper (RIGHT)
// 
// This is MUCH more concrete than abstract rotation
// ============================================================

import React, { useState } from "react";
import { Label } from "../../shared/SVGUtils";

const SVG_W = 420;
const SVG_H = 400;
const CX = 210;
const CY = 200;

const SecondLawPlaneInteractive= () => {
  // SCENARIO: Student chooses between 3 scenarios
  // 0 = "Rays in same plane (CORRECT)"
  // 1 = "One ray out of plane (WRONG #1)"
  // 2 = "Normal forgotten (WRONG #2)"
  const [scenario, setScenario] = useState(0);

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui", maxWidth: "500px" }}>
      <h3 style={{ marginBottom: "15px", color: "#1F2937", fontSize: "16px" }}>
        🎯 Try It: Where Do the Rays Belong?
      </h3>

      {/* SCENARIO BUTTONS */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setScenario(0)}
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            border: "2px solid",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            transition: "all 0.2s",
            borderColor: scenario === 0 ? "#22C55E" : "#D1D5DB",
            backgroundColor: scenario === 0 ? "#F0FDF4" : "#FFF",
            color: scenario === 0 ? "#16A34A" : "#6B7280"
          }}
        >
          ✅ Rays in same plane
        </button>

        <button
          onClick={() => setScenario(1)}
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            border: "2px solid",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            transition: "all 0.2s",
            borderColor: scenario === 1 ? "#DC2626" : "#D1D5DB",
            backgroundColor: scenario === 1 ? "#FEF2F2" : "#FFF",
            color: scenario === 1 ? "#991B1B" : "#6B7280"
          }}
        >
          ❌ One ray out
        </button>

        <button
          onClick={() => setScenario(2)}
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            border: "2px solid",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            transition: "all 0.2s",
            borderColor: scenario === 2 ? "#DC2626" : "#D1D5DB",
            backgroundColor: scenario === 2 ? "#FEF2F2" : "#FFF",
            color: scenario === 2 ? "#991B1B" : "#6B7280"
          }}
        >
          ❌ No normal shown
        </button>
      </div>

      {/* MAIN VISUALIZATION */}
      <svg width={SVG_W} height={SVG_H} style={{
        display: "block",
        border: "2px solid #E5E7EB",
        borderRadius: "8px",
        backgroundColor: "#F8FAFF",
        marginBottom: "20px"
      }}>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SCENARIO 0: CORRECT - All in same plane (sheet of paper) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {scenario === 0 && (
          <>
            {/* SHEET OF PAPER (the plane) */}
            <g>
              {/* Large white rectangle = the plane */}
              <rect
                x={40}
                y={60}
                width={340}
                height={200}
                fill="#FFF"
                stroke="#3B82F6"
                strokeWidth="3"
                opacity="0.9"
              />

              {/* Paper shadow/edge effect */}
              <rect
                x={45}
                y={265}
                width={330}
                height="6"
                fill="#BFDBFE"
                opacity="0.5"
              />

              {/* Label: this is the plane */}
              <text
                x={55}
                y={75}
                fontSize="12"
                fontWeight="bold"
                fill="#1E40AF"
              >
                Plane of Incidence
              </text>
              <text
                x={55}
                y={92}
                fontSize="11"
                fill="#3B82F6"
              >
                (sheet of paper)
              </text>
            </g>

            {/* MIRROR (drawn on the plane) */}
            <line x1={80} y1={CY} x2={340} y2={CY} stroke="#000" strokeWidth="3" />
            <text
              x={350}
              y={CY + 6}
              fontSize="11"
              fill="#374151"
              fontWeight="bold"
            >
              Mirror
            </text>

            {/* NORMAL (perpendicular, on the plane) */}
            <line
              x1={CX}
              y1={100}
              x2={CX}
              y2={CY}
              stroke="#6B7280"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <circle cx={CX} cy={100} r={4} fill="#6B7280" />
            <text
              x={CX - 20}
              y={95}
              fontSize="11"
              fill="#6B7280"
              fontWeight="bold"
            >
              Normal (N)
            </text>

            {/* INCIDENT RAY (coming from top-left, on the plane) */}
            <line
              x1={120}
              y1={130}
              x2={CX}
              y2={CY}
              stroke="#2563EB"
              strokeWidth="2.5"
              markerEnd="url(#arrow-blue)"
            />
            <text
              x={110}
              y={125}
              fontSize="11"
              fill="#2563EB"
              fontWeight="bold"
            >
              Incident
            </text>

            {/* REFLECTED RAY (bouncing to top-right, on the plane) */}
            <line
              x1={CX}
              y1={CY}
              x2={300}
              y2={130}
              stroke="#DC2626"
              strokeWidth="2.5"
              markerEnd="url(#arrow-red)"
            />
            <text
              x={305}
              y={125}
              fontSize="11"
              fill="#DC2626"
              fontWeight="bold"
            >
              Reflected
            </text>

            {/* SUCCESS MESSAGE */}
            <rect
              x={50}
              y={310}
              width={320}
              height={70}
              fill="#F0FDF4"
              stroke="#22C55E"
              strokeWidth="2"
              rx="6"
            />
            <text
              x={CX}
              y={335}
              fontSize="13"
              fontWeight="bold"
              fill="#16A34A"
              textAnchor="middle"
            >
              ✅ CORRECT!
            </text>
            <text
              x={CX}
              y={357}
              fontSize="12"
              fill="#166534"
              textAnchor="middle"
            >
              All three elements (incident ray, reflected ray, normal)
            </text>
            <text
              x={CX}
              y={375}
              fontSize="12"
              fill="#166534"
              textAnchor="middle"
            >
              are drawn on the SAME SHEET OF PAPER (plane)
            </text>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SCENARIO 1: WRONG - One ray pokes out of the plane */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {scenario === 1 && (
          <>
            {/* SHEET OF PAPER (the plane) */}
            <rect
              x={40}
              y={80}
              width={340}
              height={160}
              fill="#FFF"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <text
              x={55}
              y={95}
              fontSize="12"
              fontWeight="bold"
              fill="#6B7280"
            >
              Plane
            </text>

            {/* Shadow showing plane thickness */}
            <rect
              x={45}
              y={245}
              width={330}
              height={8}
              fill="#D1D5DB"
              opacity="0.3"
            />

            {/* MIRROR (on the plane) */}
            <line x1={80} y1={160} x2={340} y2={160} stroke="#000" strokeWidth="3" />

            {/* NORMAL (on the plane) */}
            <line x1={CX} y1={100} x2={CX} y2={160} stroke="#6B7280" strokeWidth="2" strokeDasharray="4,4" />

            {/* INCIDENT RAY (on the plane - CORRECT) */}
            <line
              x1={120}
              y1={130}
              x2={CX}
              y2={160}
              stroke="#2563EB"
              strokeWidth="2.5"
              markerEnd="url(#arrow-blue)"
            />
            <text x={100} y={125} fontSize="11" fill="#2563EB" fontWeight="bold">
              Incident ✓
            </text>

            {/* REFLECTED RAY (GOING OUT OF PLANE - WRONG!) */}
            <g>
              {/* Ray inside plane (faint) */}
              <line
                x1={CX}
                y1={160}
                x2={280}
                y2={130}
                stroke="#DC2626"
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.3"
              />

              {/* Ray POKING OUT above paper (bold) */}
              <line
                x1={CX}
                y1={160}
                x2={280}
                y2={50}
                stroke="#DC2626"
                strokeWidth="3"
                markerEnd="url(#arrow-red)"
              />
              <text x={290} y={45} fontSize="11" fill="#DC2626" fontWeight="bold">
                Reflected ✗
              </text>
            </g>

            {/* RED X over the ray sticking out */}
            <circle cx={200} cy={70} r={40} fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.6" />
            <line x1={160} y1={30} x2={240} y2={110} stroke="#DC2626" strokeWidth="3" opacity="0.6" />
            <line x1={240} y1={30} x2={160} y2={110} stroke="#DC2626" strokeWidth="3" opacity="0.6" />

            {/* ERROR MESSAGE */}
            <rect
              x={40}
              y={310}
              width={340}
              height={70}
              fill="#FEF2F2"
              stroke="#DC2626"
              strokeWidth="2"
              rx="6"
            />
            <text
              x={CX}
              y={335}
              fontSize="13"
              fontWeight="bold"
              fill="#991B1B"
              textAnchor="middle"
            >
              ❌ WRONG!
            </text>
            <text
              x={CX}
              y={357}
              fontSize="12"
              fill="#7F1D1D"
              textAnchor="middle"
            >
              The reflected ray is poking OUT of the plane!
            </text>
            <text
              x={CX}
              y={375}
              fontSize="12"
              fill="#7F1D1D"
              textAnchor="middle"
            >
              It must STAY ON the sheet of paper like the incident ray.
            </text>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* SCENARIO 2: WRONG - Normal is missing from the plane */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {scenario === 2 && (
          <>
            {/* SHEET OF PAPER (the plane) */}
            <rect
              x={40}
              y={80}
              width={340}
              height={160}
              fill="#FFF"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <text
              x={55}
              y={95}
              fontSize="12"
              fontWeight="bold"
              fill="#6B7280"
            >
              Plane
            </text>

            {/* MIRROR (on the plane) */}
            <line x1={80} y1={160} x2={340} y2={160} stroke="#000" strokeWidth="3" />

            {/* INCIDENT RAY (on the plane) */}
            <line
              x1={120}
              y1={130}
              x2={CX}
              y2={160}
              stroke="#2563EB"
              strokeWidth="2.5"
              markerEnd="url(#arrow-blue)"
            />
            <text x={100} y={125} fontSize="11" fill="#2563EB" fontWeight="bold">
              Incident
            </text>

            {/* REFLECTED RAY (on the plane) */}
            <line
              x1={CX}
              y1={160}
              x2={280}
              y2={130}
              stroke="#DC2626"
              strokeWidth="2.5"
              markerEnd="url(#arrow-red)"
            />
            <text x={290} y={125} fontSize="11" fill="#DC2626" fontWeight="bold">
              Reflected
            </text>

            {/* NORMAL - FLOATING OUTSIDE THE PLANE (WRONG!) */}
            <g opacity="0.6">
              <line x1={CX} y1={40} x2={CX} y2={70} stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4,4" />
              <circle cx={CX} cy={35} r={3} fill="#9CA3AF" />
              <text x={CX - 20} y={30} fontSize="11" fill="#9CA3AF" fontWeight="bold">
                Normal ✗
              </text>
            </g>

            {/* RED X over the floating normal */}
            <circle cx={CX} cy={50} r={25} fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.6" />
            <line x1={CX - 18} y1={32} x2={CX + 18} y2={68} stroke="#DC2626" strokeWidth="3" opacity="0.6" />
            <line x1={CX + 18} y1={32} x2={CX - 18} y2={68} stroke="#DC2626" strokeWidth="3" opacity="0.6" />

            {/* ERROR MESSAGE */}
            <rect
              x={40}
              y={310}
              width={340}
              height={70}
              fill="#FEF2F2"
              stroke="#DC2626"
              strokeWidth="2"
              rx="6"
            />
            <text
              x={CX}
              y={335}
              fontSize="13"
              fontWeight="bold"
              fill="#991B1B"
              textAnchor="middle"
            >
              ❌ WRONG!
            </text>
            <text
              x={CX}
              y={357}
              fontSize="12"
              fill="#7F1D1D"
              textAnchor="middle"
            >
              The NORMAL must be INSIDE the plane!
            </text>
            <text
              x={CX}
              y={375}
              fontSize="12"
              fill="#7F1D1D"
              textAnchor="middle"
            >
              The plane includes: mirror + normal + incident ray + reflected ray.
            </text>
          </>
        )}

        {/* ARROW MARKERS */}
        <defs>
          <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
          </marker>
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#DC2626" />
          </marker>
        </defs>
      </svg>

      {/* FINAL EXPLANATION */}
      <div style={{
        padding: "14px",
        backgroundColor: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: "6px",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#1E40AF"
      }}>
        <strong>💡 Remember:</strong>
        <p style={{ marginTop: "8px", marginBottom: "0" }}>
          Think of the plane like a <strong>sheet of paper lying on a table</strong>. 
          Everything (incident ray, reflected ray, mirror, normal) must be 
          <strong> drawn on that same sheet</strong>. If any part pokes up or 
          down off the paper, it violates the 2nd Law of Reflection!
        </p>
      </div>
    </div>
  );
};

export default SecondLawPlaneInteractive;