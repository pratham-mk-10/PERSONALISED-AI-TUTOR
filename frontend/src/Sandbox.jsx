import React from "react";
import SphericalMirrorMisconceptionFeedback from "./svg-engine/reflection/spherical-mirrors/animations/feedback/SphericalMirrorMisconceptionFeedback";
import ReflectionMisconceptionFeedback from "./svg-engine/reflection/animations/feedback/ReflectionMisconceptionFeedback";
import Case1BeyondC from "./sandbox-tests/Case_1_Beyond_C";
import Case4AtF from "./sandbox-tests/Case_4_At_F";
import Case5BetweenPF from "./sandbox-tests/Case_5_Between_P_and_F";
import RayTracingRulesLesson from "./svg-engine/reflection/spherical-mirrors/animations/RayTracingRulesLesson";
import ImageFormationLesson from "./svg-engine/reflection/spherical-mirrors/animations/ImageFormationLesson";
import DynamicMirrorFeedback from "./components/quiz/DynamicMirrorFeedback";

const Sandbox = () => {
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
    <div style={{ padding: "20px", background: "#F3F4F6", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#1F2937" }}>Animation Sandbox</h1>
      
      <h2 style={{ textAlign: "center", marginTop: "20px", color: "#DC2626", fontWeight: "bold" }}>Dynamic Try Stage (Red/Green Overlay)</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", marginBottom: "60px" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <DynamicMirrorFeedback 
              mirrorType="concave" 
              focalLength={100} 
              initialObjectDistance={150} 
              flawedModel={{ v: 50, hPrime: 30, isVirtual: true }} 
            />
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <DynamicMirrorFeedback 
              mirrorType="convex" 
              focalLength={100} 
              initialObjectDistance={150} 
              flawedModel={{ v: -100, hPrime: -50, isVirtual: false }} 
            />
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
