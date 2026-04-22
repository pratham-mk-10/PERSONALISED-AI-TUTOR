import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import NormalOrientationWrongFeedback from "./svg-engine/reflection/animations/feedback/NormalOrientationWrongFeedback";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("NormalOrientationWrongFeedback", () => {
  it("renders the incorrect normal orientation first", () => {
    render(<NormalOrientationWrongFeedback />);

    expect(screen.getByText("Fix normal orientation")).toBeTruthy();
    expect(screen.getByText("Wrong: Normal is not just any arbitrary line")).toBeTruthy();
    expect(screen.getByText("Normal is not drawn at random angles")).toBeTruthy();
    expect(screen.queryByText("Correct normal (perpendicular)")).toBeNull();
  });

  it("advances to the corrected orientation after the animation runs", () => {
    render(<NormalOrientationWrongFeedback />);

    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(screen.getByText("Correct normal (perpendicular)")).toBeTruthy();
    expect(screen.getByText("Normal is always perpendicular to the mirror")).toBeTruthy();
    expect(screen.getByText("Draw the normal exactly at 90 degrees to the mirror at the point of incidence.")).toBeTruthy();
  });
});
