import type { Constraints } from '@/layout/types'

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value) && value !== Infinity) {
    throw new Error(`${label} must be a finite number or Infinity, got ${value}`)
  }
}

export class ConstraintsImpl implements Constraints {
  readonly minWidth: number
  readonly maxWidth: number
  readonly minHeight: number
  readonly maxHeight: number

  constructor(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number) {
    assertFinite(minWidth, 'minWidth')
    assertFinite(maxWidth, 'maxWidth')
    assertFinite(minHeight, 'minHeight')
    assertFinite(maxHeight, 'maxHeight')
    if (minWidth < 0 || maxWidth < 0 || minHeight < 0 || maxHeight < 0) {
      throw new Error('Constraints values must be >= 0')
    }
    if (minWidth > maxWidth) {
      throw new Error('minWidth must be <= maxWidth')
    }
    if (minHeight > maxHeight) {
      throw new Error('minHeight must be <= maxHeight')
    }
    this.minWidth = minWidth
    this.maxWidth = maxWidth
    this.minHeight = minHeight
    this.maxHeight = maxHeight
  }
}

export function tightConstraints(width: number, height: number): Constraints {
  return new ConstraintsImpl(width, width, height, height)
}

export const fixedConstraints = tightConstraints

export function looseConstraints(maxWidth: number, maxHeight: number): Constraints {
  return new ConstraintsImpl(0, maxWidth, 0, maxHeight)
}

export function unconstrained(): Constraints {
  return new ConstraintsImpl(0, Infinity, 0, Infinity)
}

export function constrainWidth(constraints: Constraints, width: number): number {
  return Math.min(Math.max(constraints.minWidth, width), constraints.maxWidth)
}

export function constrainHeight(constraints: Constraints, height: number): number {
  return Math.min(Math.max(constraints.minHeight, height), constraints.maxHeight)
}
