import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { Color } from '@/renderer/types'
import { PrimaryColor } from '@/theme/colors'

type CircularProgressIndicatorComponent = {
  readonly kind: 'circular-progress-indicator'
  readonly progress: number
  readonly determinate: boolean
  readonly color: Color
  readonly strokeWidth: number
} & ComponentBase

function CircularProgressIndicator(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  progress: number = 0,
  determinate: boolean = false,
  color: Color = PrimaryColor,
  strokeWidth: number = 4,
): CircularProgressIndicatorComponent {
  const measurePolicy = ConstrainedMeasurePolicy(36, 36)
  return {
    kind: 'circular-progress-indicator',
    modifier,
    progress,
    determinate,
    color,
    strokeWidth,
    measurePolicy,
  }
}

export type { CircularProgressIndicatorComponent }
export { CircularProgressIndicator }
