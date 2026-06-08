// Physics calculations for the 8 cases of Spherical Mirrors
// Uses exact Cartesian paraxial optics

export const getMirrorCaseData = (caseId) => {
  const AXIS_Y = 250;
  
  // Base configuration
  let mirrorType = 'concave';
  let f = -100;
  let poleX = 650;
  let u = 0;
  let h = 80;
  
  let title = "";
  let resultLines = [];
  
  let ray1Type = 'parallel';
  let ray2Type = 'focus';
  
  switch(caseId) {
    case 'concave-infinity':
      u = -10000; // approximation
      title = "Case 1: Object at Infinity (Concave)";
      resultLines = ["Image forms at Focus (F).", "Real, Inverted, and Highly Diminished (Point size)."];
      ray2Type = 'pole'; // Let's use parallel rays from infinity. Wait, for infinity, we just draw two parallel rays. Let's handle 'infinity' specially.
      break;
    case 'concave-beyond-c':
      u = -300;
      title = "Case 2: Object Beyond C (Concave)";
      resultLines = ["Image forms Between C and F.", "Real, Inverted, and Diminished."];
      break;
    case 'concave-at-c':
      u = -200;
      title = "Case 3: Object At C (Concave)";
      resultLines = ["Image forms exactly at C.", "Real, Inverted, and Same Size."];
      break;
    case 'concave-between-c-f':
      u = -150;
      title = "Case 4: Object Between C and F (Concave)";
      resultLines = ["Image forms Beyond C.", "Real, Inverted, and Magnified."];
      break;
    case 'concave-at-f':
      u = -100;
      title = "Case 5: Object At F (Concave)";
      resultLines = ["Reflected rays are parallel. Image forms at Infinity.", "Real, Inverted, and Highly Magnified."];
      ray2Type = 'center'; // Can't draw ray through F
      break;
    case 'concave-between-p-f':
      u = -50;
      h = 60; // smaller so image fits
      title = "Case 6: Object Between P and F (Concave)";
      resultLines = ["Rays diverge. Image forms Behind the Mirror.", "Virtual, Erect, and Magnified."];
      ray2Type = 'center';
      break;
    case 'convex-infinity':
      mirrorType = 'convex';
      f = 100;
      poleX = 350;
      u = -10000;
      title = "Case 7: Object at Infinity (Convex)";
      resultLines = ["Rays diverge. Image forms at Virtual Focus (F).", "Virtual, Erect, and Highly Diminished."];
      break;
    case 'convex-finite':
      mirrorType = 'convex';
      f = 100;
      poleX = 350;
      u = -200;
      title = "Case 8: Object anywhere between Infinity and Pole (Convex)";
      resultLines = ["Image forms Between P and F behind the mirror.", "Virtual, Erect, and Diminished."];
      ray2Type = 'center';
      break;
  }

  // Calculate coordinates
  const F_X = poleX + f;
  const C_X = poleX + 2 * f;
  
  const objX = poleX + u;
  const objY = AXIS_Y;
  const objTopY = AXIS_Y - h;

  let v = 0;
  let m = 0;
  let imgX = 0;
  let imgHeight = 0;
  let imgTopY = 0;
  
  if (u === -10000) {
    v = f;
    m = 0;
    imgX = poleX + v;
    imgHeight = 0;
    imgTopY = AXIS_Y;
  } else if (u === f) {
    v = -10000;
    m = -10000;
    imgX = -10000;
    imgHeight = 10000;
    imgTopY = 10000;
  } else {
    v = (u * f) / (u - f);
    m = -v / u;
    imgX = poleX + v;
    imgHeight = Math.abs(m * h);
    imgTopY = m > 0 ? AXIS_Y - imgHeight : AXIS_Y + imgHeight;
  }

  const isVirtualImage = m > 0;

  // Ray 1: Parallel to axis
  let r1IncStart, r1Hit, r1RefEnd, r1VirtualEnd;
  if (u === -10000) {
    // Top ray parallel
    r1IncStart = { x: poleX - 300, y: AXIS_Y - 50 };
    r1Hit = { x: poleX, y: AXIS_Y - 50 };
  } else {
    r1IncStart = { x: objX, y: objTopY };
    r1Hit = { x: poleX, y: objTopY };
  }
  
  // Ray 1 reflects through F (or diverges from F)
  // line through r1Hit and F_X
  if (mirrorType === 'concave') {
    const slope = (AXIS_Y - r1Hit.y) / (F_X - poleX);
    r1RefEnd = { x: poleX - 400, y: r1Hit.y + slope * (-400) };
    if (isVirtualImage) r1VirtualEnd = { x: imgX + 100, y: r1Hit.y + slope * (imgX + 100 - poleX) };
  } else {
    // Convex: diverges from F (F is behind mirror)
    const slope = (AXIS_Y - r1Hit.y) / (F_X - poleX);
    r1RefEnd = { x: poleX - 300, y: r1Hit.y + slope * (-300) };
    r1VirtualEnd = { x: F_X, y: AXIS_Y };
  }

  // Ray 2
  let r2IncStart, r2Hit, r2RefEnd, r2VirtualEnd;
  
  if (u === -10000) {
    // Bottom ray parallel
    r2IncStart = { x: poleX - 300, y: AXIS_Y + 50 };
    r2Hit = { x: poleX, y: AXIS_Y + 50 };
    if (mirrorType === 'concave') {
      const slope = (AXIS_Y - r2Hit.y) / (F_X - poleX);
      r2RefEnd = { x: poleX - 400, y: r2Hit.y + slope * (-400) };
    } else {
      const slope = (AXIS_Y - r2Hit.y) / (F_X - poleX);
      r2RefEnd = { x: poleX - 300, y: r2Hit.y + slope * (-300) };
      r2VirtualEnd = { x: F_X, y: AXIS_Y };
    }
  } else if (ray2Type === 'focus') {
    // Through F -> Parallel
    r2IncStart = { x: objX, y: objTopY };
    const slope = (AXIS_Y - objTopY) / (F_X - objX);
    const hitY = objTopY + slope * (poleX - objX);
    r2Hit = { x: poleX, y: hitY };
    r2RefEnd = { x: poleX - 400, y: hitY };
  } else if (ray2Type === 'center') {
    // From/To Center -> Reflects back
    r2IncStart = { x: objX, y: objTopY };
    const slope = (AXIS_Y - objTopY) / (C_X - objX);
    const hitY = objTopY + slope * (poleX - objX);
    r2Hit = { x: poleX, y: hitY };
    r2RefEnd = { x: poleX - 400, y: hitY + slope * (-400) };
    if (mirrorType === 'concave') {
      if (isVirtualImage) r2VirtualEnd = { x: C_X, y: AXIS_Y };
    } else {
      r2VirtualEnd = { x: C_X, y: AXIS_Y };
    }
  }

  return {
    title,
    resultLines,
    mirrorType,
    poleX,
    AXIS_Y,
    F_X,
    C_X,
    objX,
    objTopY,
    h,
    v,
    imgX,
    imgTopY,
    imgHeight,
    isVirtualImage,
    u,
    r1IncStart, r1Hit, r1RefEnd, r1VirtualEnd,
    r2IncStart, r2Hit, r2RefEnd, r2VirtualEnd,
    ray2Type
  };
};
