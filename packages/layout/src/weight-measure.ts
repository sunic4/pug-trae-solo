import type { Constraints, MeasureResult, Measurable, Placeable, WeightConfig } from './types'
import { constrainWidth, constrainHeight } from './constraints'
import { createMeasureResult } from './measure'

interface WeightedMeasureInput {
  measurable: Measurable
  weight: WeightConfig | null
}

interface WeightedMeasureResult {
  placeables: Placeable[]
  totalMainSize: number
  maxCrossSize: number
}

function measureWithWeights(
  inputs: WeightedMeasureInput[],
  constraints: Constraints,
  isHorizontal: boolean,
): WeightedMeasureResult {
  const weights: Array<WeightConfig | null> = inputs.map((i) => i.weight)
  const measurables: Measurable[] = inputs.map((i) => i.measurable)
  const totalWeight = weights.reduce((sum, w) => sum + (w?.weight ?? 0), 0)

  if (totalWeight <= 0) {
    const placeables = measurables.map((m) => m.measure(constraints))
    return aggregatePlaceables(placeables, isHorizontal)
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

  const placeables: (Placeable | null)[] = new Array(measurables.length).fill(null)

  for (const idx of nonWeightedIndices) {
    placeables[idx] = measurables[idx]!.measure(constraints)
  }

  let usedMainSize = 0
  for (const idx of nonWeightedIndices) {
    const p = placeables[idx]!
    usedMainSize += isHorizontal ? p.measureResult.width : p.measureResult.height
  }

  const maxMain = isHorizontal ? constraints.maxWidth : constraints.maxHeight
  const remainingMainSize = Math.max(0, maxMain - usedMainSize)

  for (const idx of weightedIndices) {
    const w = weights[idx]!
    const m = measurables[idx]!
    const share = (w.weight / totalWeight) * remainingMainSize

    const childConstraints: Constraints = w.fill
      ? isHorizontal
        ? { minWidth: share, maxWidth: share, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
        : { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: share, maxHeight: share }
      : isHorizontal
        ? { minWidth: 0, maxWidth: share, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
        : { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: 0, maxHeight: share }

    placeables[idx] = m.measure(childConstraints)
  }

  return aggregatePlaceables(placeables as Placeable[], isHorizontal)
}

function aggregatePlaceables(
  placeables: Placeable[],
  isHorizontal: boolean,
): WeightedMeasureResult {
  let totalMainSize = 0
  let maxCrossSize = 0
  for (const p of placeables) {
    const mainSize = isHorizontal ? p.measureResult.width : p.measureResult.height
    const crossSize = isHorizontal ? p.measureResult.height : p.measureResult.width
    totalMainSize += mainSize
    if (crossSize > maxCrossSize) maxCrossSize = crossSize
  }
  return { placeables, totalMainSize, maxCrossSize }
}

function computeWeightedMeasureResult(
  totalMainSize: number,
  maxCrossSize: number,
  constraints: Constraints,
  isHorizontal: boolean,
): MeasureResult {
  const totalWidth = isHorizontal
    ? constrainWidth(constraints, totalMainSize)
    : constrainWidth(constraints, maxCrossSize)
  const totalHeight = isHorizontal
    ? constrainHeight(constraints, maxCrossSize)
    : constrainHeight(constraints, totalMainSize)
  return createMeasureResult(totalWidth, totalHeight)
}

export type { WeightedMeasureInput, WeightedMeasureResult }
export { measureWithWeights, aggregatePlaceables, computeWeightedMeasureResult }
