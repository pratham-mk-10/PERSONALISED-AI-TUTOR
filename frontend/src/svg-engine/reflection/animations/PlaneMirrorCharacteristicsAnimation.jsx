import React from "react";
import AudioAnimationPlayer from "../../shared/AudioAnimationPlayer";
import { clamp, lerp } from "../../shared/PhysicsEngine";
import { Label, Line, ObjectArrow, ImageArrow } from "../../shared/SVGUtils";

const SVG_W = 480;
const SVG_H = 360;

// ── Layout (vertical mirror convention, matching ObjectArrow/ImageArrow's
// horizontal-axis design -- object left of mirror, image right/"behind") ──
const MIRROR_X = 260;
const MIRROR_TOP = 90;
const MIRROR_BOTTOM = 330;
const AXIS_Y = 300;
const OBJ_X = 140;
const OBJ_HEIGHT = 70;
const OBJ_TIP = { x: OBJ_X, y: AXIS_Y - OBJ_HEIGHT };
const OBJ_BASE = { x: OBJ_X, y: AXIS_Y };

// Reflect an incident direction vector (dx, dy) about a surface whose unit
// normal is (nx, ny): reflected = d - 2*(d.n)*n. This is the one general
// reflection formula used for both the vertical-mirror ray construction
// (n = (1, 0)) and the diffused-reflection facets below (n = each facet's
// own normal) -- same physics, not two different implementations.
function reflectVector(dx, dy, nx, ny) {
  const dot = dx * nx + dy * ny;
  return { x: dx - 2 * dot * nx, y: dy - 2 * dot * ny };
}

// Build one ray-construction: incident ray (source -> mirror point), the
// real reflected ray (solid, travels back toward the viewer), and its
// backward extension (dashed, behind the mirror) which -- for a plane
// mirror -- always passes exactly through the mirror-image of `source`.
function buildRayConstruction(source, mirrorPoint) {
  const d = { x: mirrorPoint.x - source.x, y: mirrorPoint.y - source.y };
  const reflected = reflectVector(d.x, d.y, 1, 0); // vertical mirror, normal = (1,0)
  const realEnd = { x: mirrorPoint.x + reflected.x * 0.8, y: mirrorPoint.y + reflected.y * 0.8 };
  // Backward (virtual) extension travels opposite to the real reflected ray.
  const virtualEnd = { x: mirrorPoint.x - reflected.x, y: mirrorPoint.y - reflected.y };
  return { source, mirrorPoint, realEnd, virtualEnd };
}

const RAY_1 = buildRayConstruction(OBJ_TIP, { x: MIRROR_X, y: 160 });
const RAY_2 = buildRayConstruction(OBJ_BASE, { x: MIRROR_X, y: 230 });
// Both back-extensions converge here -- the mirror-image of the object tip,
// confirming same distance behind the mirror as the object is in front.
const IMG_TIP = RAY_1.virtualEnd;
const IMG_X = IMG_TIP.x;

// ── Regular vs diffused reflection panels ──
const PANEL_Y = 60;
const REG_CX = 110;
const DIFF_CX = 350;
const SURFACE_W = 150;
// A jagged "rough" surface: list of connected points, each short segment
// tilted a different small amount so its own local normal differs.
const ROUGH_POINTS = [
  { x: DIFF_CX - SURFACE_W / 2, y: PANEL_Y + 40 },
  { x: DIFF_CX - SURFACE_W / 4, y: PANEL_Y + 30 },
  { x: DIFF_CX, y: PANEL_Y + 46 },
  { x: DIFF_CX + SURFACE_W / 4, y: PANEL_Y + 28 },
  { x: DIFF_CX + SURFACE_W / 2, y: PANEL_Y + 42 },
];

function facetNormal(p1, p2) {
  const fx = p2.x - p1.x;
  const fy = p2.y - p1.y;
  const len = Math.sqrt(fx * fx + fy * fy) || 1;
  // Perpendicular candidate, then flip so it points upward (ny < 0) toward
  // the incoming rays -- SVG y increases downward.
  let nx = -fy / len;
  let ny = fx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }
  return { nx, ny };
}

