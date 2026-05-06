import type { MeasurePolicy, Measurable, Constraints, MeasureContext, MeasureResult, WeightConfig, Alignment } from '@/layout/types'
import { createMeasureResult } from '@/layout/measure'
import { constrainWidth, constrainHeight } from '@/layout/constraints'
import { createBoxMeasurePolicy, minIntrinsicWidth, minIntrinsicHeight } from '@/layout/box-layout'
import { createMeasurePolicy } from '@/layout/simple-measure-policy'

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
