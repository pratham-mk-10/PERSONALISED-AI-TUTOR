import React, { useState } from "react";
import QuizPage from "./components/quiz/QuizPage";
import FirstLawOfReflectionAnimation from "./svg-engine/reflection/animations/FirstLawOfReflectionAnimation";
import FirstLawPlaneInteractive from "./svg-engine/reflection/interactive/FirstLawPlaneInteractive";
import SecondLawOfReflectionAnimation from "./svg-engine/reflection/animations/SecondLawOfReflectionAnimation";
import SecondLawPlaneInteractive from "./svg-engine/reflection/interactive/SecondLawPlaneInteractive";
import PlaneMirrorBasicsAnimation from "./svg-engine/reflection/animations/PlaneMirrorBasicsAnimation";
import SphericalMirrorDetailedAnimation from "./svg-engine/reflection/spherical-mirrors/animations/SphericalMirrorDetailedAnimation";
import RayTracingRulesLesson from "./svg-engine/reflection/spherical-mirrors/animations/RayTracingRulesLesson";
import ImageFormationLesson from "./svg-engine/reflection/spherical-mirrors/animations/ImageFormationLesson";
import RefractionIntroAnimation from "./svg-engine/refraction/animations/RefractionIntroAnimation";
import SnellsLawAnimation from "./svg-engine/refraction/animations/SnellsLawAnimation";
import Dashboard from "./components/dashboard/Dashboard";
import { useSessionStore } from "./state/sessionStore";
import Sandbox from "./Sandbox";

