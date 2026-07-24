import React, { useEffect, useMemo, useRef, useState } from "react";
import AnimationPlayer from "../../../shared/AnimationPlayer";
import { clamp, lerp } from "../../../shared/PhysicsEngine";
import { Label } from "../../../shared/SVGUtils";

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

const STEP_AUDIO_FILES = {
  1: "/audio/spherical mirror 1.wav",
  2: "/audio/spherical mirror 2.wav",
  3: "/audio/spherical mirror 3.wav",
  4: "/audio/spherical mirror 4.wav",
  5: "/audio/spherical mirror 5.wav",
  6: "/audio/spherical mirror 6.wav",
  7: "/audio/spherical mirror 7.wav",
  8: "/audio/spherical mirror 8.wav",
};

const STEP_ORDER = [1, 2, 3, 4, 5, 6, 7, 8];

const DEFAULT_STEP_DURATIONS_MS = {
  1: 11000,
  2: 9200,
  3: 9200,
  4: 9200,
  5: 9200,
  6: 11000,
  7: 11000,
  8: 11000,
};

const SUMMARY_DURATION_MS = 11000;
const AUDIO_END_PADDING_MS = 450;

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const normalizeBetween = (value, start, end) => {
  if (end <= start) return 0;
  return clamp((value - start) / (end - start), 0, 1);
};

const rightHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
const leftHemisphere = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;

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
        return <line key={`tick-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
  );
};

const Axis = () => (
  <>
    <line x1="40" y1={AXIS_Y} x2="760" y2={AXIS_Y} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6,5" />
    <text x="765" y={AXIS_Y + 4} fontSize="11" fill="#6B7280">Principal axis</text>
  </>
);

const DefinitionCard = ({ title, lines, tone = "blue" }) => {
  const palette =
    tone === "green"
      ? { fill: "#ECFDF3", stroke: "#BBF7D0", title: "#166534", text: "#166534" }
      : { fill: "#EFF6FF", stroke: "#BFDBFE", title: "#1E40AF", text: "#1E3A8A" };

  return (
    <g>
      <rect x="48" y="430" width="704" height="120" rx="12" fill={palette.fill} stroke={palette.stroke} strokeWidth="2" />
      <text x="70" y="458" fontSize="13" fontWeight="700" fill={palette.title}>{title}</text>
      {lines.map((line, idx) => (
        <text key={`${title}-${idx}`} x="70" y={484 + idx * 23} fontSize="12" fill={palette.text}>
          • {line}
        </text>
      ))}
    </g>
  );
};

const SymbolLegend = ({ x, y, width, items }) => {
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

export const SPHERICAL_MIRROR_TTS_SCRIPT = [
  {
    step: 1,
    title: "Definition: Spherical Mirror",
    text: [
      "A spherical mirror is a mirror whose reflecting surface forms part of a hollow sphere.",
      "The circular guide shows the parent sphere from which the mirror section is obtained.",
      "The highlighted arc is the actual mirror surface used for reflection.",
    ],
  },
  {
    step: 2,
    title: "Definition: Concave Mirror",
    text: [
      "A concave mirror is a spherical mirror whose reflecting surface is curved inward.",
      "The reflecting side faces the centre of curvature side of the mirror section.",
      "Such a mirror can bring a parallel beam to a real focus after reflection.",
    ],
  },
  {
    step: 3,
    title: "Definition: Pole (P)",
    text: [
      "Pole is the geometric centre point of the mirror's reflecting surface.",
      "The principal axis intersects the mirror exactly at the pole P.",
      "All axial distance measurements are referenced from this point.",
    ],
  },
  {
    step: 4,
    title: "Definition: Centre of Curvature (C)",
    text: [
      "Centre of curvature is the centre of the sphere of which the mirror is a part.",
      "For a concave mirror, C lies in front of the mirror on the principal axis.",
      "Distance PC is called radius of curvature R.",
    ],
  },
  {
    step: 5,
    title: "Definition: Principal Focus (F), Principal Axis, f and R = 2f",
    text: [
      "Principal focus is the point where reflected parallel rays actually meet.",
      "The principal axis of a spherical mirror is the straight line passing through pole P and centre of curvature C.",
      "Focal length is f = PF and radius of curvature is R = PC.",
      "For spherical mirrors, focus lies midway between P and C, so R = 2f.",
    ],
  },
  {
    step: 6,
    title: "Concept Highlight: Concave Reflection Sequence",
    text: [
      "Incident rays first travel to the mirror surface.",
      "After impact, reflected rays move toward the principal focus F.",
      "This is real convergence, so concave mirrors are converging mirrors.",
    ],
  },
  {
    step: 7,
    title: "Definition: Convex Mirror",
    text: [
      "A convex mirror is a spherical mirror whose reflecting surface bulges outward.",
      "Its reflecting side faces away from the centre of the parent sphere.",
      "It produces divergence of reflected rays for a parallel incident beam.",
    ],
  },
  {
    step: 8,
    title: "Definition: Virtual C and F for Convex",
    text: [
      "For a convex mirror, both C and F are located behind the mirror.",
      "They are virtual points, obtained from backward extension of reflected rays.",
      "Geometrically the same relation holds: R = PC, f = PF, and R = 2f.",
    ],
  },
  {
    step: 11,
    title: "Spherical Mirror Detailed Summary",
    text: [
      "Pole P is always on mirror surface.",
      "Concave mirror converges parallel rays to real focus F.",
      "Convex mirror reflects rays diverging; extensions meet at virtual F.",
      "C and F are in front for concave, behind for convex.",
      "Radius and focal length relation remains R = 2f.",
      "Visualization follows the same definition-first teaching style as law modules.",
      "You can replay to rewatch each definition with its matching ray behavior.",
    ],
  },
];

const SphericalMirrorDetailedAnimation = ({ onTryItClicked }) => {
  const audioRef = useRef(null);
  const lastStepRef = useRef(null);
  const [stepDurationsMs, setStepDurationsMs] = useState(DEFAULT_STEP_DURATIONS_MS);

  useEffect(() => {
    let cancelled = false;

    const loadDuration = (step, src) =>
      new Promise((resolve) => {
        const audio = new Audio(src);
        audio.preload = "metadata";

        const done = (ms) => resolve([step, ms]);

        audio.onloadedmetadata = () => {
          const ms = Number.isFinite(audio.duration) ? Math.max(1000, Math.round(audio.duration * 1000)) : DEFAULT_STEP_DURATIONS_MS[step];
          done(ms + AUDIO_END_PADDING_MS);
        };

        audio.onerror = () => done(DEFAULT_STEP_DURATIONS_MS[step] + AUDIO_END_PADDING_MS);
      });

    Promise.all(STEP_ORDER.map((step) => loadDuration(step, STEP_AUDIO_FILES[step]))).then((results) => {
      if (cancelled) return;
      const nextDurations = { ...DEFAULT_STEP_DURATIONS_MS };
      results.forEach(([step, ms]) => {
        nextDurations[step] = ms;
      });
      setStepDurationsMs(nextDurations);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalDurationMs = useMemo(() => {
    const audioTotal = STEP_ORDER.reduce((acc, step) => acc + (stepDurationsMs[step] || 0), 0);
    return audioTotal + SUMMARY_DURATION_MS;
  }, [stepDurationsMs]);

  const stepRanges = useMemo(() => {
    const orderedSteps = [...STEP_ORDER, 11];
    const durationByStep = { ...stepDurationsMs, 11: SUMMARY_DURATION_MS };
    let elapsed = 0;
    const ranges = {};

    orderedSteps.forEach((step) => {
      const stepDuration = durationByStep[step];
      const start = elapsed / totalDurationMs;
      elapsed += stepDuration;
      const end = elapsed / totalDurationMs;
      ranges[step] = { start, end };
    });

    return ranges;
  }, [stepDurationsMs, totalDurationMs]);

  const playStepAudio = (step) => {
    if (step === lastStepRef.current) return;
    lastStepRef.current = step;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audioFile = STEP_AUDIO_FILES[step];
    if (!audioFile) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio(audioFile);
    audioRef.current = audio;
    audio.play().catch(() => { });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      lastStepRef.current = null;
    };
  }, []);

  return (
    <AnimationPlayer
      duration={totalDurationMs}
      title="Watch: Spherical Mirror Basics (Detailed Dynamic)"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
    >
      {({ progress, playing, hasStarted }) => {
        let step = 11;
        for (const candidateStep of STEP_ORDER) {
          if (progress < stepRanges[candidateStep].end) {
            step = candidateStep;
            break;
          }
        }

        if (hasStarted) {
          playStepAudio(step);
          if (!playing && audioRef.current) {
            audioRef.current.pause();
          }
        }

        const concaveReflectingArc = rightHemisphere(concave.center.x, concave.center.y, concave.radius);
        const convexReflectingArc = leftHemisphere(convex.center.x, convex.center.y, convex.radius);

        const concaveAppear = normalizeBetween(progress, stepRanges[2].start, stepRanges[3].start);
        const concavePointsAppear = normalizeBetween(progress, stepRanges[4].start, stepRanges[6].start);
        const concaveRayPhase = normalizeBetween(progress, stepRanges[6].start, stepRanges[7].start);
        const concaveIncPhase = clamp(concaveRayPhase * 2, 0, 1);
        const concaveRefPhase = clamp((concaveRayPhase - 0.5) * 2, 0, 1);

        const convexAppear = normalizeBetween(progress, stepRanges[7].start, stepRanges[8].start);
        const convexPointsAppear = normalizeBetween(progress, stepRanges[8].start, stepRanges[11].start);
        const convexRayPhase = normalizeBetween(progress, stepRanges[8].start, stepRanges[11].start);
        const convexIncPhase = clamp(convexRayPhase * 2, 0, 1);
        const convexRefPhase = clamp((convexRayPhase - 0.5) * 2, 0, 1);
        const summaryAppear = normalizeBetween(progress, stepRanges[11].start, stepRanges[11].end);

        return (
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block", background: "#F8FAFF" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            <defs>
              <marker id="sph-inc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
              <marker id="sph-ref" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
              <marker id="sph-dist" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="#374151" />
              </marker>
            </defs>

            <Label x={400} y={46} text="Spherical Mirror: Definition-to-Visual Walkthrough" color="#111827" size={24} bold />

            {step === 1 && (
              <>
                <Axis />
                <circle cx={concave.center.x} cy={concave.center.y} r={concave.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" opacity="0.95" />
                <path d={concaveReflectingArc} fill="none" stroke="#2563EB" strokeWidth="6" opacity="0.95" />
                <DefinitionCard
                  title="Definition: Spherical Mirror"
                  lines={[
                    "A spherical mirror is a mirror whose reflecting surface forms part of a hollow sphere.",
                    "The circular guide shows the parent sphere from which the mirror section is obtained.",
                    "The highlighted arc is the actual mirror surface used for reflection.",
                  ]}
                />
              </>
            )}

            {(step >= 2 && step <= 6) && (
              <g>
                <Axis />
                <circle cx={concave.center.x} cy={concave.center.y} r={concave.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" opacity={concaveAppear} />
                <path d={concaveReflectingArc} fill="none" stroke="#2563EB" strokeWidth="6" opacity={concaveAppear} />
                <MirrorPolishTicks cx={concave.center.x} cy={concave.center.y} r={concave.radius} side="right" />
                {step >= 3 && (
                  <>
                    <circle cx={concave.pole.x} cy={concave.pole.y} r="5" fill="#DC2626" opacity={concaveAppear} />
                    <text x={concave.pole.x - 18} y={concave.pole.y - 14} fontSize="13" fontWeight="700" fill="#DC2626">P</text>
                  </>
                )}

                {step >= 4 && (
                  <g opacity={concavePointsAppear}>
                    {step >= 4 && (
                      <>
                        <circle cx={concave.center.x} cy={concave.center.y} r="5" fill="#7C3AED" />
                        <text x={concave.center.x - 14} y={concave.center.y + 24} fontSize="13" fontWeight="700" fill="#7C3AED">C</text>
                      </>
                    )}
                    {step >= 5 && (
                      <>
                        <circle cx={concave.focus.x} cy={concave.focus.y} r="5" fill="#16A34A" />
                        <text x={concave.focus.x - 8} y={concave.focus.y + 24} fontSize="13" fontWeight="700" fill="#16A34A">F</text>

                        <line
                          x1={concave.focus.x}
                          y1="468"
                          x2={concave.pole.x}
                          y2="468"
                          stroke="#16A34A"
                          strokeWidth="2"
                          markerStart="url(#sph-dist)"
                          markerEnd="url(#sph-dist)"
                        />
                        <line
                          x1={concave.center.x}
                          y1="490"
                          x2={concave.pole.x}
                          y2="490"
                          stroke="#7C3AED"
                          strokeWidth="2"
                          markerStart="url(#sph-dist)"
                          markerEnd="url(#sph-dist)"
                        />
                        <text x="560" y="462" fontSize="12" fontWeight="700" fill="#16A34A">f = PF</text>
                        <text x="560" y="484" fontSize="12" fontWeight="700" fill="#7C3AED">R = PC</text>
                      </>
                    )}
                  </g>
                )}

                {step >= 6 && (
                  <g>
                    {concaveHits.map((hit, idx) => {
                      const yStart = hit.y;
                      const inc = lerp(60, yStart, hit.x - 2, yStart, concaveIncPhase);
                      return (
                        <line
                          key={`conc-inc-${idx}`}
                          x1={60}
                          y1={yStart}
                          x2={inc.x}
                          y2={inc.y}
                          stroke="#F59E0B"
                          strokeWidth="2.4"
                          markerEnd="url(#sph-inc)"
                        />
                      );
                    })}
                  </g>
                )}

                {step >= 6 && (
                  <g>
                    {concaveHits.map((hit, idx) => {
                      const ref = lerp(hit.x, hit.y, concave.focus.x, concave.focus.y, concaveRefPhase);
                      return (
                        <line
                          key={`conc-ref-${idx}`}
                          x1={hit.x}
                          y1={hit.y}
                          x2={ref.x}
                          y2={ref.y}
                          stroke="#EF4444"
                          strokeWidth="2.4"
                          markerEnd="url(#sph-ref)"
                          opacity={concaveRefPhase}
                        />
                      );
                    })}
                  </g>
                )}

                <SymbolLegend
                  x={40}
                  y={92}
                  width={320}
                  items={[
                    { color: "#DC2626", text: "P = Pole" },
                    { color: "#7C3AED", text: "C = Centre of curvature" },
                    { color: "#16A34A", text: "F = Principal focus" },
                    { type: "line", color: "#94A3B8", text: "Line through P and C = Principal axis (normal at P)" },
                    { type: "line", color: "#F59E0B", text: "Orange = Incident rays" },
                    { type: "line", color: "#EF4444", text: "Red = Reflected rays" },
                    { color: "#EA580C", text: "Aperture = diameter of the reflecting surface" },
                  ]}
                />
              </g>
            )}

            {(step >= 7 && step <= 8) && (
              <g>
                <Axis />
                <circle cx={convex.center.x} cy={convex.center.y} r={convex.radius} fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" opacity={convexAppear} />
                <path d={convexReflectingArc} fill="none" stroke="#16A34A" strokeWidth="6" opacity={convexAppear} />
                <MirrorPolishTicks cx={convex.center.x} cy={convex.center.y} r={convex.radius} side="left" inward />

                {step >= 7 && (
                  <>
                    <circle cx={convex.pole.x} cy={convex.pole.y} r="5" fill="#DC2626" opacity={convexAppear} />
                    <text x={convex.pole.x - 16} y={convex.pole.y - 14} fontSize="13" fontWeight="700" fill="#DC2626">P</text>
                  </>
                )}

                {step >= 8 && (
                  <g opacity={convexPointsAppear}>
                    <circle cx={convex.center.x} cy={convex.center.y} r="5" fill="#7C3AED" />
                    <circle cx={convex.focus.x} cy={convex.focus.y} r="5" fill="#16A34A" />
                    <text x={convex.center.x - 14} y={convex.center.y + 24} fontSize="13" fontWeight="700" fill="#7C3AED">C</text>
                    <text x={convex.focus.x - 6} y={convex.focus.y + 24} fontSize="13" fontWeight="700" fill="#16A34A">F</text>
                  </g>
                )}

                {step >= 8 && (
                  <g>
                    {convexHits.map((hit, idx) => {
                      const yStart = hit.y;
                      const inc = lerp(60, yStart, hit.x - 2, yStart, convexIncPhase);

                      // Reflected ray is constrained to the same line whose backward extension goes through F.
                      const dirX = hit.x - convex.focus.x;
                      const dirY = hit.y - convex.focus.y;
                      const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
                      const unitX = dirX / dirLen;
                      const unitY = dirY / dirLen;
                      const refTarget = {
                        x: hit.x + unitX * 170,
                        y: hit.y + unitY * 170,
                      };
                      const ref = lerp(hit.x, hit.y, refTarget.x, refTarget.y, convexRefPhase);

                      return (
                        <g key={`conv-${idx}`}>
                          <line
                            x1={60}
                            y1={yStart}
                            x2={inc.x}
                            y2={inc.y}
                            stroke="#F59E0B"
                            strokeWidth="2.4"
                            markerEnd="url(#sph-inc)"
                          />

                          <line
                            x1={hit.x}
                            y1={hit.y}
                            x2={ref.x}
                            y2={ref.y}
                            stroke="#EF4444"
                            strokeWidth="2.4"
                            markerEnd="url(#sph-ref)"
                            opacity={convexRefPhase}
                          />

                          <line
                            x1={hit.x}
                            y1={hit.y}
                            x2={convex.focus.x}
                            y2={convex.focus.y}
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

                <SymbolLegend
                  x={448}
                  y={88}
                  width={310}
                  items={[
                    { color: "#DC2626", text: "P = Pole" },
                    { color: "#16A34A", text: "F = Virtual focus" },
                    { type: "line", color: "#94A3B8", text: "Principal axis (normal to mirror at P)" },
                    { type: "line", color: "#F59E0B", text: "Orange = Incident rays" },
                    { type: "line", color: "#EF4444", text: "Red = Reflected (diverging)" },
                    { type: "line", color: "#94A3B8", dash: "5,5", text: "Gray dotted = backward extension" },
                    { color: "#EA580C", text: "Aperture = diameter of the reflecting surface" },
                  ]}
                />
              </g>
            )}

            {step === 2 && (
              <DefinitionCard
                title="Definition: Concave Mirror"
                lines={[
                  "A concave mirror is a spherical mirror whose reflecting surface is curved inward.",
                  "The reflecting side faces the centre of curvature side of the mirror section.",
                  "Such a mirror can bring a parallel beam to a real focus after reflection.",
                ]}
              />
            )}

            {step === 3 && (
              <DefinitionCard
                title="Definition: Pole (P)"
                lines={[
                  "Pole is the geometric centre point of the mirror's reflecting surface.",
                  "The principal axis intersects the mirror exactly at the pole P.",
                  "All axial distance measurements are referenced from this point.",
                ]}
              />
            )}

            {step === 4 && (
              <DefinitionCard
                title="Definition: Centre of Curvature (C)"
                lines={[
                  "Centre of curvature is the centre of the sphere of which the mirror is a part.",
                  "For a concave mirror, C lies in front of the mirror on the principal axis.",
                  "Distance PC is called radius of curvature R.",
                ]}
              />
            )}

            {step === 5 && (
              <DefinitionCard
                title="Definition: Principal Focus (F), Principal Axis, f and R = 2f"
                lines={[
                  "Principal focus is the point where reflected parallel rays actually meet.",
                  "Principal axis is the straight line passing through pole P and centre of curvature C.",
                  "Focal length is f = PF and radius of curvature is R = PC.",
                  "For spherical mirrors, focus lies midway between P and C, so R = 2f.",
                ]}
              />
            )}

            {step === 6 && (
              <DefinitionCard
                title="Concept Highlight: Concave Reflection Sequence"
                lines={[
                  "Incident rays first travel to the mirror surface.",
                  "After impact, reflected rays move toward the principal focus F.",
                  "This is real convergence, so concave mirrors are converging mirrors.",
                ]}
              />
            )}

            {step === 7 && (
              <DefinitionCard
                title="Definition: Convex Mirror"
                lines={[
                  "A convex mirror is a spherical mirror whose reflecting surface bulges outward.",
                  "Its reflecting side faces away from the centre of the parent sphere.",
                  "It produces divergence of reflected rays for a parallel incident beam.",
                ]}
                tone="green"
              />
            )}

            {step === 8 && (
              <DefinitionCard
                title="Definition: Virtual C and F for Convex"
                lines={[
                  "For a convex mirror, both C and F are located behind the mirror.",
                  "They are virtual points, obtained from backward extension of reflected rays.",
                  "Reflected rays diverge in front, while dotted backward extensions meet at virtual F.",
                ]}
                tone="green"
              />
            )}

            {step === 11 && (
              <g opacity={summaryAppear}>
                <rect x="80" y="130" width="640" height="380" rx="16" fill="white" stroke="#86EFAC" strokeWidth="3" />
                <text x="400" y="176" fontSize="20" fontWeight="800" textAnchor="middle" fill="#15803D">Spherical Mirror Detailed Summary</text>
                <text x="120" y="224" fontSize="13" fill="#374151">1. Pole P is always on mirror surface.</text>
                <text x="120" y="254" fontSize="13" fill="#374151">2. Concave mirror converges parallel rays to real focus F.</text>
                <text x="120" y="284" fontSize="13" fill="#374151">3. Convex mirror reflects rays diverging; extensions meet at virtual F.</text>
                <text x="120" y="314" fontSize="13" fill="#374151">4. C and F are in front for concave, behind for convex.</text>
                <text x="120" y="344" fontSize="13" fill="#374151">5. Radius and focal length relation remains R = 2f.</text>
                <text x="120" y="374" fontSize="13" fill="#374151">6. Visualization follows the same definition-first teaching style as law modules.</text>
                <text x="120" y="414" fontSize="14" fontWeight="700" fill="#15803D">You can replay to rewatch each definition with its matching ray behavior.</text>
              </g>
            )}
          </svg>
        );
      }}
    </AnimationPlayer>
  );
};

export default SphericalMirrorDetailedAnimation;
