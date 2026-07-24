import math

def _generate_base_parameters(misconception_tag):
    # Procedurally generate the base geometric coordinates so the math engine can always run
    base_traj = []
    
    if misconception_tag in ["ray_passes_through_center_of_curvature", "ray_misses_focal_point", "lens_parallel_ray_wrong", "concave_lens_converge_myth", "concave_lens_parallel_ray_wrong"]:
        # Parallel incident ray hitting at X=400
        base_traj = [{"x": 100, "y": 150}, {"x": 400, "y": 150}]
    
    elif misconception_tag in ["snell_law_confusion", "refraction_bending_normal"]:
        # Ray hitting interface at X=400, Y=200
        base_traj = [{"x": 250, "y": 50}, {"x": 400, "y": 200}]
        
    elif misconception_tag == "lens_optical_center_confusion":
        # Ray passing through origin (400, 200)
        base_traj = [{"x": 200, "y": 100}, {"x": 400, "y": 200}]
        
    elif misconception_tag in ["glass_slab_lateral_shift_wrong", "glass_slab_parallel_confusion", "lateral_displacement_confusion"]:
        # Incident ray hitting slab, and refracting inside slab
        base_traj = [{"x": 200, "y": 50}, {"x": 300, "y": 150}, {"x": 400, "y": 280}]
        
    elif misconception_tag == "tir_critical_angle_confusion":
        # Ray hitting interface from denser medium
        base_traj = [{"x": 300, "y": 300}, {"x": 400, "y": 200}]
        
    elif misconception_tag == "mirror_formula_wrong":
        base_traj = [{"x": 250, "y": 200}] # u = -150
        
    elif misconception_tag == "lens_formula_wrong":
        base_traj = [{"x": 200, "y": 200}] # u = -200
        
    if base_traj:
        return {
            "student_incorrect_trajectory": list(base_traj),
            "physics_correct_trajectory": list(base_traj)
        }
    return None

