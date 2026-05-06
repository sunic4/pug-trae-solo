import type { Constraints, MeasureResult, Measurable, LayoutNode, WeightConfig } from '@/layout/types'
import { createMeasureResult } from '@/layout/measure'

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
    const totalWeight = weights.reduce((sum, w) => sum + (w?.weight ?? 0), 0)
    if (totalWeight <= 0) {
      for (const child of measurableChildren) {
        child.measure(constraints)
      }
      return this._aggregateMeasuredSize(measurableChildren)
    }

    const nonWeightedIndices: number[] = []
    const weightedIndices: number[] = []
    for (let i = 0; i < weights.length; i++) {
      if (weights[i] !== null) {
        weightedIndices.push(i)
      } else {
        nonWeightedIndices.push(i)
      }
    }

    for (const idx of nonWeightedIndices) {
      measurableChildren[idx]!.measure(constraints)
    }

    let usedMainSize = 0
    for (const idx of nonWeightedIndices) {
      const result = measurableChildren[idx]!.measureResult
      if (result != null) {
        usedMainSize += this._isHorizontal() ? result.width : result.height
      }
    }

    const maxMain = this._isHorizontal() ? constraints.maxWidth : constraints.maxHeight
    const remainingMainSize = Math.max(0, maxMain - usedMainSize)

    for (const idx of weightedIndices) {
      const w = weights[idx]!
      const child = measurableChildren[idx]!

      const share = (w.weight / totalWeight) * remainingMainSize
      const childConstraints: Constraints = w.fill
        ? this._isHorizontal()
          ? { minWidth: share, maxWidth: share, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
          : { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: share, maxHeight: share }
        : this._isHorizontal()
          ? { minWidth: 0, maxWidth: share, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
          : { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: 0, maxHeight: share }
      child.measure(childConstraints)
    }

    return this._aggregateMeasuredSize(measurableChildren)
  }

  private _aggregateMeasuredSize(children: LayoutNode[]): MeasureResult {
    let totalMainSize = 0
    let maxCrossSize = 0
    for (const child of children) {
      if (child.measureResult != null) {
        const mainSize = this._isHorizontal() ? child.measureResult.width : child.measureResult.height
        const crossSize = this._isHorizontal() ? child.measureResult.height : child.measureResult.width
        totalMainSize += mainSize
        if (crossSize > maxCrossSize) {
          maxCrossSize = crossSize
        }
      }
    }
    const totalWidth = this._isHorizontal() ? totalMainSize : maxCrossSize
    const totalHeight = this._isHorizontal() ? maxCrossSize : totalMainSize
    return createMeasureResult(totalWidth, totalHeight)
  }
}


function createLayoutNode(id: number, measurable?: Measurable, weight?: WeightConfig): LayoutNode {
  return new LayoutNodeImpl(id, measurable ?? null, weight ?? null)
}


function createLayoutTree(direction: 'horizontal' | 'vertical' = 'horizontal'): LayoutTree {
  return new LayoutTree(direction)
}

export { LayoutNodeImpl, LayoutTree, createLayoutNode, createLayoutTree }
