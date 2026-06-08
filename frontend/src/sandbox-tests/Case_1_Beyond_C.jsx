import React from 'react';
function DynamicSphericalMirrorFeedback() {
  const P_x = 400; // Pole X-coordinate
  const P_y = 300; // Principal axis Y-coordinate
  const f = -100; // Focal length (concave mirror, real focus)
  const R = -2 * f; // Radius of curvature

  const F_x = P_x + f; // Focus X-coordinate
  const C_x = P_x + R; // Center of Curvature X-coordinate

  const u = -300; // Object distance
  const h = 50; // Object height

  // Calculate image distance v and magnification m
  const v = (u * f) / (u - f);
  const m = -v / u;
  const h_prime = m * h;

  const object_x = P_x + u;
  const object_top_y = P_y - h;

  const image_x = P_x + v;
  const image_top_y = P_y + h_prime; // Note: h_prime is negative for real, inverted image

  // Mirror properties
  const mirror_radius = Math.abs(R);
  const mirror_center_x = C_x;
  const mirror_center_y = P_y;
  const mirror_start_angle = Math.atan2(P_y - (P_y - 100), P_x - C_x); // Angle for y=200
  const mirror_end_angle = Math.atan2(P_y - (P_y + 100), P_x - C_x); // Angle for y=400

  // Mirror path for SVG arc
  // For a concave mirror, the center of curvature is to the left of the pole.
  // The mirror itself is to the right of C.
  // We want the mirror to bulge to the right (reflecting surface on the left).
  // The arc should be drawn from top-right to bottom-right, centered at C.
  const mirror_y_top = P_y - 100;
  const mirror_y_bottom = P_y + 100;

  // Calculate x-coordinates on the mirror for the given y-range
  // (x - C_x)^2 + (y - C_y)^2 = R^2
  // x = C_x + sqrt(R^2 - (y - C_y)^2)  (for the right side of the circle)
  const mirror_x_top = C_x + Math.sqrt(mirror_radius * mirror_radius - (mirror_y_top - P_y) * (mirror_y_top - P_y));
  const mirror_x_bottom = C_x + Math.sqrt(mirror_radius * mirror_radius - (mirror_y_bottom - P_y) * (mirror_y_bottom - P_y));

  // Ray 1: Parallel to principal axis, reflects through F
  const ray1_start_x = object_x;
  const ray1_start_y = object_top_y;
  const ray1_mirror_x = mirror_x_top; // Approximate intersection point on mirror
  const ray1_mirror_y = object_top_y; // This is an approximation for paraxial rays. For perfect math, need to find exact intersection.
                                     // For simplicity and visual clarity, we'll use the mirror's x-coordinate at the ray's y-level.
                                     // More accurately, find intersection of y=object_top_y and mirror arc.
                                     // x_intersect = C_x + sqrt(R^2 - (object_top_y - P_y)^2)
  const ray1_mirror_x_exact = C_x + Math.sqrt(mirror_radius * mirror_radius - (object_top_y - P_y) * (object_top_y - P_y));
  const ray1_mirror_y_exact = object_top_y;
  const ray1_reflected_end_x = image_x;
  const ray1_reflected_end_y = image_top_y;

  // Ray 2: Through F, reflects parallel to principal axis
  const ray2_start_x = object_x;
  const ray2_start_y = object_top_y;
  // Intersection of line from (object_x, object_top_y) to (F_x, P_y) with mirror
  // Line equation: y - P_y = m_ray2 * (x - F_x)
  // m_ray2 = (object_top_y - P_y) / (object_x - F_x)
  // (x - C_x)^2 + (y - P_y)^2 = R^2
  // Substitute y: (x - C_x)^2 + (m_ray2 * (x - F_x))^2 = R^2
  // This is a quadratic equation for x. For simplicity, we'll approximate the mirror intersection point.
  // We'll find the intersection of the line with the vertical line at P_x (pole) for visual simplicity,
  // then adjust to the mirror's actual curve.
  // A better approximation for paraxial rays is to find the intersection with the tangent plane at P.
  // For visual accuracy, we'll use the intersection with the mirror arc.
  // Let's find the intersection point for Ray 2 more accurately.
  // Line from (object_x, object_top_y) to (F_x, P_y)
  const m_ray2 = (object_top_y - P_y) / (object_x - F_x);
  const b_ray2 = P_y - m_ray2 * F_x; // y = m_ray2 * x + b_ray2

  // Solve (x - C_x)^2 + (m_ray2 * x + b_ray2 - P_y)^2 = R^2
  // This is a quadratic equation Ax^2 + Bx + C = 0
  const A_ray2 = 1 + m_ray2 * m_ray2;
  const B_ray2 = -2 * C_x + 2 * m_ray2 * (b_ray2 - P_y);
  const C_ray2 = C_x * C_x + (b_ray2 - P_y) * (b_ray2 - P_y) - R * R;
  const discriminant_ray2 = B_ray2 * B_ray2 - 4 * A_ray2 * C_ray2;
  let ray2_mirror_x_exact, ray2_mirror_y_exact;
  if (discriminant_ray2 >= 0) {
    const x1 = (-B_ray2 + Math.sqrt(discriminant_ray2)) / (2 * A_ray2);
    const x2 = (-B_ray2 - Math.sqrt(discriminant_ray2)) / (2 * A_ray2);
    // Choose the x that is closer to the pole P_x and to the right of C_x
    ray2_mirror_x_exact = (Math.abs(x1 - P_x) < Math.abs(x2 - P_x)) ? x1 : x2;
    // Ensure it's on the reflecting side (right of C_x)
    if (ray2_mirror_x_exact < C_x) {
        ray2_mirror_x_exact = (ray2_mirror_x_exact === x1) ? x2 : x1;
    }
    ray2_mirror_y_exact = m_ray2 * ray2_mirror_x_exact + b_ray2;
  } else {
    // Fallback for no real intersection (shouldn't happen for valid setup)
    ray2_mirror_x_exact = P_x;
    ray2_mirror_y_exact = P_y;
  }

  const ray2_reflected_end_x = image_x;
  const ray2_reflected_end_y = image_top_y;

  // Ray 3 (Optional, but good for verification): Through C, reflects back on itself
  // For this problem, we only need two rays.

  // Animation properties
  const totalRayLength1 = Math.sqrt(Math.pow(ray1_mirror_x_exact - ray1_start_x, 2) + Math.pow(ray1_mirror_y_exact - ray1_start_y, 2));
  const totalReflectedLength1 = Math.sqrt(Math.pow(ray1_reflected_end_x - ray1_mirror_x_exact, 2) + Math.pow(ray1_reflected_end_y - ray1_mirror_y_exact, 2));
  const totalRayLength2 = Math.sqrt(Math.pow(ray2_mirror_x_exact - ray2_start_x, 2) + Math.pow(ray2_mirror_y_exact - ray2_start_y, 2));
  const totalReflectedLength2 = Math.sqrt(Math.pow(ray2_reflected_end_x - ray2_mirror_x_exact, 2) + Math.pow(ray2_reflected_end_y - ray2_mirror_y_exact, 2));

  const animationDuration = 2; // seconds
  const delayBetweenRays = 0.5; // seconds
  const imageRevealDelay = animationDuration * 2 + delayBetweenRays; // After both rays are drawn

  const student_error_image_x = P_x + Math.abs(v); // Student drew image behind mirror, so positive v
  const student_error_image_top_y = P_y - h; // Assuming same height and erect for virtual image

  return (
    <svg viewBox="0 0 800 600" style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
      <style>
        {`
          @keyframes drawRay {
            from {
              stroke-dashoffset: var(--total-length);
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .ray-animation {
            stroke-dasharray: var(--total-length);
            stroke-dashoffset: var(--total-length);
            animation: drawRay var(--duration) linear forwards;
          }

          .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>

      {/* Principal Axis */}
      <line x1="0" y1={P_y} x2="800" y2={P_y} stroke="#333" strokeWidth="1" />

      {/* Mirror (Concave) */}
      <path
        d={`M ${mirror_x_top} ${mirror_y_top} A ${mirror_radius} ${mirror_radius} 0 0 1 ${mirror_x_bottom} ${mirror_y_bottom}`}
        fill="none"
        stroke="#666"
        strokeWidth="3"
      />
      {/* Mirror hatching for non-reflecting side */}
      {Array.from({ length: 20 }).map((_, i) => {
        const y = mirror_y_top + i * ((mirror_y_bottom - mirror_y_top) / 19);
        const x = C_x + Math.sqrt(mirror_radius * mirror_radius - (y - P_y) * (y - P_y));
        return (
          <line
            key={`hatch-${i}`}
            x1={x + 2}
            y1={y - 5}
            x2={x + 10}
            y2={y}
            stroke="#999"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Pole (P) */}
      <circle cx={P_x} cy={P_y} r="3" fill="black" />
      <text x={P_x + 5} y={P_y - 5} fontSize="14">P</text>

      {/* Focus (F) */}
      <circle cx={F_x} cy={P_y} r="3" fill="blue" />
      <text x={F_x + 5} y={P_y - 5} fontSize="14">F</text>

      {/* Center of Curvature (C) */}
      <circle cx={C_x} cy={P_y} r="3" fill="red" />
      <text x={C_x + 5} y={P_y - 5} fontSize="14">C</text>

      {/* Object */}
      <line x1={object_x} y1={P_y} x2={object_x} y2={object_top_y} stroke="black" strokeWidth="2" />
      <polygon points={`${object_x},${object_top_y - 10} ${object_x - 5},${object_top_y} ${object_x + 5},${object_top_y}`} fill="black" />
      <text x={object_x - 15} y={object_top_y - 15} fontSize="14">Object</text>

      {/* Student's Misconception Image (Dashed, behind mirror) */}
      <line
        x1={student_error_image_x}
        y1={P_y}
        x2={student_error_image_x}
        y2={student_error_image_top_y}
        stroke="red"
        strokeWidth="2"
        strokeDasharray="5,5"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay}s forwards` }}
      />
      <polygon
        points={`${student_error_image_x},${student_error_image_top_y - 10} ${student_error_image_x - 5},${student_error_image_top_y} ${student_error_image_x + 5},${student_error_image_top_y}`}
        fill="red"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay}s forwards` }}
      />
      <text
        x={student_error_image_x + 10}
        y={student_error_image_top_y - 15}
        fontSize="14"
        fill="red"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay}s forwards` }}
      >
        Your Image
      </text>

      {/* Ray 1: Incident (Parallel) */}
      <line
        x1={ray1_start_x}
        y1={ray1_start_y}
        x2={ray1_mirror_x_exact}
        y2={ray1_mirror_y_exact}
        stroke="blue"
        strokeWidth="2"
        className="ray-animation"
        style={{ '--total-length': totalRayLength1, '--duration': `${animationDuration}s` }}
      />
      {/* Ray 1: Reflected (Through F) */}
      <line
        x1={ray1_mirror_x_exact}
        y1={ray1_mirror_y_exact}
        x2={ray1_reflected_end_x}
        y2={ray1_reflected_end_y}
        stroke="blue"
        strokeWidth="2"
        className="ray-animation"
        style={{ '--total-length': totalReflectedLength1, '--duration': `${animationDuration}s`, animationDelay: `${animationDuration}s` }}
      />

      {/* Ray 2: Incident (Through F) */}
      <line
        x1={ray2_start_x}
        y1={ray2_start_y}
        x2={ray2_mirror_x_exact}
        y2={ray2_mirror_y_exact}
        stroke="green"
        strokeWidth="2"
        className="ray-animation"
        style={{ '--total-length': totalRayLength2, '--duration': `${animationDuration}s`, animationDelay: `${animationDuration + delayBetweenRays}s` }}
      />
      {/* Ray 2: Reflected (Parallel) */}
      <line
        x1={ray2_mirror_x_exact}
        y1={ray2_mirror_y_exact}
        x2={ray2_reflected_end_x}
        y2={ray2_reflected_end_y}
        stroke="green"
        strokeWidth="2"
        className="ray-animation"
        style={{ '--total-length': totalReflectedLength2, '--duration': `${animationDuration}s`, animationDelay: `${animationDuration * 2 + delayBetweenRays}s` }}
      />

      {/* Correct Image */}
      <line
        x1={image_x}
        y1={P_y}
        x2={image_x}
        y2={image_top_y}
        stroke="purple"
        strokeWidth="2"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay}s forwards` }}
      />
      <polygon
        points={`${image_x},${image_top_y + 10} ${image_x - 5},${image_top_y} ${image_x + 5},${image_top_y}`}
        fill="purple"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay}s forwards` }}
      />
      <text
        x={image_x + 10}
        y={image_top_y - 15}
        fontSize="14"
        fill="purple"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay}s forwards` }}
      >
        Correct Image
      </text>

      {/* Pedagogy Text Box */}
      <rect
        x="50"
        y="50"
        width="300"
        height="100"
        fill="white"
        stroke="#333"
        strokeWidth="1"
        rx="5"
        ry="5"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay + 0.5}s forwards` }}
      />
      <text
        x="60"
        y="75"
        fontSize="16"
        fill="#333"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay + 0.5}s forwards` }}
      >
        Misconception: Image Position Wrong
      </text>
      <text
        x="60"
        y="95"
        fontSize="14"
        fill="#555"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay + 0.5}s forwards` }}
      >
        When the object is placed beyond C (u &lt; R),
      </text>
      <text
        x="60"
        y="115"
        fontSize="14"
        fill="#555"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay + 0.5}s forwards` }}
      >
        a concave mirror forms a real, inverted, and
      </text>
      <text
        x="60"
        y="135"
        fontSize="14"
        fill="#555"
        style={{ animation: `fadeIn 0.5s ease-out ${imageRevealDelay + 0.5}s forwards` }}
      >
        diminished image between C and F.
      </text>
    </svg>
  );
}

export default DynamicSphericalMirrorFeedback;