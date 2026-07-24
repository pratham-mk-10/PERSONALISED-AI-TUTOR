// ============================================================
// numericalSubtopics.js
// Config objects for the 6 "Numerical Problems" subtopics, all
// consumed by the generic <NumericalChallenge config={...} />
// shell. No LLM anywhere in this file -- every number is either
// the shared, physics-verified 5-row table below, or computed
// deterministically from it via MirrorPhysicsEngine / the two
// rearranged mirror-formula forms (also verified this session
// against the engine's own output for all 5 rows):
//   find f (given u, v): f = (u * v) / (u + v)
//   find u (given f, v): u = (f * v) / (v - f)
// ============================================================

import { MirrorPhysicsEngine } from "../spherical-mirrors/MirrorPhysicsEngine";

export const TOLERANCE = 0.5;
export const round1 = (n) => Math.round(n * 10) / 10;

// The 5 canonical (mirrorType, f, u, h) triples -- every NCERT image-nature
// case, shared verbatim across every numeric subtopic below.
export const SPHERICAL_PROBLEMS = [
  { mirrorType: "concave", f: 10, u: 30, h: 4, region: "beyond C" },
  { mirrorType: "concave", f: 10, u: 20, h: 4, region: "at C" },
  { mirrorType: "concave", f: 10, u: 15, h: 4, region: "between F and C" },
  { mirrorType: "concave", f: 10, u: 5, h: 4, region: "between P and F" },
  { mirrorType: "convex", f: 10, u: 10, h: 4, region: "in front of a convex mirror" },
];

// Plane-mirror problems for Mirror Identification -- NOT run through
// MirrorPhysicsEngine.calculateImage (which only handles concave/convex).
// A plane mirror's rule is simply v = u (behind, virtual), m = +1.
export const PLANE_PROBLEMS = [
  { mirrorType: "plane", u: 20, h: 4, region: "plane mirror" },
  { mirrorType: "plane", u: 12, h: 3, region: "plane mirror" },
];

// Shared correctness source for every subtopic -- handles the plane-mirror
// shortcut, otherwise delegates entirely to MirrorPhysicsEngine.
export const computeCorrectResult = (p) => {
  if (p.mirrorType === "plane") {
    return { u: -p.u, f: null, h: p.h, v: p.u, hPrime: p.h, m: 1, isVirtual: true, isErect: true, isInfinity: false };
  }
  return MirrorPhysicsEngine.calculateImage(p.mirrorType, p.f, p.u, p.h);
};

export const describeImage = (correct) => {
  const kind = correct.isVirtual ? "virtual" : "real";
  const side = correct.isVirtual ? "behind" : "in front of";
  return `a ${kind} image ${Math.abs(round1(correct.v))} cm ${side} the mirror`;
};

// Static catalog text (shared/misconception_tags.json) -- shown instantly on
// the 1st wrong attempt on a tag, no backend round trip needed.
export const STATIC_EXPLANATIONS = {
  mirror_formula_sign_error:
    "When using 1/v + 1/u = 1/f, every known value must first be given its correct sign (u always negative, f negative for concave and positive for convex) before substituting -- substituting an unsigned magnitude gives a wrong answer even if the formula itself is applied correctly.",
  magnification_sign_error:
    "The sign of magnification m = -v/u tells you the image's nature: positive m means virtual and erect, negative m means real and inverted. Getting the sign of v or u wrong, or misreading the sign of m, leads to describing the wrong kind of image.",
  sign_convention_confusion:
    "Under the New Cartesian sign convention, a negative focal length always means concave and a positive focal length always means convex -- read the sign of your computed f directly, rather than guessing the mirror type first and working backward.",
};

