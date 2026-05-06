import type {
  Constraints,
  MeasureResult,
  Measurable,
  Placeable,
  Arrangement,
  Alignment,
  MeasurePolicy,
  MeasureContext,
  WeightConfig,
} from '@/layout/types'
import { createMeasureResult } from '@/layout/measure'
import { constrainWidth, constrainHeight } from '@/layout/constraints'
import { alignOffset } from '@/layout/box-layout'

class LinearMeasurePolicy implements MeasurePolicy {
  private readonly _orientation: 'horizontal' | 'vertical'
  private readonly _arrangement: Arrangement
  private readonly _alignment: Alignment

  constructor(
    orientation: 'horizontal' | 'vertical',
    arrangement: Arrangement,
    alignment: Alignment,
  ) {
    this._orientation = orientation
    this._arrangement = arrangement
    this._alignment = alignment
  }

  measure(measurables: Measurable[], constraints: Constraints, _context?: MeasureContext): MeasureResult {
    return this.measureWithWeights(measurables, [], constraints)
  }

  measureWithWeights(
    measurables: Measurable[],
    weights: Array<WeightConfig | null>,
    constraints: Constraints,
    _context?: MeasureContext,
  ): MeasureResult {
    if (measurables.length === 0) {
      return createMeasureResult(
        constrainWidth(constraints, 0),
        constrainHeight(constraints, 0),
      )
    }

    const hasWeights = weights.length > 0 && weights.some((w) => w !== null)

    if (!hasWeights) {
      return this._measureWithoutWeights(measurables, constraints)
    }

    return this._measureWithWeights(measurables, weights, constraints)
  }

  private _measureWithoutWeights(measurables: Measurable[], constraints: Constraints): MeasureResult {
    if (measurables.length === 0) {
      return createMeasureResult(
        constrainWidth(constraints, 0),
        constrainHeight(constraints, 0),
      )
    }

    const placeables: Placeable[] = measurables.map((m) => m.measure(constraints))

    let totalMainSize = 0
    let maxCrossSize = 0

    for (const p of placeables) {
      const mainSize = this._isHorizontal()
        ? p.measureResult.width
        : p.measureResult.height
      const crossSize = this._isHorizontal()
        ? p.measureResult.height
        : p.measureResult.width
      totalMainSize += mainSize
      if (crossSize > maxCrossSize) {
        maxCrossSize = crossSize
      }
    }

    const mainOffsets = this._computeMainOffsets(placeables, totalMainSize, constraints)

    for (let i = 0; i < placeables.length; i++) {
      const p = placeables[i]!
      const mainOffset = mainOffsets[i]!
      const childCross = this._isHorizontal()
        ? p.measureResult.height
        : p.measureResult.width
      const crossOffset = this._computeCrossOffset(maxCrossSize, childCross)

      if (this._isHorizontal()) {
        p.place(mainOffset, crossOffset)
      } else {
        p.place(crossOffset, mainOffset)
      }
    }

    const totalWidth = this._isHorizontal()
      ? constrainWidth(constraints, totalMainSize)
      : constrainWidth(constraints, maxCrossSize)
    const totalHeight = this._isHorizontal()
      ? constrainHeight(constraints, maxCrossSize)
      : constrainHeight(constraints, totalMainSize)

    return createMeasureResult(totalWidth, totalHeight)
  }

