import React from 'react';
function DynamicSphericalMirrorFeedback() {
  const P_x = 400; // Pole X-coordinate
  const P_y = 300; // Principal axis Y-coordinate
  const mirrorRadius = 200; // Radius of curvature R = 2f
  const focalLength = -100; // f = -100 for concave mirror
  const objectU = -50; // Object distance u = -50 (in front of mirror)
  const objectHeight = 50; // Height of the object arrow

  // Mirror properties
  const C_x = P_x + mirrorRadius; // Center of Curvature (C)
  const F_x = P_x + focalLength; // Focus (F)

  // Object position
  const objectX = P_x + objectU;
  const objectTopY = P_y - objectHeight;

  // Calculate image distance v and magnification m
  const imageV = (objectU * focalLength) / (objectU - focalLength);
  const magnification = -imageV / objectU;
  const imageHeight = magnification * objectHeight;
  const imageX = P_x + imageV;
  const imageTopY = P_y - imageHeight;

  // Mirror arc definition
  const mirrorStartAngle = -Math.PI / 4; // Start 45 degrees below axis
  const mirrorEndAngle = Math.PI / 4; // End 45 degrees above axis
  const mirrorStartX = P_x + mirrorRadius * Math.cos(mirrorStartAngle);
  const mirrorStartY = P_y + mirrorRadius * Math.sin(mirrorStartAngle);
  const mirrorEndX = P_x + mirrorRadius * Math.cos(mirrorEndAngle);
  const mirrorEndY = P_y + mirrorRadius * Math.sin(mirrorEndAngle);

  // Ray 1: Parallel to principal axis, reflects through F
  const ray1_obj_x = objectX;
  const ray1_obj_y = objectTopY;
  const ray1_mirror_x = P_x; // For simplicity, assume mirror is at P_x for parallel ray reflection point
  const ray1_mirror_y = objectTopY; // Ray hits mirror at same height as object top
  const ray1_reflected_x = F_x;
  const ray1_reflected_y = P_y;

  // Ray 2: Through F, reflects parallel to principal axis
  const ray2_obj_x = objectX;
  const ray2_obj_y = objectTopY;
  const ray2_focus_x = F_x;
  const ray2_focus_y = P_y;
  // Calculate intersection point of ray2 with mirror
  // Line from (ray2_obj_x, ray2_obj_y) to (ray2_focus_x, ray2_focus_y)
  // Equation: y - y1 = m(x - x1)
  // m = (ray2_focus_y - ray2_obj_y) / (ray2_focus_x - ray2_obj_x)
  // We need to find x when y is on the mirror.
  // For simplicity, we'll approximate the mirror as a vertical line at P_x for ray intersection.
  // A more accurate calculation would involve intersecting the line with the circle arc.
  // Given the small object height and mirror curvature, P_x is a reasonable approximation for the reflection point.
  const ray2_mirror_x = P_x;
  const ray2_mirror_y = ray2_obj_y + (P_x - ray2_obj_x) * ((ray2_focus_y - ray2_obj_y) / (ray2_focus_x - ray2_obj_x));
  const ray2_reflected_x = P_x + 300; // Extend far to the right
  const ray2_reflected_y = ray2_mirror_y; // Reflects parallel to axis

  // Extrapolate reflected rays backward to find virtual image
  // Line 1: (ray1_mirror_x, ray1_mirror_y) to (ray1_reflected_x, ray1_reflected_y)
  // Line 2: (ray2_mirror_x, ray2_mirror_y) to (ray2_reflected_x, ray2_reflected_y)

  // For ray 1, the reflected ray goes through F. The extension is from the mirror point (P_x, ray1_mirror_y) through F.
  // The actual reflected ray starts from the mirror point (P_x, ray1_mirror_y) and goes through F.
  // The extension is from the mirror point (P_x, ray1_mirror_y) to the right, and the virtual extension is from (P_x, ray1_mirror_y) to the left.
  // Let's re-evaluate the reflection points for better accuracy.
  // For a concave mirror, the reflecting surface is on the left.
  // The mirror is centered at (C_x, P_y) with radius mirrorRadius.
  // The pole P is at (P_x, P_y).
  // The mirror curve is x = C_x - sqrt(mirrorRadius^2 - (y - P_y)^2)

  // Let's use the approximation that the mirror is a vertical line at P_x for reflection points,
  // but draw the mirror as an arc. This is a common simplification in ray diagrams for clarity.

  // Ray 1: Parallel to principal axis (y = objectTopY)
  // Hits mirror at (P_x, objectTopY)
  // Reflects through F (F_x, P_y)
  const ray1_path = `M ${objectX} ${objectTopY} L ${P_x} ${objectTopY}`;
  const ray1_reflected_path = `M ${P_x} ${objectTopY} L ${F_x} ${P_y}`;
  const ray1_extended_path = `M ${P_x} ${objectTopY} L ${imageX} ${imageTopY}`; // Extends to virtual image

  // Ray 2: Through F (F_x, P_y)
  // Hits mirror at (P_x, ray2_mirror_y)
  // Reflects parallel to principal axis (y = ray2_mirror_y)
  const ray2_path = `M ${objectX} ${objectTopY} L ${F_x} ${P_y}`;
  const ray2_reflected_path = `M ${P_x} ${ray2_mirror_y} L ${P_x + 300} ${ray2_mirror_y}`; // Reflects to the right
  const ray2_extended_path = `M ${P_x} ${ray2_mirror_y} L ${imageX} ${imageTopY}`; // Extends to virtual image

  // Calculate lengths for dash animation
  const getPathLength = (path) => {
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", path);
    tempSvg.appendChild(tempPath);
    return tempPath.getTotalLength();
  };

  const ray1_len = getPathLength(ray1_path);
  const ray1_reflected_len = getPathLength(ray1_reflected_path);
  const ray1_extended_len = getPathLength(ray1_extended_path);

  const ray2_len = getPathLength(ray2_path);
  const ray2_reflected_len = getPathLength(ray2_reflected_path);
  const ray2_extended_len = getPathLength(ray2_extended_path);

  const totalAnimationDuration = 6; // seconds

  const keyframesStyle = `
    @keyframes drawRay1 {
      0% { stroke-dashoffset: ${ray1_len}; }
      15% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes drawRay1Reflected {
      0% { stroke-dashoffset: ${ray1_reflected_len}; }
      15% { stroke-dashoffset: ${ray1_reflected_len}; }
      30% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes drawRay1Extended {
      0% { stroke-dashoffset: ${ray1_extended_len}; }
      30% { stroke-dashoffset: ${ray1_extended_len}; }
      45% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }

    @keyframes drawRay2 {
      0% { stroke-dashoffset: ${ray2_len}; }
      45% { stroke-dashoffset: ${ray2_len}; }
      60% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes drawRay2Reflected {
      0% { stroke-dashoffset: ${ray2_reflected_len}; }
      60% { stroke-dashoffset: ${ray2_reflected_len}; }
      75% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes drawRay2Extended {
      0% { stroke-dashoffset: ${ray2_extended_len}; }
      75% { stroke-dashoffset: ${ray2_extended_len}; }
      90% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }

    @keyframes revealImage {
      0% { opacity: 0; }
      90% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes revealText {
      0% { opacity: 0; }
      95% { opacity: 0; }
      100% { opacity: 1; }
    }
  `;

  return (
    <svg viewBox="0 0 800 600" style={{ border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
      <style>{keyframesStyle}</style>

      {/* Principal Axis */}
      <line x1="0" y1={P_y} x2="800" y2={P_y} stroke="#333" strokeWidth="1" />
      <text x="780" y={P_y - 10} fontSize="14" fill="#333">P.A.</text>

      {/* Mirror */}
      <path
        d={`M ${mirrorStartX} ${mirrorStartY} A ${mirrorRadius} ${mirrorRadius} 0 0 1 ${mirrorEndX} ${mirrorEndY}`}
        fill="none"
        stroke="#007bff"
        strokeWidth="3"
      />
      {/* Mirror hatching (back side) */}
      {[...Array(20)].map((_, i) => {
        const angle = mirrorStartAngle + (mirrorEndAngle - mirrorStartAngle) * (i / 19);
        const x1 = P_x + mirrorRadius * Math.cos(angle);
        const y1 = P_y + mirrorRadius * Math.sin(angle);
        const x2 = x1 + 10 * Math.cos(angle + Math.PI / 2); // Perpendicular to radius
        const y2 = y1 + 10 * Math.sin(angle + Math.PI / 2);
        return <line key={`hatch-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#007bff" strokeWidth="1" />;
      })}
      <text x={P_x - 10} y={P_y - 10} fontSize="14" fill="#333">P</text>

      {/* Focal Point (F) */}
      <circle cx={F_x} cy={P_y} r="4" fill="#ff0000" />
      <text x={F_x - 5} y={P_y - 15} fontSize="14" fill="#ff0000">F</text>

      {/* Center of Curvature (C) */}
      <circle cx={C_x} cy={P_y} r="4" fill="#ff0000" />
      <text x={C_x - 5} y={P_y - 15} fontSize="14" fill="#ff0000">C</text>

      {/* Object */}
      <line x1={objectX} y1={P_y} x2={objectX} y2={objectTopY} stroke="#000" strokeWidth="2" />
      <polygon points={`${objectX},${objectTopY} ${objectX - 5},${objectTopY + 10} ${objectX + 5},${objectTopY + 10}`} fill="#000" />
      <text x={objectX - 15} y={P_y + 20} fontSize="14" fill="#000">Object</text>

      {/* Ray 1: Parallel to axis, reflects through F */}
      <path
        d={ray1_path}
        stroke="#ff8c00"
        strokeWidth="2"
        fill="none"
        strokeDasharray={ray1_len}
        style={{ animation: `drawRay1 ${totalAnimationDuration}s ease-out forwards` }}
      />
      <path
        d={ray1_reflected_path}
        stroke="#ff8c00"
        strokeWidth="2"
        fill="none"
        strokeDasharray={ray1_reflected_len}
        style={{ animation: `drawRay1Reflected ${totalAnimationDuration}s ease-out forwards` }}
      />
      <path
        d={ray1_extended_path}
        stroke="#ff8c00"
        strokeWidth="2"
        fill="none"
        strokeDasharray={ray1_extended_len}
        strokeDashoffset={ray1_extended_len}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: `drawRay1Extended ${totalAnimationDuration}s ease-out forwards`, strokeDasharray: '5 5' }}
      />

      {/* Ray 2: Through F, reflects parallel to axis */}
      <path
        d={ray2_path}
        stroke="#32cd32"
        strokeWidth="2"
        fill="none"
        strokeDasharray={ray2_len}
        style={{ animation: `drawRay2 ${totalAnimationDuration}s ease-out forwards` }}
      />
      <path
        d={ray2_reflected_path}
        stroke="#32cd32"
        strokeWidth="2"
        fill="none"
        strokeDasharray={ray2_reflected_len}
        style={{ animation: `drawRay2Reflected ${totalAnimationDuration}s ease-out forwards` }}
      />
      <path
        d={ray2_extended_path}
        stroke="#32cd32"
        strokeWidth="2"
        fill="none"
        strokeDasharray={ray2_extended_len}
        strokeDashoffset={ray2_extended_len}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: `drawRay2Extended ${totalAnimationDuration}s ease-out forwards`, strokeDasharray: '5 5' }}
      />

      {/* Image */}
      <g style={{ animation: `revealImage ${totalAnimationDuration}s ease-out forwards` }}>
        <line x1={imageX} y1={P_y} x2={imageX} y2={imageTopY} stroke="#8a2be2" strokeWidth="2" strokeDasharray="5 5" />
        <polygon points={`${imageX},${imageTopY} ${imageX - 5},${imageTopY + 10} ${imageX + 5},${imageTopY + 10}`} fill="#8a2be2" />
        <text x={imageX - 15} y={P_y + 20} fontSize="14" fill="#8a2be2">Image</text>
      </g>

      {/* Feedback Text Box */}
      <rect x="50" y="450" width="700" height="100" fill="#ffe0b2" stroke="#ff9800" strokeWidth="2" rx="10" ry="10" style={{ animation: `revealText ${totalAnimationDuration}s ease-out forwards` }} />
      <text x="70" y="480" fontSize="18" fill="#333" style={{ animation: `revealText ${totalAnimationDuration}s ease-out forwards` }}>
        <tspan x="70" dy="0">Misconception: You drew a real image in front of the mirror.</tspan>
        <tspan x="70" dy="25">Correct Physics: When an object is placed between the pole (P) and the focus (F)</tspan>
        <tspan x="70" dy="25">of a concave mirror, the image formed is always VIRTUAL, ERECT, and MAGNIFIED.</tspan>
        <tspan x="70" dy="25">Virtual images are formed BEHIND the mirror and cannot be projected on a screen.</tspan>
      </text>
    </svg>
  );
}

export default DynamicSphericalMirrorFeedback;