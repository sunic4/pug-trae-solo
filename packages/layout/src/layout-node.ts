import type { Constraints, MeasureResult, Measurable, LayoutNode, WeightConfig } from './types'
import { createMeasureResult } from './measure'
import { measureWithWeights, computeWeightedMeasureResult } from './weight-measure'

class LayoutNodeImpl implements LayoutNode {
  readonly id: number
  parent: LayoutNode | null = null
  children: LayoutNode[] = []
  measurable: Measurable | null
  measureResult: MeasureResult | null = null
  position: { x: number; y: number } = { x: 0, y: 0 }
  weight: WeightConfig | null

  constructor(id: number, measurable: Measurable | null = null, weight: WeightConfig | null = null) {
    this.id = id
    this.measurable = measurable
    this.weight = weight
  }

  measure(constraints: Constraints): void {
    if (this.measurable !== null) {
      const placeable = this.measurable.measure(constraints)
      this.measureResult = placeable.measureResult
      this.position = { ...placeable.position }
    }
  }

  addChild(child: LayoutNode): void {
    if (child.parent !== null) {
      child.parent.removeChild(child)
    }
    this.children.push(child)
    child.parent = this
  }

  removeChild(child: LayoutNode): void {
    const idx = this.children.indexOf(child)
    if (idx !== -1) {
      this.children.splice(idx, 1)
      child.parent = null
    }
  }
}

class LayoutTree {
  root: LayoutNode | null = null
  private _direction: 'horizontal' | 'vertical'

  constructor(direction: 'horizontal' | 'vertical' = 'horizontal') {
    this._direction = direction
  }

  private _isHorizontal(): boolean {
    return this._direction === 'horizontal'
  }

  insert(parent: LayoutNode | null, node: LayoutNode): void {
    if (parent === null) {
      this.root = node
      node.parent = null
    } else {
      parent.addChild(node)
    }
  }

  remove(node: LayoutNode): void {
    if (this.root === node) {
      this.root = null
      node.parent = null
      return
    }
    if (node.parent !== null) {
      node.parent.removeChild(node)
    }
  }

  measureAndLayout(constraints: Constraints): void {
    if (this.root === null) return
    this.root.measure(constraints)
    this._layoutChildren(this.root, constraints)
  }

  private _layoutChildren(node: LayoutNode, constraints: Constraints): void {
    if (node.children.length === 0) return

    const measurableChildren: LayoutNode[] = []
    const measurables: Measurable[] = []
    const weights: Array<WeightConfig | null> = []

    for (const child of node.children) {
      if (child.measurable !== null) {
        measurableChildren.push(child)
        measurables.push(child.measurable)
        weights.push(child.weight)
      }
    }

    if (measurables.length === 0) return

    const hasWeights = weights.some((w) => w !== null)

    if (hasWeights) {
      const result = this._measureWithWeights(measurables, weights, constraints, measurableChildren)
      if (node.measureResult === null) {
        node.measureResult = result
      }
    } else {
      for (const child of measurableChildren) {
        child.measure(constraints)
      }
    }
  }

  private _measureWithWeights(
    measurables: Measurable[],
    weights: Array<WeightConfig | null>,
    constraints: Constraints,
    measurableChildren: LayoutNode[],
  ): MeasureResult {
    const inputs = measurables.map((m, i) => ({
      measurable: m,
      weight: (i < weights.length ? weights[i] : null) ?? null,
    }))

    const result = measureWithWeights(inputs, constraints, this._isHorizontal())

    for (let i = 0; i < result.placeables.length; i++) {
      const p = result.placeables[i]!
      measurableChildren[i]!.measureResult = p.measureResult
      measurableChildren[i]!.position = { ...p.position }
    }

    return computeWeightedMeasureResult(
      result.totalMainSize,
      result.maxCrossSize,
      constraints,
      this._isHorizontal(),
    )
  }
}


function createLayoutNode(id: number, measurable?: Measurable, weight?: WeightConfig): LayoutNode {
  return new LayoutNodeImpl(id, measurable ?? null, weight ?? null)
}


function createLayoutTree(direction: 'horizontal' | 'vertical' = 'horizontal'): LayoutTree {
  return new LayoutTree(direction)
}

export { LayoutNodeImpl, LayoutTree, createLayoutNode, createLayoutTree }
