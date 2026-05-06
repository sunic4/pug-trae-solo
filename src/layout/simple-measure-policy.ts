import type { MeasurePolicy, Measurable, Constraints, MeasureResult, WeightConfig, MeasureContext } from '@/layout/types'

type MeasureFn = (measurables: Measurable[], constraints: Constraints, context?: MeasureContext) => MeasureResult

type IntrinsicSizeFn = (measurables: Measurable[], size: number) => number

interface SimpleMeasureDef {
  measure: MeasureFn
  minIntrinsicWidth: IntrinsicSizeFn
  minIntrinsicHeight: IntrinsicSizeFn
}

function createMeasurePolicy(def: SimpleMeasureDef): MeasurePolicy {
  return {
    measure: def.measure,
    measureWithWeights(measurables: Measurable[], _weights: Array<WeightConfig | null>, constraints: Constraints, context?: MeasureContext): MeasureResult {
      return def.measure(measurables, constraints, context)
    },
    minIntrinsicWidth: def.minIntrinsicWidth,
    minIntrinsicHeight: def.minIntrinsicHeight,
  }
}

export { createMeasurePolicy }
export type { SimpleMeasureDef, MeasureFn, IntrinsicSizeFn }
