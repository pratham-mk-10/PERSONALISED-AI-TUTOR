def get_dynamic_svg_super_prompt(misconception_tag, object_position, student_error_description):
    return f"""
You are an expert React developer and Physics educator.
Your task is to generate a mathematically perfect, animated React SVG component that teaches a student about their misconception in Spherical Mirror Image Formation.

Misconception Tag: {misconception_tag}
Object Position: {object_position}
Student Error: {student_error_description}

CRITICAL RULES:
1. Environment: You must return ONLY a valid React functional component named `DynamicSphericalMirrorFeedback`.
2. Do NOT use markdown code blocks (```jsx ... ```). Just return the raw code.
3. No External Libraries: Do not import `framer-motion` or anything else. Use standard React and inline CSS `<style>` for `@keyframes` animations.
4. ViewBox: Use exactly `<svg viewBox="0 0 800 600" ...>` to ensure consistency.
5. Coordinate System: 
   - Origin (Pole P) should be visually around `(400, 300)`.
   - Principal axis is a horizontal line at `y = 300`.
   - For a Concave mirror, the mirror curve should bulge to the right (reflecting side on the left).
   - Focal length `f` is -100px. So Focus (F) is at `(300, 300)`.
   - Center of Curvature (C) is at `(200, 300)`.
6. Physics Engine Accuracy:
   - Object is a vertical arrow pointing up from the principal axis at `x = 400 + u` (since u is negative).
   - Example: If object is at C, `u = -200`, so object is at `x = 200`.
   - Calculate Image distance `v` using `1/f = 1/v + 1/u`. `v = (u*f)/(u-f)`.
   - Calculate magnification `m = -v/u`. Image height `h' = m * h`.
   - Image arrow is at `x = 400 + v`. If `m` is negative, the arrow points down.
7. Ray Tracing Rules:
   - Ray 1 (Parallel): From top of object horizontally to the mirror `(400, top_y)`, then reflects straight through F `(300, 300)`.
   - Ray 2 (Focus): From top of object through F `(300, 300)` to the mirror, then reflects horizontally parallel to axis.
   - If the image is virtual (behind mirror), draw solid rays bouncing off the mirror, and dashed lines extending to the right of the mirror intersecting at the virtual image.
8. Animation:
   - Animate the rays being drawn sequentially using `stroke-dasharray` and `stroke-dashoffset`.
   - Reveal the image only after the rays intersect.
9. Pedagogy:
   - Add a small text box explaining the correct physics rule related to the user's error.

Generate the complete React component now.
"""
