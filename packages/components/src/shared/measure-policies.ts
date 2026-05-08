import type { MeasurePolicy, Measurable, Constraints, MeasureResult, Alignment } from '@pug-canvas-ui/layout'
import { createMeasureResult } from '@pug-canvas-ui/layout'
import { constrainWidth, constrainHeight } from '@pug-canvas-ui/layout'
import { createBoxMeasurePolicy, minIntrinsicWidth, minIntrinsicHeight } from '@pug-canvas-ui/layout'
import { createMeasurePolicy } from '@pug-canvas-ui/layout'

function constrainedMeasurePolicy(minWidth: number, minHeight: number): MeasurePolicy {
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const width = constrainWidth(constraints, minWidth)
      const height = constrainHeight(constraints, minHeight)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return minWidth
    },
    minIntrinsicHeight(): number {
      return minHeight
    },
  })
}

function squareMeasurePolicy(size: number): MeasurePolicy {
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const s = constrainWidth(constraints, constrainHeight(constraints, size))
      return createMeasureResult(s, s)
    },
    minIntrinsicWidth(): number {
      return size
    },
    minIntrinsicHeight(): number {
      return size
    },
  })
}

function boxAlignmentMeasurePolicy(alignment: Alignment): MeasurePolicy {
  return createMeasurePolicy({
    measure(measurables: Measurable[], constraints: Constraints): MeasureResult {
      const policy = createBoxMeasurePolicy(alignment)
      return policy(measurables, constraints)
    },
    minIntrinsicWidth(measurables: Measurable[], height: number): number {
      return minIntrinsicWidth(measurables, height)
    },
    minIntrinsicHeight(measurables: Measurable[], width: number): number {
      return minIntrinsicHeight(measurables, width)
    },
  })
}

export { constrainedMeasurePolicy as ConstrainedMeasurePolicy, squareMeasurePolicy as SquareMeasurePolicy, boxAlignmentMeasurePolicy as BoxAlignmentMeasurePolicy }
