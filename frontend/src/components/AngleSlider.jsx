import React, { useState } from "react";

export default function AngleSlider() {
  const [angle, setAngle] = useState(30);

  const cx = 300;
  const cy = 250;
  const rayLength = 180;

  const rad = (angle * Math.PI) / 180;

  // Incident ray (top-left → mirror)
  const ix = cx - rayLength * Math.sin(rad);
  const iy = cy - rayLength * Math.cos(rad);

  // Reflected ray (mirror → top-right)
  const rx = cx + rayLength * Math.sin(rad);
  const ry = cy - rayLength * Math.cos(rad);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Law of Reflection</h2>

      <svg width="600" height="400">
        {/* Mirror */}
        <line x1="50" y1={cy} x2="550" y2={cy} stroke="black" strokeWidth="4" />

        {/* Normal */}
        <line
          x1={cx}
          y1="50"
          x2={cx}
          y2={cy}
          stroke="gray"
          strokeDasharray="5,5"
        />

        {/* Incident Ray */}
        <line x1={ix} y1={iy} x2={cx} y2={cy} stroke="blue" strokeWidth="3" />

        {/* Reflected Ray */}
        <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="red" strokeWidth="3" />

        {/* Labels */}
        <text x={cx - 140} y={cy - 100} fill="blue">
          Incident Ray
        </text>

        <text x={cx + 40} y={cy - 100} fill="red">
          Reflected Ray
        </text>

        <text x={cx + 10} y={cy + 20}>Mirror</text>
        <text x={cx + 10} y={cy - 180}>Normal</text>

        <text x={230} y={30}>
          Angle = {angle}°
        </text>
      </svg>

      <input
        type="range"
        min="0"
        max="89"
        value={angle}
        onChange={(e) => setAngle(Number(e.target.value))}
        style={{ width: "400px" }}
      />
    </div>
  );
}