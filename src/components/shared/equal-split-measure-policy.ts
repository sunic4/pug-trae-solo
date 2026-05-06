import type { MeasurePolicy, Measurable, Constraints, MeasureResult } from '@/layout/types'
import { createMeasureResult } from '@/layout/measure'
import { createMeasurePolicy } from '@/layout/simple-measure-policy'

function equalSplitMeasurePolicy(itemCount: number, height: number, minItemWidth: number): MeasurePolicy {
  return createMeasurePolicy({
    measure(measurables: Measurable[], constraints: Constraints): MeasureResult {
      const itemWidth = itemCount > 0 ? constraints.maxWidth / itemCount : constraints.maxWidth
      for (let i = 0; i < measurables.length; i++) {
        const m = measurables[i]!
        m.measure({
          minWidth: 0,
          maxWidth: itemWidth,
          minHeight: 0,
          maxHeight: height,
        })
      }
      const width = Math.min(Math.max(constraints.minWidth, itemCount * minItemWidth), constraints.maxWidth)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return itemCount * minItemWidth
    },
    minIntrinsicHeight(): number {
      return height
    },
  })
}

export { equalSplitMeasurePolicy as EqualSplitMeasurePolicy }
