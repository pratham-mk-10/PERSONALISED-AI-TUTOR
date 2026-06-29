import React, { useState } from "react";
import SphericalMirrorMisconceptionFeedback from "./svg-engine/reflection/spherical-mirrors/animations/feedback/SphericalMirrorMisconceptionFeedback";
import ReflectionMisconceptionFeedback from "./svg-engine/reflection/animations/feedback/ReflectionMisconceptionFeedback";
import Case1BeyondC from "./sandbox-tests/Case_1_Beyond_C";
import Case4AtF from "./sandbox-tests/Case_4_At_F";
import Case5BetweenPF from "./sandbox-tests/Case_5_Between_P_and_F";
import RayTracingRulesLesson from "./svg-engine/reflection/spherical-mirrors/animations/RayTracingRulesLesson";
import ImageFormationLesson from "./svg-engine/reflection/spherical-mirrors/animations/ImageFormationLesson";
import DynamicMirrorFeedback from "./components/quiz/DynamicMirrorFeedback";
import AudioSpeechSandbox from "./sandbox-tests/AudioSpeechSandbox";

const Sandbox = () => {
  const [concaveModel, setConcaveModel] = useState("B");
  const [convexModel, setConvexModel] = useState("B");

  const concaveOptions = {
    A: { label: "Option A: Between C and F (Correct Physics)", flawedModel: null },
    B: { label: "Option B: Behind the mirror (Real/Virtual Confusion)", flawedModel: { v: 100, hPrime: 40, isVirtual: true } },
    C: { label: "Option C: At C (Image Position Confusion)", flawedModel: { v: -200, hPrime: -60, isVirtual: false } },
    D: { label: "Option D: Between C and F, Real & Erect (Inverted/Erect Confusion)", flawedModel: { v: -300, hPrime: 120, isVirtual: false } }
  };

  const convexOptions = {
    A: { label: "Option A: Behind the mirror, Diminished (Correct Physics)", flawedModel: null },
    B: { label: "Option B: In front of the mirror (Convex Real Image Myth)", flawedModel: { v: -100, hPrime: -40, isVirtual: false } },
    C: { label: "Option C: Behind the mirror, Magnified (Convex Size Confusion)", flawedModel: { v: 60, hPrime: 100, isVirtual: true } }
  };

  const smMisconceptions = [
    "pole_confusion",
    "center_of_curvature_confusion",
    "radius_focal_relation_wrong",
    "concave_convex_confusion"
  ];

  const reflMisconceptions = [
    "reflection_not_equal",
    "angle_from_surface",
    "normal_orientation_wrong",
    "plane_not_same"
  ];

  const imageFormationCases = [
    { id: "concave-infinity", title: "Concave Case 1: Object at Infinity" },
    { id: "concave-beyond-c", title: "Concave Case 2: Object Beyond C" },
    { id: "concave-at-c", title: "Concave Case 3: Object At C" },
    { id: "concave-between-c-f", title: "Concave Case 4: Object Between C and F" },
    { id: "concave-at-f", title: "Concave Case 5: Object At F" },
    { id: "concave-between-p-f", title: "Concave Case 6: Object Between P and F" },
    { id: "convex-infinity", title: "Convex Case 1: Object at Infinity" },
    { id: "convex-finite", title: "Convex Case 2: Object between Infinity and Pole" }
  ];

  return (
    <div style={{ padding: "20px", background: "#0B0F19", minHeight: "100vh", color: "white" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#60A5FA" }}>Animation Sandbox</h1>
      
      <AudioSpeechSandbox />
      
      <h2 style={{ textAlign: "center", marginTop: "20px", color: "#DC2626", fontWeight: "bold" }}>Interactive Misconception Quiz Simulator</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", marginBottom: "60px", width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Concave Simulator Card */}
        <div style={{ width: "100%", background: "#1E293B", color: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)", boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px", color: "#60A5FA" }}>Scenario 1: Concave Mirror (Object between C and F)</h3>
          <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "20px" }}>
            <strong>Question:</strong> An object is placed at u = -150 cm in front of a concave mirror (f = 100 cm). Choose a student's answer option below to see how the interactive feedback overlays their prediction in red against the green physics reality:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {Object.entries(concaveOptions).map(([key, opt]) => (
              <button
                key={key}
                onClick={() => setConcaveModel(key)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: concaveModel === key ? (key === "A" ? "#10B981" : "#EF4444") : "#334155",
                  background: concaveModel === key ? (key === "A" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)") : "#0F172A",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: concaveModel === key ? "bold" : "normal",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {opt.label} {key === "A" ? "✓" : "✗"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DynamicMirrorFeedback 
              mirrorType="concave" 
              focalLength={100} 
              initialObjectDistance={150} 
              flawedModel={concaveOptions[concaveModel].flawedModel} 
            />
          </div>
        </div>

        {/* Convex Simulator Card */}
        <div style={{ width: "100%", background: "#1E293B", color: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)", boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px", color: "#60A5FA" }}>Scenario 2: Convex Mirror (Object in front of mirror)</h3>
          <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "20px" }}>
            <strong>Question:</strong> An object is placed at u = -150 cm in front of a convex mirror (f = 100 cm). Choose a student's answer option below to see how the feedback highlights their misconception:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {Object.entries(convexOptions).map(([key, opt]) => (
              <button
                key={key}
                onClick={() => setConvexModel(key)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: convexModel === key ? (key === "A" ? "#10B981" : "#EF4444") : "#334155",
                  background: convexModel === key ? (key === "A" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)") : "#0F172A",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: convexModel === key ? "bold" : "normal",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {opt.label} {key === "A" ? "✓" : "✗"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DynamicMirrorFeedback 
              mirrorType="convex" 
              focalLength={100} 
              initialObjectDistance={150} 
              flawedModel={convexOptions[convexModel].flawedModel} 
            />
          </div>
        </div>

      </div>

      <h2 style={{ textAlign: "center", marginTop: "40px", color: "#2563EB" }}>Laws of Reflection Feedbacks</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", marginBottom: "60px" }}>
        {reflMisconceptions.map(tag => (
          <div key={tag} style={{ width: "800px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "#1F2937" }}>Testing Tag: <code>{tag}</code></h2>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
              <ReflectionMisconceptionFeedback misconceptionTag={tag} />
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ textAlign: "center", color: "#16A34A" }}>Spherical Mirror Feedbacks</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center" }}>
        {smMisconceptions.map(tag => (
          <div key={tag} style={{ width: "800px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "#1F2937" }}>Testing Tag: <code>{tag}</code></h2>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
              <SphericalMirrorMisconceptionFeedback misconceptionTag={tag} />
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ textAlign: "center", marginTop: "40px", color: "#F59E0B" }}>Prerequisite: Ray Tracing Rules</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", marginBottom: "60px" }}>
          <div style={{ width: "800px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "#1F2937" }}>The 3 Standard Rules</h2>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
              <RayTracingRulesLesson />
            </div>
          </div>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "40px", color: "#9333EA" }}>Hybrid Approach: Image Formation (All 8 Cases)</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", marginBottom: "60px" }}>
          {imageFormationCases.map(c => (
            <div key={c.id} style={{ width: "800px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "#1F2937" }}>{c.title}</h2>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <ImageFormationLesson caseId={c.id} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Sandbox;
