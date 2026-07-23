import React, { useEffect, useState, useRef } from "react";
import QuizCard from "./QuizCard";
import {
  getMisconceptionReason,
  getGeneratedQuestions,
  getMisconceptionQuiz,
  submitAnswers,
  getDescriptiveQuestions,
  evalDescriptiveAnswer,
  BASE_URL,
} from "../../services/api";
import { useSessionStore } from "../../state/sessionStore";
import QuizVisualCorrection from "./QuizVisualCorrection";


const QUESTION_HISTORY_KEY = "apt_seen_question_ids";

const TOPIC_CONTEXTS = {
  "intro-light": {
    title: "Introduction to Light",
    videoTemplate: "IntroToLightAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9 preliminaries only. Keep questions limited to: what light is, luminous vs non-luminous objects, transparent vs translucent vs opaque materials, rectilinear propagation of light, and the difference between a ray and a beam (parallel, convergent, divergent). Do NOT include reflection laws, mirrors, refraction, or lenses.",
    taughtConcepts: [
      "light is a form of energy that enables sight",
      "luminous objects give out their own light, non-luminous objects only reflect light",
      "transparent, translucent, and opaque materials",
      "rectilinear propagation of light and shadows",
      "a ray is a single line of light, a beam is a bundle of rays (parallel, convergent, or divergent)",
    ],
    untaughtConcepts: [
      "laws of reflection",
      "plane or spherical mirrors",
      "mirror formula",
      "refraction",
      "lenses",
    ],
  },
  "laws-reflection": {
    title: "Laws of Reflection",
    videoTemplate: "ReflectionMisconceptionFeedback",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Focus on the full reflection lesson as one topic: the angle of incidence equals the angle of reflection, and the incident ray, reflected ray, and normal lie in the same plane. Use ray-diagram ideas and the lesson video examples, but do NOT include image formation by mirrors, spherical mirrors, mirror formula, magnification, refraction, lenses, or numerical problems.",
    lessonFocus:
      "Lesson video focus: one unified reflection topic covering both laws together, using plane-mirror ray diagrams, the normal, angle measurements from the normal, and the coplanarity rule.",
    taughtConcepts: [
      "angle of incidence is measured from the normal",
      "angle of reflection is measured from the normal",
      "angle of incidence equals angle of reflection",
      "incident ray, reflected ray and normal lie in the same plane",
      "basic ray-diagram reasoning for laws of reflection",
    ],
    untaughtConcepts: [
      "spherical mirror image formation",
      "mirror formula",
      "magnification formula",
      "refraction",
      "lenses",
    ],
  },
  "plane-mirror": {
    title: "Plane Mirror Basics",
    videoTemplate: "PlaneMirrorBasicsAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to plane mirror image characteristics, laws of reflection, and related Class 10 NCERT ideas.",
    taughtConcepts: [
      "image in a plane mirror is virtual and erect",
      "image size equals object size in a plane mirror",
      "image distance equals object distance from the mirror",
      "lateral inversion in plane mirror",
      "regular reflection vs diffused reflection, and that individual rays obey the law of reflection in both",
      "laws of reflection in plane mirror context",
      "why AMBULANCE is written reversed (lateral inversion in a rear-view mirror)",
      "symmetric letters (A, H, I, M, O, T, U) that look identical to their own mirror image, vs asymmetric letters that flip",
      "multiple images formed by two plane mirrors at an angle: number of images = (360/theta) - 1",
      "kaleidoscope (two mirrors at 60 degrees) and periscope (two mirrors at 45 degrees) as applications of plane mirror reflection",
    ],
    untaughtConcepts: [
      "spherical mirrors",
      "mirror formula",
      "magnification by spherical mirrors",
      "refraction",
      "lenses",
    ],
  },
  "real-virtual-images": {
    title: "Real vs Virtual Images",
    videoTemplate: "RealVsVirtualImagesAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to the general distinction between real and virtual images: whether light rays actually converge or only appear to, whether the image can be captured on a screen, and whether it is inverted or erect. Do NOT include spherical mirror image-formation cases, mirror formula, magnification, sign convention, refraction, or lenses.",
    taughtConcepts: [
      "a real image forms where light rays actually converge and can be caught on a screen",
      "a real image is inverted",
      "a virtual image forms where light rays only appear to diverge from, traced backward",
      "a virtual image cannot be caught on a screen and is erect",
    ],
    untaughtConcepts: [
      "spherical mirror image formation cases",
      "mirror formula",
      "magnification",
      "sign convention",
      "refraction",
      "lenses",
    ],
  },
  "spherical-mirror-basics": {
    title: "Spherical Mirror Basics",
    videoTemplate: "SphericalMirrorBasicsWatch",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to introductory spherical mirror ideas only: what spherical mirrors are, concave vs convex mirror identification, and basic terms such as pole, principal axis, centre of curvature, principal focus, and focal length. Do NOT include mirror formula, magnification calculations, detailed image-formation cases, sign convention, or advanced numericals.",
    lessonFocus:
      "Lesson video focus: spherical mirrors as a combined topic, including concave and convex mirrors, principal focus, centre of curvature, pole, focal length, and the common image-forming behavior of each mirror.",
    taughtConcepts: [
      "definition of spherical mirror",
      "difference between concave and convex mirrors",
      "concave mirror properties and reflecting surface",
      "convex mirror properties and reflecting surface",
      "pole, principal axis, centre of curvature",
      "principal focus and focal length basic meaning",
      "radius of curvature and focal length relation R=2f",
      "basic everyday uses of concave and convex mirrors",
      "distinguishing concave, convex, and plane mirrors by the reflection (magnified/diminished/same size), by touch (depressed vs bulging), and the spoon analogy",
    ],
    untaughtConcepts: [
      "mirror formula",
      "magnification formula",
      "sign convention",
      "complex image formation cases for different object positions",
      "numerical problems on spherical mirrors",
      "plane mirrors",
      "laws of reflection",
      "rules of ray tracing",
      "parallel ray reflecting through focus",
      "focus ray reflecting parallel",
      "centre of curvature ray retracing path",
    ],
  },
  "spherical-mirror-rules": {
    title: "Ray Tracing Rules of Spherical Mirrors",
    videoTemplate: "SphericalMirrorBasicsWatch",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to the rules of ray tracing for spherical mirrors: a ray parallel to principal axis passing through focus, a ray passing through focus reflecting parallel, and a ray passing through centre of curvature retracing its path. Do NOT include mirror formula, magnification, detailed object placements, or sign convention.",
    lessonFocus:
      "Lesson video focus: the 3 main ray tracing rules for concave and convex mirrors.",
    taughtConcepts: [
      "rules of ray tracing for spherical mirrors",
      "parallel ray reflecting through focus",
      "focus ray reflecting parallel to principal axis",
      "centre of curvature ray retracing its path",
    ],
    untaughtConcepts: [
      "mirror formula",
      "magnification formula",
      "sign convention",
      "complex image formation cases for different object positions",
      "plane mirrors",
      "laws of reflection",
      "definition of spherical mirror",
      "difference between concave and convex mirrors",
      "pole, principal axis, centre of curvature",
      "radius of curvature and focal length relation R=2f",
      "everyday uses of concave and convex mirrors",
    ],
  },
  "spherical-mirror-image-formation": {
    title: "Image Formation by Spherical Mirrors",
    videoTemplate: "SphericalMirrorBasicsWatch",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to image formation by concave and convex mirrors for different object positions, real vs virtual images, inverted vs erect images, and size characteristics. Do NOT include mirror formula, magnification calculations, sign convention, or advanced numericals.",
    lessonFocus:
      "Lesson video focus: ray tracing rules for image formation and the 6 concave + 2 convex mirror object placement positions.",
    taughtConcepts: [
      "rules of ray tracing for spherical mirrors",
      "concave mirror image formation for different object positions",
      "convex mirror image formation for different object positions",
      "real and inverted images formed by concave mirrors",
      "virtual and erect images formed by concave and convex mirrors",
    ],
    untaughtConcepts: [
      "plane mirrors",
      "laws of reflection",
      "mirror formula",
      "magnification formula",
      "sign convention",
      "refraction",
      "lenses",
      "definition of spherical mirror",
      "difference between concave and convex mirrors",
      "pole, principal axis, centre of curvature",
      "radius of curvature and focal length relation R=2f",
      "everyday uses of concave and convex mirrors",
    ],
  },
  "spherical-mirror-uses": {
    title: "Uses of Concave and Convex Mirrors",
    videoTemplate: "SphericalMirrorUsesAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to WHY specific mirrors are used for specific devices: shaving/makeup mirrors and dentist's mirrors (concave, object between focus and pole, magnified virtual image), torches/headlights/searchlights (concave, bulb at focus, parallel reflected beam), solar furnaces/cookers (concave, parallel incoming rays converge at focus), and rear-view/side mirrors (convex, always virtual/erect/diminished image, wider field of view). Do NOT include mirror formula, magnification calculations, sign convention, or numericals.",
    lessonFocus:
      "Lesson video focus: reasoning from already-known image-formation cases to explain why each device uses concave or convex mirrors specifically.",
    taughtConcepts: [
      "concave mirror used in shaving/makeup mirrors and dentist mirrors because object between F and P gives a magnified virtual image",
      "concave mirror used in torches/headlights/searchlights because a source at the focus reflects as a parallel beam",
      "concave mirror used in solar furnaces/cookers because parallel incoming rays converge at the focus",
      "convex mirror used in rear-view and side mirrors because it always gives a virtual erect diminished image with a wider field of view",
    ],
    untaughtConcepts: [
      "mirror formula",
      "magnification formula",
      "sign convention",
      "numerical problems on spherical mirrors",
      "refraction",
      "lenses",
    ],
  },
  "mirror-formula": {
    title: "Mirror Formula and Magnification",
    videoTemplate: "MirrorFormulaLesson",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to: the New Cartesian sign convention (distances from the pole, object distance always negative, concave focal length negative, convex focal length positive, real image distance negative, virtual image distance positive, erect height positive, inverted height negative), the mirror formula 1/v + 1/u = 1/f, and magnification m = h'/h = -v/u including reading the sign and magnitude of m. Prefer conceptual and simple-substitution multiple-choice questions (e.g. given u and f, which sign should v have; given m, is the image real or virtual) over multi-step numerical solving. Do NOT include refraction or lenses.",
    lessonFocus:
      "Lesson video focus: sign convention rules, the mirror formula and magnification formula, and two fully worked NCERT examples (a convex rear-view mirror and a concave mirror) with every value computed from the formula.",
    taughtConcepts: [
      "sign convention: distances measured from the pole, object distance always negative",
      "concave mirror focal length is negative, convex mirror focal length is positive",
      "real image distance is negative, virtual image distance is positive",
      "erect image height is positive, inverted image height is negative",
      "mirror formula 1/v + 1/u = 1/f",
      "magnification m = h'/h = -v/u and interpreting its sign and magnitude",
    ],
    untaughtConcepts: [
      "refraction",
      "lenses",
      "lens formula",
      "power of a lens",
      "multi-step combined numericals",
    ],
  },
  "refraction-intro": {
    title: "Introduction to Refraction",
    videoTemplate: "RefractionAnimation",
    syllabusScope:
      "NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only. Keep questions limited to refraction, refractive index, optical density, Snell's law, and rectangular glass slab refraction.",
    taughtConcepts: [
      "light bends at boundary of two media",
      "bending towards or away from normal based on optical density",
      "basic meaning of refractive index",
      "Snell law qualitative understanding",
      "lateral displacement in rectangular glass slab",
    ],
    untaughtConcepts: [
      "lens formula",
      "power of lens",
      "advanced lens numericals",
      "spherical mirror formula",
    ],
  },
};

