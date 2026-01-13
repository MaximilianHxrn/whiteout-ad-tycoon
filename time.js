// Provides a timer for the game loop.
export class Time {
  constructor() {
    this.last = performance.now();
  }
  tick() {
    const now = performance.now();
    const dt = (now - this.last) / 1000; // seconds
    this.last = now;
    // clamp dt to avoid big jumps
    return Math.min(dt, 0.05);
  }
}