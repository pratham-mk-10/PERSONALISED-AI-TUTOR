import React, { useState } from "react";
import QuizPage from "./components/quiz/QuizPage";
import FirstLawOfReflectionAnimation from "./svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import FirstLawPlaneInteractive from "./svg-engine/reflection/interactive/FirstLawPlaneInteractive";
import SecondLawOfReflectionAnimation from "./svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import SecondLawPlaneInteractive from "./svg-engine/reflection/interactive/SecondLawPlaneInteractive";
import PlaneMirrorBasicsAnimation from "./svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import PlaneMirrorCharacteristicsAnimation from "./svg-engine/reflection/animations/PlaneMirrorCharacteristicsAnimation";
import PlaneMirrorTryInteractive from "./svg-engine/reflection/interactive/PlaneMirrorTryInteractive";
import RealVsVirtualImagesAnimation from "./svg-engine/reflection/animations/RealVsVirtualImagesAnimation";
import PlaneMirrorApplicationsAnimation from "./svg-engine/reflection/animations/PlaneMirrorApplicationsAnimation";
import SphericalMirrorUsesAnimation from "./svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorUsesAnimation";
import SignConventionLesson from "./svg-engine/reflection/spherical-mirrors/animations/SignConventionLesson";
import MirrorFormulaLesson from "./svg-engine/reflection/spherical-mirrors/animations/MirrorFormulaLesson";
import NumericalChallenge from "./svg-engine/reflection/interactive/NumericalChallenge";
import { FIND_V, FIND_M, FIND_F, FIND_U, MIRROR_ID, COMBINED } from "./svg-engine/reflection/interactive/numericalSubtopics";
import IntroToLightAnimation from "./svg-engine/intro-light/IntroToLightAnimation";
import SphericalMirrorDetailedAnimation from "./svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorDetailedAnimation";
import MirrorIdentificationActivity from "./svg-engine/reflection/spherical-mirrors/interactive/MirrorIdentificationActivity";
import RayTracingRulesLesson from "./svg-engine/reflection/spherical-mirrors/animations/RayTracingRulesLesson";
import ImageFormationLesson from "./svg-engine/reflection/spherical-mirrors/animations/ImageFormationLesson";
import Dashboard from "./components/dashboard/Dashboard";
import NameEntry from "./components/onboarding/NameEntry";
import { useSessionStore } from "./state/sessionStore";
import Sandbox from "./Sandbox";

