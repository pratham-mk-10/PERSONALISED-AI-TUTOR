import React from "react";
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SlideShowViewer from "./SlideShowViewer";

afterEach(() => {
  cleanup();
});

const mockDeck = {
  deck_title: "Laws of Reflection & Spherical Mirrors",
  mode: "quick",
  source_filename: "optics_notes.txt",
  total_slides: 2,
  estimated_read_time: "2 min",
  slides: [
    {
      slide_number: 1,
      title: "First Law of Reflection",
      subtitle: "Angular Equality",
      layout_type: "formula_spotlight",
      accent_badge: "Core Law",
      bullets: [
        "Angle of incidence i equals angle of reflection r.",
        "Measured relative to perpendicular normal."
      ],
      formula: "i = r",
      key_takeaway: "Angle i always equals angle r.",
      visual_widget: {
        widget_type: "svg_physics",
        component_key: "first_law_reflection",
        caption: "First law demonstration"
      },
      narration_script: "The First Law of Reflection states that angle i equals angle r.",
      estimated_duration_sec: 20
    },
    {
      slide_number: 2,
      title: "Concave Mirror Focus",
      subtitle: "Convergence of Rays",
      layout_type: "concept_breakdown",
      accent_badge: "Ray Rule",
      bullets: [
        "Parallel rays converge through principal focus F.",
        "f = R / 2"
      ],
      formula: "f = R / 2",
      key_takeaway: "Concave mirrors focus parallel rays at F.",
      visual_widget: null,
      narration_script: "For a concave mirror, parallel rays reflect through the focal point.",
      estimated_duration_sec: 25
    }
  ]
};

describe("SlideShowViewer Component", () => {
  it("renders slide show header, title, and initial slide content", () => {
    render(<SlideShowViewer deck={mockDeck} isOpen={true} initialMode="panel" onClose={() => {}} />);

    expect(screen.getByText("Laws of Reflection & Spherical Mirrors")).toBeTruthy();
    expect(screen.getByText("Quick Overview")).toBeTruthy();
    expect(screen.getByText("First Law of Reflection")).toBeTruthy();
    expect(screen.getByText("Angle of incidence i equals angle of reflection r.")).toBeTruthy();
    expect(screen.getByText(/Core Takeaway:/)).toBeTruthy();
  });

  it("navigates to next slide on Next button click", () => {
    render(<SlideShowViewer deck={mockDeck} isOpen={true} initialMode="panel" onClose={() => {}} />);

    const nextBtn = screen.getByLabelText("Next Slide");
    fireEvent.click(nextBtn);

    expect(screen.getByText("Concave Mirror Focus")).toBeTruthy();
    expect(screen.getByText("Parallel rays converge through principal focus F.")).toBeTruthy();
  });

  it("renders the NotebookLM 2-host podcast engine with Dr. Sarah and Alex", () => {
    render(<SlideShowViewer deck={mockDeck} isOpen={true} initialMode="panel" onClose={() => {}} />);

    expect(screen.getByText("Dr. Sarah")).toBeTruthy();
    expect(screen.getByText("Alex")).toBeTruthy();
    expect(screen.getByText("Play 2-Host Podcast")).toBeTruthy();
  });

  it("does not render SVG physics simulation in quick overview mode", () => {
    render(<SlideShowViewer deck={mockDeck} isOpen={true} initialMode="panel" onClose={() => {}} />);
    expect(screen.queryByText("Deterministic Physics Simulation")).toBeNull();
  });
});