def validate_and_fix(animation_parameters, misconception_tag):
    if not animation_parameters:
        animation_parameters = _generate_base_parameters(misconception_tag)
        if not animation_parameters:
            return None

        
    student_traj = animation_parameters.get("student_incorrect_trajectory", [])
    physics_traj = animation_parameters.get("physics_correct_trajectory", [])
    
    if len(physics_traj) < 3:
        # LLM hallucinated badly, just return what it gave and hope for the best
        # or we could provide a hardcoded fallback
        pass
        
    if misconception_tag == "ray_passes_through_center_of_curvature" or misconception_tag == "ray_misses_focal_point":
        # Rule: A ray parallel to the principal axis reflects through the focus (300, 200)
        # Assuming incident ray is parallel (y1 == y2)
        if len(physics_traj) >= 2:
            p1 = physics_traj[0]
            p2 = physics_traj[1]
            
            # If the ray is horizontal (parallel to principal axis)
            if abs(p1.get("y", 0) - p2.get("y", 0)) < 5:
                # Force the reflected ray to pass through focus (300, 200)
                # Let's just override the third point to be the focus
                # Or extend it past the focus.
                if len(physics_traj) >= 3:
                    physics_traj[2] = {"x": 300, "y": 200}
                else:
                    physics_traj.append({"x": 300, "y": 200})
                animation_parameters["physics_correct_trajectory"] = physics_traj[:3]
    
    elif misconception_tag in ["snell_law_confusion", "refraction_bending_normal"]:
        # Interface is at Y=200, Normal is at X=400.
        # Let's assume light going from air (n=1) to glass (n=1.5).
        # Incident ray hits (400, 200).
        if len(physics_traj) >= 2:
            p1 = physics_traj[0]
            p2 = physics_traj[1] # Should be (400, 200)
            
            # Recalculate refraction just to be safe
            dx = 400 - p1.get("x", 400)
            dy = 200 - p1.get("y", 0)
            if dx != 0 and dy != 0:
                angle_incident = math.atan2(abs(dx), abs(dy)) # angle with normal (vertical)
                # Snell's Law: 1 * sin(i) = 1.5 * sin(r)
                sin_r = math.sin(angle_incident) / 1.5
                angle_refracted = math.asin(sin_r)
                
                # New trajectory point
                new_dy = 150
                new_dx = new_dy * math.tan(angle_refracted)
                
                if p1.get("x", 0) < 400:
                    new_x = 400 + new_dx
                else:
                    new_x = 400 - new_dx
                new_y = 200 + new_dy
                
                if len(physics_traj) >= 3:
                    physics_traj[2] = {"x": round(new_x, 2), "y": round(new_y, 2)}
                else:
                    physics_traj.append({"x": round(new_x, 2), "y": round(new_y, 2)})
                animation_parameters["physics_correct_trajectory"] = physics_traj[:3]

    elif misconception_tag == "lens_optical_center_confusion":
        # Rule: Ray passing through the optical center (400, 200) goes straight.
        if len(physics_traj) >= 2:
            p1 = physics_traj[0]
            # p2 is optical center at 400, 200
            dx = 400 - p1.get("x", 0)
            dy = 200 - p1.get("y", 100)
            
            if len(physics_traj) >= 3:
                physics_traj[2] = {"x": 400 + dx, "y": 200 + dy}
            else:
                physics_traj.append({"x": 400 + dx, "y": 200 + dy})
            animation_parameters["physics_correct_trajectory"] = physics_traj[:3]
                
    elif misconception_tag == "lens_parallel_ray_wrong":
        # Rule: Horizontal ray passing through convex lens at X=400 passes through F2 (X=500, Y=200)
        if len(physics_traj) >= 2:
            p1 = physics_traj[0]
            p2 = physics_traj[1] # Should be (400, y)
            
            # Check if incident ray is parallel (horizontal)
            if abs(p1.get("y", 0) - p2.get("y", 0)) < 5:
                if len(physics_traj) >= 3:
                    # The ray must pass through F2 (500, 200)
                    # Let's fix the 3rd point to be exactly F2, or extend past it.
                    # Simplest is to just set it to F2
                    physics_traj[2] = {"x": 500, "y": 200}
                    animation_parameters["physics_correct_trajectory"] = physics_traj[:3]
                    
    elif misconception_tag in ["concave_lens_converge_myth", "concave_lens_parallel_ray_wrong"]:
        # Rule: Parallel ray hitting concave lens (X=400) diverges from F1 (X=300)
        if len(physics_traj) >= 2:
            p1 = physics_traj[0]
            p2 = physics_traj[1] # Should be (400, y)
            if abs(p1.get("y", 0) - p2.get("y", 0)) < 5:
                if len(physics_traj) >= 3:
                    y2 = p2.get("y", 0)
                    # Slope from F1 (300, 200) to P2 (400, y2)
                    dy_focus = y2 - 200
                    dx_focus = 100 # 400 - 300
                    slope = dy_focus / dx_focus
                    # Extend to X=500
                    new_y = y2 + (slope * 100)
                    physics_traj[2] = {"x": 500, "y": round(new_y, 2)}
                    animation_parameters["physics_correct_trajectory"] = physics_traj[:3]
                    
    elif misconception_tag in ["glass_slab_lateral_shift_wrong", "glass_slab_parallel_confusion", "lateral_displacement_confusion"]:
        # Rule: Emergent ray must be parallel to incident ray
        if len(physics_traj) >= 4:
            p1 = physics_traj[0]
            p2 = physics_traj[1] # Incident ray p1->p2
            p3 = physics_traj[2] # Refracted ray p2->p3
            # P4 is emergent ray
            dx_inc = p2.get("x", 0) - p1.get("x", 0)
            dy_inc = p2.get("y", 0) - p1.get("y", 0)
            
            # Force P4 to be parallel
            physics_traj[3] = {
                "x": p3.get("x", 0) + dx_inc,
                "y": p3.get("y", 0) + dy_inc
            }
            animation_parameters["physics_correct_trajectory"] = physics_traj[:4]
            
    elif misconception_tag == "tir_critical_angle_confusion":
        # Rule: Total internal reflection. Bounces back at same angle.
        if len(physics_traj) >= 2:
            p1 = physics_traj[0]
            p2 = physics_traj[1] # Interface point
            if len(physics_traj) >= 3:
                dx = p2.get("x", 0) - p1.get("x", 0)
                dy = p2.get("y", 0) - p1.get("y", 0)
                # Reflect across horizontal interface (assuming Y is horizontal interface)
                # dy flips sign
                physics_traj[2] = {
                    "x": p2.get("x", 0) + dx,
                    "y": p2.get("y", 0) - dy
                }
                animation_parameters["physics_correct_trajectory"] = physics_traj[:3]
                
    elif misconception_tag == "mirror_formula_wrong":
        # Assuming Pole=400, f=-100 (Concave). Calculate v.
        if len(physics_traj) >= 2:
            p1 = physics_traj[0] # Object
            u = p1.get("x", 0) - 400
            f = -100
            if u != 0 and u != f:
                # 1/v = 1/f - 1/u
                inv_v = (1/f) - (1/u)
                if inv_v != 0:
                    v = 1 / inv_v
                    image_x = 400 + v
                    # Force the final point to cross image_x
                    if len(physics_traj) >= 3:
                        # Just drop it at image_x for visualization sake
                        physics_traj[2]["x"] = round(image_x, 2)
                        animation_parameters["physics_correct_trajectory"] = physics_traj[:3]
                        
    elif misconception_tag == "lens_formula_wrong":
        # Assuming Optical center=400, f=100 (Convex). Calculate v.
        if len(physics_traj) >= 2:
            p1 = physics_traj[0] # Object
            u = p1.get("x", 0) - 400
            f = 100
            if u != 0 and u != -f:
                # 1/v - 1/u = 1/f => 1/v = 1/f + 1/u
                inv_v = (1/f) + (1/u)
                if inv_v != 0:
                    v = 1 / inv_v
                    image_x = 400 + v
                    if len(physics_traj) >= 3:
                        physics_traj[2]["x"] = round(image_x, 2)
                        animation_parameters["physics_correct_trajectory"] = physics_traj[:3]

    return animation_parameters