// One incident ray (angled, NOT perpendicular, so parallel-vs-scattered is
// visually obvious) per facet, hitting near that facet's midpoint.
const INCIDENT_DIR = { x: 0.35, y: 1 }; // travelling down-and-right
const RAY_SOURCE_Y = PANEL_Y - 30;

function buildFacetRay(p1, p2) {
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const source = { x: mid.x - INCIDENT_DIR.x * (mid.y - RAY_SOURCE_Y), y: RAY_SOURCE_Y };
  const { nx, ny } = facetNormal(p1, p2);
  const reflected = reflectVector(INCIDENT_DIR.x, INCIDENT_DIR.y, nx, ny);
  const len = 55;
  const mag = Math.sqrt(reflected.x ** 2 + reflected.y ** 2) || 1;
  const end = { x: mid.x - (reflected.x / mag) * len, y: mid.y - (reflected.y / mag) * len };
  return { source, hit: mid, end };
}

const ROUGH_RAYS = [];
for (let i = 0; i < ROUGH_POINTS.length - 1; i++) {
  ROUGH_RAYS.push(buildFacetRay(ROUGH_POINTS[i], ROUGH_POINTS[i + 1]));
}

// The smooth mirror in the "regular reflection" panel is one flat facet, so
// every incident ray reflects about the SAME normal -- reflected rays stay
// parallel to each other. Reuse buildFacetRay with a single flat facet
// sampled at 4 different x positions to make 4 genuinely parallel rays.
const SMOOTH_P1 = { x: REG_CX - SURFACE_W / 2, y: PANEL_Y + 40 };
const SMOOTH_P2 = { x: REG_CX + SURFACE_W / 2, y: PANEL_Y + 40 };
const SMOOTH_RAYS = [-0.35, -0.12, 0.12, 0.35].map((offset) => {
  const hit = { x: REG_CX + offset * SURFACE_W, y: PANEL_Y + 40 };
  const source = { x: hit.x - INCIDENT_DIR.x * (hit.y - RAY_SOURCE_Y), y: RAY_SOURCE_Y };
  const { nx, ny } = facetNormal(SMOOTH_P1, SMOOTH_P2);
  const reflected = reflectVector(INCIDENT_DIR.x, INCIDENT_DIR.y, nx, ny);
  const len = 55;
  const mag = Math.sqrt(reflected.x ** 2 + reflected.y ** 2) || 1;
  const end = { x: hit.x - (reflected.x / mag) * len, y: hit.y - (reflected.y / mag) * len };
  return { source, hit, end };
});

const AUDIO_STEPS = [
  { progress: 0.12, text: "You already know a plane mirror reflects light. But exactly what does the image it forms look like? Let's find out, property by property." },
  { progress: 0.30, text: "Take an object in front of the mirror. Draw two rays from it to the mirror, and reflect each one using the law of reflection you already know." },
  { progress: 0.44, text: "Now extend the reflected rays backward, behind the mirror, as dashed lines. They meet at a point. That is where the image forms -- but no light actually reaches there. That is why this image is called VIRTUAL." },
  { progress: 0.56, text: "Compare the object and the image. They are the same height, and both point the same way. The image is ERECT, and it is the SAME SIZE as the object." },
  { progress: 0.70, text: "Now measure the distances. The object is a certain distance in front of the mirror. The image forms exactly that same distance behind the mirror." },
  { progress: 0.84, text: "One more property: hold up your right hand in the mirror, and your reflection raises what looks like its left hand. Left and right are swapped. This is called LATERAL INVERSION." },
  { progress: 1.0, text: "Finally: a smooth mirror keeps parallel rays parallel after reflecting -- this is regular reflection. A rough surface scatters them in every direction -- diffused reflection. But look closely: every single ray, on both surfaces, still obeys the exact same law of reflection at its own point of contact." },
];

