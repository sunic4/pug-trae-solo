import { describe, it, expect } from 'vitest'
import {
  ConstraintsImpl,
  tightConstraints,
  looseConstraints,
  unconstrained,
  constrainWidth,
} from '../constraints'
import { createMeasureResult, createMeasurable, PlaceableImpl } from '../measure'
import { linearMeasurePolicy } from '../measure-policy'
import type { Constraints, Measurable, Placeable } from '../types'

class TrackedMeasurable implements Measurable {
  lastPlaceable: Placeable | undefined
  private readonly _w: number
  private readonly _h: number

  constructor(w: number, h: number) {
    this._w = w
    this._h = h
  }

  measure(_constraints: Constraints): Placeable {
    const result = createMeasureResult(this._w, this._h)
    const placeable = new PlaceableImpl(result)
    this.lastPlaceable = placeable
    return placeable
  }
}

describe('Constraints', () => {
  describe('when created via tightConstraints', () => {
    it('should have minWidth=maxWidth=width and minHeight=maxHeight=height', () => {
      const c = tightConstraints(100, 200)
      expect(c.minWidth).toBe(100)
      expect(c.maxWidth).toBe(100)
      expect(c.minHeight).toBe(200)
      expect(c.maxHeight).toBe(200)
    })
  })

  describe('when created via looseConstraints', () => {
    it('should have minWidth=0 and maxWidth=maxWidth', () => {
      const c = looseConstraints(300, 400)
      expect(c.minWidth).toBe(0)
      expect(c.maxWidth).toBe(300)
      expect(c.minHeight).toBe(0)
      expect(c.maxHeight).toBe(400)
    })
  })

  describe('when created via unconstrained', () => {
    it('should have minWidth=0 and maxWidth=Infinity', () => {
      const c = unconstrained()
      expect(c.minWidth).toBe(0)
      expect(c.maxWidth).toBe(Infinity)
      expect(c.minHeight).toBe(0)
      expect(c.maxHeight).toBe(Infinity)
    })
  })

  describe('when using constrainWidth', () => {
    it('should clamp width to [minWidth, maxWidth]', () => {
      const c: Constraints = { minWidth: 50, maxWidth: 200, minHeight: 0, maxHeight: 300 }
      expect(constrainWidth(c, 30)).toBe(50)
      expect(constrainWidth(c, 100)).toBe(100)
      expect(constrainWidth(c, 300)).toBe(200)
    })
  })

  describe('when constructor receives negative values', () => {
    it('should throw Error', () => {
      expect(() => new ConstraintsImpl(-1, 100, 0, 100)).toThrow(Error)
      expect(() => new ConstraintsImpl(0, 100, -1, 100)).toThrow(Error)
    })
  })

  describe('when constructor receives min > max', () => {
    it('should throw Error', () => {
      expect(() => new ConstraintsImpl(200, 100, 0, 100)).toThrow(Error)
      expect(() => new ConstraintsImpl(0, 100, 200, 100)).toThrow(Error)
    })
  })
})

describe('Measure', () => {
  describe('when calling createMeasureResult', () => {
    it('should return correct width and height', () => {
      const result = createMeasureResult(80, 60)
      expect(result.width).toBe(80)
      expect(result.height).toBe(60)
    })
  })

  describe('when calling createMeasurable and measure', () => {
    it('should return a Placeable', () => {
      const measurable = createMeasurable((_constraints: Constraints) => {
        return createMeasureResult(50, 30)
      })
      const placeable = measurable.measure(unconstrained())
      expect(placeable.measureResult.width).toBe(50)
      expect(placeable.measureResult.height).toBe(30)
    })
  })

  describe('when calling placeable.place', () => {
    it('should set position', () => {
      const measurable = createMeasurable((_constraints: Constraints) => {
        return createMeasureResult(50, 30)
      })
      const placeable = measurable.measure(unconstrained())
      placeable.place(10, 20)
      expect(placeable.position.x).toBe(10)
      expect(placeable.position.y).toBe(20)
    })
  })

  describe('when placeable is created', () => {
    it('should have initial position {x:0, y:0}', () => {
      const measurable = createMeasurable((_constraints: Constraints) => {
        return createMeasureResult(50, 30)
      })
      const placeable = measurable.measure(unconstrained())
      expect(placeable.position.x).toBe(0)
      expect(placeable.position.y).toBe(0)
    })
  })
})

describe('MeasurePolicy', () => {
  describe('when horizontal + start arrangement', () => {
    it('should place children from left to right', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const child1 = new TrackedMeasurable(50, 30)
      const child2 = new TrackedMeasurable(40, 20)
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 300 }
      const result = policy.measure([child1, child2], constraints)
      expect(child1.lastPlaceable!.position.x).toBe(0)
      expect(child2.lastPlaceable!.position.x).toBe(50)
      expect(result.width).toBe(90)
      expect(result.height).toBe(30)
    })
  })

  describe('when vertical + start arrangement', () => {
    it('should place children from top to bottom', () => {
      const policy = linearMeasurePolicy('vertical', 'start', 'start')
      const child1 = new TrackedMeasurable(50, 30)
      const child2 = new TrackedMeasurable(40, 20)
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 300 }
      const result = policy.measure([child1, child2], constraints)
      expect(child1.lastPlaceable!.position.y).toBe(0)
      expect(child2.lastPlaceable!.position.y).toBe(30)
      expect(result.width).toBe(50)
      expect(result.height).toBe(50)
    })
  })

  describe('when horizontal + center alignment', () => {
    it('should center children on cross axis', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'center')
      const child1 = new TrackedMeasurable(50, 30)
      const child2 = new TrackedMeasurable(40, 20)
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 300 }
      policy.measure([child1, child2], constraints)
      expect(child1.lastPlaceable!.position.y).toBe(0)
      expect(child2.lastPlaceable!.position.y).toBe(5)
    })
  })

  describe('when horizontal + spaceBetween', () => {
    it('should place first child at start and last child at end', () => {
      const policy = linearMeasurePolicy('horizontal', 'spaceBetween', 'start')
      const child1 = new TrackedMeasurable(50, 30)
      const child2 = new TrackedMeasurable(50, 30)
      const constraints: Constraints = { minWidth: 0, maxWidth: 200, minHeight: 0, maxHeight: 300 }
      policy.measure([child1, child2], constraints)
      expect(child1.lastPlaceable!.position.x).toBe(0)
      expect(child2.lastPlaceable!.position.x).toBe(150)
    })
  })

  describe('when vertical + spacedBy(10)', () => {
    it('should place children with 10px gap', () => {
      const policy = linearMeasurePolicy('vertical', { spacedBy: 10 }, 'start')
      const child1 = new TrackedMeasurable(50, 30)
      const child2 = new TrackedMeasurable(40, 20)
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 300 }
      policy.measure([child1, child2], constraints)
      expect(child1.lastPlaceable!.position.y).toBe(0)
      expect(child2.lastPlaceable!.position.y).toBe(40)
    })
  })
})
