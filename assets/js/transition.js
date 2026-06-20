/**
 * withTransition — progressive-enhancement wrapper for the View Transitions API.
 * Falls back silently when the API is absent or reduced-motion is preferred.
 */
export function withTransition(fn) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !document.startViewTransition) return void fn();
  document.startViewTransition(fn);
}
