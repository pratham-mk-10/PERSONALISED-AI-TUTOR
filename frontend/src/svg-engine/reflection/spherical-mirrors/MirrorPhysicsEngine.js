export class MirrorPhysicsEngine {
  /**
   * Calculates the theoretical image properties based on Cartesian sign convention.
   * - Pole is at origin (0,0)
   * - Light travels from left to right
   * - Object is always placed on the left (-x axis)
   * - Concave mirror focus is on the left (-x axis)
   * - Convex mirror focus is on the right (+x axis)
   * 
   * @param {string} mirrorType 'concave' or 'convex'
   * @param {number} focalLength Absolute value of focal length
   * @param {number} objectDistance Absolute value of object distance
   * @param {number} objectHeight Absolute value of object height
   */
  static calculateImage(mirrorType, focalLength, objectDistance, objectHeight) {
    // 1. Apply strict Cartesian sign conventions
    const u = -Math.abs(objectDistance);
    const f = mirrorType === 'concave' ? -Math.abs(focalLength) : Math.abs(focalLength);
    const h = Math.abs(objectHeight);

    // 2. Handle the "Infinity" edge case (Object exactly at Focus of concave mirror)
    if (Math.abs(u - f) < 0.001 && mirrorType === 'concave') {
      return {
        u, f, h,
        v: -Infinity,
        hPrime: -Infinity,
        m: -Infinity,
        isVirtual: false,
        isErect: false,
        isInfinity: true
      };
    }

    // 3. Mirror Formula: 1/v + 1/u = 1/f  =>  v = (f*u) / (u-f)
    const v = (f * u) / (u - f);

    // 4. Magnification Formula: m = -v/u
    const m = -v / u;

    // 5. Image Height: h' = m * h
    const hPrime = m * h;

    return {
      u, f, h,
      v,
      hPrime,
      m,
      isVirtual: v > 0, // Image forms behind the mirror
      isErect: hPrime > 0, // Image is pointing UP
      isInfinity: false
    };
  }

  /**
   * Calculates the exact (x, y) coordinates for rendering on an SVG canvas.
   * Returns logical coordinates. The React component will shift them to SVG center.
   */
  static getLogicalCoordinates(mirrorType, focalLength, objectDistance, objectHeight) {
    const calc = this.calculateImage(mirrorType, focalLength, objectDistance, objectHeight);
    
    const centerOfCurvature = 2 * calc.f;

    return {
      pole: { x: 0, y: 0 },
      focus: { x: calc.f, y: 0 },
      center: { x: centerOfCurvature, y: 0 },
      objectTip: { x: calc.u, y: calc.h },
      objectBase: { x: calc.u, y: 0 },
      imageTip: { x: calc.v, y: calc.hPrime },
      imageBase: { x: calc.v, y: 0 },
      properties: calc
    };
  }
}
