import React from 'react';
function DynamicSphericalMirrorFeedback() {
  const P_x = 400; // Pole X coordinate
  const P_y = 300; // Principal axis Y coordinate

  const f = -100; // Focal length (concave mirror, so negative)
  const R = -2 * f; // Radius of curvature

  const F_x = P_x + f; // Focus X coordinate
  const C_x = P_x + R; // Center of Curvature X coordinate

  const u = -100; // Object distance (student's input)
  const objectHeight = 50; // Height of the object arrow

  // Calculate image position and height
  // 1/f = 1/v + 1/u  =>  1/v = 1/f - 1/u = (u - f) / (u * f)  =>  v = (u * f) / (u - f)
  const v = (u * f) / (u - f);
  const magnification = -v / u;
  const imageHeight = magnification * objectHeight;

  const objectX = P_x + u;
  const imageX = P_x + v;

  // Mirror properties
  const mirrorRadius = Math.abs(R);
  const mirrorCenterX = P_x + R; // Center of the circle forming the mirror
  const mirrorStartAngle = Math.atan2(P_y - (P_y - 100), P_x - mirrorCenterX);
  const mirrorEndAngle = Math.atan2(P_y - (P_y + 100), P_x - mirrorCenterX);

  // For a concave mirror, the arc should be drawn from top to bottom, bulging right.
  // SVG arc path: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  // We want the arc to be centered at (C_x, P_y) and pass through (P_x, P_y).
  // The mirror is a segment of a circle with radius R, centered at C.
  // We'll draw an arc from (P_x, P_y - 100) to (P_x, P_y + 100)
  // The center of the circle is (C_x, P_y).
  // The mirror should be drawn such that its reflecting surface is on the left.
  // The arc should be from (C_x + R*cos(theta_top), P_y + R*sin(theta_top))
  // to (C_x + R*cos(theta_bottom), P_y + R*sin(theta_bottom))
  // Let's define the mirror's vertical extent
  const mirrorHeightExtent = 100;
  const mirrorTopY = P_y - mirrorHeightExtent;
  const mirrorBottomY = P_y + mirrorHeightExtent;

  // Calculate the x-coordinate of the mirror's edge at mirrorTopY and mirrorBottomY
  // (x - C_x)^2 + (y - P_y)^2 = R^2
  // x = C_x - sqrt(R^2 - (y - P_y)^2) for the reflecting side
  const mirrorEdgeX = C_x - Math.sqrt(R * R - mirrorHeightExtent * mirrorHeightExtent);

  // Ray 1: Parallel to principal axis, reflects through F
  const ray1_start = { x: objectX, y: P_y - objectHeight };
  const ray1_mirror_intersect = { x: mirrorEdgeX, y: P_y - objectHeight };
  const ray1_reflect_end = { x: P_x + 600, y: P_y + (P_y - objectHeight - F_x) * (P_x + 600 - F_x) / (mirrorEdgeX - F_x) }; // Extend far right

  // Ray 2: Through F, reflects parallel to principal axis
  const ray2_start = { x: objectX, y: P_y - objectHeight };
  // Find intersection of line from ray2_start to F with the mirror arc
  // Line equation: y - y1 = m(x - x1) where m = (F_y - ray2_start.y) / (F_x - ray2_start.x)
  // (x - C_x)^2 + (y - P_y)^2 = R^2
  // This is complex. For simplicity, we'll approximate the mirror as a vertical line at mirrorEdgeX for ray intersection.
  // This is a common simplification for paraxial rays in diagrams.
  const ray2_mirror_intersect = { x: mirrorEdgeX, y: P_y - objectHeight + (F_x - objectX) * (P_y - objectHeight - P_y) / (F_x - objectX) };
  // Recalculate y for ray2_mirror_intersect using the line from object top to F
  const m2 = (P_y - (P_y - objectHeight)) / (F_x - objectX);
  const ray2_mirror_intersect_y = (P_y - objectHeight) + m2 * (mirrorEdgeX - objectX);
  const ray2_mirror_intersect_actual = { x: mirrorEdgeX, y: ray2_mirror_intersect_y };

  const ray2_reflect_end = { x: P_x + 600, y: ray2_mirror_intersect_actual.y }; // Reflects parallel

  // Image position for u = -100, f = -100:
  // 1/v = 1/f - 1/u = 1/(-100) - 1/(-100) = -1/100 + 1/100 = 0
  // So, v = infinity. This means rays reflect parallel.
  // The student's error is drawing the image at C.

  // Pedagogy: Explain that when object is at F, image is at infinity.
  const feedbackText = `
    Misconception Alert!
    You placed the image at C, but the object is at the Focal Point (F).
    When an object is placed at the Focal Point (F) of a concave mirror,
    the reflected rays become parallel to the principal axis.
    This means the image is formed at infinity, not at C.
    Remember: Object at F -> Image at Infinity (parallel rays).
    Object at C -> Image at C (real, inverted, same size).
  `;

  // Animation properties
  const animationDuration = 3; // seconds
  const rayLength1 = Math.sqrt(Math.pow(ray1_mirror_intersect.x - ray1_start.x, 2) + Math.pow(ray1_mirror_intersect.y - ray1_start.y, 2)) +
                     Math.sqrt(Math.pow(ray1_reflect_end.x - ray1_mirror_intersect.x, 2) + Math.pow(ray1_reflect_end.y - ray1_mirror_intersect.y, 2));
  const rayLength2 = Math.sqrt(Math.pow(ray2_mirror_intersect_actual.x - ray2_start.x, 2) + Math.pow(ray2_mirror_intersect_actual.y - ray2_start.y, 2)) +
                     Math.sqrt(Math.pow(ray2_reflect_end.x - ray2_mirror_intersect_actual.x, 2) + Math.pow(ray2_reflect_end.y - ray2_mirror_intersect_actual.y, 2));

  const ray1DashArray = `${rayLength1} ${rayLength1}`;
  const ray2DashArray = `${rayLength2} ${rayLength2}`;

  const keyframesStyle = `
    @keyframes drawRay1 {
      0% { stroke-dashoffset: ${rayLength1}; }
      30% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes drawRay2 {
      0% { stroke-dashoffset: ${rayLength2}; }
      30% { stroke-dashoffset: ${rayLength2}; }
      60% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes fadeIn {
      0% { opacity: 0; }
      70% { opacity: 0; }
      100% { opacity: 1; }
    }
  `;

  return (
    <svg viewBox="0 0 800 600" style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
      <style>{keyframesStyle}</style>

      {/* Principal Axis */}
      <line x1="0" y1={P_y} x2="800" y2={P_y} stroke="#333" strokeWidth="1" />

      {/* Mirror */}
      <path
        d={`M ${mirrorEdgeX} ${mirrorTopY} A ${mirrorRadius} ${mirrorRadius} 0 0 1 ${mirrorEdgeX} ${mirrorBottomY}`}
        fill="none"
        stroke="blue"
        strokeWidth="3"
      />
      {/* Mirror hatching (non-reflecting side) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={`hatch-${i}`}
          x1={mirrorEdgeX + 2}
          y1={mirrorTopY + i * (mirrorHeightExtent * 2 / 19)}
          x2={mirrorEdgeX + 8}
          y2={mirrorTopY + i * (mirrorHeightExtent * 2 / 19) + 5}
          stroke="blue"
          strokeWidth="1"
        />
      ))}

      {/* Pole (P) */}
      <circle cx={P_x} cy={P_y} r="3" fill="black" />
      <text x={P_x + 5} y={P_y - 5} fontSize="14">P</text>

      {/* Focus (F) */}
      <circle cx={F_x} cy={P_y} r="3" fill="red" />
      <text x={F_x + 5} y={P_y - 5} fontSize="14">F</text>

      {/* Center of Curvature (C) */}
      <circle cx={C_x} cy={P_y} r="3" fill="green" />
      <text x={C_x + 5} y={P_y - 5} fontSize="14">C</text>

      {/* Object Arrow */}
      <line x1={objectX} y1={P_y} x2={objectX} y2={P_y - objectHeight} stroke="purple" strokeWidth="2" />
      <polygon points={`${objectX},${P_y - objectHeight} ${objectX - 5},${P_y - objectHeight + 10} ${objectX + 5},${P_y - objectHeight + 10}`} fill="purple" />
      <text x={objectX - 10} y={P_y - objectHeight - 5} fontSize="14" fill="purple">Object</text>

      {/* Ray 1: Parallel to axis, reflects through F */}
      <g>
        <line
          x1={ray1_start.x} y1={ray1_start.y}
          x2={ray1_mirror_intersect.x} y2={ray1_mirror_intersect.y}
          stroke="orange" strokeWidth="2"
          strokeDasharray={ray1DashArray}
          style={{ animation: `drawRay1 ${animationDuration}s ease-out forwards` }}
        />
        <line
          x1={ray1_mirror_intersect.x} y1={ray1_mirror_intersect.y}
          x2={P_x + 700} y2={ray1_mirror_intersect.y} // Reflects parallel to axis
          stroke="orange" strokeWidth="2"
          strokeDasharray={ray1DashArray}
          style={{ animation: `drawRay1 ${animationDuration}s ease-out forwards` }}
        />
        {/* Arrowhead for reflected ray 1 */}
        <polygon
          points={`${P_x + 700},${ray1_mirror_intersect.y} ${P_x + 700 - 10},${ray1_mirror_intersect.y - 5} ${P_x + 700 - 10},${ray1_mirror_intersect.y + 5}`}
          fill="orange"
          style={{ animation: `fadeIn ${animationDuration}s forwards` }}
        />
      </g>

      {/* Ray 2: Through F, reflects parallel to axis */}
      <g>
        <line
          x1={ray2_start.x} y1={ray2_start.y}
          x2={ray2_mirror_intersect_actual.x} y2={ray2_mirror_intersect_actual.y}
          stroke="green" strokeWidth="2"
          strokeDasharray={ray2DashArray}
          style={{ animation: `drawRay2 ${animationDuration}s ease-out forwards` }}
        />
        <line
          x1={ray2_mirror_intersect_actual.x} y1={ray2_mirror_intersect_actual.y}
          x2={P_x + 700} y2={ray2_mirror_intersect_actual.y} // Reflects parallel to axis
          stroke="green" strokeWidth="2"
          strokeDasharray={ray2DashArray}
          style={{ animation: `drawRay2 ${animationDuration}s ease-out forwards` }}
        />
        {/* Arrowhead for reflected ray 2 */}
        <polygon
          points={`${P_x + 700},${ray2_mirror_intersect_actual.y} ${P_x + 700 - 10},${ray2_mirror_intersect_actual.y - 5} ${P_x + 700 - 10},${ray2_mirror_intersect_actual.y + 5}`}
          fill="green"
          style={{ animation: `fadeIn ${animationDuration}s forwards` }}
        />
      </g>

      {/* Feedback Text Box */}
      <rect
        x="50" y="400" width="700" height="150"
        fill="#ffe0b2" stroke="#ff9800" strokeWidth="2"
        rx="10" ry="10"
        style={{ animation: `fadeIn ${animationDuration}s forwards` }}
      />
      <text
        x="70" y="430"
        fontSize="16"
        fill="#333"
        style={{ whiteSpace: 'pre-wrap', animation: `fadeIn ${animationDuration}s forwards` }}
      >
        {feedbackText.trim()}
      </text>
    </svg>
  );
}

export default DynamicSphericalMirrorFeedback;