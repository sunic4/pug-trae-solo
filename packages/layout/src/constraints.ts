export interface Constraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface Size {
  width: number;
  height: number;
}

export function looseConstraints(maxW: number, maxH: number): Constraints {
  return { minWidth: 0, maxWidth: maxW, minHeight: 0, maxHeight: maxH };
}

export function tightConstraints(w: number, h: number): Constraints {
  return { minWidth: w, maxWidth: w, minHeight: h, maxHeight: h };
}

export function wrapContentConstraints(maxW: number, maxH: number): Constraints {
  return { minWidth: 0, maxWidth: maxW, minHeight: 0, maxHeight: maxH };
}

export function clampSize(constraints: Constraints, w: number, h: number): Size {
  return {
    width: Math.max(constraints.minWidth, Math.min(constraints.maxWidth, w)),
    height: Math.max(constraints.minHeight, Math.min(constraints.maxHeight, h)),
  };
}

export function constraintsToString(c: Constraints): string {
  return `Constraints(minW=${c.minWidth}, maxW=${c.maxWidth}, minH=${c.minHeight}, maxH=${c.maxHeight})`;
}
