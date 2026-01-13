// Utility math functions
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}