  minIntrinsicWidth(measurables: Measurable[], height: number): number {
    if (measurables.length === 0) return 0
    if (this._isHorizontal()) {
      return measurables.reduce(
        (sum, m) => sum + m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: height, maxHeight: height }).measureResult.width,
        0,
      )
    }
    return measurables.reduce(
      (max, m) => {
        const w = m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity }).measureResult.width
        return w > max ? w : max
      },
      0,
    )
  }

  minIntrinsicHeight(measurables: Measurable[], width: number): number {
    if (measurables.length === 0) return 0
    if (this._isHorizontal()) {
      return measurables.reduce(
        (max, m) => {
          const h = m.measure({ minWidth: width, maxWidth: width, minHeight: 0, maxHeight: Infinity }).measureResult.height
          return h > max ? h : max
        },
        0,
      )
    }
    return measurables.reduce(
      (sum, m) => sum + m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity }).measureResult.height,
      0,
    )
  }

  private _isHorizontal(): boolean {
    return this._orientation === 'horizontal'
  }

  private _computeMainOffsets(
    placeables: Placeable[],
    totalMainSize: number,
    constraints: Constraints,
  ): number[] {
    const count = placeables.length
    const mainSizes = placeables.map((p) =>
      this._isHorizontal() ? p.measureResult.width : p.measureResult.height,
    )

    const maxMain = this._isHorizontal() ? constraints.maxWidth : constraints.maxHeight
    const availableExtra = Math.max(0, maxMain - totalMainSize)

    if (this._arrangement === 'start') {
      return this._offsetsStart(mainSizes)
    }

    if (this._arrangement === 'end') {
      return this._offsetsEnd(mainSizes, availableExtra)
    }

    if (this._arrangement === 'center') {
      return this._offsetsCenter(mainSizes, availableExtra)
    }

    if (this._arrangement === 'spaceEvenly') {
      return this._offsetsSpaceEvenly(mainSizes, availableExtra, count)
    }

    if (this._arrangement === 'spaceBetween') {
      return this._offsetsSpaceBetween(mainSizes, availableExtra, count)
    }

    if (typeof this._arrangement === 'object' && 'spacedBy' in this._arrangement) {
      return this._offsetsSpacedBy(mainSizes, this._arrangement.spacedBy)
    }

    return this._offsetsStart(mainSizes)
  }

  private _offsetsStart(sizes: number[]): number[] {
    const offsets: number[] = []
    let acc = 0
    for (const s of sizes) {
      offsets.push(acc)
      acc += s
    }
    return offsets
  }

  private _offsetsEnd(sizes: number[], extra: number): number[] {
    const offsets: number[] = []
    let acc = extra
    for (const s of sizes) {
      offsets.push(acc)
      acc += s
    }
    return offsets
  }

  private _offsetsCenter(sizes: number[], extra: number): number[] {
    const offsets: number[] = []
    const leading = extra / 2
    let acc = leading
    for (const s of sizes) {
      offsets.push(acc)
      acc += s
    }
    return offsets
  }

  private _offsetsSpaceEvenly(sizes: number[], extra: number, count: number): number[] {
    const offsets: number[] = []
    const gap = count > 0 ? extra / (count + 1) : 0
    let acc = gap
    for (const s of sizes) {
      offsets.push(acc)
      acc += s + gap
    }
    return offsets
  }

  private _offsetsSpaceBetween(sizes: number[], extra: number, count: number): number[] {
    const offsets: number[] = []
    if (count <= 1) {
      return this._offsetsStart(sizes)
    }
    const gap = extra / (count - 1)
    let acc = 0
    for (let i = 0; i < sizes.length; i++) {
      offsets.push(acc)
      acc += sizes[i]!
      if (i < sizes.length - 1) {
        acc += gap
      }
    }
    return offsets
  }

  private _offsetsSpacedBy(sizes: number[], gap: number): number[] {
    const offsets: number[] = []
    let acc = 0
    for (let i = 0; i < sizes.length; i++) {
      offsets.push(acc)
      acc += sizes[i]!
      if (i < sizes.length - 1) {
        acc += gap
      }
    }
    return offsets
  }

  private _computeCrossOffset(maxCross: number, childCross: number): number {
    return alignOffset(this._alignment, maxCross, childCross)
  }

  private _measureWithWeights(
    measurables: Measurable[],
    weights: Array<WeightConfig | null>,
    constraints: Constraints,
  ): MeasureResult {
    const totalWeight = weights.reduce((sum, w) => sum + (w?.weight ?? 0), 0)
    if (totalWeight <= 0) {
      return this._measureWithoutWeights(measurables, constraints)
    }

    const nonWeightedIndices: number[] = []
    const weightedIndices: number[] = []
    for (let i = 0; i < measurables.length; i++) {
      const w = i < weights.length ? weights[i] : null
      if (w !== null && w !== undefined) {
        weightedIndices.push(i)
      } else {
        nonWeightedIndices.push(i)
      }
    }

    const nonWeightedPlaceables: Map<number, Placeable> = new Map()
    for (const idx of nonWeightedIndices) {
      const m = measurables[idx]!
      nonWeightedPlaceables.set(idx, m.measure(constraints))
    }

    let usedMainSize = 0
    for (const [, p] of nonWeightedPlaceables) {
      usedMainSize += this._isHorizontal() ? p.measureResult.width : p.measureResult.height
    }

    const maxMain = this._isHorizontal() ? constraints.maxWidth : constraints.maxHeight
    const remainingMainSize = Math.max(0, maxMain - usedMainSize)

    const weightedPlaceables: Map<number, Placeable> = new Map()
    for (const idx of weightedIndices) {
      const w = weights[idx]!
      const m = measurables[idx]!
      const share = (w.weight / totalWeight) * remainingMainSize

      const childConstraints: Constraints = w.fill
        ? this._isHorizontal()
          ? { minWidth: share, maxWidth: share, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
          : { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: share, maxHeight: share }
        : this._isHorizontal()
          ? { minWidth: 0, maxWidth: share, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
          : { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: 0, maxHeight: share }

      weightedPlaceables.set(idx, m.measure(childConstraints))
    }

    const allPlaceables: Placeable[] = []
    for (let i = 0; i < measurables.length; i++) {
      const p = nonWeightedPlaceables.get(i) ?? weightedPlaceables.get(i)
      if (p !== undefined) {
        allPlaceables.push(p)
      }
    }

    let totalMainSize = 0
    let maxCrossSize = 0
    for (const p of allPlaceables) {
      const mainSize = this._isHorizontal() ? p.measureResult.width : p.measureResult.height
      const crossSize = this._isHorizontal() ? p.measureResult.height : p.measureResult.width
      totalMainSize += mainSize
      if (crossSize > maxCrossSize) maxCrossSize = crossSize
    }

    const mainOffsets = this._computeMainOffsets(allPlaceables, totalMainSize, constraints)

    for (let i = 0; i < allPlaceables.length; i++) {
      const p = allPlaceables[i]!
      const mainOffset = mainOffsets[i]!
      const childCross = this._isHorizontal() ? p.measureResult.height : p.measureResult.width
      const crossOffset = this._computeCrossOffset(maxCrossSize, childCross)

      if (this._isHorizontal()) {
        p.place(mainOffset, crossOffset)
      } else {
        p.place(crossOffset, mainOffset)
      }
    }

    const totalWidth = this._isHorizontal()
      ? constrainWidth(constraints, totalMainSize)
      : constrainWidth(constraints, maxCrossSize)
    const totalHeight = this._isHorizontal()
      ? constrainHeight(constraints, maxCrossSize)
      : constrainHeight(constraints, totalMainSize)

    return createMeasureResult(totalWidth, totalHeight)
  }
}


function linearMeasurePolicy(
  orientation: 'horizontal' | 'vertical',
  arrangement: Arrangement,
  alignment: Alignment,
): MeasurePolicy {
  return new LinearMeasurePolicy(orientation, arrangement, alignment)
}

export { LinearMeasurePolicy, linearMeasurePolicy }
