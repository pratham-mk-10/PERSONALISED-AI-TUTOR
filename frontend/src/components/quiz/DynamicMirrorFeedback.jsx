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

  // Convert key logical points to SVG points using robust direct math
  const objTip = toSVG(-uDistance, objectHeight);
  const objBase = toSVG(-uDistance, 0);
  const imgTip = toSVG(physics.properties.v, physics.properties.hPrime);
  const imgBase = toSVG(physics.properties.v, 0);
  
  const F = toSVG(physics.focus.x, physics.focus.y);
  const C = toSVG(physics.center.x, physics.center.y);

  // Ray Intersection Points on the mirror plane (approximate x=0 for paraxial rays)
  const hit1 = toSVG(0, objectHeight); // Ray 1: Parallel to axis, hits at height h
  
  // Ray 2: Passes through Focus, hits mirror, reflects parallel
  const yHit2 = (objectHeight * physics.properties.f) / (physics.properties.f - (-uDistance));
  const hit2 = toSVG(0, yHit2);
  
  // Ray 3 (Rule 4): Passes through Pole, reflects obliquely
  const hitPole = toSVG(0, 0);

  // Object Position Text Logic
  let positionText = "";
  const u = Math.abs(uDistance);
  const f = Math.abs(focalLength);
  const c = 2 * f;
  
  if (mirrorType === 'concave') {
    if (u > c + 5) positionText = "Beyond C";
    else if (Math.abs(u - c) <= 5) positionText = "At C";
    else if (u > f + 5 && u < c - 5) positionText = "Between C and F";
    else if (Math.abs(u - f) <= 5) positionText = "At F";
    else if (u < f - 5) positionText = "Between F and P";
  } else {
    positionText = "In front of mirror";
  }

  // Image Nature Text Logic
  const m = Math.abs(physics.properties.hPrime / objectHeight);
  let sizeText = "Same Size";
  if (m > 1.05) sizeText = "Magnified";
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

        {/* Actual Physics Image (Green) & Rays */}
        {!physics.properties.isInfinity && (
          <g>
            {/* Green Ray 1: Parallel to Axis -> Through F */}
            <line x1={objTip.x} y1={objTip.y} x2={hit1.x} y2={hit1.y} stroke="#10b981" strokeWidth="2" opacity="0.6" />
            <line 
              x1={hit1.x} y1={hit1.y} 
              x2={physics.properties.isVirtual ? (F.x > poleX ? F.x + 100 : F.x - 100) : imgTip.x} 
              y2={physics.properties.isVirtual ? (F.y > poleY ? F.y + 100 : F.y - 100) : imgTip.y} 
              stroke="#10b981" strokeWidth="2" opacity="0.6" 
              strokeDasharray={physics.properties.isVirtual ? "5,5" : "none"} 
            />
            {/* Green Ray 2: Through Focus -> Parallel */}
            <line x1={objTip.x} y1={objTip.y} x2={hit2.x} y2={hit2.y} stroke="#10b981" strokeWidth="2" opacity="0.6" />
            <line 
              x1={hit2.x} y1={hit2.y} 
              x2={physics.properties.isVirtual ? (hit2.x > poleX ? hit2.x + 100 : hit2.x - 100) : imgTip.x} 
              y2={hit2.y} /* Reflects strictly parallel */
              stroke="#10b981" strokeWidth="2" opacity="0.6" 
              strokeDasharray={physics.properties.isVirtual ? "5,5" : "none"} 
            />
            
            {/* Green Ray 3 (Rule 4): Through Pole -> Equal Angle */}
            <line x1={objTip.x} y1={objTip.y} x2={hitPole.x} y2={hitPole.y} stroke="#10b981" strokeWidth="2" opacity="0.6" />
            <line 
              x1={hitPole.x} y1={hitPole.y} 
              x2={physics.properties.isVirtual ? (imgTip.x > poleX ? imgTip.x + 100 : imgTip.x - 100) : imgTip.x} 
              y2={physics.properties.isVirtual ? (imgTip.y > poleY ? imgTip.y + 100 : imgTip.y - 100) : imgTip.y} 
              stroke="#10b981" strokeWidth="2" opacity="0.6" 
              strokeDasharray={physics.properties.isVirtual ? "5,5" : "none"} 
            />

            <line 
              x1={imgBase.x} y1={imgBase.y} 
              x2={imgTip.x} y2={imgTip.y} 
              stroke="#10b981" strokeWidth="6" markerEnd="url(#arrow-green)" 
              strokeDasharray={physics.properties.isVirtual ? "8,4" : "none"} 
            />
            <text x={imgTip.x} y={imgTip.y > poleY ? imgTip.y + 20 : imgTip.y - 15} fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle">
              {physics.properties.isVirtual ? "Virtual Image" : "Real Image"}
            </text>
          </g>
        )}

        {/* Physical Object (Blue) */}
        <line x1={objBase.x} y1={objBase.y} x2={objTip.x} y2={objTip.y} stroke="#3b82f6" strokeWidth="8" markerEnd="url(#arrow-blue)" filter="url(#glow)" />
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