function App() {
  const [view, setView] = useState("dashboard");
  const [stage, setStage] = useState("pmTell");
  const [activeCaseId, setActiveCaseId] = useState("concave-infinity");
  const selectTopic = useSessionStore((s) => s.selectTopic);
  const currentTopicId = useSessionStore((s) => s.currentTopicId);
  const user = useSessionStore((s) => s.user);
  const login = useSessionStore((s) => s.login);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Secret keybind: press backtick (`) to toggle Sandbox
      if (e.key === '`') {
         setView(v => v === 'sandbox' ? 'dashboard' : 'sandbox');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Single source of truth for per-topic stage routing: an ordered list of
  // {id, label} per topic. Drives the dev-shortcuts panel, the stageBar chip
  // list/labels, "back to lesson", and Dashboard's initial stage on topic
  // click -- previously these were 4 separate hand-maintained if/else chains
  // that had to be kept in sync by hand for every topic.
  const TOPIC_FLOWS = {
    "intro-light": [
      { id: "introTell", label: "1. What is Light?" },
      { id: "introShow", label: "2. Watch" },
      { id: "introTest", label: "3. Quiz" },
    ],
    "plane-mirror": [
      { id: "pmTell", label: "1. Basics" },
      { id: "pmShow", label: "2. Watch" },
      { id: "pmCharTell", label: "3. Image Properties" },
      { id: "pmCharShow", label: "4. Watch" },
      { id: "pmTry", label: "5. Try" },
      { id: "pmAppTell", label: "6. Applications" },
      { id: "pmAppShow", label: "7. Watch" },
      { id: "pmTest", label: "8. Quiz" },
    ],
    "laws-reflection": [
      { id: "tell1", label: "1. 1st Law" },
      { id: "show1", label: "2. Watch" },
      { id: "try1", label: "3. Try" },
      { id: "tell2", label: "4. 2nd Law" },
      { id: "show2", label: "5. Watch" },
      { id: "try2", label: "6. Try" },
      { id: "test", label: "7. Quiz" },
    ],
    "real-virtual-images": [
      { id: "rviTell", label: "1. Real vs Virtual" },
      { id: "rviShow", label: "2. Watch" },
      { id: "rviTest", label: "3. Quiz" },
    ],
    "spherical-mirror-basics": [
      { id: "smTell", label: "1. Basics" },
      { id: "smShow", label: "2. Watch" },
      { id: "smIdentify", label: "3. Try" },
      { id: "smQuiz", label: "4. Quiz" },
    ],
    "spherical-mirror-rules": [
      { id: "smRulesTell", label: "1. Rules" },
      { id: "smRulesShow", label: "2. Watch" },
      { id: "smQuiz", label: "3. Quiz" },
    ],
    "spherical-mirror-image-formation": [
      { id: "smFormationTell", label: "1. Image Formation" },
      { id: "smFormationShow", label: "2. Watch" },
      { id: "smQuiz", label: "3. Quiz" },
    ],
    "spherical-mirror-uses": [
      { id: "smUsesTell", label: "1. Uses" },
      { id: "smUsesShow", label: "2. Watch" },
      { id: "smQuiz", label: "3. Quiz" },
    ],
    "mirror-formula": [
      { id: "mfSignTell", label: "1. Sign Convention" },
      { id: "mfSignShow", label: "2. Watch" },
      { id: "mfTell", label: "3. Mirror Formula" },
      { id: "mfShow", label: "4. Worked Examples" },
      { id: "mfTest", label: "5. Quiz" },
    ],
    "numerical-find-v": [
      { id: "nfvTell", label: "1. Intro" },
      { id: "nfvChallenge", label: "2. Practice" },
    ],
    "numerical-find-m": [
      { id: "nfmTell", label: "1. Intro" },
      { id: "nfmChallenge", label: "2. Practice" },
    ],
    "numerical-find-f": [
      { id: "nffTell", label: "1. Intro" },
      { id: "nffChallenge", label: "2. Practice" },
    ],
    "numerical-find-u": [
      { id: "nfuTell", label: "1. Intro" },
      { id: "nfuChallenge", label: "2. Practice" },
    ],
    "numerical-mirror-id": [
      { id: "nmiTell", label: "1. Intro" },
      { id: "nmiChallenge", label: "2. Practice" },
    ],
    "numerical-combined": [
      { id: "ncTell", label: "1. Intro" },
      { id: "ncChallenge", label: "2. Practice" },
    ],
    "refraction-intro": [
      { id: "test", label: "Quiz" },
    ],
  };
  const currentFlow = TOPIC_FLOWS[currentTopicId] || [];
  const currentFlowIds = currentFlow.map((s) => s.id);
  const stageLabels = Object.fromEntries(
    Object.values(TOPIC_FLOWS).flat().map((s) => [s.id, s.label])
  );

  const handleGoBackToLesson = () => {
    setStage(currentFlow[0]?.id || "pmTell");
  };

  const renderSession = () => (
    <div style={styles.sessionPage}>
      <button style={styles.backBtn} onClick={() => setView("dashboard")}>
        ← Back to Dashboard
      </button>

      {import.meta.env.DEV && currentFlow.length > 0 && (
        <div style={styles.devPanel}>
          <span style={styles.devPanelLabel}>Jump to stage</span>
          {currentFlow.map((s) => (
            <button
              key={s.id}
              style={styles.devPanelBtn}
              onClick={() => setStage(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.h1}>Personalised AI Tutor</h1>
        <p style={styles.subtitle}>
          Class 10 NCERT — Light: Reflection & Refraction
        </p>
      </div>

      <div style={styles.stageBar}>
        {currentFlowIds
          .map((s) => {
            const isActive = stage === s;
            const isCompleted = currentFlowIds.indexOf(s) < currentFlowIds.indexOf(stage);

            return (
              <div
                key={s}
                style={{
                  ...styles.stageStep,
                  background: isActive
                    ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                    : isCompleted ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: isActive ? "#FFFFFF" : isCompleted ? "#60A5FA" : "#6B7280",
                  border: isActive
                    ? "1px solid #3B82F6"
                    : isCompleted ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255, 255, 255, 0.02)",
                  boxShadow: isActive ? "0 4px 12px rgba(59,130,246,0.3)" : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {stageLabels[s] || s}
              </div>
            );
          })}
      </div>

      {/* INTRO TO LIGHT - TELL */}
      {stage === "introTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>What is Light?</h2>

          <p style={styles.explanation}>
            Before we study how light reflects off a mirror, let's cover the basics:
            what light is, luminous vs non-luminous objects, transparent/translucent/opaque
            materials, how light travels, and the difference between a ray and a beam.
          </p>

          <button style={styles.btnPrimary} onClick={() => setStage("introShow")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* INTRO TO LIGHT - SHOW */}
      {stage === "introShow" && (
        <div style={styles.cardWide}>
          <IntroToLightAnimation onTryItClicked={() => setStage("introTest")} />
        </div>
      )}

      {/* INTRO TO LIGHT - QUIZ */}
      {stage === "introTest" && (
        <div style={styles.card}>
          <QuizPage onGoBackToLesson={handleGoBackToLesson} />
        </div>
      )}

      {/* PLANE MIRROR BASICS - TELL */}
      {stage === "pmTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Plane Mirror Basics</h2>

          <p style={styles.explanation}>
            A <strong>plane mirror</strong> is a flat, polished surface that reflects light.
          </p>

          <p style={styles.explanation}>
            In this lesson you will learn every core term: mirror, point of incidence,
            incident ray, reflected ray, normal, angle of incidence, and angle of reflection.
          </p>

          <p style={styles.explanation}>
            You will also see how these are represented in standard ray diagrams used in
            Class 10 NCERT.
          </p>

          <button style={styles.btnPrimary} onClick={() => setStage("pmShow")}>
            Start Plane Mirror Animation →
          </button>
        </div>
      )}

      {/* PLANE MIRROR BASICS - SHOW */}
      {stage === "pmShow" && (
        <div style={styles.card}>
          <PlaneMirrorBasicsAnimation
            onContinue={() => setStage("pmCharTell")}
          />
        </div>
      )}

      {/* PLANE MIRROR IMAGE PROPERTIES - TELL */}
      {stage === "pmCharTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Properties of the Image</h2>

          <p style={styles.explanation}>
            You know how a plane mirror reflects light. Now let's work out exactly what
            the image it forms looks like -- its position, size, orientation, and one
            surprising twist.
          </p>

          <p style={styles.explanation}>
            We'll also look at what happens when the reflecting surface isn't perfectly
            smooth.
          </p>

          <button style={styles.btnPrimary} onClick={() => setStage("pmCharShow")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* PLANE MIRROR IMAGE PROPERTIES - SHOW */}
      {stage === "pmCharShow" && (
        <div style={styles.cardWide}>
          <PlaneMirrorCharacteristicsAnimation onTryItClicked={() => setStage("pmTry")} />
        </div>
      )}

      {/* PLANE MIRROR - TRY */}
      {stage === "pmTry" && (
        <div style={styles.card}>
          <PlaneMirrorTryInteractive misconceptionTag="" onInteracted={() => {}} />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("pmAppTell")}
          >
            Continue: Fun Applications →
          </button>
        </div>
      )}

      {/* PLANE MIRROR APPLICATIONS - TELL */}
      {stage === "pmAppTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Plane Mirror Applications</h2>
          <p style={styles.explanation}>
            You've learned the physics -- now let's see the fun, real-world consequences of
            lateral inversion, and how stacking two plane mirrors together creates entirely
            new devices.
          </p>
          <p style={styles.explanation}>
            We'll cover: why AMBULANCE is written reversed, which letters look identical in a
            mirror, how many images two angled mirrors create, and how kaleidoscopes and
            periscopes work.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("pmAppShow")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* PLANE MIRROR APPLICATIONS - SHOW */}
      {stage === "pmAppShow" && (
        <div style={styles.cardWide}>
          <PlaneMirrorApplicationsAnimation onTryItClicked={() => setStage("pmTest")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("pmTest")}>
              Ready for Quiz? →
            </button>
          </div>
        </div>
      )}

      {/* PLANE MIRROR - QUIZ */}
      {stage === "pmTest" && (
        <div style={styles.card}>
          <QuizPage
            onGoBackToLesson={handleGoBackToLesson}
          />
        </div>
      )}

      {/* REAL VS VIRTUAL IMAGES - TELL */}
      {stage === "rviTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Real vs Virtual Images</h2>

          <p style={styles.explanation}>
            Before we study spherical mirrors, there are two words you'll see constantly:
            <strong> real</strong> and <strong>virtual</strong>. Every image you form from
            now on will be one or the other.
          </p>

          <div style={styles.lawBox}>
            <p style={styles.lawText}>Real: light actually meets there, can be caught on a screen, inverted</p>
            <p style={styles.lawText}>Virtual: light only appears to meet there, no screen, erect</p>
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("rviShow")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* REAL VS VIRTUAL IMAGES - SHOW */}
      {stage === "rviShow" && (
        <div style={styles.cardWide}>
          <RealVsVirtualImagesAnimation onTryItClicked={() => setStage("rviTest")} />
        </div>
      )}

      {/* REAL VS VIRTUAL IMAGES - QUIZ */}
      {stage === "rviTest" && (
        <div style={styles.card}>
          <QuizPage onGoBackToLesson={handleGoBackToLesson} />
        </div>
      )}

      {/* SPHERICAL MIRROR BASICS - TELL */}
      {stage === "smTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Spherical Mirror Basics</h2>

          <p style={styles.explanation}>
            Learn spherical mirrors, their types (concave and convex), and key points:
            pole (P), focus (F), centre of curvature (C), and relation R = 2f.
          </p>

          <p style={styles.explanation}>
            Two more terms you'll need: the <strong>principal axis</strong> — the straight
            line through the pole and the centre of curvature (it's also the normal to the
            mirror at the pole) — and the <strong>aperture</strong>, the diameter of the
            mirror's reflecting surface.
          </p>

          <div style={styles.lawBox}>
            <p style={styles.lawText}>
              A convex mirror ALWAYS forms a virtual, erect, diminished image — for every
              object position, no exceptions.
            </p>
            <p style={styles.lawText}>
              It can never form a real image, and it can never form a magnified image.
            </p>
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("smShow")}>
            Start Spherical Mirror Animation →
          </button>
        </div>
      )}

      {/* SPHERICAL MIRROR BASICS - SHOW */}
      {stage === "smShow" && (
        <div style={styles.cardWide}>
          <SphericalMirrorDetailedAnimation onTryItClicked={() => setStage("smIdentify")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smIdentify")}>
              Continue to Mirror Identification →
            </button>
          </div>
        </div>
      )}

      {/* SPHERICAL MIRROR BASICS - TRY (identification) */}
      {stage === "smIdentify" && (
        <div style={styles.cardWide}>
          <MirrorIdentificationActivity />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Ready for Quiz? →
            </button>
          </div>
        </div>
      )}

      {/* RAY TRACING RULES - TELL */}
      {stage === "smRulesTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Prerequisite: Ray Tracing Rules</h2>
          <p style={styles.explanation}>
            Before we can form images with spherical mirrors, we need to know how light rays behave.
            There are 4 standard rules of ray tracing that you must master.
          </p>
          <p style={styles.explanation}>
            In practice, any 2 of the 4 rules are enough to locate an image — wherever two
            reflected rays cross is the image point. The other rules are there to double-check
            your answer.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("smRulesShow")}>
            Watch the 4 Rules →
          </button>
        </div>
      )}

      {/* RAY TRACING RULES - SHOW */}
      {stage === "smRulesShow" && (
        <div style={styles.cardWide}>
          <RayTracingRulesLesson onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Continue to Rules Quiz →
            </button>
          </div>
        </div>
      )}

      {/* IMAGE FORMATION - TELL */}
      {stage === "smFormationTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Image Formation by Spherical Mirrors</h2>
          <p style={styles.explanation}>
            By combining the rules you just learned, we can predict exactly where an image will form for any object!
            There are 8 total cases (6 for Concave, 2 for Convex). Let's watch them in action.
          </p>
          <p style={styles.explanation}>
            Watch the pattern as you step through the concave cases: as the object moves from
            infinity toward the pole, the image moves from F outward to infinity — then, once
            the object crosses inside F, the image reappears as a virtual image behind the mirror.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("smFormationShow")}>
            Watch Image Formation →
          </button>
        </div>
      )}

      {/* IMAGE FORMATION - SHOW */}
      {stage === "smFormationShow" && (
        <div style={styles.cardWide}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
            {[
              { id: "concave-infinity", label: "Concave: Obj At Infinity" },
              { id: "concave-beyond-c", label: "Concave: Obj Beyond C" },
              { id: "concave-at-c", label: "Concave: Obj At C" },
              { id: "concave-between-c-f", label: "Concave: Obj Between C & F" },
              { id: "concave-at-f", label: "Concave: Obj At F" },
              { id: "concave-between-p-f", label: "Concave: Obj Between F & P" },
              { id: "convex-infinity", label: "Convex: Obj At Infinity" },
              { id: "convex-finite", label: "Convex: Obj Finite Distance" },
            ].map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCaseId(c.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  border: `1px solid ${activeCaseId === c.id ? "#2563EB" : "#D1D5DB"}`,
                  background: activeCaseId === c.id ? "#2563EB" : "#fff",
                  color: activeCaseId === c.id ? "#fff" : "#111827",
                  fontWeight: activeCaseId === c.id ? "600" : "500",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ImageFormationLesson caseId={activeCaseId} onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Go to Spherical Mirror Quiz →
            </button>
          </div>
        </div>
      )}

      {/* USES OF MIRRORS - TELL */}
      {stage === "smUsesTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Uses of Concave and Convex Mirrors</h2>
          <p style={styles.explanation}>
            You've learned how each mirror forms images. Now let's see why concave mirrors
            show up in shaving mirrors, torches, and solar cookers -- and why convex mirrors
            are used for rear-view and side mirrors.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("smUsesShow")}>
            Watch the uses →
          </button>
        </div>
      )}

      {/* USES OF MIRRORS - SHOW */}
      {stage === "smUsesShow" && (
        <div style={styles.cardWide}>
          <SphericalMirrorUsesAnimation onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Continue to Quiz →
            </button>
          </div>
        </div>
      )}

      {/* SPHERICAL MIRROR QUIZ */}
      {stage === "smQuiz" && (
        <div style={styles.card}>
          <QuizPage onGoBackToLesson={handleGoBackToLesson} />
        </div>
      )}

      {/* TELL 1 - 1st LAW */}
      {stage === "tell1" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>1st Law of Reflection</h2>

          <p style={styles.explanation}>
            When a ray of light hits a mirror, it bounces back. This is called
            <strong> reflection</strong>.
          </p>

          <p style={styles.explanation}>
            The ray that hits the mirror is called the
            <strong> incident ray</strong>, and the ray that bounces back is the
            <strong> reflected ray</strong>.
          </p>

          <p style={styles.explanation}>
            The <strong>Normal</strong> is a line perpendicular (90°) to the mirror.
          </p>

          <div style={styles.lawBox}>
            <p style={styles.lawText}>
              The Angle of Incidence = Angle of Reflection
            </p>
            <p style={styles.lawText}>(Both measured from the Normal)</p>
          </div>

          <p style={styles.explanation}>
            Special case: if a ray hits the mirror exactly along the Normal (angle of
            incidence = 0°), it reflects straight back along the same path (angle of
            reflection = 0° too) — still the same law, just its simplest case.
          </p>

          <button style={styles.btnPrimary} onClick={() => setStage("show1")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* SHOW 1 - REFLECTION */}
      {stage === "show1" && (
        <div style={styles.card}>
          <FirstLawOfReflectionAnimation onTryItClicked={() => setStage("try1")} />
        </div>
      )}

      {/* TRY 1 - REFLECTION */}
      {stage === "try1" && (
        <div style={styles.card}>
          <FirstLawPlaneInteractive attempt={1} misconceptionTag="" onInteracted={() => { }} />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("tell2")}
          >
            Continue reflection lesson →
          </button>
        </div>
      )}

      {/* TELL 2 - 2nd LAW */}
      {stage === "tell2" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>2nd Law of Reflection</h2>

          <p style={styles.explanation}>
            The incident ray, reflected ray, and the normal all lie in the
            <strong> same plane</strong>.
          </p>

          <p style={styles.explanation}>
            A <strong>plane</strong> is a flat surface. Think of it as a sheet of paper.
            All three elements (incident ray, reflected ray, and normal) must be
            drawn on the same sheet of paper.
          </p>

          <p style={styles.explanation}>
            They can never go "above" or "below" the page. They stay together in
            one flat plane.
          </p>

          <div style={styles.lawBox}>
            <p style={styles.lawText}>
              Incident Ray, Reflected Ray, and Normal = Same Plane
            </p>
            <p style={styles.lawText}>(Coplanarity)</p>
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("show2")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* SHOW 2 - REFLECTION */}
      {stage === "show2" && (
        <div style={styles.card}>
          <SecondLawOfReflectionAnimation onTryItClicked={() => setStage("try2")} />
        </div>
      )}

      {/* TRY 2 - REFLECTION */}
      {stage === "try2" && (
        <div style={styles.card}>
          <SecondLawPlaneInteractive />

          <button
            style={{ ...styles.btnPrimary, marginTop: "16px" }}
            onClick={() => setStage("test")}
          >
            Ready for Quiz? →
          </button>
        </div>
      )}

      {/* TEST - BOTH LAWS */}
      {stage === "test" && (
        <div style={styles.card}>
          <QuizPage onGoBackToLesson={handleGoBackToLesson} />
        </div>
      )}

      {/* SIGN CONVENTION - TELL */}
      {stage === "mfSignTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Sign Convention for Spherical Mirrors</h2>
          <p style={styles.explanation}>
            Before we can calculate exactly where an image forms, we need one consistent
            set of rules for positive and negative. This is the New Cartesian Sign Convention.
          </p>
          <div style={styles.lawBox}>
            <p style={styles.lawText}>All distances measured from the Pole (origin)</p>
            <p style={styles.lawText}>Object distance u is always negative</p>
          </div>
          <p style={styles.explanation}>
            Three mistakes students make most often with this convention:
          </p>
          <div style={styles.lawBox}>
            <p style={styles.lawText}>1. Forgetting to give u its negative sign before substituting</p>
            <p style={styles.lawText}>2. Mixing up f's sign between concave (negative) and convex (positive)</p>
            <p style={styles.lawText}>3. Confusing the sign of v with the image's actual nature — always read it off after computing, don't guess it first</p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setStage("mfSignShow")}>
            Watch it in action →
          </button>
        </div>
      )}

      {/* SIGN CONVENTION - SHOW */}
      {stage === "mfSignShow" && (
        <div style={styles.cardWide}>
          <SignConventionLesson onTryItClicked={() => setStage("mfTell")} />
        </div>
      )}

      {/* MIRROR FORMULA - TELL */}
      {stage === "mfTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Mirror Formula and Magnification</h2>
          <p style={styles.explanation}>
            The mirror formula connects object distance, image distance, and focal length
            for any spherical mirror: <strong>1/v + 1/u = 1/f</strong>.
          </p>
          <p style={styles.explanation}>
            Magnification tells us the image's size and orientation:{" "}
            <strong>m = h'/h = -v/u</strong>. Using the sign convention you just learned:
            positive m means virtual and erect, negative m means real and inverted;
            |m| &gt; 1 means magnified, |m| &lt; 1 means diminished.
          </p>
          <p style={styles.explanation}>
            Two special cases worth memorizing: for a <strong>plane mirror</strong>, m = +1
            always (virtual, erect, same size). For a <strong>convex mirror</strong>, m is
            always positive with |m| &lt; 1 (virtual, erect, always diminished) — no exceptions.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("mfShow")}>
            See it solved →
          </button>
        </div>
      )}

      {/* MIRROR FORMULA - SHOW (worked examples) */}
      {stage === "mfShow" && (
        <div style={styles.cardWide}>
          <MirrorFormulaLesson onTryItClicked={() => setStage("mfTest")} />
        </div>
      )}

      {/* MIRROR FORMULA - QUIZ */}
      {stage === "mfTest" && (
        <div style={styles.card}>
          <QuizPage onGoBackToLesson={handleGoBackToLesson} />
        </div>
      )}

      {/* NUMERICAL PROBLEMS - FIND V */}
      {stage === "nfvTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Numerical Problems: Find v</h2>
          <p style={styles.explanation}>
            Given the object distance and the focal length, find where the image forms. This is
            the core mirror-formula skill everything else builds on.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("nfvChallenge")}>
            Start Practice →
          </button>
        </div>
      )}
      {stage === "nfvChallenge" && (
        <div style={styles.cardWide}>
          <NumericalChallenge config={FIND_V} />
        </div>
      )}

      {/* NUMERICAL PROBLEMS - FIND HEIGHT/MAGNIFICATION */}
      {stage === "nfmTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Numerical Problems: Find Height / Magnification</h2>
          <p style={styles.explanation}>
            Given u, f, and the object's height, find the image's height using magnification:
            m = h'/h = -v/u.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("nfmChallenge")}>
            Start Practice →
          </button>
        </div>
      )}
      {stage === "nfmChallenge" && (
        <div style={styles.cardWide}>
          <NumericalChallenge config={FIND_M} />
        </div>
      )}

      {/* NUMERICAL PROBLEMS - FIND F */}
      {stage === "nffTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Numerical Problems: Find f</h2>
          <p style={styles.explanation}>
            Given the object distance and where the image forms, work backward to find the focal
            length: f = (u × v) / (u + v).
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("nffChallenge")}>
            Start Practice →
          </button>
        </div>
      )}
      {stage === "nffChallenge" && (
        <div style={styles.cardWide}>
          <NumericalChallenge config={FIND_F} />
        </div>
      )}

      {/* NUMERICAL PROBLEMS - FIND U */}
      {stage === "nfuTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Numerical Problems: Find u</h2>
          <p style={styles.explanation}>
            Given the focal length and where the image forms, work backward to find how far the
            object was placed: u = (f × v) / (v − f).
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("nfuChallenge")}>
            Start Practice →
          </button>
        </div>
      )}
      {stage === "nfuChallenge" && (
        <div style={styles.cardWide}>
          <NumericalChallenge config={FIND_U} />
        </div>
      )}

      {/* NUMERICAL PROBLEMS - MIRROR IDENTIFICATION */}
      {stage === "nmiTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Numerical Problems: Mirror Identification</h2>
          <p style={styles.explanation}>
            Given only the object distance and image distance, work out whether the mirror is
            concave, convex, or plane — no picture, just the numbers.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("nmiChallenge")}>
            Start Practice →
          </button>
        </div>
      )}
      {stage === "nmiChallenge" && (
        <div style={styles.cardWide}>
          <NumericalChallenge config={MIRROR_ID} />
        </div>
      )}

      {/* NUMERICAL PROBLEMS - COMBINED */}
      {stage === "ncTell" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>Numerical Problems: Combined</h2>
          <p style={styles.explanation}>
            The capstone: find v, then correctly describe the image's magnification and full
            nature, all in one problem — everything you've practiced so far, together.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("ncChallenge")}>
            Start Practice →
          </button>
        </div>
      )}
      {stage === "ncChallenge" && (
        <div style={styles.cardWide}>
          <NumericalChallenge config={COMBINED} />
        </div>
      )}
    </div>
  );

  if (view === "session") {
    return <div style={styles.page}>{renderSession()}</div>;
  }

  if (view === "sandbox") {
    return <Sandbox />;
  }

  if (!user) {
    return <NameEntry onSubmit={(name) => login({ name })} />;
  }

  return (
    <div style={styles.page}>
      <Dashboard
        onStartTopic={(topicId) => {
          const flow = TOPIC_FLOWS[topicId];
          setStage(flow?.[0]?.id || "test");
          setView("session");
        }}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0B0F19",
    color: "#F8FAFC",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  devPanel: {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    border: "1px solid rgba(234, 179, 8, 0.4)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  },
  devPanelLabel: {
    fontSize: "12px",
    color: "#EAB308",
    fontWeight: 600,
    marginRight: "4px",
    whiteSpace: "nowrap",
  },
  devPanelBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(234, 179, 8, 0.4)",
    background: "transparent",
    color: "#EAB308",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  sessionPage: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  h1: {
    fontSize: "26px",
    color: "#60A5FA",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: "14px",
    color: "#9CA3AF",
  },
  stageBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    padding: "12px",
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.02)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  stageStep: {
    padding: "8px 18px",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "default",
    userSelect: "none",
  },
  card: {
    background: "#1E293B",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255, 255, 255, 0.02)",
  },
  cardWide: {
    background: "#1E293B",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "960px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255, 255, 255, 0.02)",
  },
  h2: {
    color: "#F8FAFC",
    marginBottom: "16px",
  },
  explanation: {
    fontSize: "15px",
    color: "#D1D5DB",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  lawBox: {
    background: "rgba(59, 130, 246, 0.1)",
    padding: "16px",
    borderRadius: "8px",
    marginTop: 10,
    marginBottom: 10,
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  lawText: {
    fontWeight: 600,
    color: "#60A5FA",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    color: "#FFFFFF",
    padding: "12px 24px",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
    transition: "transform 0.2s",
  },
  btnSecondary: {
    padding: "12px 24px",
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    borderRadius: "9999px",
    backgroundColor: "transparent",
    color: "#FFFFFF",
    fontWeight: 600,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
    border: "none",
    background: "transparent",
    color: "#60A5FA",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
};

export default App;
