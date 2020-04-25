
export function invert(accessor) {
  return () => accessor(!accessor());
}
