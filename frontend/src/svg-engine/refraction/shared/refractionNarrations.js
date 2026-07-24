// Narration scripts for all refraction long-form lessons (NCERT Ch.9)

export const INTRO_STEPS = [
  { progress: 1 / 6, part: 1, text: "Welcome. Let us begin. Look at this diagram carefully. The top half, shaded in blue, represents AIR with refractive index one point zero zero. The bottom half represents WATER with refractive index one point three three. A higher refractive index means light travels more slowly. Light travels faster in air and slower in water. The horizontal line separating them is the boundary where refraction happens." },
  { progress: 2 / 6, part: 2, text: "Here is a real-life example. When you place a straw in a glass of water, it appears bent at the water surface. But the straw is perfectly straight. Light from the straw bends when it crosses the boundary. Your eyes trace these bent rays back in a straight line, making the straw appear bent. This bending of light at the boundary between two mediums is called refraction." },
  { progress: 3 / 6, part: 3, text: "Now watch the blue incident ray appear. It is a ray of light travelling through air from the upper left toward the water surface. It strikes the surface at the point of incidence, labelled P. The incident ray is still in air and has not yet crossed into water." },
  { progress: 4 / 6, part: 4, text: "At point P we draw a dashed line perpendicular to the surface. This is the Normal. All angles in refraction are measured from the Normal, never from the surface itself. The normal extends both above and below the boundary." },
  { progress: 5 / 6, part: 5, text: "Now watch the teal refracted ray appear below the surface. As light enters water it slows down because water is denser than air. When light slows down entering a denser medium, it bends toward the Normal. The refracted ray is closer to the Normal than the incident ray was." },
  { progress: 1, part: 6, text: "The angle between the incident ray and the normal in air is the angle of incidence i, equal to forty degrees. The angle between the refracted ray and the normal in water is the angle of refraction r, equal to twenty nine degrees. Because r is less than i, the ray bent toward the Normal, proving light entered a denser medium. Refraction is the bending of light at the boundary of two transparent mediums." },
];

export const SNELL_STEPS = [
  { progress: 0.25, part: 1, text: "Now we learn the Laws of Refraction, also called Snell's Law. The first law states that the incident ray, the refracted ray, and the normal all lie in the same plane. The second law gives the mathematical relationship between the angles and the refractive indices." },
  { progress: 0.5, part: 2, text: "Snell's Law is written as n one sin i equals n two sin r. n one is the refractive index of the first medium, air, equal to one point zero zero. n two is the refractive index of water, one point three three. i is the angle of incidence and r is the angle of refraction. Both angles are measured from the Normal." },
  { progress: 0.75, part: 3, text: "Let us verify with our diagram. Angle i equals forty degrees and angle r equals twenty nine degrees. One point zero zero times sin forty degrees equals one point three three times sin twenty nine degrees. Both sides are approximately zero point six four three. Snell's Law is satisfied." },
  { progress: 1, part: 4, text: "Remember the golden rules. From rarer to denser medium, r is less than i and the ray bends toward the Normal. From denser to rarer medium, r is greater than i and the ray bends away from the Normal. In air to water, r equals twenty nine degrees which is less than i equals forty degrees." },
];

export const GLASS_SLAB_STEPS = [
  { progress: 0.2, part: 1, text: "Let us study refraction through a rectangular glass slab. A glass slab has two parallel surfaces. Light passes through air, enters the glass, travels inside, and emerges back into air. Glass has refractive index about one point five, so it is optically denser than air." },
  { progress: 0.4, part: 2, text: "Watch the incident ray strike the top surface of the slab obliquely. At the first boundary, air to glass, light slows down and bends toward the Normal. This is the first refraction at the top surface." },
  { progress: 0.6, part: 3, text: "Inside the glass slab the ray travels in a straight line at an angle to the normal. The ray then reaches the bottom parallel surface of the slab." },
  { progress: 0.8, part: 4, text: "At the second boundary, glass to air, light speeds up and bends away from the Normal. The emergent ray leaves the slab into air." },
  { progress: 1, part: 5, text: "Notice the important result. The emergent ray is parallel to the incident ray but is shifted sideways. This sideways shift is called lateral displacement. The incident ray and emergent ray are parallel because the two refracting surfaces of the slab are parallel." },
];

export const LENSES_STEPS = [
  { progress: 0.2, part: 1, text: "A lens is a transparent material bounded by two curved surfaces. Lenses are used in spectacles, cameras, and microscopes. There are two main types: convex lenses and concave lenses." },
  { progress: 0.4, part: 2, text: "A convex lens is thicker at the middle and thinner at the edges. It is also called a converging lens because parallel rays of light passing through it converge at the principal focus F on the other side." },
  { progress: 0.6, part: 3, text: "A concave lens is thinner at the middle and thicker at the edges. It is a diverging lens. Parallel rays passing through it appear to diverge from the principal focus F on the same side as the incident light." },
  { progress: 0.8, part: 4, text: "Every lens has an optical centre O, a principal axis passing through O, and two principal foci F one and F two. For a thin lens, the distance from O to F is the focal length f. For convex lens f is positive. For concave lens f is negative by sign convention." },
  { progress: 1, part: 5, text: "To summarise: convex lenses converge light and have positive focal length. Concave lenses diverge light and have negative focal length. The optical centre O is the point through which a ray passes undeviated." },
];

export const LENS_IMAGE_STEPS = [
  { progress: 0.25, part: 1, text: "Image formation by lenses uses ray diagrams. For a convex lens, a ray parallel to the principal axis passes through F after refraction. A ray through the optical centre O passes straight without bending." },
  { progress: 0.5, part: 2, text: "When an object is placed beyond two F for a convex lens, a real, inverted, diminished image forms between F and two F on the other side. This is how a camera forms an image on film." },
  { progress: 0.75, part: 3, text: "When the object is between F and O for a convex lens, a virtual, erect, magnified image forms on the same side as the object. This is how a magnifying glass works." },
  { progress: 1, part: 4, text: "For a concave lens, whatever the object position, the image is always virtual, erect, and diminished, formed between O and F on the same side as the object. Concave lenses are used in spectacles for correcting myopia." },
];

export const LENS_FORMULA_STEPS = [
  { progress: 0.25, part: 1, text: "The lens formula relates object distance u, image distance v, and focal length f. It is written as one over v minus one over u equals one over f. This applies to both convex and concave lenses when sign convention is followed." },
  { progress: 0.5, part: 2, text: "Sign convention for lenses: object distance u is always negative when the object is on the left. For a convex lens focal length f is positive. For a concave lens f is negative. A real image has positive v. A virtual image has negative v." },
  { progress: 0.75, part: 3, text: "Magnification m equals height of image divided by height of object, also equal to v over u. If m is negative the image is inverted. If m is positive the image is erect. Magnification greater than one means enlarged image." },
  { progress: 1, part: 4, text: "Power of a lens P equals one over f where f is in metres. The unit is dioptre, symbol D. One dioptre is the power of a lens with focal length one metre. Convex lenses have positive power. Concave lenses have negative power. Power of combination of lenses in contact is P equals P one plus P two." },
];