const PlaneMirrorCharacteristicsAnimation = ({ onTryItClicked }) => {
  return (
    <AudioAnimationPlayer
      audioSteps={AUDIO_STEPS}
      title="Watch: Properties of a Plane Mirror Image"
      onTryItClicked={onTryItClicked}
      showTryIt={true}
      tryButtonLabel="Try it yourself ->"
    >
      {({ progress }) => {
        let step = 0;
        if (progress < 0.12) step = 0;
        else if (progress < 0.30) step = 1;
        else if (progress < 0.44) step = 2;
        else if (progress < 0.56) step = 3;
        else if (progress < 0.70) step = 4;
        else if (progress < 0.84) step = 5;
        else step = 6;

        const showRays = step >= 1;
        const showVirtualExtension = step >= 2;
        const showImage = step >= 2;
        const showSizeCompare = step === 3;
        const showDistanceMarkers = step === 4;
        const showLateralInversion = step === 5;
        const showDiffusion = step === 6;

        return (
          <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
            <rect width={SVG_W} height={SVG_H} fill="#F8FAFF" />

            {step <= 4 && (
              <g>
                {/* Vertical mirror with hatch marks on the back (silvered) side */}
                <line x1={MIRROR_X} y1={MIRROR_TOP} x2={MIRROR_X} y2={MIRROR_BOTTOM} stroke="#1F2937" strokeWidth={3} />
                {Array.from({ length: 9 }).map((_, i) => {
                  const y = MIRROR_TOP + (i * (MIRROR_BOTTOM - MIRROR_TOP)) / 8;
                  return <line key={i} x1={MIRROR_X} y1={y} x2={MIRROR_X + 10} y2={y + 8} stroke="#9CA3AF" strokeWidth={1.5} />;
                })}
                <Line x1={40} y1={AXIS_Y} x2={SVG_W - 20} y2={AXIS_Y} color="#D1D5DB" strokeWidth={1} dashed />

                <ObjectArrow x={OBJ_X} axisY={AXIS_Y} height={OBJ_HEIGHT} color="#16A34A" label="Object" />

                {showRays && (
                  <g>
                    {[RAY_1, RAY_2].map((r, i) => (
                      <g key={i}>
                        <line x1={r.source.x} y1={r.source.y} x2={r.mirrorPoint.x} y2={r.mirrorPoint.y} stroke="#2563EB" strokeWidth={2} markerEnd="url(#pmc-arrow-blue)" />
                        <line x1={r.mirrorPoint.x} y1={r.mirrorPoint.y} x2={r.realEnd.x} y2={r.realEnd.y} stroke="#2563EB" strokeWidth={2} markerEnd="url(#pmc-arrow-blue)" />
                        {showVirtualExtension && (
                          <Line x1={r.mirrorPoint.x} y1={r.mirrorPoint.y} x2={r.virtualEnd.x} y2={r.virtualEnd.y} color="#93C5FD" strokeWidth={1.5} dashed />
                        )}
                      </g>
                    ))}
                  </g>
                )}

                <defs>
                  <marker id="pmc-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#2563EB" />
                  </marker>
                </defs>

                {showImage && (
                  <ImageArrow x={IMG_X} axisY={AXIS_Y} height={OBJ_HEIGHT} inverted={false} isVirtual={true} color="#DC2626" label="Image (virtual)" />
                )}

                {step === 2 && (
                  <Label x={SVG_W / 2} y={335} text="No real light reaches behind the mirror -- your eye just traces the dashed rays back" size={12} color="#6B7280" />
                )}

                {showSizeCompare && (
                  <g>
                    <Line x1={OBJ_X} y1={OBJ_TIP.y - 14} x2={OBJ_X} y2={OBJ_BASE.y} color="#16A34A" strokeWidth={1} dashed />
                    <Label x={OBJ_X - 34} y={AXIS_Y - OBJ_HEIGHT / 2} text={`h = ${OBJ_HEIGHT}`} size={11} color="#16A34A" anchor="end" />
                    <Line x1={IMG_X} y1={OBJ_TIP.y - 14} x2={IMG_X} y2={OBJ_BASE.y} color="#DC2626" strokeWidth={1} dashed />
                    <Label x={IMG_X + 34} y={AXIS_Y - OBJ_HEIGHT / 2} text={`h' = ${OBJ_HEIGHT}`} size={11} color="#DC2626" anchor="start" />
                    <Label x={SVG_W / 2} y={335} text="Same height, same orientation: SAME SIZE and ERECT" size={13} color="#111827" bold />
                  </g>
                )}

                {showDistanceMarkers && (
                  <g>
                    <Line x1={OBJ_X} y1={AXIS_Y + 20} x2={MIRROR_X} y2={AXIS_Y + 20} color="#16A34A" strokeWidth={1.5} />
                    <Label x={(OBJ_X + MIRROR_X) / 2} y={AXIS_Y + 34} text="d" size={12} color="#16A34A" bold />
                    <Line x1={MIRROR_X} y1={AXIS_Y + 20} x2={IMG_X} y2={AXIS_Y + 20} color="#DC2626" strokeWidth={1.5} />
                    <Label x={(MIRROR_X + IMG_X) / 2} y={AXIS_Y + 34} text="d" size={12} color="#DC2626" bold />
                    <Label x={SVG_W / 2} y={335} text="Object distance in front = Image distance behind the mirror" size={13} color="#111827" bold />
                  </g>
                )}
              </g>
            )}

            {showLateralInversion && (
              <g>
                <line x1={MIRROR_X} y1={MIRROR_TOP} x2={MIRROR_X} y2={MIRROR_BOTTOM} stroke="#1F2937" strokeWidth={3} />
                {/* A flag pointing right (object side): asymmetric shape so the flip is unambiguous */}
                <line x1={140} y1={140} x2={140} y2={260} stroke="#16A34A" strokeWidth={3} />
                <polygon points="140,140 200,165 140,190" fill="#16A34A" />
                <Label x={170} y={280} text="Object (flag points right)" size={12} color="#16A34A" />
                {/* Mirrored flag, x-flipped about MIRROR_X, pointing left */}
                <line x1={380} y1={140} x2={380} y2={260} stroke="#DC2626" strokeWidth={3} />
                <polygon points="380,140 320,165 380,190" fill="#DC2626" />
                <Label x={350} y={280} text="Image (flag points left)" size={12} color="#DC2626" />
                <Label x={SVG_W / 2} y={310} text="Left <-> Right swap: LATERAL INVERSION (up/down does NOT flip)" size={13} color="#111827" bold />
              </g>
            )}

            {showDiffusion && (
              <g>
                <Label x={REG_CX} y={PANEL_Y - 8} text="Smooth surface: Regular reflection" size={13} color="#111827" bold />
                <line x1={SMOOTH_P1.x} y1={SMOOTH_P1.y} x2={SMOOTH_P2.x} y2={SMOOTH_P2.y} stroke="#1F2937" strokeWidth={3} />
                {SMOOTH_RAYS.map((r, i) => (
                  <g key={i}>
                    <line x1={r.source.x} y1={r.source.y} x2={r.hit.x} y2={r.hit.y} stroke="#2563EB" strokeWidth={1.5} />
                    <line x1={r.hit.x} y1={r.hit.y} x2={r.end.x} y2={r.end.y} stroke="#DC2626" strokeWidth={1.5} markerEnd="url(#pmc-arrow-blue)" />
                  </g>
                ))}
                <Label x={REG_CX} y={PANEL_Y + 90} text="Reflected rays stay parallel" size={11} color="#6B7280" />

                <Label x={DIFF_CX} y={PANEL_Y - 8} text="Rough surface: Diffused reflection" size={13} color="#111827" bold />
                <polyline points={ROUGH_POINTS.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#1F2937" strokeWidth={3} />
                {ROUGH_RAYS.map((r, i) => (
                  <g key={i}>
                    <line x1={r.source.x} y1={r.source.y} x2={r.hit.x} y2={r.hit.y} stroke="#2563EB" strokeWidth={1.5} />
                    <line x1={r.hit.x} y1={r.hit.y} x2={r.end.x} y2={r.end.y} stroke="#DC2626" strokeWidth={1.5} markerEnd="url(#pmc-arrow-blue)" />
                  </g>
                ))}
                <Label x={DIFF_CX} y={PANEL_Y + 90} text="Reflected rays scatter -- but each still obeys i = r" size={11} color="#6B7280" />
              </g>
            )}

            {step === 0 && (
              <Label x={SVG_W / 2} y={SVG_H / 2} text="What exactly does a plane mirror image look like?" size={15} color="#111827" bold />
            )}
          </svg>
        );
      }}
    </AudioAnimationPlayer>
  );
};

export default PlaneMirrorCharacteristicsAnimation;
