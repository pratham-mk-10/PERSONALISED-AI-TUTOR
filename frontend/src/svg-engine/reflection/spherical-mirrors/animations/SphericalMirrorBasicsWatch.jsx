import React, { useState } from "react";

const SVG_W = 800;
const SVG_H = 700;
const AXIS_Y = 300;

const concave = {
  center: { x: 515, y: 300 },
  radius: 120,
  pole: { x: 635, y: 300 },
  focus: { x: 575, y: 300 },
};

const convex = {
  center: { x: 285, y: 300 },
  radius: 120,
  pole: { x: 165, y: 300 },
  focus: { x: 225, y: 300 },
};

const concaveHits = [
  { x: 604, y: 220 },
  { x: 635, y: 300 },
  { x: 604, y: 380 },
];

const convexHits = [
  { x: 196, y: 220 },
  { x: 165, y: 300 },
  { x: 196, y: 380 },
];

const SphericalMirrorBasicsWatch = () => {
  const [step, setStep] = useState(0);
  const totalSteps = 7;

  const circlePath = (cx, cy, r) => `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
  const rightHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
  const leftHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;
  const concaveReflectingArc = rightHemisphere(concave.center.x, concave.center.y, concave.radius);
  const concaveBackArc = leftHemisphere(concave.center.x, concave.center.y, concave.radius);
  const convexReflectingArc = leftHemisphere(convex.center.x, convex.center.y, convex.radius);
  const convexBackArc = rightHemisphere(convex.center.x, convex.center.y, convex.radius);

  const arrowMarker = (
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#111827" />
      </marker>
      <marker id="distanceArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="#374151" />
      </marker>
    </defs>
  );

  const Axis = () => (
    <>
      <line x1="40" y1={AXIS_Y} x2="760" y2={AXIS_Y} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6,5" />
      <text x="765" y={AXIS_Y + 4} fontSize="11" fill="#6B7280">Principal axis</text>
    </>
  );

  const MirrorButton = ({ x, y, width, fill, text, onClick, disabled = false }) => (
    <g
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <rect x={x} y={y} width={width} height="40" rx="9" fill={fill} opacity={disabled ? 0.35 : 1} />
      <text x={x + width / 2} y={y + 26} fontSize="15" fontWeight="700" textAnchor="middle" fill={disabled ? "#9CA3AF" : "white"}>
        {text}
      </text>
    </g>
  );

  const NavBar = () => (
    <g>
      <MirrorButton
        x={40}
        y={620}
        width={130}
        fill="#6B7280"
        text="← Back"
        disabled={step === 0}
        onClick={() => setStep((value) => Math.max(0, value - 1))}
      />
      <text x="400" y="646" fontSize="14" fill="#6B7280" textAnchor="middle">Step {step} of {totalSteps}</text>
      <MirrorButton
        x={630}
        y={620}
        width={130}
        fill="#2563EB"
        text={step === totalSteps ? "Done" : "Next →"}
        disabled={step === totalSteps}
        onClick={() => setStep((value) => Math.min(totalSteps, value + 1))}
      />
    </g>
  );

  const SymbolLegend = ({ x = 40, y = 92, width = 320, items }) => {
    const rowH = 20;
    const height = 42 + items.length * rowH;

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx="10" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.2" opacity="0.96" />
        <text x={x + 12} y={y + 22} fontSize="12.5" fontWeight="700" fill="#111827">Legend</text>
        {items.map((item, idx) => {
          const rowY = y + 38 + idx * rowH;

          if (item.type === "line") {
            return (
              <g key={`${item.text}-${idx}`}>
                <line
                  x1={x + 10}
                  y1={rowY - 5}
                  x2={x + 28}
                  y2={rowY - 5}
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={item.dash || undefined}
                />
                <text x={x + 36} y={rowY - 1} fontSize="11.5" fill="#1F2937">{item.text}</text>
              </g>
            );
          }

          return (
            <g key={`${item.text}-${idx}`}>
              <circle cx={x + 19} cy={rowY - 5} r="4" fill={item.color} />
              <text x={x + 36} y={rowY - 1} fontSize="11.5" fill="#1F2937">{item.text}</text>
            </g>
          );
        })}
      </g>
    );
  };

  const MirrorPolishTicks = ({ cx, cy, r, side, inward = false }) => {
    const ys = [-102, -84, -66, -48, -30, -12, 12, 30, 48, 66, 84, 102];
    const dir = side === "right" ? 1 : -1;
    const tickDir = inward ? -dir : dir;

    return (
      <g stroke="#111827" strokeWidth="2" strokeLinecap="round">
        {ys.map((dy, idx) => {
          const edgeX = cx + dir * Math.sqrt(Math.max(0, r * r - dy * dy));
          const x1 = edgeX + tickDir * 2;
          const x2 = edgeX + tickDir * 8;
          const y1 = cy + dy - 3;
          const y2 = cy + dy + 3;
          return <line key={`${side}-tick-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    );
  };

  const Title = () => (
    <>
      <text x={400} y={102} fontSize={44} fontWeight="800" textAnchor="middle" fill="#111827">Spherical Mirror Basics</text>
      <text x={400} y={156} fontSize="19" textAnchor="middle" fill="#6B7280">Class 10 NCERT: concave and convex mirrors</text>
      <rect x="90" y="220" width="620" height="330" rx="16" fill="#ECFDF3" stroke="#86EFAC" strokeWidth="2" />
      <text x="400" y="260" fontSize="18" textAnchor="middle" fill="#166534" fontWeight="700">NCERT definitions (quick view)</text>
      <text x="110" y="292" fontSize="12.5" fill="#166534">• Spherical mirror: reflecting surface is part of a hollow sphere.</text>
      <text x="110" y="318" fontSize="12.5" fill="#166534">• Concave mirror: reflecting surface curves inward.</text>
      <text x="110" y="344" fontSize="12.5" fill="#166534">• Convex mirror: reflecting surface curves outward.</text>
      <text x="110" y="370" fontSize="12.5" fill="#166534">• Principal axis: line passing through P and C.</text>
      <text x="110" y="396" fontSize="12.5" fill="#166534">• Pole (P): midpoint of mirror surface where principal axis meets mirror.</text>
      <text x="110" y="422" fontSize="12.5" fill="#166534">• Centre of curvature (C): centre of the sphere of which mirror is a part.</text>
      <text x="110" y="448" fontSize="12.5" fill="#166534">• Radius of curvature (R): distance PC.</text>
      <text x="110" y="474" fontSize="12.5" fill="#166534">• Principal focus (F): where parallel rays converge (concave) or appear from (convex).</text>
      <text x="110" y="500" fontSize="12.5" fill="#166534">• Focal length (f): distance PF, and relation R = 2f.</text>
      <MirrorButton x={628} y={620} width={128} fill="#2563EB" text="Start →" onClick={() => setStep(1)} />
    </>
  );

  const ConcaveShape = () => (
    <>
      <text x="40" y="42" fontSize="24" fontWeight="700" fill="#111827">Concave mirror</text>
      <text x="40" y="70" fontSize="14" fill="#374151">The reflecting surface curves inward. The solid arc is the reflecting side; the dotted arc is the back of the glass.</text>
      <Axis />
      <circle cx={concave.center.x} cy={concave.center.y} r={concave.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
      <path d={concaveReflectingArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <MirrorPolishTicks cx={concave.center.x} cy={concave.center.y} r={concave.radius} side="right" />
      <circle cx={concave.pole.x} cy={concave.pole.y} r="5" fill="#DC2626" />
      <text x={concave.pole.x - 22} y={concave.pole.y - 14} fontSize="13" fontWeight="700" fill="#DC2626">P</text>
      <text x="468" y="132" fontSize="12" fill="#2563EB" fontWeight="700">Reflecting side</text>
      <text x="470" y="192" fontSize="12" fill="#6B7280">Back surface</text>
      <rect x="48" y="430" width="340" height="118" rx="12" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
      <text x="68" y="460" fontSize="13" fontWeight="700" fill="#1E40AF">Key facts</text>
      <text x="68" y="485" fontSize="12" fill="#1E40AF">• Pole lies on the mirror surface</text>
      <text x="68" y="508" fontSize="12" fill="#1E40AF">• Concave mirrors can converge parallel rays</text>
      <SymbolLegend
        items={[
          { color: "#DC2626", text: "P = Pole (midpoint of mirror surface)" },
          { type: "line", color: "#2563EB", text: "Solid blue arc = Reflecting surface" },
          { type: "line", color: "#111827", text: "Black ticks = Polished blue surface" },
          { type: "line", color: "#9CA3AF", dash: "6,5", text: "Principal axis (reference line)" },
        ]}
      />
      <NavBar />
    </>
  );

  const ConcavePoints = () => (
    <>
      <text x="40" y="42" fontSize="24" fontWeight="700" fill="#111827">Pole, focus and centre of curvature</text>
      <Axis />
      <circle cx={concave.center.x} cy={concave.center.y} r={concave.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
      <path d={concaveReflectingArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <MirrorPolishTicks cx={concave.center.x} cy={concave.center.y} r={concave.radius} side="right" />

      <circle cx={concave.pole.x} cy={concave.pole.y} r="5" fill="#DC2626" />
      <circle cx={concave.focus.x} cy={concave.focus.y} r="5" fill="#16A34A" />
      <circle cx={concave.center.x} cy={concave.center.y} r="5" fill="#7C3AED" />
      <text x={concave.pole.x - 18} y={concave.pole.y - 14} fontSize="13" fontWeight="700" fill="#DC2626">P</text>
      <text x={concave.focus.x - 8} y={concave.focus.y + 24} fontSize="13" fontWeight="700" fill="#16A34A">F</text>
      <text x={concave.center.x - 14} y={concave.center.y + 24} fontSize="13" fontWeight="700" fill="#7C3AED">C</text>

      <line
        x1={concave.focus.x}
        y1="462"
        x2={concave.pole.x}
        y2="462"
        stroke="#16A34A"
        strokeWidth="2"
        markerStart="url(#distanceArrow)"
        markerEnd="url(#distanceArrow)"
      />
      <line
        x1={concave.center.x}
        y1="486"
        x2={concave.pole.x}
        y2="486"
        stroke="#7C3AED"
        strokeWidth="2"
        markerStart="url(#distanceArrow)"
        markerEnd="url(#distanceArrow)"
      />
      <text x="560" y="456" fontSize="12" fontWeight="700" fill="#16A34A">f = PF</text>
      <text x="560" y="480" fontSize="12" fontWeight="700" fill="#7C3AED">R = PC</text>
      <text x="40" y="532" fontSize="13" fill="#374151">For a concave mirror, C and F are in front of the mirror and F lies midway between P and C.</text>
      <text x="40" y="556" fontSize="13" fill="#374151">Hence, radius of curvature and focal length satisfy: R = 2f.</text>

      <SymbolLegend
        items={[
          { color: "#DC2626", text: "P = Pole" },
          { color: "#7C3AED", text: "C = Centre of curvature" },
          { color: "#16A34A", text: "F = Principal focus" },
          { type: "line", color: "#7C3AED", text: "R = PC (radius of curvature)" },
          { type: "line", color: "#16A34A", text: "f = PF (focal length)" },
        ]}
      />

      <NavBar />
    </>
  );

  const ConcaveRays = () => (
    <>
      <text x="40" y="42" fontSize="24" fontWeight="700" fill="#111827">Concave mirror: parallel rays converge after reflection</text>
      <Axis />
      <circle cx={concave.center.x} cy={concave.center.y} r={concave.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
      <path d={concaveReflectingArc} fill="none" stroke="#2563EB" strokeWidth="6" />
      <MirrorPolishTicks cx={concave.center.x} cy={concave.center.y} r={concave.radius} side="right" />
      <circle cx={concave.pole.x} cy={concave.pole.y} r="5" fill="#DC2626" />
      <circle cx={concave.focus.x} cy={concave.focus.y} r="5" fill="#16A34A" />
      <text x={concave.focus.x - 6} y={concave.focus.y - 14} fontSize="13" fontWeight="700" fill="#16A34A">F</text>

      <line x1="60" y1={concaveHits[0].y} x2={concaveHits[0].x - 2} y2={concaveHits[0].y} stroke="#F59E0B" strokeWidth="2.3" markerEnd="url(#arrow)" />
      <line x1="60" y1={concaveHits[1].y} x2={concaveHits[1].x - 2} y2={concaveHits[1].y} stroke="#F59E0B" strokeWidth="2.3" markerEnd="url(#arrow)" />
      <line x1="60" y1={concaveHits[2].y} x2={concaveHits[2].x - 2} y2={concaveHits[2].y} stroke="#F59E0B" strokeWidth="2.3" markerEnd="url(#arrow)" />

      <line x1={concaveHits[0].x} y1={concaveHits[0].y} x2={concave.focus.x} y2={concave.focus.y} stroke="#EF4444" strokeWidth="2.4" markerEnd="url(#arrow)" />
      <line x1={concaveHits[1].x} y1={concaveHits[1].y} x2={concave.focus.x} y2={concave.focus.y} stroke="#EF4444" strokeWidth="2.4" markerEnd="url(#arrow)" />
      <line x1={concaveHits[2].x} y1={concaveHits[2].y} x2={concave.focus.x} y2={concave.focus.y} stroke="#EF4444" strokeWidth="2.4" markerEnd="url(#arrow)" />

      <line x1={concaveHits[0].x} y1={concaveHits[0].y} x2="560" y2={concaveHits[0].y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" />
      <line x1={concaveHits[1].x} y1={concaveHits[1].y} x2="560" y2={concaveHits[1].y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" />
      <line x1={concaveHits[2].x} y1={concaveHits[2].y} x2="560" y2={concaveHits[2].y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" />

      <rect x="48" y="430" width="704" height="120" rx="12" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
      <text x="70" y="460" fontSize="13" fontWeight="700" fill="#1E40AF">Law of reflection</text>
      <text x="70" y="485" fontSize="12" fill="#1E40AF">• Angle of incidence equals angle of reflection</text>
      <text x="70" y="508" fontSize="12" fill="#1E40AF">• The reflected rays meet at the real focus F</text>
      <text x="70" y="531" fontSize="12" fill="#1E40AF">• The pole is the point where the principal axis meets the mirror</text>
      <SymbolLegend
        items={[
          { color: "#DC2626", text: "P = Pole" },
          { color: "#16A34A", text: "F = Principal focus" },
          { type: "line", color: "#F59E0B", text: "Orange rays = Incident rays" },
          { type: "line", color: "#EF4444", text: "Red rays = Reflected rays" },
          { type: "line", color: "#94A3B8", dash: "5,5", text: "Gray dotted = Reference extension" },
        ]}
      />
      <NavBar />
    </>
  );

  const ConvexShape = () => (
    <>
      <text x="40" y="42" fontSize="24" fontWeight="700" fill="#111827">Convex mirror</text>
      <text x="40" y="70" fontSize="14" fill="#374151">The reflecting surface bulges outward. The pole still lies on the curve.</text>
      <Axis />
      <circle cx={convex.center.x} cy={convex.center.y} r={convex.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
      <path d={convexReflectingArc} fill="none" stroke="#16A34A" strokeWidth="6" />
      <MirrorPolishTicks cx={convex.center.x} cy={convex.center.y} r={convex.radius} side="left" inward />
      <circle cx={convex.pole.x} cy={convex.pole.y} r="5" fill="#DC2626" />
      <text x={convex.pole.x - 16} y={convex.pole.y - 14} fontSize="13" fontWeight="700" fill="#DC2626">P</text>
      <text x="214" y="132" fontSize="12" fill="#16A34A" fontWeight="700">Reflecting side</text>
      <text x="272" y="192" fontSize="12" fill="#6B7280">Back surface</text>
      <rect x="410" y="430" width="290" height="118" rx="12" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2" />
      <text x="430" y="460" fontSize="13" fontWeight="700" fill="#15803D">Key facts</text>
      <text x="430" y="485" fontSize="12" fill="#15803D">• Rays diverge after reflection</text>
      <text x="430" y="508" fontSize="12" fill="#15803D">• Focus and centre are virtual</text>
      <SymbolLegend x={448} y={88} width={310}
        items={[
          { color: "#DC2626", text: "P = Pole (midpoint of mirror surface)" },
          { type: "line", color: "#16A34A", text: "Solid green arc = Reflecting surface" },
          { type: "line", color: "#111827", text: "Black ticks = Polished blue surface" },
          { type: "line", color: "#9CA3AF", dash: "6,5", text: "Principal axis (reference line)" },
        ]}
      />
      <NavBar />
    </>
  );

  const ConvexPoints = () => (
    <>
      <text x="40" y="42" fontSize="24" fontWeight="700" fill="#111827">Convex mirror: pole, centre and virtual focus</text>
      <Axis />
      <circle cx={convex.center.x} cy={convex.center.y} r={convex.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
      <path d={convexReflectingArc} fill="none" stroke="#16A34A" strokeWidth="6" />
      <MirrorPolishTicks cx={convex.center.x} cy={convex.center.y} r={convex.radius} side="left" inward />
      <circle cx={convex.center.x} cy={convex.center.y} r="5" fill="#7C3AED" />
      <circle cx={convex.focus.x} cy={convex.focus.y} r="5" fill="#16A34A" />
      <circle cx={convex.pole.x} cy={convex.pole.y} r="5" fill="#DC2626" />
      <text x={convex.pole.x - 16} y={convex.pole.y - 14} fontSize="13" fontWeight="700" fill="#DC2626">P</text>
      <text x={convex.center.x - 14} y={convex.center.y + 24} fontSize="13" fontWeight="700" fill="#7C3AED">C</text>
      <text x={convex.focus.x - 6} y={convex.focus.y + 24} fontSize="13" fontWeight="700" fill="#16A34A">F</text>
      <text x="360" y="132" fontSize="12" fill="#374151">C and F lie behind the mirror for a convex mirror.</text>
      <line
        x1={convex.pole.x}
        y1="468"
        x2={convex.focus.x}
        y2="468"
        stroke="#16A34A"
        strokeWidth="2"
        markerStart="url(#distanceArrow)"
        markerEnd="url(#distanceArrow)"
      />
      <line
        x1={convex.pole.x}
        y1="490"
        x2={convex.center.x}
        y2="490"
        stroke="#7C3AED"
        strokeWidth="2"
        markerStart="url(#distanceArrow)"
        markerEnd="url(#distanceArrow)"
      />
      <text x="182" y="462" fontSize="12" fontWeight="700" fill="#16A34A">f</text>
      <text x="182" y="484" fontSize="12" fontWeight="700" fill="#7C3AED">R</text>
      <text x="220" y="462" fontSize="12" fill="#16A34A">= PF (virtual)</text>
      <text x="220" y="484" fontSize="12" fill="#7C3AED">= PC (virtual)</text>
      <text x="40" y="532" fontSize="13" fill="#374151">For convex mirrors, P is on the mirror while C and F are behind the mirror (virtual).</text>
      <text x="40" y="556" fontSize="13" fill="#374151">The same relation holds geometrically: R = 2f.</text>
      <SymbolLegend x={448} y={88} width={310}
        items={[
          { color: "#DC2626", text: "P = Pole" },
          { color: "#7C3AED", text: "C = Centre of curvature (virtual)" },
          { color: "#16A34A", text: "F = Principal focus (virtual)" },
          { type: "line", color: "#7C3AED", text: "R = PC (radius of curvature)" },
          { type: "line", color: "#16A34A", text: "f = PF (focal length)" },
        ]}
      />
      <NavBar />
    </>
  );

  const ConvexRays = () => (
    <>
      <text x="40" y="42" fontSize="24" fontWeight="700" fill="#111827">Convex mirror: reflected rays diverge</text>
      <Axis />
      <circle cx={convex.center.x} cy={convex.center.y} r={convex.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
      <path d={convexReflectingArc} fill="none" stroke="#16A34A" strokeWidth="6" />
      <MirrorPolishTicks cx={convex.center.x} cy={convex.center.y} r={convex.radius} side="left" inward />
      <circle cx={convex.pole.x} cy={convex.pole.y} r="5" fill="#DC2626" />
      <circle cx={convex.focus.x} cy={convex.focus.y} r="5" fill="#16A34A" />
      <text x={convex.focus.x - 6} y={convex.focus.y - 14} fontSize="13" fontWeight="700" fill="#16A34A">F</text>

      <line x1="60" y1={convexHits[0].y} x2={convexHits[0].x - 2} y2={convexHits[0].y} stroke="#F59E0B" strokeWidth="2.3" markerEnd="url(#arrow)" />
      <line x1="60" y1={convexHits[1].y} x2={convexHits[1].x - 2} y2={convexHits[1].y} stroke="#F59E0B" strokeWidth="2.3" markerEnd="url(#arrow)" />
      <line x1="60" y1={convexHits[2].y} x2={convexHits[2].x - 2} y2={convexHits[2].y} stroke="#F59E0B" strokeWidth="2.3" markerEnd="url(#arrow)" />

      <line x1={convexHits[0].x} y1={convexHits[0].y} x2="90" y2="150" stroke="#EF4444" strokeWidth="2.4" markerEnd="url(#arrow)" />
      <line x1={convexHits[1].x} y1={convexHits[1].y} x2="80" y2="300" stroke="#EF4444" strokeWidth="2.4" markerEnd="url(#arrow)" />
      <line x1={convexHits[2].x} y1={convexHits[2].y} x2="90" y2="450" stroke="#EF4444" strokeWidth="2.4" markerEnd="url(#arrow)" />

      <line x1={convexHits[0].x} y1={convexHits[0].y} x2={convex.focus.x} y2={convex.focus.y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" />
      <line x1={convexHits[1].x} y1={convexHits[1].y} x2={convex.focus.x} y2={convex.focus.y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" />
      <line x1={convexHits[2].x} y1={convexHits[2].y} x2={convex.focus.x} y2={convex.focus.y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,5" />

      <rect x="48" y="430" width="704" height="120" rx="12" fill="#ECFDF3" stroke="#BBF7D0" strokeWidth="2" />
      <text x="70" y="460" fontSize="13" fontWeight="700" fill="#166534">What happens</text>
      <text x="70" y="485" fontSize="12" fill="#166534">• Rays hit the mirror first, then reflect and diverge</text>
      <text x="70" y="508" fontSize="12" fill="#166534">• Their backward extensions meet at the virtual focus F</text>
      <text x="70" y="531" fontSize="12" fill="#166534">• No real convergence occurs in front of a convex mirror</text>
      <SymbolLegend x={448} y={88} width={310}
        items={[
          { color: "#DC2626", text: "P = Pole" },
          { color: "#16A34A", text: "F = Virtual focus" },
          { type: "line", color: "#F59E0B", text: "Orange rays = Incident rays" },
          { type: "line", color: "#EF4444", text: "Red rays = Reflected rays (diverging)" },
          { type: "line", color: "#94A3B8", dash: "5,5", text: "Gray dotted = Backward extension" },
        ]}
      />
      <NavBar />
    </>
  );

  const Summary = () => (
    <>
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#F0FDF4" />
      <text x="400" y="78" fontSize="32" fontWeight="800" textAnchor="middle" fill="#15803D">Spherical Mirror Basics Complete</text>
      <rect x="80" y="130" width="640" height="380" rx="16" fill="white" stroke="#86EFAC" strokeWidth="3" />
      <text x="120" y="172" fontSize="16" fontWeight="700" fill="#166534">The correct rules are:</text>
      <text x="120" y="210" fontSize="13" fill="#374151">1. Pole P is on the mirror surface, not floating away from it.</text>
      <text x="120" y="242" fontSize="13" fill="#374151">2. Concave mirrors have the reflecting side on the inner curved surface.</text>
      <text x="120" y="274" fontSize="13" fill="#374151">3. Convex mirrors have the reflecting side on the outer curved surface.</text>
      <text x="120" y="306" fontSize="13" fill="#374151">4. For concave mirrors, C and F are in front of the mirror.</text>
      <text x="120" y="338" fontSize="13" fill="#374151">5. For convex mirrors, C and F are behind the mirror and virtual.</text>
      <text x="120" y="370" fontSize="13" fill="#374151">6. Parallel rays hit first, then reflect; they never converge before the mirror.</text>
      <text x="120" y="402" fontSize="13" fill="#374151">7. The dotted part is only the non-reflecting back surface.</text>
      <text x="120" y="448" fontSize="14" fontWeight="700" fill="#15803D">Key relation: R = 2f</text>
      <rect x="470" y="430" width="220" height="96" rx="10" fill="#F8FAFF" stroke="#D1D5DB" strokeWidth="1.2" />
      <text x="484" y="452" fontSize="12.5" fontWeight="700" fill="#111827">Symbol recap</text>
      <text x="484" y="472" fontSize="11.5" fill="#1F2937">P = Pole</text>
      <text x="484" y="488" fontSize="11.5" fill="#1F2937">C = Centre of curvature</text>
      <text x="484" y="504" fontSize="11.5" fill="#1F2937">F = Principal focus</text>
      <text x="484" y="520" fontSize="11.5" fill="#1F2937">f = PF, R = PC, and R = 2f</text>
      <MirrorButton x={40} y={620} width={140} fill="#16A34A" text="← Restart" onClick={() => setStep(0)} />
    </>
  );

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block", background: "#F8FAFF" }}>
      {arrowMarker}
      {step === 0 && <Title />}
      {step === 1 && <ConcaveShape />}
      {step === 2 && <ConcavePoints />}
      {step === 3 && <ConcaveRays />}
      {step === 4 && <ConvexShape />}
      {step === 5 && <ConvexPoints />}
      {step === 6 && <ConvexRays />}
      {step === 7 && <Summary />}
    </svg>
  );
};

export default SphericalMirrorBasicsWatch;
