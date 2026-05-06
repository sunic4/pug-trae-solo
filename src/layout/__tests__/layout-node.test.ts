import { describe, it, expect } from 'vitest'
import { createLayoutNode, createLayoutTree } from '@/layout/layout-node'
import { createMeasureResult, PlaceableImpl } from '@/layout/measure'
import { linearMeasurePolicy } from '@/layout/measure-policy'
import type { Constraints, Measurable, Placeable, WeightConfig } from '@/layout/types'
import type { LayoutNode } from '@/layout/types'
import { LayoutTree } from '@/layout/layout-node'

function unconstrained(): Constraints {
  return { minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity }
}

function looseConstraints(maxWidth: number, maxHeight: number): Constraints {
  return { minWidth: 0, maxWidth, minHeight: 0, maxHeight }
}

class FixedMeasurable implements Measurable {
  constructor(
    private _w: number,
    private _h: number,
  ) {}
  lastConstraints: Constraints | null = null
  lastPlaceable: Placeable | null = null

  measure(constraints: Constraints): Placeable {
    this.lastConstraints = constraints
    const result = createMeasureResult(
      Math.min(Math.max(constraints.minWidth, this._w), constraints.maxWidth),
      Math.min(Math.max(constraints.minHeight, this._h), constraints.maxHeight),
    )
    const placeable = new PlaceableImpl(result)
    this.lastPlaceable = placeable
    return placeable
  }
}

describe('LayoutNode', () => {
  describe('when creating a layout node', () => {
    it('should have default values', () => {
      const node = createLayoutNode(1)
      expect(node.id).toBe(1)
      expect(node.parent).toBeNull()
      expect(node.children).toEqual([])
      expect(node.measurable).toBeNull()
      expect(node.measureResult).toBeNull()
      expect(node.weight).toBeNull()
      expect(node.position).toEqual({ x: 0, y: 0 })
    })
  })

  describe('when creating a layout node with measurable and weight', () => {
    it('should set measurable and weight', () => {
      const m = new FixedMeasurable(50, 30)
      const w: WeightConfig = { weight: 1, fill: true }
      const node = createLayoutNode(1, m, w)
      expect(node.measurable).toBe(m)
      expect(node.weight).toEqual(w)
    })
  })

  describe('when calling measure', () => {
    it('should set measureResult from measurable', () => {
      const m = new FixedMeasurable(50, 30)
      const node = createLayoutNode(1, m)
      node.measure(unconstrained())
      expect(node.measureResult).not.toBeNull()
      expect(node.measureResult!.width).toBe(50)
      expect(node.measureResult!.height).toBe(30)
    })
  })

  describe('when calling addChild', () => {
    it('should add child and set parent', () => {
      const parent = createLayoutNode(1)
      const child = createLayoutNode(2)
      parent.addChild(child)
      expect(parent.children).toHaveLength(1)
      expect(child.parent).toBe(parent)
    })

    it('should remove child from previous parent', () => {
      const oldParent = createLayoutNode(1)
      const newParent = createLayoutNode(2)
      const child = createLayoutNode(3)
      oldParent.addChild(child)
      newParent.addChild(child)
      expect(oldParent.children).toHaveLength(0)
      expect(newParent.children).toHaveLength(1)
    })
  })

  describe('when calling removeChild', () => {
    it('should remove child and clear parent', () => {
      const parent = createLayoutNode(1)
      const child = createLayoutNode(2)
      parent.addChild(child)
      parent.removeChild(child)
      expect(parent.children).toHaveLength(0)
      expect(child.parent).toBeNull()
    })
  })
})

describe('LayoutTree', () => {
  describe('when inserting root', () => {
    it('should set root', () => {
      const tree = createLayoutTree()
      const root = createLayoutNode(1)
      tree.insert(null, root)
      expect(tree.root).toBe(root)
    })
  })

  describe('when inserting child', () => {
    it('should add child to parent', () => {
      const tree = createLayoutTree()
      const root = createLayoutNode(1)
      const child = createLayoutNode(2)
      tree.insert(null, root)
      tree.insert(root, child)
      expect(root.children).toHaveLength(1)
    })
  })

  describe('when removing root', () => {
    it('should clear root', () => {
      const tree = createLayoutTree()
      const root = createLayoutNode(1)
      tree.insert(null, root)
      tree.remove(root)
      expect(tree.root).toBeNull()
    })
  })

  describe('when calling measureAndLayout', () => {
    it('should measure all nodes', () => {
      const tree = createLayoutTree()
      const m1 = new FixedMeasurable(100, 50)
      const m2 = new FixedMeasurable(80, 40)
      const root = createLayoutNode(1, m1)
      const child = createLayoutNode(2, m2)
      tree.insert(null, root)
      tree.insert(root, child)

      tree.measureAndLayout(looseConstraints(300, 300))

      expect(root.measureResult).not.toBeNull()
      expect(child.measureResult).not.toBeNull()
    })
  })
})