// ─── 1. FIND V (migrated as-is from the original MirrorFormulaTryChallenge) ─
export const FIND_V = {
  key: "find-v",
  topicTitle: "Numerical Problems: Find v",
  problems: SPHERICAL_PROBLEMS,
  buildWordProblem: (p) =>
    `A ${p.mirrorType} mirror has a focal length of ${p.f} cm. An object ${p.h} cm tall is placed ${p.u} cm in front of the mirror. Find the position of the image (v).`,
  fastPathType: "numeric",
  fastPathLabel: "Your answer for v (cm, with sign):",
  fastPathPlaceholder: "e.g. -15",
  checkFastPath: (correct, studentValue) => Math.abs(studentValue - correct.v) <= TOLERANCE,
  correctBannerText: (correct, p) =>
    `Correct — v = ${correct.v} cm. This image is ${correct.isVirtual ? "virtual" : "real"} and ${correct.hPrime > 0 ? "erect" : "inverted"} (${p.region}).`,
  bonusCheck: {
    question: "Is this image erect or inverted?",
    choices: [{ label: "Erect (upright)", value: true }, { label: "Inverted (upside-down)", value: false }],
    evaluate: (correct, studentSaysErect) => {
      const actuallyErect = correct.hPrime > 0;
      if (studentSaysErect === actuallyErect) return null;
      return {
        tag: "magnification_sign_error",
        brokenField: "nature",
        flawedModel: { v: correct.v, hPrime: -correct.hPrime, isVirtual: correct.isVirtual },
      };
    },
  },
  breakdownFields: [
    { key: "enteredU", label: "What did you substitute for u?", placeholder: "e.g. -30" },
    { key: "enteredF", label: "What did you substitute for f?", placeholder: "e.g. -10" },
  ],
  diagnoseBreakdown: (correct, values, studentValue) => {
    const eU = values.enteredU, eF = values.enteredF;
    const uSignWrong = Math.sign(eU) !== Math.sign(correct.u);
    const fSignWrong = Math.sign(eF) !== Math.sign(correct.f);
    if (uSignWrong || fSignWrong) {
      const impliedV = (eF * eU) / (eU - eF);
      const impliedM = -impliedV / eU;
      return {
        tag: "mirror_formula_sign_error",
        brokenField: uSignWrong ? "u" : "f",
        enteredU: eU,
        enteredF: eF,
        flawedModel: { v: round1(impliedV), hPrime: round1(impliedM * correct.h), isVirtual: impliedV > 0 },
      };
    }
    return {
      tag: null,
      brokenField: "arithmetic",
      flawedModel: { v: studentValue, hPrime: round1((-studentValue / correct.u) * correct.h), isVirtual: studentValue > 0 },
    };
  },
  brokenFieldSentence: (diagnosis, correct, p) => {
    if (diagnosis.brokenField === "u") {
      return `You substituted u = ${diagnosis.enteredU} here, but the sign convention always makes object distance negative (u should have been ${correct.u} cm) — see how that shifts your red image to the wrong side entirely.`;
    }
    if (diagnosis.brokenField === "f") {
      const expectedSign = correct.f < 0 ? "negative" : "positive";
      return `You substituted f = ${diagnosis.enteredF} here, but for a ${p.mirrorType} mirror f must be ${expectedSign} (f = ${correct.f} cm) — that's why your red image lands in the wrong place.`;
    }
    if (diagnosis.brokenField === "nature") {
      const actuallyErect = correct.hPrime > 0;
      return `You got the image position exactly right (v = ${correct.v} cm) but misjudged its orientation — this image is actually ${actuallyErect ? "erect" : "inverted"}, not ${actuallyErect ? "inverted" : "erect"}.`;
    }
    return `Your signs were correct (u = ${correct.u} cm, f = ${correct.f} cm) but the arithmetic slipped somewhere — recompute 1/v = 1/f − 1/u using these exact signed values. The correct answer is v = ${correct.v} cm.`;
  },
};