const DEFAULT_TOPIC_CONTEXT = TOPIC_CONTEXTS["laws-reflection"];

const TAG_TO_VISUAL_TEMPLATE = {
  angle_from_surface: "ReflectionMisconceptionFeedback",
  reflection_not_equal: "ReflectionMisconceptionFeedback",
  normal_orientation_wrong: "ReflectionMisconceptionFeedback",
  plane_not_same: "ReflectionMisconceptionFeedback",
  first_law_reflection_angle: "ReflectionMisconceptionFeedback",
  second_law_reflection_plane: "ReflectionMisconceptionFeedback",
  image_real_confusion: "PlaneMirrorBasicsAnimation",
  size_mismatch: "PlaneMirrorBasicsAnimation",
  distance_confusion: "PlaneMirrorBasicsAnimation",
  lateral_inversion_confusion: "PlaneMirrorBasicsAnimation",
  plane_mirror_image_properties: "PlaneMirrorBasicsAnimation",
  concave_convex_confusion: "SphericalMirrorMisconceptionFeedback",
  pole_confusion: "SphericalMirrorMisconceptionFeedback",
  center_of_curvature_confusion: "SphericalMirrorMisconceptionFeedback",
  principal_axis_confusion: "SphericalMirrorMisconceptionFeedback",
  focus_definition_wrong: "SphericalMirrorMisconceptionFeedback",
  focus_convex_confusion: "SphericalMirrorMisconceptionFeedback",
  radius_focal_relation_wrong: "SphericalMirrorMisconceptionFeedback",
  sign_convention_confusion: "SphericalMirrorMisconceptionFeedback",
  left_right_sign_error: "SphericalMirrorMisconceptionFeedback",
  parallel_ray_rule_wrong: "SphericalMirrorMisconceptionFeedback",
  focus_ray_rule_wrong: "SphericalMirrorMisconceptionFeedback",
  center_ray_rule_wrong: "SphericalMirrorMisconceptionFeedback",
  random_reflection: "SphericalMirrorMisconceptionFeedback",
  image_position_confusion: "SphericalMirrorMisconceptionFeedback",
  real_virtual_confusion: "SphericalMirrorMisconceptionFeedback",
  image_size_confusion: "SphericalMirrorMisconceptionFeedback",
  inverted_erect_confusion: "SphericalMirrorMisconceptionFeedback",
  focus_infinity_confusion: "SphericalMirrorMisconceptionFeedback",
  beyond_c_confusion: "SphericalMirrorMisconceptionFeedback",
  convex_real_image_myth: "SphericalMirrorMisconceptionFeedback",
  convex_size_confusion: "SphericalMirrorMisconceptionFeedback",
  rearview_reason_wrong: "SphericalMirrorMisconceptionFeedback",
};

