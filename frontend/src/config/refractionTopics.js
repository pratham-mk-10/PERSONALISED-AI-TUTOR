// Refraction curriculum session config — tell / show / quiz stages per topic

export const REFRACTION_TOPICS = {
  "refraction-intro": {
    tell: "rfIntroTell",
    show: "rfIntroShow",
    quiz: "rfIntroQuiz",
    nextTell: "rfSnellTell",
    title: "Introduction to Refraction",
    tellSummary: "Refraction is the bending of light when it crosses the boundary between two transparent mediums of different optical densities.",
    formula: "Light bends toward the Normal when entering a denser medium.",
    Animation: null, // set in App imports
  },
  "refraction-snells-law": {
    tell: "rfSnellTell",
    show: "rfSnellShow",
    quiz: "rfSnellQuiz",
    nextTell: "rfGlassTell",
    title: "Laws of Refraction (Snell's Law)",
    tellSummary: "The laws of refraction relate angle of incidence, angle of refraction, and refractive indices.",
    formula: "n₁ sin i = n₂ sin r",
  },
  "refraction-glass-slab": {
    tell: "rfGlassTell",
    show: "rfGlassShow",
    quiz: "rfGlassQuiz",
    nextTell: "rfLensesTell",
    title: "Refraction Through a Glass Slab",
    tellSummary: "A rectangular glass slab refracts light twice. The emergent ray is parallel to the incident ray with lateral displacement.",
    formula: "Emergent ray ∥ incident ray (parallel surfaces)",
  },
  "refraction-lenses": {
    tell: "rfLensesTell",
    show: "rfLensesShow",
    quiz: "rfLensesQuiz",
    nextTell: "rfLensImgTell",
    title: "Spherical Lenses",
    tellSummary: "Convex lenses converge light; concave lenses diverge light. Key points: optical centre O, principal focus F, focal length f.",
    formula: "Convex: f > 0  |  Concave: f < 0",
  },
  "refraction-lens-images": {
    tell: "rfLensImgTell",
    show: "rfLensImgShow",
    quiz: "rfLensImgQuiz",
    nextTell: "rfLensFormulaTell",
    title: "Image Formation by Lenses",
    tellSummary: "Convex lenses form real or virtual images depending on object position. Concave lenses always form virtual, erect, diminished images.",
    formula: "Use ray rules: parallel→F, through O undeviated",
  },
  "refraction-lens-formula": {
    tell: "rfLensFormulaTell",
    show: "rfLensFormulaShow",
    quiz: "rfLensFormulaQuiz",
    nextTell: null,
    title: "Lens Formula & Power",
    tellSummary: "The lens formula relates object distance, image distance, and focal length. Power is the reciprocal of focal length in metres.",
    formula: "1/v − 1/u = 1/f   |   P = 1/f (dioptre)",
  },
};

export const REFRACTION_TOPIC_ORDER = [
  "refraction-intro",
  "refraction-snells-law",
  "refraction-glass-slab",
  "refraction-lenses",
  "refraction-lens-images",
  "refraction-lens-formula",
];

export const REFRACTION_STAGES = REFRACTION_TOPIC_ORDER.flatMap((id) => {
  const t = REFRACTION_TOPICS[id];
  return [t.tell, t.show, t.quiz];
});

export function getRefractionStagesForTopic(topicId) {
  const t = REFRACTION_TOPICS[topicId];
  if (!t) return [];
  return [t.tell, t.show, t.quiz];
}

export function topicIdFromStage(stage) {
  return REFRACTION_TOPIC_ORDER.find((id) => {
    const t = REFRACTION_TOPICS[id];
    return t.tell === stage || t.show === stage || t.quiz === stage;
  });
}
