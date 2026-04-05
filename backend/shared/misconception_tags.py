from enum import Enum


class MisconceptionTag(str, Enum):
    ANGLE_FROM_SURFACE = "angle_from_surface"
    REFLECTION_NOT_EQUAL = "reflection_not_equal"
    NORMAL_ORIENTATION_WRONG = "normal_orientation_wrong"
    PLANE_NOT_SAME = "plane_not_same"