const resolveVisualTemplateByTag = (tag) => {
  const key = String(tag || "").trim();
  return TAG_TO_VISUAL_TEMPLATE[key] || null;
};

const loadQuestionHistory = () => {
  try {
    const raw = sessionStorage.getItem(QUESTION_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveQuestionHistory = (ids) => {
  try {
    sessionStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
};

const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const questionKey = (question, fallbackIndex = 0) => {
  if (question?.id !== undefined && question?.id !== null) {
    return `id-${question.id}`;
  }
  const text = String(question?.question_text || "").slice(0, 24);
  return `gen-${fallbackIndex}-${text}`;
};

const getQuizTopicContext = (topicId) => {
  if (topicId && TOPIC_CONTEXTS[topicId]) {
    return TOPIC_CONTEXTS[topicId];
  }
  return DEFAULT_TOPIC_CONTEXT;
};

const getPersonalization = (topicId, progress) => {
  const topicProgress = progress?.[topicId] || {};
  const mastery = Number(topicProgress?.mastery ?? 0);

  let difficulty = "easy";

  if (mastery >= 70) {
    difficulty = "hard";
  } else if (mastery >= 40) {
    difficulty = "medium";
  }

  const tutorContext =
    topicProgress?.misconception && String(topicProgress.misconception).trim()
      ? `Primary misconception observed: ${topicProgress.misconception}`
      : "No prior misconception data for this topic.";

  return {
    difficulty,
    tutorContext,
  };
};

const renderFormattedText = (text) => {
  if (!text) return "";
  const parts = String(text).split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} style={{ color: "#F8FAFC" }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const LESSON_TEXTS = {
  "laws-reflection": `When a ray of light hits a mirror, it bounces back. This is called reflection.
The ray that hits the mirror is called the incident ray, and the ray that bounces back is the reflected ray.
The Normal is a line perpendicular (90°) to the mirror at the point of incidence.
The Angle of Incidence = Angle of Reflection. Both are measured from the Normal.
The incident ray, reflected ray, and the normal at the point of incidence all lie in the same plane (they are coplanar).`,
  
  "plane-mirror": `A plane mirror is a flat, polished surface that reflects light.
A plane mirror forms a virtual, erect image of the same size as the object, placed as far behind the mirror as the object is in front. The image is laterally inverted (left-right reversed).
Applications: AMBULANCE is written reversed on ambulances so lateral inversion flips it back to normal in a car's rear-view mirror ahead. Letters like A, H, I, M, O, T, U are left-right symmetric and look identical to their own mirror image; asymmetric letters like R visibly flip. Two plane mirrors placed at an angle theta form multiple images, following Number of images = (360/theta) - 1 -- 3 images at 90 degrees, 5 images at 60 degrees. A kaleidoscope uses two mirrors at 60 degrees; a periscope uses two mirrors at 45 degrees, each bending the light ray 90 degrees.`,
  
  "spherical-mirror-basics": `A spherical mirror is a mirror which has the shape of a piece cut out of a spherical surface.
Its reflecting surface is curved. A concave mirror curves inwards (like the inside of a spoon) and converges light. A convex mirror curves outwards (like the back of a spoon) and diverges light.
Key points include:
- Pole (P): The geometric center of the reflecting surface of the spherical mirror.
- Centre of Curvature (C): The center of the hollow sphere of which the mirror is a part.
- Radius of Curvature (R): The radius of the hollow sphere of which the mirror is a part.
- Principal Axis: A straight line passing through the pole and the centre of curvature.
- Principal Focus (F): The point where parallel rays converge (for concave mirror) or appear to diverge from (for convex mirror) after reflection.
- Relation: For spherical mirrors of small aperture, the radius of curvature is twice the focal length (R = 2f).
- Identification: hold your face close to the mirror -- a giant, magnified reflection means concave, a tiny diminished reflection means convex, a same-size reflection means plane. By touch, a concave surface is depressed inward and a convex surface bulges outward, exactly like the inner (concave) and outer (convex) surfaces of a steel spoon.`
};

const QuizPage = ({ onGoBackToLesson = null }) => {
  const currentTopicId = useSessionStore((s) => s.currentTopicId);
  const user = useSessionStore((s) => s.user);
  const progress = useSessionStore((s) => s.progress);
  const recordResult = useSessionStore((s) => s.recordResult);
  const retestBias = useSessionStore((s) => s.retestBias);
  const clearRetestBias = useSessionStore((s) => s.clearRetestBias);

  const [quizType, setQuizType] = useState("mcq"); // "mcq" | "descriptive"
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingRemedial, setLoadingRemedial] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [activeVisualByQuestion, setActiveVisualByQuestion] = useState({});
  const [quizMode, setQuizMode] = useState("regular");
  const [currentPlayingKey, setCurrentPlayingKey] = useState(null);
  const [loadingTts, setLoadingTts] = useState(null);
  const [openTraceIndex, setOpenTraceIndex] = useState(null);
  const audioInstanceRef = useRef(null);

  // Clean up audio on unmount or report change
  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
    };
  }, [report]);

  // Reload questions if topic or quizType changes
  useEffect(() => {
    loadQuestions();
  }, [currentTopicId, quizType]);

  const handlePlaySpeech = (text, key) => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current = null;
      if (currentPlayingKey === key || loadingTts === key) {
        setCurrentPlayingKey(null);
        setLoadingTts(null);
        return;
      }
    }

    const cleanText = text
      .replace(/\*\*|__/g, "")
      .replace(/[*#-]/g, "")
      .trim();

    setLoadingTts(key);
    const url = `${BASE_URL}/api/tts?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(url);
    audioInstanceRef.current = audio;

    audio.oncanplaythrough = () => {
      setLoadingTts(null);
      setCurrentPlayingKey(key);
      audio.play().catch(e => {
        console.error("TTS playback failed:", e);
        setCurrentPlayingKey(null);
      });
    };

    audio.onerror = () => {
      setLoadingTts(null);
      setCurrentPlayingKey(null);
      audioInstanceRef.current = null;
    };

    audio.onended = () => {
      setCurrentPlayingKey(null);
      audioInstanceRef.current = null;
    };
  };

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    setCurrentIndex(0);
    setActiveVisualByQuestion({});
    setQuizMode("regular");
    setAttemptNumber(1);

    const seenIds = loadQuestionHistory();
    const quizTopicContext = getQuizTopicContext(currentTopicId);
    const personalization = getPersonalization(currentTopicId, progress);
    const studentId = user?.id || user?.name || "guest-student";
    const tutorContext = [quizTopicContext.lessonFocus, personalization.tutorContext]
      .filter(Boolean)
      .join(" ");
    const lessonContent = LESSON_TEXTS[currentTopicId] || "";

    try {
      if (quizType === "descriptive") {
        const data = await getDescriptiveQuestions(currentTopicId);
        const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
        if (!rawQuestions.length) {
          throw new Error("No descriptive questions found in the database for this topic. Switch to MCQ mode.");
        }
        const nextQuestions = rawQuestions.map((q, idx) => ({
          ...q,
          _key: `desc-${q.id ?? idx}`,
          isDescriptive: true,
        }));
        setQuestions(nextQuestions);
      } else {
        const applyRetestBias = retestBias?.topicId === currentTopicId;
        const retestTagBreakdown = applyRetestBias ? (retestBias.tagBreakdown || []) : [];
        if (applyRetestBias) clearRetestBias();

        let rawQuestions = null;

        if (retestTagBreakdown.length > 0) {
          // Cross-session retest: route through the same weighted
          // misconception-quiz endpoint startMisconceptionQuiz() uses, so the
          // regenerated quiz is proportionally weighted across every
          // misconception this topic's history shows -- not just the single
          // most-frequent one.
          const data = await getMisconceptionQuiz({
            topic: quizTopicContext.title,
            studentId,
            misconceptionTags: retestTagBreakdown.map((t) => t.tag),
            misconceptionWeights: Object.fromEntries(
              retestTagBreakdown.map((t) => [t.tag, t.count])
            ),
            questionCount: 5,
            difficulty: personalization.difficulty,
          });
          rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
        }

        if (rawQuestions === null) {
          const data = await getGeneratedQuestions({
            topic: quizTopicContext.title,
            difficulty: personalization.difficulty,
            syllabusScope: quizTopicContext.syllabusScope,
            tutorContext,
            videoTemplate: quizTopicContext.videoTemplate,
            taughtConcepts: quizTopicContext.taughtConcepts,
            untaughtConcepts: quizTopicContext.untaughtConcepts,
            lessonContent,
            studentId,
          });
          rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
        }

        const nextQuestions = shuffle(rawQuestions).map((q, idx) => ({
          ...q,
          options: Array.isArray(q?.options) ? q.options : [],
          _key: questionKey(q, idx),
        }));
        setQuestions(nextQuestions);

        const nextIds = [
          ...new Set([...seenIds, ...nextQuestions.map(q => q.id).filter((id) => id !== undefined && id !== null)])
        ].slice(-50);
        saveQuestionHistory(nextIds);
      }

      setAnswers({});
    } catch (err) {
      setQuestions([]);
      setError(err?.message || "Unable to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qid, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: optionIndex
    }));
  };

  const handleChangeText = (qid, text) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: text
    }));
  };

  const handleSubmit = async () => {
    if (quizType === "descriptive") {
      await handleSubmitDescriptive();
      return;
    }

    setError("");
    const unanswered = questions.filter(q => answers[q._key] === undefined);
    if (unanswered.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const quizTopicContext = getQuizTopicContext(currentTopicId);
      const studentId = user?.id || user?.name || "guest-student";

      const formatted = questions.map(q => ({
        question_id: q.id ?? q._key,
        question_text: q.question_text,
        selected: answers[q._key],
        correct: q.correct,
        difficulty: q.difficulty,
        misconception_map: q.misconception_map || {},
        topic: q.topic || quizTopicContext.title,
        options: q.options || [],
      }));

      const total = questions.length;
      const correctCount = questions.reduce((count, q) => {
        return count + (answers[q._key] === q.correct ? 1 : 0);
      }, 0);

      let res = null;
      let reason = {
        reason: "Let's review this concept and try again.",
        focus_area: "N/A",
      };
      let dbSyncWarning = null;

      try {
        res = await submitAnswers({ answers: formatted, topic: quizTopicContext.title, studentId, attemptNumber });
        reason = {
          reason: res.reason,
          focus_area: res.focus_area,
        };

        if (!reason.reason) {
          reason = await getMisconceptionReason(
            res.main_misconception,
            quizTopicContext.title
          );
        }

        if (res?.attempt_number) {
            setAttemptNumber(res.attempt_number);
        }
      } catch (submitErr) {
        dbSyncWarning = submitErr?.message || "Could not submit this attempt right now.";
      }

      const questionFeedback = Array.isArray(res?.question_feedback) ? res.question_feedback : [];
      const questionFeedbackById = new Map(
        questionFeedback
          .filter((item) => item?.question_id !== undefined && item?.question_id !== null)
          .map((item) => [String(item.question_id), item])
      );

      const mainMisconception = res?.main_misconception || "none";
      const misconceptionExplanation = res?.misconception_explanation || null;

      const detailedResults = questions.map((q, idx) => {
        const selectedIndex = answers[q._key];
        const correctIndex = q.correct;
        const isCorrect = selectedIndex === correctIndex;
        const questionId = String(q.id ?? q._key);

        const matchedFeedback = questionFeedbackById.get(questionId);
        const localMisconceptionTag = !isCorrect
          ? ((q.misconception_map || {})[String(selectedIndex)]
            || (q.misconception_map || {})[selectedIndex]
            || null)
          : null;
        const focusArea = matchedFeedback?.focus_area || localMisconceptionTag || null;

        const selectedFeedback = matchedFeedback;

        return {
          index: idx + 1,
          questionText: q.question_text,
          options: Array.isArray(q.options) ? q.options : [],
          selectedIndex,
          correctIndex,
          isCorrect,
          reason: selectedFeedback?.reason || (isCorrect ? "Correct answer." : "Review this concept once more."),
          focusArea,
          svgComponent: selectedFeedback?.svg_component || null,
          svgVariant: selectedFeedback?.svg_variant || focusArea || null,
        };
      });

      const accuracy = Math.round((correctCount / total) * 100);
      recordResult(currentTopicId, accuracy, mainMisconception);

      setReport({
        type: "mcq",
        total,
        correctCount,
        wrongCount: total - correctCount,
        accuracy,
        reason: reason.reason || "Let's review this concept and try again.",
        focusArea: reason.focus_area || "N/A",
        mainMisconception,
        misconceptionExplanation,
        svgComponent: res?.svg_component || null,
        svgVariant: res?.svg_variant || null,
        questionFeedback,
        detailedResults,
        dbSyncWarning: res?.db_sync_warning || dbSyncWarning,
        shouldRedirectToLesson: res?.should_redirect_to_lesson || false,
        followUpStrategy: res?.follow_up_strategy || "visual_only",
        serverAttemptNumber: res?.attempt_number || attemptNumber,
      });
    } catch (err) {
      setError(err?.message || "Unable to process quiz results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDescriptive = async () => {
    setError("");
    const unanswered = questions.filter(q => !answers[q._key] || !answers[q._key].trim());
    if (unanswered.length > 0) {
      setError("Please write answers for all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const studentId = user?.id || user?.name || "guest-student";
      const topicContext = getQuizTopicContext(currentTopicId);

      const evaluationPromises = questions.map(async (q) => {
        const studentAnswer = answers[q._key];
        const res = await evalDescriptiveAnswer({
          studentId,
          questionId: q.id,
          studentAnswer,
        });
        return {
          questionId: q.id,
          questionText: q.question_text,
          studentAnswer,
          rubricItems: q.rubric_items || [],
          evaluation: res.evaluation || res,
        };
      });

      const results = await Promise.all(evaluationPromises);

      // Summarize scores (Understanding, Completeness, Keywords, Weighted)
      let totalUnderstanding = 0;
      let totalCompleteness = 0;
      let totalKeywords = 0;
      let totalWeighted = 0;
      let tagCounts = {};

      results.forEach(r => {
        const scores = r.evaluation.scores || {};
        const und = scores.understanding ?? 0;
        const comp = scores.completeness ?? 0;
        const kw = scores.keywords ?? 0;

        totalUnderstanding += und;
        totalCompleteness += comp;
        totalKeywords += kw;

        const weighted = (und * 0.70) + (comp * 0.25) + (kw * 0.05);
        totalWeighted += weighted;

        const tag = r.evaluation.misconception_tag;
        if (tag && tag !== "none" && tag !== "NOVEL_UNTAGGED_ERROR") {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });

      const avgUnderstanding = Math.round((totalUnderstanding / questions.length) * 10) / 10;
      const avgCompleteness = Math.round((totalCompleteness / questions.length) * 10) / 10;
      const avgKeywords = Math.round((totalKeywords / questions.length) * 10) / 10;
      const avgWeighted = Math.round((totalWeighted / questions.length) * 10) / 10;

      // Detect main misconception tag
      let mainMisconception = "none";
      let maxCount = 0;
      Object.entries(tagCounts).forEach(([tag, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mainMisconception = tag;
        }
      });

      let misconceptionExplanation = null;
      if (mainMisconception !== "none") {
        try {
          const conceptReason = await getMisconceptionReason(mainMisconception, topicContext.title);
          misconceptionExplanation = conceptReason.reason;
        } catch {
          misconceptionExplanation = `Identified misconception: ${mainMisconception}`;
        }
      }

      setReport({
        type: "descriptive",
        total: questions.length,
        avgUnderstanding,
        avgCompleteness,
        avgKeywords,
        avgWeighted,
        mainMisconception,
        misconceptionExplanation,
        detailedResults: results.map((r, idx) => ({
          index: idx + 1,
          questionText: r.questionText,
          studentAnswer: r.studentAnswer,
          rubricItems: r.rubricItems,
          scores: r.evaluation.scores || {},
          feedback: r.evaluation.feedback || "Good effort.",
          reasoningTrace: r.evaluation.reasoning_trace || [],
          contradictedSpan: r.evaluation.contradicted_span,
          misconceptionTag: r.evaluation.misconception_tag,
        })),
      });

    } catch (err) {
      setError(err?.message || "Unable to evaluate descriptive answers");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const restartSameQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setReport(null);
    setError("");
    setActiveVisualByQuestion({});
    setOpenTraceIndex(null);
    setAttemptNumber(1);
  };

  const startMisconceptionQuiz = async () => {
    if (!report?.detailedResults?.length) {
      return;
    }

    const quizTopicContext = getQuizTopicContext(currentTopicId);
    const studentId = user?.id || user?.name || "guest-student";
    const wrongItems = report.detailedResults.filter((item) => !item.isCorrect);
    // Count occurrences instead of just deduping, so a tag the student
    // tripped on 3 times in this quiz gets proportionally more questions
    // than one they only missed once -- same weighting the cross-session
    // retest path uses (see loadQuestions()'s retestTagBreakdown handling).
    const misconceptionWeights = {};
    wrongItems.forEach((item) => {
      const tag = String(item.focusArea || "").trim();
      if (!tag) return;
      misconceptionWeights[tag] = (misconceptionWeights[tag] || 0) + 1;
    });
    const misconceptionTags = Object.keys(misconceptionWeights);
    const wrongQuestionTexts = wrongItems
      .map((item) => String(item.questionText || "").trim())
      .filter(Boolean);

    if (!misconceptionTags.length) {
      setError("No misconception tags were found for remedial quiz generation.");
      return;
    }

    setLoadingRemedial(true);
    setError("");

    try {
      const data = await getMisconceptionQuiz({
        topic: quizTopicContext.title,
        studentId,
        misconceptionTags,
        misconceptionWeights,
        wrongQuestionTexts,
        questionCount: Math.max(2, Math.min(wrongItems.length + 1, 6)),
      });

      const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
      const nextQuestions = shuffle(rawQuestions).map((q, idx) => ({
        ...q,
        options: Array.isArray(q?.options) ? q.options : [],
        _key: questionKey(q, idx),
      }));

      if (!nextQuestions.length) {
        setError("Could not generate misconception-focused quiz right now.");
        return;
      }

      setQuizType("mcq"); // Force back to MCQ for remedial
      setQuestions(nextQuestions);
      setAnswers({});
      setCurrentIndex(0);
      setReport(null);
      setActiveVisualByQuestion({});
      setQuizMode("misconception");
      setAttemptNumber(prev => prev + 1);
    } catch (err) {
      setError(err?.message || "Unable to start misconception quiz");
    } finally {
      setLoadingRemedial(false);
    }
  };

  // --- Rendering Helpers ---
  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ color: "#60A5FA", marginBottom: "20px" }}>Loading Quiz Questions...</h2>
        <div style={{ width: "48px", height: "48px", border: "4px solid rgba(59, 130, 246, 0.2)", borderTop: "4px solid #3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "24px", color: "#9CA3AF", maxWidth: "450px", lineHeight: "1.6" }}>
          Retrieving conceptual questions for {getQuizTopicContext(currentTopicId).title}. Hang tight!
        </p>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  // --- REPORT RENDERING ---
  if (report) {
    if (report.type === "descriptive") {
      return (
        <div style={{ padding: "20px" }}>
          <h1 style={{ color: "#F8FAFC", marginBottom: "4px" }}>Descriptive Practice Evaluation</h1>
          <p style={{ color: "#9CA3AF", marginTop: 0 }}>Gemini 3.5 Flash CoT Evaluation Pipeline</p>

          {/* Core score meters */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "24px",
            marginBottom: "24px"
          }}>
            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Weighted Final Score</span>
              <h2 style={{ fontSize: "28px", color: "#10B981", margin: "8px 0" }}>{report.avgWeighted} <span style={{ fontSize: "16px", color: "#9CA3AF" }}>/ 10</span></h2>
              <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${report.avgWeighted * 10}%`, background: "#10B981" }}></div>
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Understanding & Correctness (70%)</span>
              <h2 style={{ fontSize: "24px", color: "#60A5FA", margin: "8px 0" }}>{report.avgUnderstanding} <span style={{ fontSize: "14px", color: "#9CA3AF" }}>/ 10</span></h2>
              <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${report.avgUnderstanding * 10}%`, background: "#60A5FA" }}></div>
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Completeness & Rubric (25%)</span>
              <h2 style={{ fontSize: "24px", color: "#A78BFA", margin: "8px 0" }}>{report.avgCompleteness} <span style={{ fontSize: "14px", color: "#9CA3AF" }}>/ 10</span></h2>
              <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${report.avgCompleteness * 10}%`, background: "#A78BFA" }}></div>
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Terminology & Keywords (5%)</span>
              <h2 style={{ fontSize: "24px", color: "#FBBF24", margin: "8px 0" }}>{report.avgKeywords} <span style={{ fontSize: "14px", color: "#9CA3AF" }}>/ 10</span></h2>
              <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${report.avgKeywords * 10}%`, background: "#FBBF24" }}></div>
              </div>
            </div>
          </div>

          {/* Misconception remediation visual */}
          {report.misconceptionExplanation && (
            <div style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ marginTop: 0, color: "#34D399" }}>Concept Summary Nudge</h3>
                <button
                  onClick={() => handlePlaySpeech(report.misconceptionExplanation, "misconception")}
                  style={currentPlayingKey === "misconception" ? styles.audioBtnActive : loadingTts === "misconception" ? styles.audioBtnLoading : styles.audioBtn}
                  disabled={loadingTts !== null && loadingTts !== "misconception"}
                >
                  {currentPlayingKey === "misconception" ? "⏸ Stop Audio" : loadingTts === "misconception" ? "⏳ Loading..." : "🔊 Listen Feedback"}
                </button>
              </div>
              <p style={{ margin: 0, color: "#D1D5DB", lineHeight: 1.6 }}>{renderFormattedText(report.misconceptionExplanation)}</p>
            </div>
          )}

          {report.mainMisconception && report.mainMisconception !== "none" && (
            <QuizVisualCorrection
              svgComponent={report.svgComponent || resolveVisualTemplateByTag(report.mainMisconception) || "SphericalMirrorMisconceptionFeedback"}
              svgVariant={report.svgVariant || report.mainMisconception}
              misconceptionTag={report.mainMisconception}
              explanation={report.misconceptionExplanation || "Let's review this concept."}
            />
          )}

          {/* Detailed Question Review */}
          <div style={{ marginTop: "24px", padding: "24px", borderRadius: "16px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.02)" }}>
            <h3 style={{ marginTop: 0, color: "#F8FAFC", marginBottom: "20px" }}>Detailed Responses Review</h3>

            {report.detailedResults.map((item, idx) => {
              const itemWeighted = Math.round(((item.scores.understanding * 0.70) + (item.scores.completeness * 0.25) + (item.scores.keywords * 0.05)) * 10) / 10;
              const isTraceOpen = openTraceIndex === idx;

              return (
                <div key={idx} style={{
                  padding: "20px",
                  borderRadius: "12px",
                  background: "rgba(30, 41, 59, 0.3)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <span style={{ color: "#60A5FA", fontWeight: 700, fontSize: "14px" }}>Question {item.index}</span>
                      <h4 style={{ color: "#F8FAFC", margin: "6px 0 12px 0", fontSize: "16px" }}>{item.questionText}</h4>
                    </div>
                    <div style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <span style={{ color: "#34D399", fontWeight: "bold" }}>Score: {itemWeighted} / 10</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <strong style={{ color: "#9CA3AF", fontSize: "13px" }}>Your Written Answer:</strong>
                    <p style={{
                      margin: "6px 0",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "rgba(0,0,0,0.2)",
                      color: "#E5E7EB",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      borderLeft: "4px solid #3B82F6"
                    }}>
                      "{item.studentAnswer}"
                    </p>
                  </div>

                  {item.contradictedSpan && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      color: "#FCA5A5",
                      fontSize: "13px",
                      marginBottom: "16px"
                    }}>
                      <strong>Flagged Concept Error:</strong> "{item.contradictedSpan}"
                    </div>
                  )}

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#9CA3AF", fontSize: "13px" }}>AI Tutor Feedback:</strong>
                      <button
                        onClick={() => handlePlaySpeech(item.feedback, `feedback-${idx}`)}
                        style={currentPlayingKey === `feedback-${idx}` ? styles.audioBtnActive : loadingTts === `feedback-${idx}` ? styles.audioBtnLoading : styles.audioBtn}
                        disabled={loadingTts !== null && loadingTts !== `feedback-${idx}`}
                      >
                        {currentPlayingKey === `feedback-${idx}` ? "⏸ Stop Audio" : loadingTts === `feedback-${idx}` ? "⏳ Loading..." : "🔊 Play"}
                      </button>
                    </div>
                    <p style={{ margin: "6px 0", color: "#D1D5DB", fontSize: "14px", lineHeight: "1.6" }}>
                      {renderFormattedText(item.feedback)}
                    </p>
                  </div>

                  {/* CoT reasoning trace dropdown */}
                  {item.reasoningTrace && item.reasoningTrace.length > 0 && (
                    <div>
                      <button
                        onClick={() => setOpenTraceIndex(isTraceOpen ? null : idx)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          color: "#9CA3AF",
                          border: "1px solid rgba(255,255,255,0.06)",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                      >
                        {isTraceOpen ? "Hide AI Grading Steps" : "Show AI Grading Steps (CoT)"}
                      </button>
                      
                      {isTraceOpen && (
                        <div style={{
                          marginTop: "12px",
                          padding: "14px",
                          borderRadius: "8px",
                          background: "rgba(15, 23, 42, 0.4)",
                          border: "1px solid rgba(255,255,255,0.02)"
                        }}>
                          <h5 style={{ margin: "0 0 8px 0", color: "#60A5FA", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Chain of Thought Trace</h5>
                          <ul style={{ margin: 0, paddingLeft: "18px", color: "#9CA3AF", fontSize: "13px", lineHeight: "1.6" }}>
                            {item.reasoningTrace.map((step, sIdx) => (
                              <li key={sIdx} style={{ marginBottom: "6px" }}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button onClick={restartSameQuiz} style={{
              padding: "12px 24px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
              color: "#FFFFFF",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
            }}>
              Practice Again
            </button>
            <button onClick={loadQuestions} style={{
              padding: "12px 24px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#D1D5DB",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
              Load New Questions
            </button>
          </div>
        </div>
      );
    }

    // MCQ report
    return (
      <div style={{ padding: "20px" }}>
        <h1>
            {report.serverAttemptNumber >= 3
                ? "Round 3 — Let's slow down"
                : report.serverAttemptNumber === 2
                ? "Round 2 — Targeted Practice"
                : "Quiz Report"}
        </h1>
        {report.serverAttemptNumber >= 2 && (
            <p style={{ color: "#F59E0B", marginTop: 4, fontWeight: 600 }}>
                {report.serverAttemptNumber >= 3
                    ? "You've attempted this 3 times. A different approach and a lesson revisit should help."
                    : "This was a targeted round focusing on your specific misconceptions."}
            </p>
        )}
        <p style={{ fontWeight: 700, marginTop: "10px" }}>
          Score: {report.correctCount}/{report.total} ({report.accuracy}%)
        </p>
        <p>Correct: {report.correctCount}</p>
        <p>Incorrect: {report.wrongCount}</p>

        {report.misconceptionExplanation && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              borderRadius: "10px",
              background: "#e8fff2",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ marginTop: 0, color: "#166534" }}>Misconception Explanation</h3>
              <button
                onClick={() => handlePlaySpeech(report.misconceptionExplanation, "misconception")}
                style={currentPlayingKey === "misconception" ? styles.audioBtnActive : loadingTts === "misconception" ? styles.audioBtnLoading : styles.audioBtn}
                disabled={loadingTts !== null && loadingTts !== "misconception"}
              >
                {currentPlayingKey === "misconception" ? "⏸ Stop Audio" : loadingTts === "misconception" ? "⏳ Loading..." : "🔊 Listen Feedback"}
              </button>
            </div>
            <p style={{ margin: 0, color: "#1E293B" }}>{renderFormattedText(report.misconceptionExplanation)}</p>
          </div>
        )}

        {report.mainMisconception && report.mainMisconception !== "none" && (
          <QuizVisualCorrection
            svgComponent={report.svgComponent || resolveVisualTemplateByTag(report.mainMisconception) || "ReflectionMisconceptionFeedback"}
            svgVariant={report.svgVariant || report.mainMisconception}
            misconceptionTag={report.mainMisconception}
            explanation={report.misconceptionExplanation || report.reason}
          />
        )}

        <div style={{ marginTop: "18px", padding: "20px", border: "1px solid rgba(255,255,255,0.02)", borderRadius: "12px", background: "rgba(30, 41, 59, 0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ marginTop: 0, color: "#F8FAFC" }}>Personalized Feedback</h3>
            <button
              onClick={() => handlePlaySpeech(report.reason, "reason")}
              style={currentPlayingKey === "reason" ? styles.audioBtnActive : loadingTts === "reason" ? styles.audioBtnLoading : styles.audioBtn}
              disabled={loadingTts !== null && loadingTts !== "reason"}
            >
              {currentPlayingKey === "reason" ? "⏸ Stop Audio" : loadingTts === "reason" ? "⏳ Loading..." : "🔊 Listen Feedback"}
            </button>
          </div>
          <p style={{ marginBottom: "12px", color: "#D1D5DB", lineHeight: 1.6 }}>{renderFormattedText(report.reason)}</p>
          <p style={{ margin: 0, color: "#9CA3AF" }}>
            <strong style={{ color: "#F8FAFC" }}>Focus Area:</strong> {report.focusArea}
          </p>
        </div>

        {report.dbSyncWarning && (
          <div style={{ marginTop: "12px", padding: "10px 12px", border: "1px solid #f5c2c7", borderRadius: "8px", background: "#fff5f5", color: "#842029" }}>
            Could not sync this attempt to database right now. Quiz result is shown locally.
          </div>
        )}

        {!!report.detailedResults?.length && (
          <div style={{ marginTop: "24px", padding: "24px", border: "1px solid rgba(255,255,255,0.02)", borderRadius: "16px", background: "rgba(15, 23, 42, 0.6)" }}>
            <h3 style={{ marginTop: 0, color: "#F8FAFC" }}>Answer Review</h3>
            <p style={{ marginTop: 0, color: "#9CA3AF", marginBottom: "24px" }}>
              Green = correct option, Red = your wrong selected option.
            </p>

            {report.detailedResults.map((item, idx) => (
              <div
                key={`review-${idx}`}
                style={{
                  marginTop: idx === 0 ? 0 : "12px",
                  paddingTop: idx === 0 ? 0 : "12px",
                  borderTop: idx === 0 ? "none" : "1px solid #eef2ff",
                }}
              >
                <p style={{ margin: "0 0 8px", color: "#60A5FA", fontWeight: 700 }}>
                  Question {item.index}
                </p>
                <p style={{ margin: "0 0 16px", color: "#F8FAFC", fontSize: "16px" }}>{item.questionText}</p>

                <div style={{ display: "grid", gap: "10px" }}>
                  {item.options.map((opt, optionIdx) => {
                    const isSelected = optionIdx === item.selectedIndex;
                    const isCorrectOption = optionIdx === item.correctIndex;

                    let background = "#1E293B";
                    let border = "1px solid rgba(255,255,255,0.02)";
                    let color = "#94A3B8";

                    if (isCorrectOption) {
                      background = "rgba(16, 185, 129, 0.15)";
                      border = "1px solid #10B981";
                      color = "#34D399";
                    } else if (isSelected) {
                      background = "rgba(239, 68, 68, 0.15)";
                      border = "1px solid #EF4444";
                      color = "#FCA5A5";
                    }

                    return (
                      <div
                        key={optionIdx}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "8px",
                          background,
                          border,
                          color,
                          fontSize: "14px",
                          fontWeight: isSelected || isCorrectOption ? 600 : 400,
                        }}
                      >
                        <span style={{ marginRight: "10px", fontWeight: "bold" }}>
                          {String.fromCharCode(65 + optionIdx)}.
                        </span>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "12px", padding: "12px", background: "rgba(30, 41, 59, 0.4)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.02)" }}>
                  <p style={{ margin: 0, color: "#CBD5E1", fontSize: "14px", lineHeight: 1.5 }}>
                    <strong>Feedback:</strong> {renderFormattedText(item.reason)}
                  </p>
                  {item.focusArea && item.focusArea !== "none" && (
                    <p style={{ margin: "6px 0 0 0", color: "#9CA3AF", fontSize: "13px" }}>
                      <strong>Concept Tag:</strong> {item.focusArea}
                    </p>
                  )}
                </div>

                {item.focusArea && item.focusArea !== "none" && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      onClick={() => {
                        setActiveVisualByQuestion((prev) => ({
                          ...prev,
                          [item.index]: !prev[item.index],
                        }));
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        border: "1px solid #c7d2fe",
                        background: "#eef2ff",
                        color: "#3730a3",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {activeVisualByQuestion[item.index] ? "Hide Visual Fix" : "See Visual Fix"}
                    </button>

                    {activeVisualByQuestion[item.index] && (
                      <QuizVisualCorrection
                        svgComponent={
                          item.svgComponent
                          || resolveVisualTemplateByTag(item.focusArea)
                          || report.svgComponent
                          || "ReflectionMisconceptionFeedback"
                        }
                        svgVariant={item.svgVariant || item.focusArea || report.mainMisconception}
                        misconceptionTag={item.focusArea || report.mainMisconception}
                        explanation={item.reason || report.misconceptionExplanation || report.reason}
                        questionText={item.questionText}
                        selectedOptionText={item.options[item.selectedIndex]}
                        correctOptionText={item.options[item.correctIndex]}
                        topicId={currentTopicId}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {report.mainMisconception && report.mainMisconception !== "none" && (
          <div style={{ marginTop: "24px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {report.shouldRedirectToLesson && onGoBackToLesson ? (
              <button
                onClick={() => {
                  onGoBackToLesson();
                }}
                style={{
                  padding: "12px 24px",
                  cursor: "pointer",
                  borderRadius: "999px",
                  border: "none",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
                }}
              >
                📚 Revisit Lesson — then try again
              </button>
            ) : (
              <button
                onClick={startMisconceptionQuiz}
                disabled={loadingRemedial}
                style={{
                  padding: "12px 24px",
                  cursor: loadingRemedial ? "not-allowed" : "pointer",
                  borderRadius: "999px",
                  border: "none",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                }}
              >
                {loadingRemedial ? "Generating remedial round..." : "🎯 Start Targeted Misconception Round"}
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={restartSameQuiz} style={{ padding: "10px 16px", cursor: "pointer" }}>
            Start New Quiz
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ QUESTIONS RENDERING ---
  const currentQuestion = questions[currentIndex] || null;
  const selectedForCurrent = currentQuestion ? answers[currentQuestion._key] : undefined;
  const isLast = questions.length > 0 ? currentIndex === questions.length - 1 : false;

  return (

    <div style={{ padding: "20px", position: "relative", minHeight: "300px" }}>
      {submitting && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11, 15, 25, 0.8)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "12px", backdropFilter: "blur(6px)" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid rgba(16, 185, 129, 0.2)", borderTop: "4px solid #10B981", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <h2 style={{ color: "#34D399", marginTop: "24px", marginBottom: "8px" }}>Evaluating your answers...</h2>
          <p style={{ color: "#D1D5DB", textAlign: "center", maxWidth: "350px", lineHeight: "1.6" }}>
            The AI is analyzing your conceptual understanding to generate personalized feedback.
          </p>
        </div>
      )}

      {/* Mode Selector Tabs */}
      {quizMode !== "misconception" && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => setQuizType("mcq")}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: quizType === "mcq" ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.05)",
              background: quizType === "mcq" ? "rgba(59, 130, 246, 0.15)" : "rgba(30, 41, 59, 0.4)",
              color: quizType === "mcq" ? "#60A5FA" : "#9CA3AF",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
          >
            Multiple Choice (MCQ)
          </button>
          <button
            onClick={() => setQuizType("descriptive")}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: quizType === "descriptive" ? "1px solid #10B981" : "1px solid rgba(255,255,255,0.05)",
              background: quizType === "descriptive" ? "rgba(16, 185, 129, 0.15)" : "rgba(30, 41, 59, 0.4)",
              color: quizType === "descriptive" ? "#34D399" : "#9CA3AF",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
          >
            Descriptive Practice (CoT Grading)
          </button>
        </div>
      )}

      <h1>{quizMode === "misconception" ? "🎯 Misconception Quiz" : "🧠 AI Tutor Quiz"}</h1>
      {quizMode === "misconception" && (
        <p style={{ marginTop: "4px", color: "#374151", fontWeight: 600 }}>
          This round targets only the misconceptions from your previous attempt.
        </p>
      )}

      {!questions.length ? (
        <div style={{ padding: "40px 0" }}>
          <p style={{ color: "#9CA3AF" }}>No questions loaded for this topic yet.</p>
          <button onClick={loadQuestions} style={{ padding: "10px 16px", cursor: "pointer", borderRadius: "8px", border: "none", background: "#3B82F6", color: "#fff", fontWeight: "bold" }}>
            Try Loading Questions
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: "#4b587c", fontWeight: 600 }}>
            Question {currentIndex + 1} of {questions.length}
          </p>

          {error && (
            <p style={{ color: "#ef4444", fontWeight: 600 }}>
              {error}
            </p>
          )}

          {quizType === "descriptive" ? (
            <QuizCard
              key={currentQuestion._key}
              question={currentQuestion}
              index={currentIndex}
              questionKey={currentQuestion._key}
              isDescriptive={true}
              textValue={answers[currentQuestion._key] || ""}
              onChangeText={handleChangeText}
            />
          ) : (
            <QuizCard
              key={currentQuestion._key}
              question={currentQuestion}
              index={currentIndex}
              questionKey={currentQuestion._key}
              selected={selectedForCurrent}
              onSelect={handleSelect}
            />
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{
                padding: "12px 24px",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.02)",
                background: currentIndex === 0 ? "rgba(255,255,255,0.02)" : "rgba(30, 41, 59, 0.8)",
                color: currentIndex === 0 ? "#6B7280" : "#F8FAFC",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Previous
            </button>

            {!isLast ? (
              <button
                onClick={handleNext}
                disabled={selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())}
                style={{
                  padding: "12px 24px",
                  cursor: (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) ? "not-allowed" : "pointer",
                  borderRadius: "999px",
                  border: "none",
                  background: (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                  color: (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) ? "#6B7280" : "#FFFFFF",
                  fontWeight: 600,
                  boxShadow: (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) ? "none" : "0 4px 14px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.2s"
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={(selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) || submitting}
                style={{
                  padding: "12px 24px",
                  cursor:
                    (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) || submitting
                      ? "not-allowed"
                      : "pointer",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: 700,
                  color: "#ffffff",
                  background:
                    (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim()))
                      ? "#4b5563"
                      : submitting
                        ? "linear-gradient(90deg, #4b5563, #6b7280)"
                        : quizType === "descriptive"
                          ? "linear-gradient(90deg, #10B981, #059669)"
                          : "linear-gradient(90deg, #4f46e5, #6366f1)",
                  boxShadow:
                    (selectedForCurrent === undefined || (quizType === "descriptive" && !String(selectedForCurrent).trim())) || submitting
                      ? "none"
                      : quizType === "descriptive"
                        ? "0 10px 20px rgba(16, 185, 129, 0.3)"
                        : "0 10px 20px rgba(79, 70, 229, 0.4)",
                  transform: submitting ? "scale(0.97)" : "scale(1)",
                  transition: "all 0.18s ease-out",
                }}
              >
                {submitting ? "Evaluating..." : "Finish Quiz"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  audioBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #3B82F6",
    background: "#EFF6FF",
    color: "#1D4ED8",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  audioBtnActive: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #DC2626",
    background: "#FEF2F2",
    color: "#991B1B",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  audioBtnLoading: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #D1D5DB",
    background: "#F3F4F6",
    color: "#6B7280",
    cursor: "not-allowed",
    transition: "all 0.15s ease",
  }
};

export default QuizPage;