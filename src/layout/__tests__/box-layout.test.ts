import { describe, it, expect } from 'vitest'
import {
  createBoxMeasurePolicy,
  computeAlignmentX,
  computeAlignmentY,
  minIntrinsicWidth,
  minIntrinsicHeight,
  percentageConstraints,
} from '@/layout/box-layout'
import { createMeasurable, createMeasureResult } from '@/layout/measure'
import type { Constraints, Measurable } from '@/layout/types'

function makeConstraints(opts: Partial<Constraints> = {}): Constraints {
  return {
    minWidth: 0,
    maxWidth: Infinity,
    minHeight: 0,
    maxHeight: Infinity,
    ...opts,
  }
}

function makeMeasurable(width: number, height: number): Measurable {
  return createMeasurable((constraints: Constraints) => {
    const w = Math.min(Math.max(width, constraints.minWidth), constraints.maxWidth)
    const h = Math.min(Math.max(height, constraints.minHeight), constraints.maxHeight)
    return createMeasureResult(w, h)
  })
}

describe('computeAlignmentX', () => {
  it('should align start (left)', () => {
    expect(computeAlignmentX('start', 200, 100)).toBe(0)
  })

  it('should align center', () => {
    expect(computeAlignmentX('center', 200, 100)).toBe(50)
  })

  it('should align end (right)', () => {
    expect(computeAlignmentX('end', 200, 100)).toBe(100)
  })
})

describe('computeAlignmentY', () => {
  it('should align start (top)', () => {
    expect(computeAlignmentY('start', 200, 100)).toBe(0)
  })

  it('should align center', () => {
    expect(computeAlignmentY('center', 200, 100)).toBe(50)
  })

  it('should align end (bottom)', () => {
    expect(computeAlignmentY('end', 200, 100)).toBe(100)
  })
})

describe('boxMeasurePolicy', () => {
  it('should measure single child with center alignment', () => {
    const policy = createBoxMeasurePolicy('center')
    const measurables = [makeMeasurable(100, 50)]
    const constraints = makeConstraints({ maxWidth: 300, maxHeight: 200 })
    const result = policy(measurables, constraints)

    expect(result.width).toBe(100)
    expect(result.height).toBe(50)
  })

  it('should measure multiple children and take max size', () => {
    const policy = createBoxMeasurePolicy('start')
    const measurables = [makeMeasurable(100, 50), makeMeasurable(150, 80)]
    const constraints = makeConstraints({ maxWidth: 300, maxHeight: 200 })
    const result = policy(measurables, constraints)

    expect(result.width).toBe(150)
    expect(result.height).toBe(80)
  })

  it('should respect min constraints', () => {
    const policy = createBoxMeasurePolicy('center')
    const measurables = [makeMeasurable(100, 50)]
    const constraints = makeConstraints({ minWidth: 200, minHeight: 150, maxWidth: 300, maxHeight: 200 })
    const result = policy(measurables, constraints)

    expect(result.width).toBe(200)
    expect(result.height).toBe(150)
  })

  it('should respect max constraints', () => {
    const policy = createBoxMeasurePolicy('center')
    const measurables = [makeMeasurable(500, 400)]
    const constraints = makeConstraints({ maxWidth: 300, maxHeight: 200 })
    const result = policy(measurables, constraints)

    expect(result.width).toBe(300)
    expect(result.height).toBe(200)
  })

  it('should handle empty measurables', () => {
    const policy = createBoxMeasurePolicy('center')
    const constraints = makeConstraints({ minWidth: 100, minHeight: 100 })
    const result = policy([], constraints)

    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })
})

describe('minIntrinsicWidth', () => {
  it('should return max min-width of children', () => {
    const measurables = [makeMeasurable(100, 50), makeMeasurable(150, 80)]
    const result = minIntrinsicWidth(measurables, Infinity)
    expect(result).toBe(150)
  })
})

describe('minIntrinsicHeight', () => {
  it('should return max min-height of children', () => {
    const measurables = [makeMeasurable(100, 50), makeMeasurable(150, 80)]
    const result = minIntrinsicHeight(measurables, Infinity)
    expect(result).toBe(80)
  })
})

describe('percentageConstraints', () => {
  it('should compute percentage of parent constraints', () => {
    const parent: Constraints = makeConstraints({
      minWidth: 100,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 800,
    })
    const result = percentageConstraints(parent, 0.5, 0.25)

    expect(result.minWidth).toBe(50)
    expect(result.maxWidth).toBe(200)
    expect(result.minHeight).toBe(25)
    expect(result.maxHeight).toBe(200)
  })

  it('should handle 100% constraints', () => {
    const parent: Constraints = makeConstraints({
      minWidth: 100,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 800,
    })
    const result = percentageConstraints(parent, 1, 1)

    expect(result.minWidth).toBe(100)
    expect(result.maxWidth).toBe(400)
    expect(result.minHeight).toBe(100)
    expect(result.maxHeight).toBe(800)
  })
})
