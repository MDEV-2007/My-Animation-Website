// Lightweight global signal shared between the DOM scroll layer and the WebGL
// render loop. We deliberately avoid React state here: this object is mutated
// every frame and read inside useFrame, so it must never trigger re-renders.

export const stage = {
  // Normalized scroll progress across the whole narrative, 0 -> 1.
  progress: 0,
  // Smoothed progress (eased toward `progress`) used by the camera rig.
  eased: 0,
  // Pointer in normalized device space (-1 -> 1) for cinematic parallax.
  mouseX: 0,
  mouseY: 0,
  // Smoothed pointer.
  pointerX: 0,
  pointerY: 0,
  // Seconds since boot, advanced by the render loop.
  time: 0,
  // Whether the intro boot sequence has finished.
  entered: false,
};

// The scroll narrative is divided into acts. Each act owns a slice of the
// global progress. Scenes read their local 0..1 progress from here.
export const ACTS = {
  hero: [0.0, 0.14],
  forest: [0.14, 0.32],
  ocean: [0.32, 0.5],
  mountains: [0.5, 0.66],
  cosmos: [0.66, 0.8],
  developer: [0.8, 0.9],
  skills: [0.9, 1.0],
};

// Map global progress -> local 0..1 progress for an act, clamped.
export function localProgress(p, [start, end]) {
  return Math.min(1, Math.max(0, (p - start) / (end - start)));
}

// Smooth-min style band: returns 0 outside the range, ramping to 1 in the
// middle third — used to fade whole worlds in and out of the camera path.
export function band(p, start, end, feather = 0.06) {
  const a = smoothstep(start - feather, start + feather, p);
  const b = 1 - smoothstep(end - feather, end + feather, p);
  return Math.min(a, b);
}

export function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
