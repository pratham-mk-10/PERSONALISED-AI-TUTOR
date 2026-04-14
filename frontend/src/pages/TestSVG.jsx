import React, { useState } from "react";

// 👉 import your component here
import AngleFromSurfaceFeedback from "../svg-engine/reflection/feedback/AngleFromSurfaceFeedback";

export default function TestSVG() {

  const [attempt, setAttempt] = useState(2);

  return (
    <div style={{ padding: "20px" }}>

      <h2>SVG Test Page</h2>

      {/* Controls */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setAttempt(1)}>Attempt 1</button>
        <button onClick={() => setAttempt(2)}>Attempt 2</button>
        <button onClick={() => setAttempt(3)}>Attempt 3</button>
      </div>

      {/* Render your component */}
      <AngleFromSurfaceFeedback attempt={attempt} />

    </div>
  );
}