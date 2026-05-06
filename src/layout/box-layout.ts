import type { Constraints, Measurable, MeasureResult, Alignment } from '@/layout/types'
import { createMeasureResult } from '@/layout/measure'
import { constrainWidth, constrainHeight } from '@/layout/constraints'


function boxMeasurePolicy(
  alignment: Alignment,
): (measurables: Measurable[], constraints: Constraints) => MeasureResult {
  return (measurables: Measurable[], constraints: Constraints): MeasureResult => {
    let maxWidth = 0
    let maxHeight = 0
    const placeables = []

    for (const measurable of measurables) {
      const placeable = measurable.measure(constraints)
      placeables.push(placeable)
      if (placeable.measureResult.width > maxWidth) {
        maxWidth = placeable.measureResult.width
      }
      if (placeable.measureResult.height > maxHeight) {
        maxHeight = placeable.measureResult.height
      }
    }

    const width = constrainWidth(constraints, maxWidth)
    const height = constrainHeight(constraints, maxHeight)

    for (const placeable of placeables) {
      const x = computeAlignmentX(alignment, width, placeable.measureResult.width)
      const y = computeAlignmentY(alignment, height, placeable.measureResult.height)
      placeable.place(x, y)
    }

    return createMeasureResult(width, height)
  }
}


function alignOffset(alignment: Alignment, containerSize: number, childSize: number): number {
  if (alignment === 'end') return containerSize - childSize
  if (alignment === 'center') return (containerSize - childSize) / 2
  return 0
}

function computeAlignmentX(alignment: Alignment, containerWidth: number, childWidth: number): number {
  return alignOffset(alignment, containerWidth, childWidth)
}

function computeAlignmentY(alignment: Alignment, containerHeight: number, childHeight: number): number {
  return alignOffset(alignment, containerHeight, childHeight)
}


function minIntrinsicWidth(measurables: Measurable[], height: number): number {
  let maxMinWidth = 0
  for (const measurable of measurables) {
    const constraints: Constraints = {
      minWidth: 0,
      maxWidth: Infinity,
      minHeight: 0,
      maxHeight: height,
    }
    const placeable = measurable.measure(constraints)
    if (placeable.measureResult.width > maxMinWidth) {
      maxMinWidth = placeable.measureResult.width
    }
  }
  return maxMinWidth
}


function minIntrinsicHeight(measurables: Measurable[], width: number): number {
  let maxMinHeight = 0
  for (const measurable of measurables) {
    const constraints: Constraints = {
      minWidth: 0,
      maxWidth: width,
      minHeight: 0,
      maxHeight: Infinity,
    }
    const placeable = measurable.measure(constraints)
    if (placeable.measureResult.height > maxMinHeight) {
      maxMinHeight = placeable.measureResult.height
    }
  }
  return maxMinHeight
}


function percentageConstraints(
  parentConstraints: Constraints,
  widthPercent: number,
  heightPercent: number,
): Constraints {
  return {
    minWidth: Math.floor(parentConstraints.minWidth * widthPercent),
    maxWidth: Math.floor(parentConstraints.maxWidth * widthPercent),
    minHeight: Math.floor(parentConstraints.minHeight * heightPercent),
    maxHeight: Math.floor(parentConstraints.maxHeight * heightPercent),
  }
}


function createBoxMeasurePolicy(alignment: Alignment = 'center') {
  return boxMeasurePolicy(alignment)
}

export {
  boxMeasurePolicy,
  alignOffset,
  computeAlignmentX,
  computeAlignmentY,
  minIntrinsicWidth,
  minIntrinsicHeight,
  percentageConstraints,
  createBoxMeasurePolicy,
}