// ─── 2. FIND M / HEIGHT (u, f, h all given directly) ────────────
export const FIND_M = {
  key: "find-m",
  topicTitle: "Numerical Problems: Find Height / Magnification",
  problems: SPHERICAL_PROBLEMS,
  buildWordProblem: (p) =>
    `A ${p.mirrorType} mirror has a focal length of ${p.f} cm. An object ${p.h} cm tall is placed ${p.u} cm in front of the mirror. Find the height of the image (h').`,
  fastPathType: "numeric",
  fastPathLabel: "Your answer for h' (cm, with sign; positive = erect, negative = inverted):",
  fastPathPlaceholder: "e.g. -2",
  checkFastPath: (correct, studentValue) => Math.abs(studentValue - correct.hPrime) <= TOLERANCE,
  correctBannerText: (correct, p) =>
    `Correct — h' = ${correct.hPrime} cm (m = ${correct.m}). This image is ${correct.isVirtual ? "virtual" : "real"} and ${correct.hPrime > 0 ? "erect" : "inverted"} (${p.region}).`,
  breakdownFields: [
    { key: "enteredV", label: "What did you compute for v?", placeholder: "e.g. -15" },
    { key: "enteredHPrime", label: "What magnification/height did you use to get h'?", placeholder: "e.g. 2" },
  ],
  diagnoseBreakdown: (correct, values, studentValue) => {
    const eV = values.enteredV, eHPrime = values.enteredHPrime;
    const vWrong = Math.abs(eV - correct.v) > TOLERANCE;
    if (vWrong) {
      return {
        tag: "mirror_formula_sign_error",
        brokenField: "v",
        enteredV: eV,
        flawedModel: { v: eV, hPrime: studentValue, isVirtual: eV > 0 },
      };
    }
    return {
      tag: "magnification_sign_error",
      brokenField: "hPrime",
      flawedModel: { v: correct.v, hPrime: studentValue, isVirtual: correct.isVirtual },
    };
  },
  brokenFieldSentence: (diagnosis, correct) => {
    if (diagnosis.brokenField === "v") {
      return `Before magnification even comes in, your image position itself was off — you used v = ${diagnosis.enteredV} cm, but it should be v = ${correct.v} cm. Re-derive v first (1/v = 1/f − 1/u), then recompute h' = m × h from the correct v.`;
    }
    return `Your image position v = ${correct.v} cm was right, but the height's sign or magnitude is off — h' = m × h with m = -v/u = ${correct.m}, so h' should be ${correct.hPrime} cm, not ${diagnosis.flawedModel.hPrime} cm.`;
  },
};

// ─── 3. FIND F (given u and the image's stated nature/position) ─
export const FIND_F = {
  key: "find-f",
  topicTitle: "Numerical Problems: Find f",
  problems: SPHERICAL_PROBLEMS,
  buildWordProblem: (p) => {
    const correct = computeCorrectResult(p);
    return `A ${p.mirrorType} mirror forms ${describeImage(correct)}, for an object ${p.h} cm tall placed ${p.u} cm from the mirror. Find the focal length (f).`;
  },
  fastPathType: "numeric",
  fastPathLabel: "Your answer for f (cm, with sign):",
  fastPathPlaceholder: "e.g. -10",
  checkFastPath: (correct, studentValue) => Math.abs(studentValue - correct.f) <= TOLERANCE,
  correctBannerText: (correct) => `Correct — f = ${correct.f} cm.`,
  bonusCheck: {
    question: "Is this mirror concave or convex?",
    choices: [{ label: "Concave", value: "concave" }, { label: "Convex", value: "convex" }],
    evaluate: (correct, studentAnswer) => {
      const actual = correct.f < 0 ? "concave" : "convex";
      if (studentAnswer === actual) return null;
      return { tag: "sign_convention_confusion", brokenField: "mirrorType", flawedModel: null };
    },
  },
  breakdownFields: [
    { key: "enteredU", label: "What did you substitute for u?", placeholder: "e.g. -30" },
    { key: "enteredV", label: "What did you substitute for v?", placeholder: "e.g. -15" },
  ],
  diagnoseBreakdown: (correct, values, studentValue, p) => {
    const eU = values.enteredU, eV = values.enteredV;
    const uSignWrong = Math.sign(eU) !== Math.sign(correct.u);
    const vSignWrong = Math.sign(eV) !== Math.sign(correct.v);
    let impliedF;
    if (uSignWrong || vSignWrong) {
      impliedF = (eU * eV) / (eU + eV);
    } else {
      impliedF = studentValue;
    }
    const tag = uSignWrong || vSignWrong ? "mirror_formula_sign_error" : null;
    const brokenField = uSignWrong ? "u" : vSignWrong ? "v" : "arithmetic";
    if (!Number.isFinite(impliedF)) {
      // eU + eV = 0 (e.g. forgetting the sign on v when |u| = |v|, the "at C" case) ->
      // the implied focal length is infinite, which isn't a real mirror. Explain in
      // words instead of trying to render an infinite-focal-length visual.
      return { tag, brokenField: "infinite", enteredU: eU, enteredV: eV, flawedModel: null };
    }
    const wrongResult = MirrorPhysicsEngine.calculateImage(p.mirrorType, Math.abs(impliedF), Math.abs(correct.u), p.h);
    return {
      tag,
      brokenField,
      enteredU: eU,
      enteredV: eV,
      impliedF: round1(impliedF),
      flawedModel: { v: round1(wrongResult.v), hPrime: round1(wrongResult.hPrime), isVirtual: wrongResult.v > 0 },
    };
  },
  brokenFieldSentence: (diagnosis, correct, p) => {
    if (diagnosis.brokenField === "infinite") {
      return `Your values (u = ${diagnosis.enteredU}, v = ${diagnosis.enteredV}) would require an infinite focal length -- not a real mirror. That's a strong sign one of the signs is flipped: u should be ${correct.u} cm and v should be ${correct.v} cm here.`;
    }
    if (diagnosis.brokenField === "u") {
      return `You substituted u = ${diagnosis.enteredU} here, but object distance is always negative (u should have been ${correct.u} cm) — if the mirror actually had the focal length you calculated (f = ${diagnosis.impliedF} cm), the image would form where the red arrow is, not where the problem said it does.`;
    }
    if (diagnosis.brokenField === "v") {
      return `You substituted v = ${diagnosis.enteredV} here, but based on "${describeImage(correct)}", v should have been ${correct.v} cm — that sign flip is why your implied focal length (f = ${diagnosis.impliedF} cm) puts the red image in the wrong place.`;
    }
    return `Your signs were correct (u = ${correct.u} cm, v = ${correct.v} cm) but the arithmetic slipped — recompute f = (u × v) / (u + v) using these exact signed values. The correct answer is f = ${correct.f} cm.`;
  },
};

