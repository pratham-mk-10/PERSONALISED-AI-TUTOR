// ============================================================
// PhysicsEngine.js
// ALL physics math for the SVG engine lives here.
// No component should do its own calculations.
// Every animation and interactive component imports from here.
// ============================================================

// ─── REFLECTION ─────────────────────────────────────────────

/**
 * Law of Reflection: angle of incidence = angle of reflection
 * @param {number} incidentAngle - angle in degrees from normal
 * @returns {number} reflected angle (always equal to incident)
 */
export function reflectionAngle(incidentAngle) {
  return incidentAngle;
}

/**
 * Given angle from normal, compute incident ray start point
 * Mirror centre is at (cx, cy). Ray comes from upper-left.
 * @param {number} cx - mirror centre x
 * @param {number} cy - mirror centre y
 * @param {number} length - ray length in SVG units
 * @param {number} angleDeg - angle from normal (degrees)
 * @returns {{ x: number, y: number }}
 */
export function incidentRayStart(cx, cy, length, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx - length * Math.sin(rad),
    y: cy - length * Math.cos(rad),
  };
}

/**
 * Given angle from normal, compute reflected ray end point
 * Mirror centre is at (cx, cy). Ray goes to upper-right.
 * @param {number} cx - mirror centre x
 * @param {number} cy - mirror centre y
 * @param {number} length - ray length in SVG units
 * @param {number} angleDeg - angle from normal (degrees)
 * @returns {{ x: number, y: number }}
 */
export function reflectedRayEnd(cx, cy, length, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + length * Math.sin(rad),
    y: cy - length * Math.cos(rad),
  };
}

// ─── REFRACTION ─────────────────────────────────────────────

/**
 * Snell's Law: n1 * sin(i) = n2 * sin(r)
 * @param {number} n1 - refractive index of medium 1 (incident)
 * @param {number} n2 - refractive index of medium 2 (refracted)
 * @param {number} angleDeg - angle of incidence in degrees
 * @returns {number} angle of refraction in degrees (or null if total internal reflection)
 */
export function snellsLaw(n1, n2, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const sinR = (n1 * Math.sin(angleRad)) / n2;
  if (sinR > 1) return null; // total internal reflection
  return (Math.asin(sinR) * 180) / Math.PI;
}

/**
 * Lateral displacement of ray through a glass slab
 * @param {number} t - thickness of slab in SVG units
 * @param {number} i - angle of incidence in degrees
 * @param {number} r - angle of refraction in degrees
 * @returns {number} lateral displacement d
 */
export function lateralDisplacement(t, i, r) {
  const iRad = (i * Math.PI) / 180;
  const rRad = (r * Math.PI) / 180;
  return (t / Math.cos(rRad)) * Math.sin(iRad - rRad);
}

// ─── MIRRORS ────────────────────────────────────────────────

/**
 * Mirror formula: 1/v + 1/u = 1/f
 * Sign convention: distances measured from pole
 * Object is always on left → u is negative
 * Concave mirror → f is negative
 * Convex mirror  → f is positive
 * @param {number} u - object distance (negative)
 * @param {number} f - focal length (negative for concave, positive for convex)
 * @returns {number} image distance v
 */
export function mirrorFormula(u, f) {
  if (u === 0) return null;
  // 1/v = 1/f - 1/u
  return 1 / (1 / f - 1 / u);
}

// ─── LENSES ─────────────────────────────────────────────────

/**
 * Lens formula: 1/v - 1/u = 1/f
 * Sign convention: new Cartesian
 * Object always on left → u is negative
 * Convex lens  → f is positive
 * Concave lens → f is negative
 * @param {number} u - object distance (negative)
 * @param {number} f - focal length
 * @returns {number | null} image distance v (null if object at F)
 */
export function lensFormula(u, f) {
  if (u + f === 0) return null; // object at F → image at infinity
  return (f * u) / (u + f);
}

/**
 * Magnification
 * @param {number} v - image distance
 * @param {number} u - object distance
 * @returns {number} magnification m
 */
export function magnification(v, u) {
  if (u === 0) return null;
  return v / u;
}

/**
 * Determine nature of image from v and m
 * @param {number} v - image distance
 * @param {number} m - magnification
 * @returns {string} description of image nature
 */
export function imageNature(v, m) {
  if (v === null || v === Infinity) return "Image at Infinity";

  let nature = "";

  // Real or virtual
  if (v > 0) nature += "Real, Inverted";
  else nature += "Virtual, Upright";

  // Size
  const absM = Math.abs(m);
  if (absM > 1.05) nature += ", Magnified";
  else if (absM < 0.95) nature += ", Diminished";
  else nature += ", Same Size";

  return nature;
}

/**
 * Power of a lens
 * @param {number} fMetres - focal length in metres
 * @returns {number} power in dioptres (D)
 */
export function lensPower(fMetres) {
  return 1 / fMetres;
}

// ─── SVG GEOMETRY HELPERS ───────────────────────────────────

/**
 * Convert polar coordinates to Cartesian
 * Angle measured from vertical (12 o'clock = 0°)
 * Used for drawing angle arcs around the normal
 * @param {number} cx - centre x
 * @param {number} cy - centre y
 * @param {number} r  - radius
 * @param {number} angleDeg - angle from vertical in degrees
 * @returns {{ x: number, y: number }}
 */
export function polarToCartesian(cx, cy, r, angleDeg) {
  // subtract 90 so 0° points upward (toward normal direction)
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path string between two angles
 * Both angles measured from vertical (normal direction)
 * @param {number} cx - centre x
 * @param {number} cy - centre y
 * @param {number} r  - radius
 * @param {number} startAngle - start angle in degrees (from vertical)
 * @param {number} endAngle   - end angle in degrees (from vertical)
 * @returns {string} SVG path d attribute string
 */
export function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end   = polarToCartesian(cx, cy, r, endAngle);
  const sweep = endAngle > startAngle ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 0 ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/**
 * Interpolate between two points (for animating rays)
 * @param {number} x1 - start x
 * @param {number} y1 - start y
 * @param {number} x2 - end x
 * @param {number} y2 - end y
 * @param {number} t  - progress (0 to 1)
 * @returns {{ x: number, y: number }}
 */
export function lerp(x1, y1, x2, y2, t) {
  return {
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  };
}

/**
 * Clamp a value between min and max
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}