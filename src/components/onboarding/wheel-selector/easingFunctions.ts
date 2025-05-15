
/**
 * Collection of easing functions for smooth animations
 */

// Linear interpolation (no easing)
export const linear = (t: number): number => t;

// Quadratic ease out
export const easeOutQuad = (t: number): number => t * (2 - t);

// Cubic ease out
export const easeOutCubic = (t: number): number => 1 + (--t) * t * t;

// Quartic ease out
export const easeOutQuart = (t: number): number => 1 - (--t) * t * t * t;

// Quintic ease out
export const easeOutQuint = (t: number): number => 1 + (--t) * t * t * t * t;

// Sinusoidal ease out
export const easeOutSine = (t: number): number => Math.sin(t * Math.PI / 2);

// Exponential ease out
export const easeOutExpo = (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

// Circular ease out
export const easeOutCirc = (t: number): number => Math.sqrt(1 - (--t) * t);

// Elastic ease out
export const easeOutElastic = (t: number): number => {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
};

// Back ease out
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Bounce ease out
export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};