describe('Weight-based layout', () => {
  describe('when using measureWithWeights with equal weights', () => {
    it('should distribute remaining space equally', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const m1 = new FixedMeasurable(50, 30)
      const m2 = new FixedMeasurable(50, 30)
      const weights: Array<WeightConfig | null> = [
        { weight: 1, fill: true },
        { weight: 1, fill: true },
      ]
      const constraints: Constraints = { minWidth: 0, maxWidth: 200, minHeight: 0, maxHeight: 300 }
      policy.measureWithWeights([m1, m2], weights, constraints)

      expect(m1.lastConstraints!.minWidth).toBe(100)
      expect(m1.lastConstraints!.maxWidth).toBe(100)
      expect(m2.lastConstraints!.minWidth).toBe(100)
      expect(m2.lastConstraints!.maxWidth).toBe(100)
    })
  })

  describe('when using measureWithWeights with unequal weights', () => {
    it('should distribute space proportionally', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const m1 = new FixedMeasurable(50, 30)
      const m2 = new FixedMeasurable(50, 30)
      const weights: Array<WeightConfig | null> = [
        { weight: 2, fill: true },
        { weight: 1, fill: true },
      ]
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 300 }
      policy.measureWithWeights([m1, m2], weights, constraints)

      expect(m1.lastConstraints!.maxWidth).toBe(200)
      expect(m2.lastConstraints!.maxWidth).toBe(100)
    })
  })

  describe('when mixing weighted and non-weighted children', () => {
    it('should measure non-weighted first then distribute remaining', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const m1 = new FixedMeasurable(60, 30)
      const m2 = new FixedMeasurable(50, 30)
      const weights: Array<WeightConfig | null> = [
        null,
        { weight: 1, fill: true },
      ]
      const constraints: Constraints = { minWidth: 0, maxWidth: 200, minHeight: 0, maxHeight: 300 }
      policy.measureWithWeights([m1, m2], weights, constraints)

      expect(m1.lastConstraints!.maxWidth).toBe(200)
      expect(m2.lastConstraints!.maxWidth).toBe(140)
    })
  })

  describe('when using weight with fill=false', () => {
    it('should allow child to be smaller than allocated share', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const m1 = new FixedMeasurable(50, 30)
      const weights: Array<WeightConfig | null> = [
        { weight: 1, fill: false },
      ]
      const constraints: Constraints = { minWidth: 0, maxWidth: 200, minHeight: 0, maxHeight: 300 }
      policy.measureWithWeights([m1], weights, constraints)

      expect(m1.lastConstraints!.minWidth).toBe(0)
      expect(m1.lastConstraints!.maxWidth).toBe(200)
    })
  })

  describe('when using vertical orientation with weights', () => {
    it('should distribute height instead of width', () => {
      const policy = linearMeasurePolicy('vertical', 'start', 'start')
      const m1 = new FixedMeasurable(50, 30)
      const m2 = new FixedMeasurable(50, 30)
      const weights: Array<WeightConfig | null> = [
        { weight: 1, fill: true },
        { weight: 1, fill: true },
      ]
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 200 }
      policy.measureWithWeights([m1, m2], weights, constraints)

      expect(m1.lastConstraints!.minHeight).toBe(100)
      expect(m1.lastConstraints!.maxHeight).toBe(100)
      expect(m2.lastConstraints!.minHeight).toBe(100)
      expect(m2.lastConstraints!.maxHeight).toBe(100)
    })
  })

  describe('when all weights are zero', () => {
    it('should fall back to non-weighted measurement', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const m1 = new FixedMeasurable(50, 30)
      const weights: Array<WeightConfig | null> = [
        { weight: 0, fill: true },
      ]
      const constraints: Constraints = { minWidth: 0, maxWidth: 200, minHeight: 0, maxHeight: 300 }
      const result = policy.measureWithWeights([m1], weights, constraints)
      expect(result.width).toBe(50)
    })
  })

  describe('when no weights provided', () => {
    it('should behave like regular measure', () => {
      const policy = linearMeasurePolicy('horizontal', 'start', 'start')
      const m1 = new FixedMeasurable(50, 30)
      const m2 = new FixedMeasurable(40, 20)
      const constraints: Constraints = { minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 300 }
      const result = policy.measureWithWeights([m1, m2], [], constraints)
      expect(result.width).toBe(90)
    })
  })
})
