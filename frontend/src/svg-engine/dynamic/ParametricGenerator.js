/**
 * ParametricGenerator
 * 
 * Maps misconception tags to deterministic mathematical drawing parameters.
 * This ensures the physics engine has strict constraints and the LLM 
 * does not hallucinate the math.
 */

const generateRayTracingParams = (misconceptionTag, attemptNumber) => {
  // Base configuration
  const config = {
    frame_count: 60,
    visualization_mode: attemptNumber > 2 ? "step_by_step" : "overlay",
    student_incorrect_trajectory: [],
    physics_correct_trajectory: []
  };

  // The viewbox is assumed to be 800x400.
  // Origin (0,0) is top-left.
  // Let's assume a principal axis at Y=200.
  // Pole at X=400. Focus at X=300 (Concave mirror). Center at X=200.
  
  switch (misconceptionTag) {
    case "ray_passes_through_center_of_curvature":
    case "ray_misses_focal_point":
      // Incident parallel ray: y=100
      // Student reflects it to C (200, 200)
      config.student_incorrect_trajectory = [
        { x: 0, y: 100 },
        { x: 400, y: 100 }, // hits mirror
        { x: 200, y: 200 }  // student goes to C
      ];
      // Correct reflection goes to F (300, 200)
      config.physics_correct_trajectory = [
        { x: 0, y: 100 },
        { x: 400, y: 100 }, // hits mirror
        { x: 300, y: 200 }  // correct goes to F
      ];
      break;

    case "snell_law_confusion":
      // Air to Water (n1=1, n2=1.33)
      // Normal at X=400. Interface at Y=200.
      // Incident ray: hits at (400, 200).
      // Student bends away from normal (incorrect)
      config.student_incorrect_trajectory = [
        { x: 300, y: 100 }, // incident
        { x: 400, y: 200 }, // interface
        { x: 550, y: 300 }  // bent away from normal
      ];
      // Correct bends toward normal
      config.physics_correct_trajectory = [
        { x: 300, y: 100 }, // incident
        { x: 400, y: 200 }, // interface
        { x: 470, y: 300 }  // bent toward normal
      ];
      break;

    default:
      // Fallback simple ray
      config.student_incorrect_trajectory = [
        { x: 100, y: 100 }, { x: 300, y: 300 }
      ];
      config.physics_correct_trajectory = [
        { x: 100, y: 100 }, { x: 300, y: 100 }
      ];
  }

  return config;
};

export const getAnimationParameters = (misconceptionTag, attemptNumber) => {
  return generateRayTracingParams(misconceptionTag, attemptNumber);
};