// ─── 4. FIND U (given f and the image's stated nature/position) ─
export const FIND_U = {
  key: "find-u",
  topicTitle: "Numerical Problems: Find u",
  problems: SPHERICAL_PROBLEMS,
  buildWordProblem: (p) => {
    const correct = computeCorrectResult(p);
    return `A ${p.mirrorType} mirror of focal length ${p.f} cm forms ${describeImage(correct)}, for an object ${p.h} cm tall. Find how far the object was placed from the mirror (u).`;
  },
  fastPathType: "numeric",
  fastPathLabel: "Your answer for u (cm, with sign):",
  fastPathPlaceholder: "e.g. -30",
  checkFastPath: (correct, studentValue) => Math.abs(studentValue - correct.u) <= TOLERANCE,
  correctBannerText: (correct) => `Correct — u = ${correct.u} cm.`,
  breakdownFields: [
    { key: "enteredF", label: "What did you substitute for f?", placeholder: "e.g. -10" },
    { key: "enteredV", label: "What did you substitute for v?", placeholder: "e.g. -15" },
  ],
  diagnoseBreakdown: (correct, values, studentValue, p) => {
    const eF = values.enteredF, eV = values.enteredV;
    const fSignWrong = Math.sign(eF) !== Math.sign(correct.f);
    const vSignWrong = Math.sign(eV) !== Math.sign(correct.v);
    let impliedU;
    if (fSignWrong || vSignWrong) {
      impliedU = (eF * eV) / (eV - eF);
    } else {
      impliedU = studentValue;
    }
    const tag = fSignWrong || vSignWrong ? "mirror_formula_sign_error" : null;
    const brokenField = fSignWrong ? "f" : vSignWrong ? "v" : "arithmetic";
    if (!Number.isFinite(impliedU)) {
      // eV = eF (e.g. flipping v's sign when |v| = |f|) -> the implied object
      // distance is infinite. Explain in words instead of an infinite visual.
      return { tag, brokenField: "infinite", enteredF: eF, enteredV: eV, flawedModel: null };
    }
    const wrongResult = MirrorPhysicsEngine.calculateImage(p.mirrorType, Math.abs(correct.f), Math.abs(impliedU), p.h);
    return {
      tag,
      brokenField,
      enteredF: eF,
      enteredV: eV,
      impliedU: round1(impliedU),
      flawedModel: { v: round1(wrongResult.v), hPrime: round1(wrongResult.hPrime), isVirtual: wrongResult.v > 0 },
    };
  },
  brokenFieldSentence: (diagnosis, correct, p) => {
    if (diagnosis.brokenField === "infinite") {
      return `Your values (f = ${diagnosis.enteredF}, v = ${diagnosis.enteredV}) would put the object infinitely far away -- not physical here. That's a strong sign one of the signs is flipped: f should be ${correct.f} cm and v should be ${correct.v} cm.`;
    }
    const base = diagnosis.brokenField === "f"
      ? `You substituted f = ${diagnosis.enteredF} here, but for a ${p.mirrorType} mirror f should have been ${correct.f} cm.`
      : diagnosis.brokenField === "v"
        ? `You substituted v = ${diagnosis.enteredV} here, but based on "${describeImage(correct)}", v should have been ${correct.v} cm.`
        : `Your signs were correct (f = ${correct.f} cm, v = ${correct.v} cm) but the arithmetic slipped — recompute u = (f × v) / (v − f).`;
    return `${base} If the object were actually placed at u = ${diagnosis.impliedU} cm (what your numbers imply), the image would form where the red arrow is — not at the position the problem described. The correct object distance is u = ${correct.u} cm.`;
  },
};

