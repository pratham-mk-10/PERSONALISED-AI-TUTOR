import React, { useState } from 'react';
import { MirrorPhysicsEngine } from '../../svg-engine/reflection/spherical-mirrors/MirrorPhysicsEngine';

const DynamicMirrorFeedback = ({ 
  mirrorType = 'concave', 
  focalLength = 100, 
  initialObjectDistance = 150,
  objectHeight = 60,
  flawedModel = null 
}) => {
  const [uDistance, setUDistance] = useState(initialObjectDistance);

  // Canvas configuration
  const width = 800;
  const height = 400;
  const poleX = 400; 
  const poleY = 200; 

  const toSVG = (logicalX, logicalY) => ({
    x: poleX + logicalX,
    y: poleY - logicalY
  });

  // 1. Calculate Actual Physics Truth using our Engine
  const physics = MirrorPhysicsEngine.getLogicalCoordinates(
    mirrorType, focalLength, uDistance, objectHeight
  );

  // 2. Extrapolate Flawed Physics (If a misconception tag triggered this stage)
  let flawedPhysics = null;
  if (flawedModel) {
    flawedPhysics = {
      imageTip: toSVG(flawedModel.v, flawedModel.hPrime),
      imageBase: toSVG(flawedModel.v, 0)
    };
  }

  // Mirror curve helper
  const getMirrorX = (y) => {
    const minY = poleY - 150;
    const maxY = poleY + 150;
    const clampedY = Math.max(minY, Math.min(maxY, y));
    const t = (clampedY - minY) / 300;
    
    let x0, xc, x1;
    if (mirrorType === 'concave') {
      x0 = poleX - 20;
      xc = poleX + 40;
      x1 = poleX - 20;
    } else {
      x0 = poleX + 20;
      xc = poleX - 40;
      x1 = poleX + 20;
    }
    return (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * xc + t * t * x1;
  };

  // Convert key logical points to SVG points using robust direct math
  const objTip = toSVG(-uDistance, objectHeight);
  const objBase = toSVG(-uDistance, 0);
  
  // Handle infinity case for image tip positioning safely
  let imgTip = { x: 50, y: poleY };
  let imgBase = { x: 50, y: poleY };
  if (!physics.properties.isInfinity) {
    imgTip = toSVG(physics.properties.v, physics.properties.hPrime);
    imgBase = toSVG(physics.properties.v, 0);
  }
  
  const F = toSVG(physics.focus.x, physics.focus.y);
  const C = toSVG(physics.center.x, physics.center.y);

  // --- RAY 1 CALCULATIONS (Parallel -> Focus) ---
  const ray1_inc_start = objTip;
  const ray1_hit = { x: getMirrorX(objTip.y), y: objTip.y };
  const ray1_inc_mid = { x: (ray1_inc_start.x + ray1_hit.x) / 2, y: (ray1_inc_start.y + ray1_hit.y) / 2 };

  let ray1_ref_end = { x: 50, y: poleY };
  let ray1_virtual_end = null;

  if (mirrorType === 'concave') {
    if (physics.properties.isInfinity) {
      // Reflected ray passes through F and goes to left edge
      const slope = (F.y - ray1_hit.y) / (F.x - ray1_hit.x);
      ray1_ref_end = { x: 50, y: ray1_hit.y + slope * (50 - ray1_hit.x) };
    } else if (physics.properties.isVirtual) {
      // Virtual extension behind mirror to imgTip
      ray1_virtual_end = imgTip;
      // Real reflected ray goes to the left, pointing away from virtual focus / through focus F
      const slope = (imgTip.y - ray1_hit.y) / (imgTip.x - ray1_hit.x);
      ray1_ref_end = { x: 50, y: ray1_hit.y + slope * (50 - ray1_hit.x) };
    } else {
      // Real image: Reflected ray goes through imgTip
      ray1_ref_end = imgTip;
    }
  } else {
    // Convex mirror: reflects to the left, virtual extension to virtual focus F (which passes through imgTip)
    const slope = (F.y - ray1_hit.y) / (F.x - ray1_hit.x);
    ray1_virtual_end = F;
    // Bounces back to the left (diverging)
    ray1_ref_end = { x: 50, y: ray1_hit.y - slope * (ray1_hit.x - 50) };
  }

  const ray1_ref_mid = { x: (ray1_hit.x + ray1_ref_end.x) / 2, y: (ray1_hit.y + ray1_ref_end.y) / 2 };

  // --- RAY 2 CALCULATIONS (Focus -> Parallel or Center -> Center) ---
  // Concave Between F and P (u < f) OR Concave At F (u = f) uses the C-ray
  const useCenterRay = (mirrorType === 'concave' && uDistance <= focalLength);
  
  let ray2_inc_start = objTip;
  let ray2_hit = { x: poleX, y: poleY };
  let ray2_inc_mid = { x: poleX, y: poleY };
  let ray2_ref_end = { x: 50, y: poleY };
  let ray2_virtual_end = null;
  let ray2_focus_helper_end = null; // for dotted trace to focus/center

  if (useCenterRay) {
    // C-ray: passes through C(200, 200) and objTip. Retraces path.
    const slope = (objTip.y - C.y) / (objTip.x - C.x);
    const approxY = C.y + slope * (poleX - C.x);
    const hitX = getMirrorX(approxY);
    const hitY = C.y + slope * (hitX - C.x);
    ray2_hit = { x: hitX, y: hitY };
    ray2_inc_mid = { x: (ray2_inc_start.x + ray2_hit.x) / 2, y: (ray2_inc_start.y + ray2_hit.y) / 2 };
    
    // Help line from objTip back to C (shows alignment with C)
    ray2_focus_helper_end = C;

    if (physics.properties.isInfinity) {
      // Retraces through C to left edge
      ray2_ref_end = { x: 50, y: ray2_hit.y + slope * (50 - ray2_hit.x) };
    } else if (physics.properties.isVirtual) {
      // Virtual extension behind mirror to imgTip
      ray2_virtual_end = imgTip;
      // Real reflected ray goes to the left through C
      ray2_ref_end = { x: 50, y: ray2_hit.y + slope * (50 - ray2_hit.x) };
    } else {
      // Real image case (if u distance is close to C but triggered useCenterRay)
      ray2_ref_end = imgTip;
    }
  } else {
    // Aligned with Focus
    let slope = 0;
    if (mirrorType === 'concave') {
      if (uDistance > focalLength) {
        // Real: Ray passes through F to hit mirror
        slope = (F.y - objTip.y) / (F.x - objTip.x);
      } else {
        // Virtual: Ray comes as if from F (on the left) through objTip
        slope = (objTip.y - F.y) / (objTip.x - F.x);
        ray2_focus_helper_end = F;
      }
    } else {
      // Convex: Directed towards virtual F on the right
      slope = (F.y - objTip.y) / (F.x - objTip.x);
      ray2_focus_helper_end = F;
    }

    const approxY = objTip.y + slope * (poleX - objTip.x);
    const hitX = getMirrorX(approxY);
    const hitY = objTip.y + slope * (hitX - objTip.x);
    ray2_hit = { x: hitX, y: hitY };
    ray2_inc_mid = { x: (ray2_inc_start.x + ray2_hit.x) / 2, y: (ray2_inc_start.y + ray2_hit.y) / 2 };

    if (physics.properties.isInfinity) {
      ray2_ref_end = { x: 50, y: ray2_hit.y };
    } else if (physics.properties.isVirtual) {
      // Reflects parallel to left, virtual extension parallel behind mirror to imgTip
      ray2_ref_end = { x: 50, y: ray2_hit.y };
      ray2_virtual_end = { x: imgTip.x, y: ray2_hit.y };
    } else {
      // Real: goes from hit to imgTip (which is at imgTip.x and approximately parallel height)
      ray2_ref_end = imgTip;
    }
  }

  const ray2_ref_mid = { x: (ray2_hit.x + ray2_ref_end.x) / 2, y: (ray2_hit.y + ray2_ref_end.y) / 2 };

  // Object Position Text Logic
  let positionText = "";
  const u = Math.abs(uDistance);
  const f = Math.abs(focalLength);
  const c = 2 * f;
  
  if (mirrorType === 'concave') {
    if (u > c) positionText = "Beyond C";
    else if (u === c) positionText = "At C";
    else if (u > f && u < c) positionText = "Between C and F";
    else if (u === f) positionText = "At F";
    else if (u < f) positionText = "Between F and P";
  } else {
    positionText = "In front of mirror";
  }

  // Correct position of the image formed logic
  let imagePositionText = "";
  if (mirrorType === 'concave') {
    if (u === f) imagePositionText = "At Infinity";
    else if (u < f) imagePositionText = "Behind the mirror";
    else if (u > c) imagePositionText = "Between C and F";
    else if (u === c) imagePositionText = "At C";
    else if (u > f && u < c) imagePositionText = "Beyond C";
  } else {
    imagePositionText = "Behind the mirror (Between P and F)";
  }

  // Image Nature Text Logic
  const m = Math.abs(physics.properties.hPrime / objectHeight);
  let sizeText = "Same Size";
  if (physics.properties.isInfinity) sizeText = "Highly Magnified";
  else if (m > 1.05) sizeText = "Magnified";
  else if (m < 0.05) sizeText = "Highly Diminished";
  else if (m < 0.95) sizeText = "Diminished";

  // Styles
  const containerStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '840px',
    background: 'linear-gradient(145deg, #1f2937, #111827)', borderRadius: '16px', padding: '30px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    fontFamily: '"Inter", "Segoe UI", sans-serif', color: 'white', boxSizing: 'border-box'
  };

  const svgStyle = {
    background: '#0f172a', borderRadius: '12px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
    border: '1px solid #334155', width: '100%', height: 'auto', display: 'block'
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        Interactive Try Stage: <span style={{ color: '#60a5fa', textTransform: 'capitalize' }}>{mirrorType}</span> Mirror
      </h3>
      
      <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle}>
        <defs>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Principal Axis */}
        <line x1="0" y1={poleY} x2={width} y2={poleY} stroke="#475569" strokeWidth="2" strokeDasharray="6,6" />
        
        {/* Mirror - Fixed Path. Concave bulges right to wrap around object on left. Convex bulges left. */}
        {mirrorType === 'concave' ? (
          <path d={`M ${poleX-20} ${poleY-150} Q ${poleX+40} ${poleY} ${poleX-20} ${poleY+150}`} stroke="#cbd5e1" strokeWidth="5" fill="none" filter="url(#glow)" />
        ) : (
          <path d={`M ${poleX+20} ${poleY-150} Q ${poleX-40} ${poleY} ${poleX+20} ${poleY+150}`} stroke="#cbd5e1" strokeWidth="5" fill="none" filter="url(#glow)" />
        )}
        <line x1={poleX} y1={poleY-150} x2={poleX} y2={poleY+150} stroke="white" strokeWidth="1" strokeDasharray="2,2" opacity="0.2" />

        {/* F and C */}
        <circle cx={F.x} cy={F.y} r="5" fill="#fde047" filter="url(#glow)" />
        <text x={F.x - 5} y={F.y + 25} fill="#fde047" fontSize="14" fontWeight="bold">F</text>
        <circle cx={C.x} cy={C.y} r="5" fill="#f97316" filter="url(#glow)" />
        <text x={C.x - 5} y={C.y + 25} fill="#f97316" fontSize="14" fontWeight="bold">C</text>

        {/* Flawed Mental Model Image (Red) and "Impossible Rays" */}
        {flawedModel && (
          <g opacity="0.7">
            {/* Impossible Red Rays showing how absurd their mental model is */}
            <line x1={objTip.x} y1={objTip.y} x2={flawedPhysics.imageTip.x} y2={flawedPhysics.imageTip.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
            <line x1={poleX} y1={poleY} x2={flawedPhysics.imageTip.x} y2={flawedPhysics.imageTip.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
            
            <line 
              x1={flawedPhysics.imageBase.x} y1={flawedPhysics.imageBase.y} 
              x2={flawedPhysics.imageTip.x} y2={flawedPhysics.imageTip.y} 
              stroke="#ef4444" strokeWidth="8" markerEnd="url(#arrow-red)" 
              strokeDasharray={flawedModel.isVirtual ? "8,4" : "none"} 
            />
          </g>
        )}

        {/* Actual Physics Rays (Green) */}
        <g>
          {/* Ray 1: Parallel to Principal Axis */}
          {/* Incident Ray 1 */}
          <line 
            x1={ray1_inc_start.x} y1={ray1_inc_start.y} 
            x2={ray1_inc_mid.x} y2={ray1_inc_mid.y} 
            stroke="#10b981" strokeWidth="2.5" 
            markerEnd="url(#arrow-green)" opacity="0.8" 
          />
          <line 
            x1={ray1_inc_mid.x} y1={ray1_inc_mid.y} 
            x2={ray1_hit.x} y2={ray1_hit.y} 
            stroke="#10b981" strokeWidth="2.5" opacity="0.8" 
          />

          {/* Reflected Ray 1 */}
          <line 
            x1={ray1_hit.x} y1={ray1_hit.y} 
            x2={ray1_ref_mid.x} y2={ray1_ref_mid.y} 
            stroke="#10b981" strokeWidth="2.5" 
            markerEnd="url(#arrow-green)" opacity="0.8" 
          />
          <line 
            x1={ray1_ref_mid.x} y1={ray1_ref_mid.y} 
            x2={ray1_ref_end.x} y2={ray1_ref_end.y} 
            stroke="#10b981" strokeWidth="2.5" opacity="0.8" 
          />

          {/* Ray 1 Virtual Extension */}
          {ray1_virtual_end && (
            <line 
              x1={ray1_hit.x} y1={ray1_hit.y} 
              x2={ray1_virtual_end.x} y2={ray1_virtual_end.y} 
              stroke="#10b981" strokeWidth="2" 
              strokeDasharray="6,4" opacity="0.7" 
            />
          )}

          {/* Ray 2: Focus / Center of Curvature Ray */}
          {/* Incident Ray 2 */}
          <line 
            x1={ray2_inc_start.x} y1={ray2_inc_start.y} 
            x2={ray2_inc_mid.x} y2={ray2_inc_mid.y} 
            stroke="#10b981" strokeWidth="2.5" 
            markerEnd="url(#arrow-green)" opacity="0.8" 
          />
          <line 
            x1={ray2_inc_mid.x} y1={ray2_inc_mid.y} 
            x2={ray2_hit.x} y2={ray2_hit.y} 
            stroke="#10b981" strokeWidth="2.5" opacity="0.8" 
          />

          {/* Reflected Ray 2 */}
          <line 
            x1={ray2_hit.x} y1={ray2_hit.y} 
            x2={ray2_ref_mid.x} y2={ray2_ref_mid.y} 
            stroke="#10b981" strokeWidth="2.5" 
            markerEnd="url(#arrow-green)" opacity="0.8" 
          />
          <line 
            x1={ray2_ref_mid.x} y1={ray2_ref_mid.y} 
            x2={ray2_ref_end.x} y2={ray2_ref_end.y} 
            stroke="#10b981" strokeWidth="2.5" opacity="0.8" 
          />

          {/* Ray 2 Focus Helper (alignment guide before/after focus or center) */}
          {ray2_focus_helper_end && (
            <line 
              x1={ray2_inc_start.x} y1={ray2_inc_start.y} 
              x2={ray2_focus_helper_end.x} y2={ray2_focus_helper_end.y} 
              stroke="#10b981" strokeWidth="1.5" 
              strokeDasharray="4,4" opacity="0.5" 
            />
          )}

          {/* Ray 2 Virtual Extension */}
          {ray2_virtual_end && (
            <line 
              x1={ray2_hit.x} y1={ray2_hit.y} 
              x2={ray2_virtual_end.x} y2={ray2_virtual_end.y} 
              stroke="#10b981" strokeWidth="2" 
              strokeDasharray="6,4" opacity="0.7" 
            />
          )}
        </g>

        {/* Actual Physics Image (Green Arrow) */}
        {!physics.properties.isInfinity && (
          <g>
            <line 
              x1={imgBase.x} y1={imgBase.y} 
              x2={imgTip.x} y2={imgTip.y} 
              stroke="#10b981" strokeWidth="8" 
              markerEnd="url(#arrow-green)" 
              strokeDasharray={physics.properties.isVirtual ? "8,4" : "none"} 
            />
            <text 
              x={imgTip.x} 
              y={imgTip.y > poleY ? imgTip.y + 25 : imgTip.y - 15} 
              fill="#10b981" fontSize="14" fontWeight="bold" 
              textAnchor="middle"
            >
              {physics.properties.isVirtual ? "Virtual Image" : "Real Image"}
            </text>
          </g>
        )}

        {/* Physical Object (Blue) */}
        <line x1={objBase.x} y1={objBase.y} x2={objTip.x} y2={objTip.y} stroke="#3b82f6" strokeWidth="8" markerEnd="url(#arrow-blue)" />
        <text x={objTip.x} y={objTip.y - 15} fill="#3b82f6" fontSize="16" fontWeight="bold" textAnchor="middle">Object</text>
      </svg>

      {/* Controls */}
      <div style={{ width: '100%', marginTop: '30px', padding: '0 20px', boxSizing: 'border-box' }}>
        <input 
          type="range" 
          min="10" max="350" value={uDistance} 
          onChange={(e) => setUDistance(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6', height: '6px', background: '#374151', borderRadius: '4px', outline: 'none', direction: 'rtl' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '14px' }}>
          <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Far Left (-350cm)</span>
          <span style={{ background: '#374151', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #4b5563', textAlign: 'center' }}>
            Object Distance: {-uDistance} cm <br/>
            <span style={{ color: '#93c5fd', fontSize: '12px' }}>{positionText}</span>
          </span>
          <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Pole (0cm)</span>
        </div>
      </div>

      {/* Diagnostics Panel */}
      <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '30px', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '15px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#34d399', fontSize: '16px' }}>🟢 The Physics Reality</h4>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#cbd5e1' }}>Image forms at: <strong>{physics.properties.isInfinity ? "Infinity" : `${physics.properties.v.toFixed(1)} cm`}</strong></p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#cbd5e1' }}>Position: <strong>{imagePositionText}</strong></p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#cbd5e1' }}>Nature: <strong>{physics.properties.isVirtual ? "Virtual & Erect" : "Real & Inverted"}</strong> ({sizeText})</p>
        </div>

        {flawedModel && (
          <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#f87171', fontSize: '16px' }}>🔴 Your Flawed Prediction</h4>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#fca5a5' }}>You guessed the image forms at <strong>{flawedModel.v} cm</strong>.</p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#fca5a5' }}><em>Notice how the Red impossible rays violate the laws of reflection!</em></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicMirrorFeedback;