function App() {
  const [view, setView] = useState("dashboard");
  const [stage, setStage] = useState("pmTell");
  const [activeCaseId, setActiveCaseId] = useState("concave-infinity");
  const selectTopic = useSessionStore((s) => s.selectTopic);
  const currentTopicId = useSessionStore((s) => s.currentTopicId);

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

  const stages = [
    "pmTell",
    "pmShow",
    "smTell",
    "smShow",
    "smQuiz",
    "smRulesTell",
    "smRulesShow",
    "smFormationTell",
    "smFormationShow",
    "tell1",
    "show1",
    "try1",
    "tell2",
    "show2",
    "try2",
    "test",
    "mirrorFormulaComingSoon",
    // ── REFRACTION ──
    "rfIntroTell",
    "rfIntroShow",
    "rfSnellTell",
    "rfSnellShow",
  ];
  const currentIndex = stages.indexOf(stage);

  const renderSession = () => (
    <div style={styles.sessionPage}>
      <button style={styles.backBtn} onClick={() => setView("dashboard")}>
        ← Back to Dashboard
      </button>

      <div style={styles.header}>
        <h1 style={styles.h1}>Personalised AI Tutor</h1>
        <p style={styles.subtitle}>
          Class 10 NCERT — Light: Reflection & Refraction
        </p>
      </div>

      <div style={styles.stageBar}>
        {stages
          .filter((s) => {
            if (stage === "pmTell" || stage === "pmShow") {
              return s === "pmTell" || s === "pmShow";
            }
            if (currentTopicId === "spherical-mirror-basics") {
              return s === "smTell" || s === "smShow" || s === "smQuiz";
            }
            if (currentTopicId === "spherical-mirror-rules") {
              return s === "smRulesTell" || s === "smRulesShow" || s === "smQuiz";
            }
            if (currentTopicId === "spherical-mirror-image-formation") {
              return s === "smFormationTell" || s === "smFormationShow" || s === "smQuiz";
            }
            if (stage === "mirrorFormulaComingSoon") {
              return s === "mirrorFormulaComingSoon";
            }
            if (currentTopicId === "refraction-intro" || stage === "rfIntroTell" || stage === "rfIntroShow") {
              return s === "rfIntroTell" || s === "rfIntroShow";
            }
            if (currentTopicId === "refraction-snells-law" || stage === "rfSnellTell" || stage === "rfSnellShow") {
              return s === "rfSnellTell" || s === "rfSnellShow";
            }
            // Hide all prior stages when in Laws of Reflection
            return s !== "pmTell" && s !== "pmShow" && s !== "smTell" && s !== "smShow" && s !== "smQuiz" && s !== "smRulesTell" && s !== "smRulesShow" && s !== "smFormationTell" && s !== "smFormationShow" && s !== "mirrorFormulaComingSoon" && s !== "rfIntroTell" && s !== "rfIntroShow" && s !== "rfSnellTell" && s !== "rfSnellShow";
          })
          .map((s, i) => {
            const isActive = stage === s;
            const isCompleted = stages.indexOf(s) < stages.indexOf(stage);
            
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
                {{
                  pmTell: "1. Plane Basics",
                  pmShow: "2. Watch",
                  smTell: "1. Basics",
                  smShow: "2. Watch",
                  smRulesTell: "1. Rules",
                  smRulesShow: "2. Watch",
                  smFormationTell: "1. Image Formation",
                  smFormationShow: "2. Watch",
                  smQuiz: "3. Quiz",
                  tell1: "1. 1st Law",
                  show1: "2. Watch",
                  try1: "3. Try",
                  tell2: "4. 2nd Law",
                  show2: "5. Watch",
                  try2: "6. Try",
                  test: "7. Quiz",
                  mirrorFormulaComingSoon: "Coming Soon",
                  rfIntroTell: "1. Intro",
                  rfIntroShow: "2. Watch",
                  rfSnellTell: "1. Snell's Law",
                  rfSnellShow: "2. Watch",
                }[s]}
              </div>
            );
          })}
      </div>

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
            onContinue={() => {
              selectTopic("laws-reflection");
              setStage("tell1");
            }}
          />
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

          <button style={styles.btnPrimary} onClick={() => setStage("smShow")}>
            Start Spherical Mirror Animation →
          </button>
        </div>
      )}

      {/* SPHERICAL MIRROR BASICS - SHOW */}
      {stage === "smShow" && (
        <div style={styles.cardWide}>
          <SphericalMirrorDetailedAnimation onTryItClicked={() => setStage("smQuiz")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setStage("smQuiz")}>
              Continue to Basics Quiz →
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
            There are 3 standard rules of ray tracing that you must master.
          </p>
          <button style={styles.btnPrimary} onClick={() => setStage("smRulesShow")}>
            Watch the 3 Rules →
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
            By combining the 3 rules you just learned, we can predict exactly where an image will form for any object!
            There are 8 total cases (6 for Concave, 2 for Convex). Let's watch them in action.
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
              { id: "concave-between-c-and-f", label: "Concave: Obj Between C & F" },
              { id: "concave-at-f", label: "Concave: Obj At F" },
              { id: "concave-between-f-and-p", label: "Concave: Obj Between F & P" },
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

      {/* SPHERICAL MIRROR QUIZ */}
      {stage === "smQuiz" && (
        <div style={styles.card}>
          <QuizPage />
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
          <QuizPage />
        </div>
      )}

      {/* MIRROR FORMULA - COMING SOON */}
      {stage === "mirrorFormulaComingSoon" && (
        <div style={styles.card}>
          <h2 style={styles.h2}>4. Mirror Formula (Numerical Section)</h2>
          <p style={styles.explanation}>
            This numerical and formula section is currently under development.
          </p>
          <div style={styles.lawBox || { padding: "12px", background: "#fef2f2", border: "1px dashed #fca5a5", borderRadius: "8px", margin: "16px 0", textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#991b1b" }}>Coming Soon!</p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setView("dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          REFRACTION MODULE
      ═══════════════════════════════════════════════════════ */}

      {/* REFRACTION INTRO — TELL */}
      {stage === "rfIntroTell" && (
        <div style={{ ...styles.cardWide, maxWidth: "860px" }}>
          <h2 style={styles.h2}>Introduction to Refraction</h2>

          {/* ── TOP: two-column layout ── */}
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "20px" }}>

            {/* LEFT — static SVG diagram */}
            <div style={{ flex: "0 0 auto" }}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#94A3B8", textAlign: "center", fontStyle: "italic" }}>
                Ray Diagram: Refraction at Air–Water boundary
              </p>
              <svg width="340" height="320" style={{ display: "block", borderRadius: "12px", border: "1px solid rgba(100,116,139,0.3)", background: "#0F172A" }}>
                <defs>
                  {/* Arrow markers */}
                  <marker id="ti-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#60A5FA" />
                  </marker>
                  <marker id="ti-teal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#2DD4BF" />
                  </marker>
                  {/* Medium gradients */}
                  <linearGradient id="ti-air" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0F1F38" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="ti-water" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0C4A6E" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#082f49" stopOpacity="1" />
                  </linearGradient>
                  <filter id="ti-glow">
                    <feGaussianBlur stdDeviation="2.5" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* AIR zone */}
                <rect x="0" y="0" width="340" height="155" fill="url(#ti-air)" />
                {/* WATER zone */}
                <rect x="0" y="155" width="340" height="165" fill="url(#ti-water)" />
                {/* Water ripples */}
                {[20, 50, 80, 110].map(dy => (
                  <path key={dy}
                    d={`M0,${155+dy} Q85,${148+dy} 170,${155+dy} Q255,${162+dy} 340,${155+dy}`}
                    fill="none" stroke="#38BDF8" strokeWidth="0.8" opacity="0.25" />
                ))}

                {/* Boundary line */}
                <line x1="0" y1="155" x2="340" y2="155" stroke="#38BDF8" strokeWidth="2" opacity="0.8" />

                {/* Medium labels */}
                <text x="14" y="28" fill="#93C5FD" fontSize="13" fontWeight="700" fontFamily="Arial">AIR</text>
                <text x="14" y="44" fill="#60A5FA" fontSize="11" fontFamily="Arial">n₁ = 1.00</text>
                <text x="14" y="182" fill="#7DD3FC" fontSize="13" fontWeight="700" fontFamily="Arial">WATER</text>
                <text x="14" y="198" fill="#38BDF8" fontSize="11" fontFamily="Arial">n₂ = 1.33</text>

                {/* Normal (dashed vertical) — at x=170, from y=10 to y=310 */}
                <line x1="170" y1="18" x2="170" y2="308" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="7,5" />
                <text x="176" y="30" fill="#94A3B8" fontSize="11" fontFamily="Arial" fontWeight="600">Normal (N)</text>

                {/* INCIDENT RAY: from upper-left → (170,155) at 40° from normal */}
                {/* 40° from vertical normal in air: dx = sin40° = 0.643, dy = -cos40° = -0.766 */}
                {/* start = (170 - 0.643*130, 155 - 0.766*130) = (87, 55) */}
                <line x1="87" y1="55" x2="170" y2="155"
                  stroke="#60A5FA" strokeWidth="2.8" markerEnd="url(#ti-blue)" filter="url(#ti-glow)" />
                {/* Incident ray label */}
                <text x="72" y="50" fill="#60A5FA" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Incident</text>
                <text x="72" y="63" fill="#60A5FA" fontSize="12" fontWeight="700" fontFamily="Arial" textAnchor="middle">Ray</text>

                {/* REFRACTED RAY: from (170,155) → lower-right at 29° from normal */}
                {/* 29° from vertical normal in water: dx = sin29° = 0.485, dy = cos29° = 0.875 */}
                {/* end = (170 + 0.485*135, 155 + 0.875*135) = (236, 273) */}
                <line x1="170" y1="155" x2="236" y2="273"
                  stroke="#2DD4BF" strokeWidth="2.8" markerEnd="url(#ti-teal)" filter="url(#ti-glow)" />
                {/* Refracted ray label */}
                <text x="258" y="262" fill="#2DD4BF" fontSize="12" fontWeight="700" fontFamily="Arial">Refracted</text>
                <text x="258" y="275" fill="#2DD4BF" fontSize="12" fontWeight="700" fontFamily="Arial">Ray</text>

                {/* Point of incidence dot */}
                <circle cx="170" cy="155" r="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="178" y="152" fill="#FBBF24" fontSize="11" fontFamily="Arial" fontWeight="600">P</text>

                {/* ANGLE i arc — upper left quadrant, from normal to incident ray */}
                {/* Arc from -40° to 0° (above surface, measured from upward normal) */}
                {/* r=44: from (170+44*sin(-40°), 155-44*cos(-40°)) to (170, 155-44) */}
                {/* = (170-28.3, 155-33.7) to (170, 111) → (141.7,121.3) to (170,111) */}
                <path d="M141.7,121.3 A44,44 0 0,1 170,111"
                  fill="none" stroke="#FBBF24" strokeWidth="2" />
                <path d="M141.7,121.3 A44,44 0 0,1 170,111 L170,155 Z"
                  fill="#FBBF24" fillOpacity="0.12" />
                <text x="143" y="109" fill="#FBBF24" fontSize="17" fontWeight="900" fontFamily="Arial" textAnchor="middle">i</text>
                <text x="143" y="123" fill="#FBBF24" fontSize="10" fontFamily="Arial" textAnchor="middle">=40°</text>

                {/* ANGLE r arc — lower right quadrant, from normal to refracted ray */}
                {/* Arc from 0° to 29° (below surface, measured from downward normal) */}
                {/* r=44: from (170, 155+44) to (170+44*sin29°, 155+44*cos29°) */}
                {/* = (170,199) to (170+21.3,155+38.5) = (191.3,193.5) */}
                <path d="M170,199 A44,44 0 0,0 191.3,193.5"
                  fill="none" stroke="#34D399" strokeWidth="2" />
                <path d="M170,199 A44,44 0 0,0 191.3,193.5 L170,155 Z"
                  fill="#34D399" fillOpacity="0.12" />
                <text x="197" y="189" fill="#34D399" fontSize="17" fontWeight="900" fontFamily="Arial">r</text>
                <text x="197" y="202" fill="#34D399" fontSize="10" fontFamily="Arial">=29°</text>

                {/* i > r callout badge */}
                <rect x="60" y="265" width="120" height="36" rx="8" fill="#1E3A5F" stroke="#60A5FA" strokeWidth="1" />
                <text x="120" y="279" fill="#93C5FD" fontSize="11" fontWeight="700" fontFamily="Arial" textAnchor="middle">i (40°) &gt; r (29°)</text>
                <text x="120" y="293" fill="#2DD4BF" fontSize="10" fontFamily="Arial" textAnchor="middle">↑ bends TOWARD normal</text>

                {/* Speed labels */}
                <text x="310" y="85" fill="#93C5FD" fontSize="10" fontFamily="Arial" textAnchor="middle">faster</text>
                <text x="310" y="97" fill="#93C5FD" fontSize="10" fontFamily="Arial" textAnchor="middle">⚡</text>
                <text x="310" y="228" fill="#38BDF8" fontSize="10" fontFamily="Arial" textAnchor="middle">slower</text>
                <text x="310" y="240" fill="#38BDF8" fontSize="10" fontFamily="Arial" textAnchor="middle">🐢</text>
              </svg>
            </div>

            {/* RIGHT — explanation text */}
            <div style={{ flex: "1 1 240px" }}>
              <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#D1D5DB", lineHeight: "1.7" }}>
                <strong style={{ color: "#60A5FA" }}>Refraction</strong> is the <strong>bending of light</strong>{" "}
                when it crosses the boundary between two transparent mediums (e.g., Air → Water).
              </p>
              <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#D1D5DB", lineHeight: "1.7" }}>
                Light slows down in water (denser), which makes it bend{" "}
                <strong style={{ color: "#2DD4BF" }}>toward the Normal</strong>.
              </p>

              {/* Key terms as colour-coded pills */}
              {[
                { label: "Incident Ray", color: "#60A5FA", desc: "incoming ray of light" },
                { label: "Normal (N)", color: "#94A3B8", desc: "⊥ line at point P" },
                { label: "Refracted Ray", color: "#2DD4BF", desc: "bent ray after boundary" },
                { label: "Angle i", color: "#FBBF24", desc: "in AIR from Normal = 40°" },
                { label: "Angle r", color: "#34D399", desc: "in WATER from Normal = 29°" },
              ].map(({ label, color, desc }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: "8px", padding: "7px 10px",
                  background: "rgba(255,255,255,0.03)", borderRadius: "8px",
                  border: `1px solid ${color}33`,
                }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ color, fontWeight: 700, fontSize: "13px", minWidth: "90px" }}>{label}</span>
                  <span style={{ color: "#94A3B8", fontSize: "12px" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM: Three fact cards ── */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "22px" }}>
            {[
              {
                icon: "🪣",
                title: "Straw in Water",
                text: "The straw looks bent because light from underwater bends away from the Normal when exiting to air.",
                color: "#F59E0B",
              },
              {
                icon: "📏",
                title: "Snell's Law",
                text: "n₁ sin i = n₂ sin r  — the ratio of sines is always equal to the ratio of refractive indices.",
                color: "#818CF8",
              },
              {
                icon: "🎯",
                title: "Golden Rule",
                text: "Rarer → Denser: r < i (toward normal).  Denser → Rarer: r > i (away from normal).",
                color: "#2DD4BF",
              },
            ].map(({ icon, title, text, color }) => (
              <div key={title} style={{
                flex: "1 1 180px", padding: "14px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${color}44`,
                borderRadius: "10px",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: "22px" }}>{icon}</p>
                <p style={{ margin: "0 0 6px", fontWeight: 700, color, fontSize: "13px" }}>{title}</p>
                <p style={{ margin: 0, color: "#94A3B8", fontSize: "12px", lineHeight: "1.6" }}>{text}</p>
              </div>
            ))}
          </div>

          <button style={styles.btnPrimary} onClick={() => setStage("rfIntroShow")}>
            Watch the Animation with Audio →
          </button>
        </div>
      )}

      {/* REFRACTION INTRO — SHOW */}
      {stage === "rfIntroShow" && (
        <div style={styles.cardWide}>
          <RefractionIntroAnimation onContinue={() => setStage("rfSnellTell")} />
        </div>
      )}

      {/* REFRACTION — SNELL'S LAW TELL */}
      {stage === "rfSnellTell" && (
        <div style={{ ...styles.cardWide, maxWidth: "860px" }}>
          <h2 style={styles.h2}>Laws of Refraction (Snell's Law)</h2>
          <p style={styles.explanation}>
            The laws of refraction relate the angle of incidence, angle of refraction,
            and the refractive indices of the two mediums.
          </p>
          <div style={styles.lawBox}>
            <p style={styles.lawText}>n₁ sin i = n₂ sin r</p>
            <p style={{ ...styles.lawText, fontSize: 13, fontWeight: 500 }}>
              Law 1: Incident ray, refracted ray, and normal are coplanar.<br />
              Law 2: The ratio of sines equals the ratio of refractive indices.
            </p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setStage("rfSnellShow")}>
            Watch Snell's Law Animation →
          </button>
        </div>
      )}

      {/* REFRACTION — SNELL'S LAW SHOW */}
      {stage === "rfSnellShow" && (
        <div style={styles.cardWide}>
          <SnellsLawAnimation onContinue={() => setView("dashboard")} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => setView("dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
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

  return (
    <div style={styles.page}>
      <Dashboard
        onStartTopic={(topicId) => {
          if (topicId === "plane-mirror") {
            setStage("pmTell");
          } else if (topicId === "spherical-mirror-basics") {
            setStage("smTell");
          } else if (topicId === "spherical-mirror-rules") {
            setStage("smRulesTell");
          } else if (topicId === "spherical-mirror-image-formation") {
            setStage("smFormationTell");
          } else if (topicId === "mirror-formula") {
            setStage("mirrorFormulaComingSoon");
          } else if (topicId === "laws-reflection") {
            setStage("tell1");
          } else if (topicId === "refraction-intro") {
            setStage("rfIntroTell");
          } else if (topicId === "refraction-snells-law") {
            setStage("rfSnellTell");
          } else {
            setStage("test");
          }
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