// ─── 5. MIRROR IDENTIFICATION (given u, v -> concave/convex/plane) ─
export const MIRROR_ID = {
  key: "mirror-id",
  topicTitle: "Numerical Problems: Mirror Identification",
  problems: [...SPHERICAL_PROBLEMS, ...PLANE_PROBLEMS],
  buildWordProblem: (p) => {
    const correct = computeCorrectResult(p);
    return `An object ${p.h} cm tall is placed ${p.u} cm from an unknown mirror, forming ${describeImage(correct)}. What type of mirror is it?`;
  },
  fastPathType: "choice",
  fastPathLabel: "What type of mirror is this?",
  fastPathChoices: [
    { label: "Concave", value: "concave" },
    { label: "Convex", value: "convex" },
    { label: "Plane", value: "plane" },
  ],
  checkFastPath: (correct, studentValue, p) => studentValue === p.mirrorType,
  correctBannerText: (correct, p) => `Correct — this is a ${p.mirrorType} mirror.`,
  breakdownFields: [
    { key: "enteredU", label: "What did you use for u?", placeholder: "e.g. -30" },
    { key: "enteredV", label: "What did you use for v?", placeholder: "e.g. -15" },
  ],
  diagnoseBreakdown: (correct, values, studentValue, p) => {
    if (p.mirrorType === "plane") {
      return {
        tag: null,
        brokenField: "plane",
        flawedModel: null,
      };
    }
    const eU = values.enteredU, eV = values.enteredV;
    const uSignWrong = Math.sign(eU) !== Math.sign(correct.u);
    const vSignWrong = Math.sign(eV) !== Math.sign(correct.v);
    const impliedF = (eU * eV) / (eU + eV);
    const tag = uSignWrong || vSignWrong ? "mirror_formula_sign_error" : null;
    const brokenField = uSignWrong ? "u" : vSignWrong ? "v" : "arithmetic";
    if (!Number.isFinite(impliedF)) {
      return { tag, brokenField: "infinite", enteredU: eU, enteredV: eV, flawedModel: null };
    }
    const impliedType = impliedF < 0 ? "concave" : "convex";
    const wrongResult = MirrorPhysicsEngine.calculateImage(p.mirrorType, Math.abs(impliedF), Math.abs(correct.u), p.h);
    return {
      tag,
      brokenField,
      impliedF: round1(impliedF),
      impliedType,
      flawedModel: { v: round1(wrongResult.v), hPrime: round1(wrongResult.hPrime), isVirtual: wrongResult.v > 0 },
    };
  },
  brokenFieldSentence: (diagnosis, correct, p) => {
    if (diagnosis.brokenField === "plane") {
      return `A plane mirror always has |v| = |u| with a virtual, same-size image (m = +1) — here u = ${p.u} cm and the image is ${p.u} cm behind the mirror, which only a plane mirror does. A curved mirror's image distance changes with object distance; a plane mirror's never does.`;
    }
    if (diagnosis.brokenField === "infinite") {
      return `Your values (u = ${diagnosis.enteredU}, v = ${diagnosis.enteredV}) would require an infinite focal length -- not a real mirror. Check your signs: u should be ${correct.u} cm and v should be ${correct.v} cm here.`;
    }
    return `Your numbers imply f = ${diagnosis.impliedF} cm, which would make this a ${diagnosis.impliedType} mirror — but it's actually ${p.mirrorType}. Check the signs you used for u and v against the sign convention.`;
  },
};

// ─── 6. COMBINED (find v, mandatory nature + magnification check) ─
export const COMBINED = {
  ...FIND_V,
  key: "combined",
  topicTitle: "Numerical Problems: Combined",
  buildWordProblem: (p) =>
    `A ${p.mirrorType} mirror has a focal length of ${p.f} cm. An object ${p.h} cm tall is placed ${p.u} cm in front of the mirror. Find v, the magnification m, and fully describe the image (real/virtual, erect/inverted, magnified/diminished).`,
};
